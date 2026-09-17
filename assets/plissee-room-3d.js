/**
 * Plissee-Konfigurator — interaktive 3D-Raumansicht ("Raum ansehen").
 * Eigenständiges Modul, komplett getrennt von der 2D-Konfigurationslogik:
 * bekommt nur eine Raumgruppe (Fenster-Konfigurationen) + den Fabrik-Katalog
 * übergeben und rendert eine Three.js-Szene, die sich per Drag umsehen lässt
 * (OrbitControls, auf den Innenraum begrenzt).
 *
 * Three.js selbst ist bewusst NICHT fest eingebunden: geladen wird es erst per
 * dynamischem import(), wenn "Raum ansehen" tatsächlich geklickt wird — die
 * meisten Besucher, die nur ein einzelnes Plissee kaufen, laden es nie.
 *
 * Hardware-Teile (Kopf-/Fußschiene, Klemmträger, ein wiederverwendbares
 * Falten-Segment) kommen aus assets/plissee-parts.glb — prozedural gebaut in
 * Blender (siehe tools/build_plissee_model.py), NICHT von einem Artist oder
 * aus einem Foto generiert. Jedes Teil hat ein eigenes, benanntes Material
 * (Fabric/Rail/Bracket), das hier zur Laufzeit auf die vom Kunden gewählte
 * Farbe umgefärbt wird — das geht mit einem aus einem Foto erzeugten
 * KI-Modell nicht, weil dort die Farbe in eine gebackene Textur eingebrannt
 * wäre. Ist kein Modell konfiguriert oder schlägt das Laden fehl, fällt die
 * Szene automatisch auf die rein prozedurale Geometrie zurück (siehe
 * buildPleatedFabricGeometry), damit die Ansicht nie leer bleibt. */
(function () {
  "use strict";

  var THREE_VERSION = "0.169.0";
  var THREE_URL = "https://esm.sh/three@" + THREE_VERSION;
  var CONTROLS_URL = "https://esm.sh/three@" + THREE_VERSION + "/examples/jsm/controls/OrbitControls.js";
  var GLTF_LOADER_URL = "https://esm.sh/three@" + THREE_VERSION + "/examples/jsm/loaders/GLTFLoader.js";

  var THREE = null;
  var OrbitControls = null;
  var GLTFLoader = null;
  var loadPromise = null;
  var modelCache = {};

  function loadThree() {
    if (THREE && OrbitControls && GLTFLoader) return Promise.resolve();
    if (!loadPromise) {
      loadPromise = Promise.all([import(THREE_URL), import(CONTROLS_URL), import(GLTF_LOADER_URL)]).then(function (mods) {
        THREE = mods[0];
        OrbitControls = mods[1].OrbitControls;
        GLTFLoader = mods[2].GLTFLoader;
      });
    }
    return loadPromise;
  }

  /** Lädt assets/plissee-parts.glb einmal und cacht das Ergebnis (Promise,
   * damit parallele Aufrufe nicht mehrfach laden). Gibt die vier benannten
   * Teile zurück oder lehnt ab, wenn eines fehlt/die Datei nicht existiert —
   * der Aufrufer fängt das ab und nutzt dann die prozedurale Geometrie. */
  function loadModelParts(url) {
    if (!url) return Promise.reject(new Error("kein plisseeModelUrl konfiguriert"));
    if (modelCache[url]) return modelCache[url];
    var promise = new Promise(function (resolve, reject) {
      var loader = new GLTFLoader();
      loader.load(
        url,
        function (gltf) {
          var scene = gltf.scene;
          var parts = {
            fabricUnit: scene.getObjectByName("FabricUnit"),
            rail: scene.getObjectByName("Rail"),
            bracketCap: scene.getObjectByName("BracketCap"),
            bracketClip: scene.getObjectByName("BracketClip"),
          };
          if (!parts.fabricUnit || !parts.rail || !parts.bracketCap || !parts.bracketClip) {
            reject(new Error("plissee-parts.glb: erwartete Teile fehlen"));
            return;
          }
          resolve(parts);
        },
        undefined,
        reject
      );
    });
    modelCache[url] = promise;
    return promise;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /** Findet das erste Mesh in einem geladenen glTF-Knoten (falls Blender das
   * Objekt in einen leeren Transform-Knoten gepackt hat statt es direkt als
   * Mesh zu exportieren). */
  function findMesh(obj) {
    if (obj.isMesh) return obj;
    for (var i = 0; i < obj.children.length; i++) {
      var found = findMesh(obj.children[i]);
      if (found) return found;
    }
    return null;
  }

  function shadeHex(hex, percent) {
    var num = parseInt(String(hex).replace("#", ""), 16);
    var r = clamp((num >> 16) + Math.round(255 * percent), 0, 255);
    var g = clamp(((num >> 8) & 0x00ff) + Math.round(255 * percent), 0, 255);
    var b = clamp((num & 0x0000ff) + Math.round(255 * percent), 0, 255);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /** Baut die ECHTE Zickzack-Faltengeometrie eines Plissees — kein Bild einer
   * Falte mehr, sondern ein tatsächlich gefaltetes Netz (wie ein gefalteter
   * Papierfächer). Eine bemalte flache Fläche (der vorherige Ansatz, auch mit
   * bumpMap) kann von der Seite betrachtet nie wie ein Plissee aussehen, weil
   * die Silhouette immer eine gerade Kante bleibt. Mit echter Geometrie
   * entsteht die charakteristische Zickzack-Kontur automatisch aus jedem
   * Blickwinkel, und jede Facette wird von Three.js unabhängig beleuchtet
   * (kein Textur-Trick nötig) — das ist der Unterschied zwischen "Bild eines
   * Plissees" und "gefaltetes Plissee". */
  function buildPleatedFabricGeometry(winWidth, winHeight) {
    // Im direkten Vergleich mit echten Stofftex-Produktfotos: deren Falten
    // sind sehr fein und dicht (deutlich mehr als 2,5 cm/Falte) und die
    // Reliefstiefe ist flach — dadurch wirkt der Stoff hell und gleichmäßig
    // mit nur einer dünnen Schattenlinie pro Falte, nicht grob gestreift.
    var foldHeight = 0.016; // ~1,6 cm — deutlich feiner als vorher (2,5 cm)
    var foldCount = Math.max(16, Math.round(winHeight / foldHeight));
    var actualFoldHeight = winHeight / foldCount;
    var foldDepth = 0.007; // flacheres Relief → sanftere, hellere Schattierung
    var halfW = winWidth / 2;

    var positions = [];
    var normals = [];
    var uvs = [];

    var prevY = 0;
    var prevZ = foldDepth / 2;
    for (var i = 1; i <= foldCount; i++) {
      var y = i * actualFoldHeight;
      var z = i % 2 === 0 ? foldDepth / 2 : -foldDepth / 2;

      var v0 = [-halfW, prevY, prevZ];
      var v1 = [halfW, prevY, prevZ];
      var v2 = [halfW, y, z];
      var v3 = [-halfW, y, z];

      var e1x = v1[0] - v0[0], e1y = v1[1] - v0[1], e1z = v1[2] - v0[2];
      var e2x = v3[0] - v0[0], e2y = v3[1] - v0[1], e2z = v3[2] - v0[2];
      var nx = e1y * e2z - e1z * e2y;
      var ny = e1z * e2x - e1x * e2z;
      var nz = e1x * e2y - e1y * e2x;
      var len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx /= len; ny /= len; nz /= len;

      positions.push(v0[0], v0[1], v0[2], v1[0], v1[1], v1[2], v2[0], v2[1], v2[2]);
      positions.push(v0[0], v0[1], v0[2], v2[0], v2[1], v2[2], v3[0], v3[1], v3[2]);
      for (var k = 0; k < 6; k++) normals.push(nx, ny, nz);
      var v0u = prevY / winHeight, v1u = y / winHeight;
      uvs.push(0, v0u, 1, v0u, 1, v1u, 0, v0u, 1, v1u, 0, v1u);

      prevY = y;
      prevZ = z;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    return geo;
  }

  /** Wandfläche mit sanfter Vignette (dunklere Ecken/Kanten, leichte
   * Aufhellung zur Mitte) statt reiner Flächenfarbe — ohne das würden alle
   * Wände wie flache, gleichmäßig eingefärbte Rechtecke wirken. */
  function buildWallTexture(color, opts) {
    opts = opts || {};
    var size = 256;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    var vignette = ctx.createRadialGradient(
      size * 0.5, size * (opts.lightY != null ? opts.lightY : 0.32), size * 0.1,
      size * 0.5, size * 0.55, size * 0.82
    );
    vignette.addColorStop(0, "rgba(255,255,255," + (opts.highlight != null ? opts.highlight : 0.16) + ")");
    vignette.addColorStop(0.5, "rgba(255,255,255,0)");
    vignette.addColorStop(1, "rgba(20,16,8," + (opts.shadow != null ? opts.shadow : 0.24) + ")");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, size, size);

    var texture = new THREE.CanvasTexture(canvas);
    if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /** Wie buildWallTexture, aber zusätzlich mit angedeuteten Dielenfugen und
   * Wiederholung über die Bodenfläche — sonst liest sich der Boden als
   * einfarbige Fläche statt als Material. */
  function buildFloorTexture(color, repeatX, repeatY) {
    var size = 256;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    for (var x = 0; x < size; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(20,16,8,0.12)";
    for (var x2 = 16; x2 < size; x2 += 32) {
      ctx.beginPath();
      ctx.moveTo(x2, 0);
      ctx.lineTo(x2, size);
      ctx.stroke();
    }

    var vignette = ctx.createRadialGradient(size * 0.5, size * 0.4, size * 0.1, size * 0.5, size * 0.5, size * 0.85);
    vignette.addColorStop(0, "rgba(255,255,255,0.12)");
    vignette.addColorStop(0.55, "rgba(255,255,255,0)");
    vignette.addColorStop(1, "rgba(20,16,8,0.3)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, size, size);

    var texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.anisotropy = 8;
    if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /** Ein Fenster: weißer Rahmen, eingefärbtes Plissee (Falten-Textur), Schiene
   * oben/unten, Klemmträger seitlich — dieselben Bauteile wie in der SVG-
   * Illustration, nur als Box-Geometrie. */
  function buildWindowGroup(cfg, config, modelParts) {
    var fabric = config.fabrics.filter(function (f) { return f.id === cfg.fabricId; })[0];
    var rail = config.rails.filter(function (r) { return r.id === cfg.railId; })[0];
    var bracket = config.brackets.filter(function (b) { return b.id === cfg.bracketId; })[0];

    // Direkt aus den echten Konfigurationsmaßen (cm → m) ableiten, nur gegen
    // Null/Negativwerte abgesichert — vorher wurde hier zu eng geklammert
    // (0.5–1.6 / 0.6–2.0), wodurch unterschiedliche Fenstermaße im 3D-Raum
    // kaum sichtbar unterschiedlich groß wirkten.
    var winWidth = clamp(cfg.width / 100, 0.25, 1.8);
    var winHeight = clamp(cfg.height / 100, 0.25, 2.6);
    var frameThickness = 0.045;
    // Echte Fenster liegen in einer Laibung, die in die Wanddicke einschneidet
    // (~18–20 cm) — die vorherige, sehr flache Tiefe (9 cm) ließ das Fenster
    // wie aufgeklebt statt eingelassen wirken. Mit echter Tiefe wirft der
    // Rahmen jetzt auch einen sichtbaren Schatten in die eigene Laibung.
    var frameDepth = 0.2;

    var group = new THREE.Group();
    var centerY = winHeight / 2 + frameThickness;

    // Rahmen als HOHLE Laibung aus 4 Leisten (oben/unten/links/rechts) statt
    // eines massiven Blocks — ein massiver Block hätte die Öffnung komplett
    // verdeckt, sodass Stoff/Schiene dahinter unsichtbar blieben.
    var frameMat = new THREE.MeshStandardMaterial({ color: 0xfbfaf5, roughness: 0.45 });
    var outerWidth = winWidth + frameThickness * 2;
    var topBorder = new THREE.Mesh(new THREE.BoxGeometry(outerWidth, frameThickness, frameDepth), frameMat);
    topBorder.position.set(0, winHeight + frameThickness * 1.5, 0);
    var bottomBorder = new THREE.Mesh(new THREE.BoxGeometry(outerWidth, frameThickness, frameDepth), frameMat);
    bottomBorder.position.set(0, frameThickness / 2, 0);
    var leftBorder = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, winHeight, frameDepth), frameMat);
    leftBorder.position.set(-winWidth / 2 - frameThickness / 2, centerY, 0);
    var rightBorder = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, winHeight, frameDepth), frameMat);
    rightBorder.position.set(winWidth / 2 + frameThickness / 2, centerY, 0);
    [topBorder, bottomBorder, leftBorder, rightBorder].forEach(function (piece) {
      piece.castShadow = true;
      piece.receiveShadow = true;
      group.add(piece);
    });

    var disposables = [
      topBorder.geometry, bottomBorder.geometry, leftBorder.geometry, rightBorder.geometry, frameMat,
    ];

    // Fensterbank: kleine vorstehende Ablage unten, wie bei einem echten
    // Fenster — ohne die wirkt der Rahmen wie ein reines Bild an der Wand.
    // Überstand bewusst moderat (ein echtes Fensterbrett ragt ~3-5 cm über
    // die Wand, nicht 8+ cm) — zu viel Überstand ließ die Bank aus bestimmten
    // Blickwinkeln wie einen Fremdkörper unter dem Stoff hervorstechen.
    // Bodentiefe Glastüren (cfg.type === "tuer") haben keine Fensterbank —
    // die Schwelle sitzt auf Bodenhöhe, eine Ablage wäre dort eine Stolperkante.
    var isDoor = cfg.type === "tuer";
    if (!isDoor) {
      var sillMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ea, roughness: 0.55 });
      var sillLedge = new THREE.Mesh(new THREE.BoxGeometry(winWidth + frameThickness * 2 + 0.06, 0.025, frameDepth + 0.03), sillMat);
      sillLedge.position.set(0, frameThickness * 0.3, frameDepth / 2 - 0.01);
      sillLedge.castShadow = true;
      sillLedge.receiveShadow = true;
      group.add(sillLedge);
      disposables.push(sillLedge.geometry, sillMat);
    }

    // Plissee, Schiene und Klemmträger sitzen deutlich in der Laibung
    // zurückversetzt (nicht an der Außenkante) — dadurch fällt ein echter
    // Schlagschatten des Rahmens auf den Stoff, statt dass alles auf einer
    // Ebene aufgeklebt wirkt.
    var innerZ = frameDepth / 2 - 0.07;

    // "Draußen ist hell": eine schlichte, unbeleuchtete (MeshBasicMaterial —
    // reagiert nicht auf Schatten/Lichtrichtung) helle Fläche ganz hinten in
    // der Fensterlaibung, größer als die Öffnung selbst. Ohne sie wirkt die
    // Tiefe hinter dem Plissee wie ein dunkles Loch statt wie ein Fenster mit
    // Blick nach draußen — besonders an den Rändern/Ecken, wo die Laibung
    // zwischen Rahmen und Stoff sichtbar wird.
    var skyMat = new THREE.MeshBasicMaterial({ color: 0xeaf3ff });
    var skyGeo = new THREE.PlaneGeometry(winWidth + frameThickness, winHeight + frameThickness);
    var skyPlane = new THREE.Mesh(skyGeo, skyMat);
    skyPlane.position.set(0, centerY, -frameDepth / 2 + 0.012);
    group.add(skyPlane);
    disposables.push(skyGeo, skyMat);

    var fabricColor = fabric ? fabric.color : "#cfcabb";
    var railColor = rail ? rail.color : "#e4e2dc";
    var bracketColor = bracket ? bracket.color : "#2b2a28";

    if (modelParts) {
      // Blender-gebaute Hardware-Teile (siehe tools/build_plissee_model.py):
      // dieselben Geometrien werden für jedes Fenster wiederverwendet
      // (Geometrie bleibt Eigentum des Caches, nur die eingefärbten Material-
      // Klone werden pro Fenster entsorgt), nur Größe/Farbe passen sich an.
      var fabricUnitMesh = findMesh(modelParts.fabricUnit);
      var railMeshTpl = findMesh(modelParts.rail);
      var capMeshTpl = findMesh(modelParts.bracketCap);
      var clipMeshTpl = findMesh(modelParts.bracketClip);

      var fabricMatShared = fabricUnitMesh.material.clone();
      fabricMatShared.color.set(fabricColor);
      fabricMatShared.side = THREE.DoubleSide;
      var unitHeight = 0.032; // muss zur Einheit in build_plissee_model.py passen
      var unitCount = Math.max(6, Math.round(winHeight / unitHeight));
      var yScale = winHeight / (unitCount * unitHeight);
      for (var u = 0; u < unitCount; u++) {
        var unitMesh = new THREE.Mesh(fabricUnitMesh.geometry, fabricMatShared);
        unitMesh.scale.set(winWidth, yScale, 1);
        unitMesh.position.set(0, frameThickness + u * unitHeight * yScale, innerZ);
        unitMesh.castShadow = true;
        unitMesh.receiveShadow = true;
        group.add(unitMesh);
      }
      disposables.push(fabricMatShared);

      // Schiene knapp AUSSERHALB der Stoff-Fläche platzieren (nicht mittig
      // auf der Stoffkante) — sonst überlappt die Schiene die erste/letzte
      // Falte und blitzt als heller Keil durch den Stoff (Z-Fighting).
      var railHalfHeight = 0.016;
      var railTopY = winHeight + frameThickness + railHalfHeight;
      var railBottomY = frameThickness - railHalfHeight;
      var railMatShared = railMeshTpl.material.clone();
      railMatShared.color.set(railColor);
      [railTopY, railBottomY].forEach(function (railY) {
        var railMesh = new THREE.Mesh(railMeshTpl.geometry, railMatShared);
        railMesh.scale.set(winWidth + 0.05, 1, 1);
        railMesh.position.set(0, railY, innerZ + 0.015);
        railMesh.castShadow = true;
        group.add(railMesh);
      });
      [-1, 1].forEach(function (side) {
        var cap = new THREE.Mesh(capMeshTpl.geometry, railMatShared);
        cap.position.set(side * (winWidth / 2 + 0.015), railTopY, innerZ + 0.03);
        cap.castShadow = true;
        group.add(cap);
      });
      disposables.push(railMatShared);

      var bracketMatShared = clipMeshTpl.material.clone();
      bracketMatShared.color.set(bracketColor);
      var clip = new THREE.Mesh(clipMeshTpl.geometry, bracketMatShared);
      clip.position.set(-winWidth / 2 + 0.03, centerY, innerZ + 0.04);
      clip.castShadow = true;
      group.add(clip);
      disposables.push(bracketMatShared);
    } else {
      // Fallback: rein prozedurale Geometrie, falls kein Modell konfiguriert
      // ist oder das Laden fehlschlägt — die Ansicht bleibt nutzbar.
      var pleatGeo = buildPleatedFabricGeometry(winWidth, winHeight);
      var fabricMat = new THREE.MeshStandardMaterial({ color: fabricColor, roughness: 0.85, side: THREE.DoubleSide });
      var fabricPlane = new THREE.Mesh(pleatGeo, fabricMat);
      fabricPlane.position.set(0, frameThickness, innerZ);
      fabricPlane.castShadow = true;
      fabricPlane.receiveShadow = true;
      group.add(fabricPlane);

      var railMat = new THREE.MeshStandardMaterial({ color: railColor, roughness: 0.35, metalness: 0.55 });
      var railHeight = 0.05;
      var railGeo = new THREE.BoxGeometry(winWidth + 0.05, railHeight, frameDepth * 0.55);
      var bracketCapGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.012, 16);
      var topRail = new THREE.Mesh(railGeo, railMat);
      topRail.position.set(0, winHeight + frameThickness + railHeight / 2, innerZ + 0.015);
      topRail.castShadow = true;
      group.add(topRail);
      var bottomRail = new THREE.Mesh(railGeo, railMat);
      bottomRail.position.set(0, frameThickness - railHeight / 2, innerZ + 0.015);
      bottomRail.castShadow = true;
      group.add(bottomRail);
      [-1, 1].forEach(function (side) {
        var cap = new THREE.Mesh(bracketCapGeo, railMat);
        cap.rotation.x = Math.PI / 2;
        cap.position.set(side * (winWidth / 2 + 0.015), winHeight + frameThickness + railHeight / 2, innerZ + 0.03);
        cap.castShadow = true;
        group.add(cap);
      });

      var bracketMat = new THREE.MeshStandardMaterial({ color: bracketColor, roughness: 0.5 });
      var bracketMesh = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.1), bracketMat);
      bracketMesh.position.set(-winWidth / 2 + 0.03, centerY, innerZ + 0.04);
      bracketMesh.castShadow = true;
      group.add(bracketMesh);

      disposables.push(pleatGeo, fabricMat, railGeo, bracketCapGeo, railMat, bracketMesh.geometry, bracketMat);
    }

    group.userData._disposables = disposables;
    group.userData._windowHeight = winHeight + frameThickness * 2;

    return group;
  }

  function buildRoom(scene, roomWidth, roomHeight, roomDepth) {
    var disposables = [];

    // Wärmerer, gesättigterer Holzton statt des vorherigen gräulich-drab
    // Beige — liest deutlich mehr als "Boden", weniger als "Fläche".
    var floorTexture = buildFloorTexture("#b98f5e", roomWidth * 0.7, roomDepth * 0.7);
    var floorMat = new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.55 });
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomDepth), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    disposables.push(floor.geometry, floorMat, floorTexture);

    // Jede Wand bekommt ihre eigene Vignetten-Textur statt derselben Instanz —
    // sonst wird dieselbe Textur beim Dispose einer Wand für alle entsorgt.
    var backWallTexture = buildWallTexture("#f5f1e6", { lightY: 0.3 });
    var backWallMat = new THREE.MeshStandardMaterial({ map: backWallTexture, roughness: 0.9 });
    var backWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), backWallMat);
    backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
    backWall.receiveShadow = true;
    scene.add(backWall);
    disposables.push(backWall.geometry, backWallMat, backWallTexture);

    var sideWallGeo = new THREE.PlaneGeometry(roomDepth, roomHeight);
    var leftWallTexture = buildWallTexture("#efeadb", { lightY: 0.3, shadow: 0.32 });
    var leftWallMat = new THREE.MeshStandardMaterial({ map: leftWallTexture, roughness: 0.9 });
    var leftWall = new THREE.Mesh(sideWallGeo, leftWallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    var rightWallTexture = buildWallTexture("#f8f4e7", { lightY: 0.3, highlight: 0.24, shadow: 0.16 });
    var rightWallMat = new THREE.MeshStandardMaterial({ map: rightWallTexture, roughness: 0.9 });
    var rightWall = new THREE.Mesh(sideWallGeo, rightWallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);
    disposables.push(sideWallGeo, leftWallMat, leftWallTexture, rightWallMat, rightWallTexture);

    // Echte Decke statt einer bloßen Lücke nach oben — sonst wirkt der Raum
    // oben "offen"/leer, sobald man ein wenig nach oben blickt.
    var ceilingMat = new THREE.MeshStandardMaterial({ color: 0xfbf9f2, roughness: 1 });
    var ceiling = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomDepth), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, roomHeight, 0);
    ceiling.receiveShadow = true;
    scene.add(ceiling);
    disposables.push(ceiling.geometry, ceilingMat);

    var baseboardMat = new THREE.MeshStandardMaterial({ color: 0xfbfaf4, roughness: 0.5 });
    var backBaseboard = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, 0.09, 0.02), baseboardMat);
    backBaseboard.position.set(0, 0.045, -roomDepth / 2 + 0.01);
    scene.add(backBaseboard);
    disposables.push(backBaseboard.geometry);

    var sideBaseboardGeo = new THREE.BoxGeometry(roomDepth, 0.09, 0.02);
    var leftBaseboard = new THREE.Mesh(sideBaseboardGeo, baseboardMat);
    leftBaseboard.rotation.y = Math.PI / 2;
    leftBaseboard.position.set(-roomWidth / 2 + 0.01, 0.045, 0);
    scene.add(leftBaseboard);
    var rightBaseboard = new THREE.Mesh(sideBaseboardGeo, baseboardMat);
    rightBaseboard.rotation.y = -Math.PI / 2;
    rightBaseboard.position.set(roomWidth / 2 - 0.01, 0.045, 0);
    scene.add(rightBaseboard);
    disposables.push(sideBaseboardGeo, baseboardMat);

    return disposables;
  }

  /** Fenstermaße (m) aus den Kundenmaßen (cm), auf denselben Bereich geklammert
   * wie buildWindowGroup — zentral hier, damit mount() Fenster VOR dem Bauen
   * der Geometrie schon korrekt an der Wand einordnen/begrenzen kann. */
  function windowDims(cfg) {
    return {
      width: clamp(cfg.width / 100, 0.25, 1.8),
      height: clamp(cfg.height / 100, 0.25, 2.6),
    };
  }

  /** Interaktive Raumansicht ("Raum ansehen"): baut die Szene wie gehabt, aber
   * zusätzlich per Raycasting auswählbar/verschiebbar. `opts.onSelect(cfgId)`
   * feuert bei einem einfachen Klick auf ein Fenster (öffnet das Bearbeitungs-
   * panel), `opts.onPositionChange(cfgId, position)` nach einem Verschieben
   * per Drag (position = normalisierte Stelle 0–1 entlang der Rückwand). Das
   * aufgelöste Promise liefert ein Handle (refreshWindow/setPosition/
   * selectWindow), mit dem der Aufrufer nach einer Bearbeitung (Panel-Eingabe)
   * gezielt nur das betroffene Fenster neu bauen kann, ohne die ganze Szene
   * (Kamera/Blickwinkel des Nutzers) neu aufzusetzen. */
  function mount(container, roomGroup, config, opts) {
    opts = opts || {};
    return loadThree().then(function () {
      // Optionales Blender-Modell laden (Hardware-Teile) — schlägt das fehl
      // (keine URL, Datei fehlt, Format kaputt), rendert die Szene trotzdem
      // mit der rein prozeduralen Geometrie weiter statt leer zu bleiben.
      return loadModelParts(config.plisseeModelUrl).catch(function (err) {
        console.warn("Plissee-Konfigurator: 3D-Modellteile nicht geladen, nutze prozedurale Geometrie.", err);
        return null;
      });
    }).then(function (modelParts) {
      dispose(container);

      var width = container.clientWidth || 640;
      var height = container.clientHeight || 400;

      var scene = new THREE.Scene();
      scene.background = new THREE.Color(0xede9db);

      var count = roomGroup.items.length || 1;
      // Großzügiger bemessen als vorher — bei knappen Raummaßen wirkten die
      // Fenster wie an die Wand gequetscht statt in einem echten Zimmer.
      var roomWidth = Math.max(4.6, count * 2.2 + 2.2);
      // Reale Standard-Raumhöhe (2,50 m) statt einer übertrieben hohen
      // Studio-Decke — wirkt dadurch wie ein tatsächliches Zimmer.
      var roomHeight = 2.5;
      var roomDepth = 4.4;

      // Fensterbrüstung: echte Fenster hängen nicht am Boden, sondern auf
      // typischer Brüstungshöhe (~85–90 cm) — gegen das höchste gemerkte
      // Fenster in diesem Raum abgesichert, damit nichts durch die Decke ragt.
      // Bodentiefe Glastüren bestimmen nicht die Brüstungshöhe der übrigen
      // Fenster im Raum (sie reichen ohnehin bis zum Boden). Obergrenze
      // (roomHeight - maxWinHeight - 0.1) verhindert, dass sehr hohe Fenster
      // bei der niedrigeren 2,50-m-Decke durch die Decke ragen.
      var maxWinHeight = roomGroup.items.reduce(function (max, cfg) {
        if (cfg.type === "tuer") return max;
        return Math.max(max, windowDims(cfg).height);
      }, 0.6);
      var sillHeadroom = Math.max(0.08, roomHeight - maxWinHeight - 0.1);
      var sillHeight = clamp(roomHeight - maxWinHeight - 0.4, 0.08, sillHeadroom);

      var camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
      camera.position.set(0, sillHeight + maxWinHeight * 0.65, roomDepth * 1.05);

      var renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      if (renderer.outputColorSpace !== undefined && THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      }
      // Weiche Schatten + Filmic-Tonemapping — ohne das sieht jede Fläche
      // gleichmäßig ausgeleuchtet aus ("3 Quadrate"), egal wie viel Textur-
      // Politur man draufpackt. Der Schlagschatten von Rahmen/Fensterbank auf
      // Wand und Boden ist der Schritt, der den Raum wirklich plastisch macht.
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (THREE.ACESFilmicToneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
      }
      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      // Hemisphere-Licht: nach oben gerichtete Flächen (Boden) bekommen die
      // "Sky"-Farbe, nach unten gerichtete Flächen (Deckenunterseite) die
      // "Ground"-Farbe — genau umgekehrt zur intuitiven Erwartung. Beide
      // Farben bewusst hell halten, sonst wirkt die Decke unrealistisch dunkel
      // (sie bekommt keinerlei direktes Licht von der Deckenleuchte o. Ä.).
      scene.add(new THREE.HemisphereLight(0xf3ecd8, 0xfbf8ef, 0.55));
      var dirLight = new THREE.DirectionalLight(0xfff3df, 1.6);
      dirLight.position.set(-roomWidth * 0.35, roomHeight * 1.6, roomDepth * 0.55);
      dirLight.target.position.set(0, sillHeight + maxWinHeight * 0.5, -roomDepth / 2);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.set(1024, 1024);
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = roomDepth * 3;
      dirLight.shadow.camera.left = -roomWidth * 0.7;
      dirLight.shadow.camera.right = roomWidth * 0.7;
      dirLight.shadow.camera.top = roomHeight * 1.2;
      dirLight.shadow.camera.bottom = -0.5;
      dirLight.shadow.bias = -0.0015;
      scene.add(dirLight);
      scene.add(dirLight.target);
      var fillLight = new THREE.DirectionalLight(0xdfe8ff, 0.22);
      fillLight.position.set(roomWidth * 0.3, roomHeight * 0.7, roomDepth * 0.4);
      scene.add(fillLight);

      var disposables = buildRoom(scene, roomWidth, roomHeight, roomDepth);

      var items = roomGroup.items;
      var n = items.length;
      var spacing = roomWidth / (n + 1);
      var windowGroups = {};

      function sillYFor(cfg) {
        return cfg.type === "tuer" ? 0 : sillHeight;
      }

      /** Geometrie einer Wand: welche Achse das Fenster ENTLANG der Wand
       * bewegt ("along"), welche Achse fest an der Wand klebt ("fixed") samt
       * ihrem Wert, die Y-Rotation, damit das Fenster ins Zimmer schaut (wie
       * bei den Wandflächen selbst in buildRoom), und die Wandlänge (für die
       * Positions-Normalisierung 0–1). "back" entspricht dem bisherigen
       * Verhalten (unverändert), "left"/"right" sind neu — der Kunde kann
       * ein Fenster jetzt auch an den Seitenwänden platzieren. */
      function wallGeometry(wall) {
        if (wall === "left") {
          return { axis: "z", fixedValue: -roomWidth / 2 + 0.03, rotationY: Math.PI / 2, span: roomDepth };
        }
        if (wall === "right") {
          return { axis: "z", fixedValue: roomWidth / 2 - 0.03, rotationY: -Math.PI / 2, span: roomDepth };
        }
        return { axis: "x", fixedValue: -roomDepth / 2 + 0.03, rotationY: 0, span: roomWidth };
      }

      function wallOf(cfg) {
        return cfg.wall === "left" || cfg.wall === "right" ? cfg.wall : "back";
      }

      // Begrenzt die Position ENTLANG der Wand so, dass Fenster inkl. Rahmen
      // nicht über die Wandenden hinausragen — sowohl für die automatische
      // Verteilung (nur Rückwand) als auch für vom Kunden frei verschobene
      // Fenster auf jeder der drei Wände.
      function clampedAlongFor(cfg, rawAlong) {
        var wg = wallGeometry(wallOf(cfg));
        var span = wg.span;
        var halfOuter = windowDims(cfg).width / 2 + 0.045 + 0.05;
        var min = -span / 2 + halfOuter;
        var max = span / 2 - halfOuter;
        if (min > max) return 0;
        return clamp(rawAlong, min, max);
      }

      function placeWindow(cfg, index) {
        var wall = wallOf(cfg);
        var wg = wallGeometry(wall);
        var span = wg.span;
        var defaultAlong = wall === "back" ? -roomWidth / 2 + spacing * (index + 1) : 0;
        var rawAlong = cfg.position != null ? -span / 2 + cfg.position * span : defaultAlong;
        var along = clampedAlongFor(cfg, rawAlong);
        var winGroup = buildWindowGroup(cfg, config, modelParts);
        winGroup.rotation.y = wg.rotationY;
        if (wg.axis === "x") {
          winGroup.position.set(along, sillYFor(cfg), wg.fixedValue);
        } else {
          winGroup.position.set(wg.fixedValue, sillYFor(cfg), along);
        }
        winGroup.userData.cfgId = cfg.id;
        winGroup.userData.wall = wall;
        scene.add(winGroup);
        windowGroups[cfg.id] = winGroup;
        disposables = disposables.concat(winGroup.userData._disposables);
      }
      items.forEach(placeWindow);

      var controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, sillHeight + maxWinHeight * 0.5, -roomDepth / 2 + 0.5);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 1.8;
      controls.maxDistance = roomDepth * 2.2;
      controls.minPolarAngle = Math.PI * 0.28;
      controls.maxPolarAngle = Math.PI * 0.56;
      controls.minAzimuthAngle = -Math.PI * 0.4;
      controls.maxAzimuthAngle = Math.PI * 0.4;
      controls.enablePan = false;
      controls.update();

      // --- Fenster auswählen & per Drag verschieben ---------------------
      // Klick auf ein Fenster (ohne Bewegung) → Auswahl (Bearbeitungspanel
      // öffnet sich außerhalb der 3D-Ansicht). Klick + Ziehen → Fenster
      // wandert live entlang SEINER Wand (Rückwand ODER — neu — linke/rechte
      // Wand, je nach cfg.wall); OrbitControls wird währenddessen deaktiviert,
      // sonst würde derselbe Drag gleichzeitig die Kamera drehen.
      var raycaster = new THREE.Raycaster();
      var pointerNDC = new THREE.Vector2();
      // Eine Drag-Ebene pro Wand — normal zeigt jeweils ins Zimmer, exakt wie
      // bei den Wandflächen selbst (siehe buildRoom), damit der Raycast immer
      // auf der Fensterfläche selbst landet, unabhängig davon, welche Wand
      // gerade gezogen wird.
      function planeForWall(wall) {
        var wg = wallGeometry(wall);
        if (wg.axis === "x") return new THREE.Plane(new THREE.Vector3(0, 0, 1), -wg.fixedValue);
        return new THREE.Plane(new THREE.Vector3(wall === "left" ? 1 : -1, 0, 0), wall === "left" ? -wg.fixedValue : wg.fixedValue);
      }
      var selectedCfgId = null;
      var highlightHelper = null;
      var dragState = null;

      function setSelected(cfgId) {
        selectedCfgId = cfgId;
        if (highlightHelper) {
          scene.remove(highlightHelper);
          highlightHelper.geometry.dispose();
          highlightHelper.material.dispose();
          highlightHelper = null;
        }
        if (cfgId && windowGroups[cfgId]) {
          highlightHelper = new THREE.BoxHelper(windowGroups[cfgId], 0xffc94d);
          scene.add(highlightHelper);
        }
      }

      function groupFromIntersected(obj) {
        var o = obj;
        while (o) {
          if (o.userData && o.userData.cfgId) return o;
          o = o.parent;
        }
        return null;
      }

      function setPointerNDC(event) {
        var rect = renderer.domElement.getBoundingClientRect();
        pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      }

      function findCfg(cfgId) {
        for (var i = 0; i < items.length; i++) {
          if (items[i].id === cfgId) return items[i];
        }
        return null;
      }

      function onPointerDown(event) {
        if (event.button !== undefined && event.button !== 0) return;
        setPointerNDC(event);
        raycaster.setFromCamera(pointerNDC, camera);
        var hits = raycaster.intersectObjects(scene.children, true);
        var hitGroup = null;
        for (var i = 0; i < hits.length; i++) {
          hitGroup = groupFromIntersected(hits[i].object);
          if (hitGroup) break;
        }
        if (!hitGroup) return;
        var wall = hitGroup.userData.wall || "back";
        dragState = {
          cfgId: hitGroup.userData.cfgId,
          group: hitGroup,
          wg: wallGeometry(wall),
          plane: planeForWall(wall),
          startClientX: event.clientX,
          startClientY: event.clientY,
          moved: false,
          lastAlong: wallGeometry(wall).axis === "x" ? hitGroup.position.x : hitGroup.position.z,
        };
        controls.enabled = false;
      }

      function onPointerMove(event) {
        if (!dragState) return;
        var dx = event.clientX - dragState.startClientX;
        var dy = event.clientY - dragState.startClientY;
        if (!dragState.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) dragState.moved = true;
        if (!dragState.moved) return;
        setPointerNDC(event);
        raycaster.setFromCamera(pointerNDC, camera);
        var hitPoint = new THREE.Vector3();
        if (!raycaster.ray.intersectPlane(dragState.plane, hitPoint)) return;
        var cfg = findCfg(dragState.cfgId);
        if (!cfg) return;
        var along = clampedAlongFor(cfg, dragState.wg.axis === "x" ? hitPoint.x : hitPoint.z);
        if (dragState.wg.axis === "x") dragState.group.position.x = along;
        else dragState.group.position.z = along;
        dragState.lastAlong = along;
        if (highlightHelper && selectedCfgId === dragState.cfgId) highlightHelper.update();
      }

      function onPointerUp() {
        if (!dragState) return;
        var cfgId = dragState.cfgId;
        var wasDrag = dragState.moved;
        var wg = dragState.wg;
        var lastAlong = dragState.lastAlong;
        controls.enabled = true;
        dragState = null;
        if (wasDrag) {
          var normalized = clamp((lastAlong + wg.span / 2) / wg.span, 0.02, 0.98);
          if (opts.onPositionChange) opts.onPositionChange(cfgId, normalized);
        } else {
          setSelected(cfgId);
          if (opts.onSelect) opts.onSelect(cfgId);
        }
      }

      renderer.domElement.addEventListener("pointerdown", onPointerDown);
      renderer.domElement.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);

      /** Baut nur EIN Fenster neu (nach einer Panel-Bearbeitung von Maßen/Typ/
       * Wand) — nutzt dieselbe placeWindow()-Platzierung wie beim ersten
       * Aufbau (liest die aktuelle cfg.position/cfg.wall), damit ein
       * Wandwechsel automatisch die richtige Rotation/Achse bekommt, statt
       * die alte Weltposition unpassend auf die neue Wand zu übertragen.
       * Kamera/Blickwinkel des Nutzers bleiben unberührt. */
      function refreshWindow(cfgId) {
        var oldGroup = windowGroups[cfgId];
        var cfg = findCfg(cfgId);
        if (!oldGroup || !cfg) return;
        var oldDisposables = oldGroup.userData._disposables || [];
        scene.remove(oldGroup);
        oldDisposables.forEach(function (item) {
          if (item && typeof item.dispose === "function") item.dispose();
        });
        disposables = disposables.filter(function (d) {
          return oldDisposables.indexOf(d) === -1;
        });
        placeWindow(cfg, items.indexOf(cfg));
        if (selectedCfgId === cfgId) setSelected(cfgId);
      }

      /** Bewegt ein Fenster ohne Geometrie-Neuaufbau — für das Positions-
       * Schieberegler im Bearbeitungspanel (Alternative zum Drag in der 3D-
       * Ansicht selbst, z. B. für Trackpad-/Touch-Nutzer). Wandwechsel läuft
       * dagegen über refreshWindow (Rotation ändert sich mit). */
      function setPosition(cfgId, normalized) {
        var group = windowGroups[cfgId];
        var cfg = findCfg(cfgId);
        if (!group || !cfg) return;
        var wg = wallGeometry(wallOf(cfg));
        var along = clampedAlongFor(cfg, -wg.span / 2 + normalized * wg.span);
        if (wg.axis === "x") group.position.x = along;
        else group.position.z = along;
        if (selectedCfgId === cfgId && highlightHelper) highlightHelper.update();
      }

      function selectWindow(cfgId) {
        setSelected(cfgId);
      }

      var frameId = null;
      function animate() {
        frameId = window.requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      function handleResize() {
        var w = container.clientWidth;
        var h = container.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      var resizeObserver = null;
      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);
      } else {
        window.addEventListener("resize", handleResize);
      }

      container._pcRoom3dCleanup = function () {
        window.cancelAnimationFrame(frameId);
        if (resizeObserver) resizeObserver.disconnect();
        else window.removeEventListener("resize", handleResize);
        renderer.domElement.removeEventListener("pointerdown", onPointerDown);
        renderer.domElement.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        controls.dispose();
        if (highlightHelper) {
          scene.remove(highlightHelper);
          highlightHelper.geometry.dispose();
          highlightHelper.material.dispose();
        }
        disposables.forEach(function (item) {
          if (!item) return;
          if (typeof item.dispose === "function") item.dispose();
        });
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };

      return { refreshWindow: refreshWindow, setPosition: setPosition, selectWindow: selectWindow };
    });
  }

  /** Live-Einzelfenster-Ansicht für die Haupt-Vorschau (ersetzt die vorherige
   * statische SVG-Illustration) — kein Raum drumherum (bewusst wie ein reines
   * Produktfoto, transparenter Hintergrund über der vorhandenen CSS-Fläche),
   * aber mit derselben hochwertigen Falten-/Material-Qualität wie "Raum
   * ansehen". Anders als mount() baut das hier eine PERSISTENTE Szene auf und
   * gibt ein Handle mit update(cfg) zurück, das bei jeder Maß-/Farbänderung
   * nur die Fenstergruppe austauscht — nicht Renderer/Kamera/Licht neu baut,
   * das wäre bei Live-Eingaben (Schieberegler, Stepper) viel zu teuer. */
  function mountSingle(container, config) {
    return loadThree().then(function () {
      return loadModelParts(config.plisseeModelUrl).catch(function (err) {
        console.warn("Plissee-Konfigurator: 3D-Modellteile nicht geladen, nutze prozedurale Geometrie.", err);
        return null;
      });
    }).then(function (modelParts) {
      var width = container.clientWidth || 400;
      var height = container.clientHeight || 480;

      var scene = new THREE.Scene();
      // Kein Hintergrund/keine Wände — der Canvas liegt transparent über der
      // vorhandenen CSS-Fläche der Vorschau-Karte, wie ein freigestelltes
      // Produktfoto statt einer Zimmerszene.
      var camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 20);

      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      if (renderer.outputColorSpace !== undefined && THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      }
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (THREE.ACESFilmicToneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
      }
      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xf3ecd8, 0xfbf8ef, 0.6));
      var dirLight = new THREE.DirectionalLight(0xfff3df, 1.5);
      dirLight.position.set(-1.4, 2.4, 2.2);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.set(1024, 1024);
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 8;
      dirLight.shadow.camera.left = -1.4;
      dirLight.shadow.camera.right = 1.4;
      dirLight.shadow.camera.top = 1.6;
      dirLight.shadow.camera.bottom = -0.2;
      dirLight.shadow.bias = -0.0015;
      scene.add(dirLight);
      scene.add(dirLight.target);
      var fillLight = new THREE.DirectionalLight(0xdfe8ff, 0.25);
      fillLight.position.set(1.2, 1.2, 1.6);
      scene.add(fillLight);

      // Weicher, aufgemalter Bodenschatten statt einer echten
      // ShadowMaterial-Fangfläche — die zeigte bei flachem Kamerawinkel einen
      // sichtbar grauen Rand statt vollständig transparent zu bleiben
      // (unabhängig von der Plane-Größe). Ein Canvas-Verlauf ist hier
      // zuverlässiger und für einen reinen Kontaktschatten völlig ausreichend.
      var shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = 128;
      shadowCanvas.height = 128;
      var sctx = shadowCanvas.getContext("2d");
      var grad = sctx.createRadialGradient(64, 64, 4, 64, 64, 62);
      grad.addColorStop(0, "rgba(30,26,14,0.32)");
      grad.addColorStop(1, "rgba(30,26,14,0)");
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 128, 128);
      var shadowTex = new THREE.CanvasTexture(shadowCanvas);
      var shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
      var shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), shadowMat);
      shadowCatcher.rotation.x = -Math.PI / 2;
      shadowCatcher.position.y = 0.002;
      scene.add(shadowCatcher);

      var controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 0.75;
      controls.maxDistance = 3.9;
      controls.minPolarAngle = Math.PI * 0.3;
      controls.maxPolarAngle = Math.PI * 0.62;
      controls.minAzimuthAngle = -Math.PI * 0.42;
      controls.maxAzimuthAngle = Math.PI * 0.42;
      controls.enablePan = false;

      var currentGroup = null;

      function update(cfg) {
        if (currentGroup) {
          scene.remove(currentGroup);
          (currentGroup.userData._disposables || []).forEach(function (item) {
            if (item && typeof item.dispose === "function") item.dispose();
          });
          currentGroup = null;
        }
        currentGroup = buildWindowGroup(cfg, config, modelParts);
        currentGroup.position.set(0, 0, 0);
        scene.add(currentGroup);

        var winWidth = clamp(cfg.width / 100, 0.25, 1.8);
        var winHeight = clamp(cfg.height / 100, 0.25, 2.6);
        var centerY = winHeight / 2 + 0.06;
        controls.target.set(0, centerY, 0);
        dirLight.target.position.set(0, centerY, 0);
        // Genug Abstand für Rahmen/Fensterbank-Überstand auf beiden Achsen,
        // nicht nur für die reine Fensterhöhe — sonst wird bei breiten
        // Fenstern der Rahmenrand angeschnitten. Nur AUSZOOMEN, nie
        // reinzoomen: sonst würde jede Maßänderung eine manuelle Drehung/
        // einen manuellen Zoom des Nutzers zurücksetzen. Bei drastisch
        // größeren Maßen (z. B. 60×200 statt 100×120) reicht der ursprünglich
        // berechnete Abstand sonst nicht mehr aus und der Rahmen wird
        // abgeschnitten.
        var dist = clamp(Math.max(winWidth, winHeight) * 1.78 + 0.62, 1.5, 4.0);
        var currentDist = update._positioned ? camera.position.distanceTo(controls.target) : 0;
        if (!update._positioned || dist > currentDist) {
          var dir = update._positioned ? camera.position.clone().sub(controls.target).normalize() : new THREE.Vector3(0, 0.12, 1).normalize();
          camera.position.copy(controls.target).addScaledVector(dir, dist);
          update._positioned = true;
        }
        controls.update();
      }

      var frameId = null;
      function animate() {
        frameId = window.requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      function handleResize() {
        var w = container.clientWidth;
        var h = container.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      var resizeObserver = null;
      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);
      } else {
        window.addEventListener("resize", handleResize);
      }

      return {
        update: update,
        dispose: function () {
          window.cancelAnimationFrame(frameId);
          if (resizeObserver) resizeObserver.disconnect();
          else window.removeEventListener("resize", handleResize);
          controls.dispose();
          if (currentGroup) {
            (currentGroup.userData._disposables || []).forEach(function (item) {
              if (item && typeof item.dispose === "function") item.dispose();
            });
          }
          shadowCatcher.geometry.dispose();
          shadowMat.dispose();
          shadowTex.dispose();
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        },
      };
    });
  }

  function dispose(container) {
    if (container && typeof container._pcRoom3dCleanup === "function") {
      container._pcRoom3dCleanup();
      container._pcRoom3dCleanup = null;
    }
  }

  window.PlisseeRoom3D = { mount: mount, mountSingle: mountSingle, dispose: dispose };
})();
