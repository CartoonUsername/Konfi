/**
 * Plissee-Konfigurator
 * Trennung: PlisseeConfiguratorState (reine Konfigurations-/Preislogik, kein DOM)
 *           PlisseeConfiguratorView   (DOM-Rendering + Event-Bindung, liest/schreibt nur über State)
 */

(function () {
  "use strict";

  function clamp(value, min, max) {
    if (Number.isNaN(value)) return min;
    return Math.min(max, Math.max(min, value));
  }

  function formatMoney(amount, currency) {
    return amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + (currency || "€");
  }

  /** Vorschläge für das Raum-Eingabefeld ("Mein Haus") — typische Räumlichkeiten
   * eines Hauses/einer Wohnung, damit man den Raum per Vorschlagsliste auswählen
   * statt jedes Mal frei eintippen zu müssen. Freitext bleibt weiterhin möglich
   * (das <input list> lässt jeden Wert zu), das ist nur die Vorbelegung. */
  var ROOM_NAME_PRESETS = [
    "Wohnzimmer",
    "Schlafzimmer 1",
    "Schlafzimmer 2",
    "Kinderzimmer",
    "Küche",
    "Esszimmer",
    "Bad",
    "Gästezimmer",
    "Arbeitszimmer",
    "Flur",
    "Keller",
    "Dachboden",
  ];

  /** Einheitspreis für beliebige Maße/Auswahl — losgelöst vom aktuellen State,
   * damit dieselbe Formel auch für bereits gemerkte Fenster (Raum-Planer,
   * Bearbeitung in der 3D-Ansicht) genutzt werden kann, ohne den State-
   * "aktuelle Konfiguration" umzuschalten. */
  function computeUnitPrice(config, { width, height, fabricId, railId, bracketId }) {
    const fabric = config.fabrics.find((f) => f.id === fabricId);
    if (!fabric) return 0;
    const rail = config.rails.find((r) => r.id === railId);
    const bracket = config.brackets.find((b) => b.id === bracketId);
    const base = config.baseFee + (width / 100) * config.pricePerMeterWidth + (height / 100) * config.pricePerMeterHeight;
    const surcharge = (fabric.surcharge || 0) + (rail ? rail.surcharge : 0) + (bracket ? bracket.surcharge : 0);
    const unit = Math.max(base + surcharge, config.minPrice);
    return Math.round(unit * 100) / 100;
  }

  /* ---------------------------------------------------------------------
   * State: hält alle Konfigurationswerte + Preisberechnung.
   * Kennt keine DOM-Elemente. Benachrichtigt Listener bei jeder Änderung.
   * ------------------------------------------------------------------- */
  class PlisseeConfiguratorState {
    constructor(config) {
      this.config = config;
      this.width = config.defaultWidth;
      this.height = config.defaultHeight;
      this.railId = config.rails[0] ? config.rails[0].id : null;
      this.bracketId = config.brackets[0] ? config.brackets[0].id : null;
      this.fabricId = config.fabrics[0] ? config.fabrics[0].id : null;
      this.quantity = 1;
      // Raum-Zuordnung (z. B. "Wohnzimmer") — Grundlage für die Haus-Planung:
      // mehrere Fenster desselben Raums werden in der Merkliste gruppiert.
      this.room = "";
      // Freier Hinweistext des Kunden ("Anmerkung") — unabhängig vom Raum-
      // Planer, landet auf jeder Warenkorbposition (siehe toCartProperties).
      this.note = "";
      this.filters = { collection: "", colorGroup: "", opacity: "" };
      this.savedConfigs = [];
      // Ob die aktuelle Konfiguration "zählt" (als weiteres Stück on top der
      // gemerkten Liste). Direkt nach dem Laden/Zurücksetzen zählt sie nur,
      // wenn noch nichts gemerkt wurde — sonst wäre die frische Konfiguration
      // sofort ein ungewolltes drittes Stück im Gesamtbetrag.
      this._currentDirty = true;
      this._listeners = [];
    }

    subscribe(fn) {
      this._listeners.push(fn);
      return () => {
        this._listeners = this._listeners.filter((l) => l !== fn);
      };
    }

    _emit(changeType) {
      this._listeners.forEach((fn) => fn(this, changeType));
    }

    setWidth(value) {
      this.width = clamp(Math.round(value * 10) / 10, this.config.minWidth, this.config.maxWidth);
      this._currentDirty = true;
      this._emit("dimensions");
    }

    setHeight(value) {
      this.height = clamp(Math.round(value * 10) / 10, this.config.minHeight, this.config.maxHeight);
      this._currentDirty = true;
      this._emit("dimensions");
    }

    stepWidth(delta) {
      this.setWidth(this.width + delta);
    }

    stepHeight(delta) {
      this.setHeight(this.height + delta);
    }

    setRail(id) {
      if (!this.config.rails.some((r) => r.id === id)) return;
      this.railId = id;
      this._currentDirty = true;
      this._emit("rail");
    }

    setBracket(id) {
      if (!this.config.brackets.some((b) => b.id === id)) return;
      this.bracketId = id;
      this._currentDirty = true;
      this._emit("bracket");
    }

    setFabric(id) {
      if (!this.config.fabrics.some((f) => f.id === id)) return;
      this.fabricId = id;
      this._currentDirty = true;
      this._emit("fabric");
    }

    setFilter(key, value) {
      if (!(key in this.filters)) return;
      this.filters[key] = value;
      // Falls der aktuell gewählte Stoff nach dem Filtern nicht mehr sichtbar ist,
      // bleibt er trotzdem "gewählt" (nur die Galerie wird eingeschränkt).
      this._emit("filters");
    }

    resetFilters() {
      this.filters = { collection: "", colorGroup: "", opacity: "" };
      this._emit("filters");
    }

    setQuantity(value) {
      this.quantity = clamp(Math.round(value), 1, 99);
      this._currentDirty = true;
      this._emit("quantity");
    }

    stepQuantity(delta) {
      this.setQuantity(this.quantity + delta);
    }

    /** Raumbezeichnung (z. B. "Wohnzimmer") — kein Pflichtfeld, aber die
     * Grundlage für die Haus-Planung: Fenster mit demselben Raumnamen werden
     * in der Merkliste als eine Gruppe zusammengefasst. */
    setRoom(value) {
      this.room = String(value || "").slice(0, 60);
      this._currentDirty = true;
      this._emit("room");
    }

    /** Freier Hinweistext ("Anmerkung") — vom Raum-Planer unabhängig, gilt
     * für die ganze Bestellung, nicht pro Fenster. */
    setNote(value) {
      this.note = String(value || "").slice(0, 500);
      this._emit("note");
    }

    get rail() {
      return this.config.rails.find((r) => r.id === this.railId) || null;
    }

    get bracket() {
      return this.config.brackets.find((b) => b.id === this.bracketId) || null;
    }

    get fabric() {
      return this.config.fabrics.find((f) => f.id === this.fabricId) || null;
    }

    get filteredFabrics() {
      return this.config.fabrics.filter((f) => {
        if (this.filters.collection && f.collection !== this.filters.collection) return false;
        if (this.filters.colorGroup && f.colorGroup !== this.filters.colorGroup) return false;
        if (this.filters.opacity && String(f.opacity) !== String(this.filters.opacity)) return false;
        return true;
      });
    }

    /**
     * Preisformel — Grundpreis + Breite × Breitenrate + Höhe × Höhenrate,
     * PLUS feste Stoff-/Schienen-/Klemmträger-Aufpreise (statt Fläche × Rate).
     * Kalibriert anhand real gemessener Referenzpreise: Breite und Höhe wirken
     * sich unterschiedlich stark aus (nicht symmetrisch wie bei reiner
     * Flächenberechnung), und Stoff-Mehrpreise sind feste €-Aufpreise pro
     * Stoffgruppe, keine Faktoren auf den Gesamtpreis.
     */
    get unitPrice() {
      return computeUnitPrice(this.config, {
        width: this.width,
        height: this.height,
        fabricId: this.fabricId,
        railId: this.railId,
        bracketId: this.bracketId,
      });
    }

    get totalPrice() {
      return Math.round(this.unitPrice * this.quantity * 100) / 100;
    }

    get isValid() {
      return (
        this.width >= this.config.minWidth &&
        this.width <= this.config.maxWidth &&
        this.height >= this.config.minHeight &&
        this.height <= this.config.maxHeight &&
        !!this.fabric &&
        !!this.rail &&
        !!this.bracket
      );
    }

    /** Für den Warenkorb-Submit (Zeilen-Eigenschaften). */
    toCartProperties() {
      const props = {
        Breite: this.width + " cm",
        Höhe: this.height + " cm",
        Stoff: this.fabric ? this.fabric.name : "",
        Schiene: this.rail ? this.rail.name : "",
        Klemmträger: this.bracket ? this.bracket.name : "",
      };
      if (this.room.trim()) props.Raum = this.room.trim();
      if (this.note.trim()) props.Anmerkung = this.note.trim();
      return props;
    }

    /** "Zwischenspeicher": mehrere Plissee-Konfigurationen für ein ganzes Haus
     * sammeln (mehrere Räume, pro Raum mehrere Fenster), ohne die aktuelle
     * Konfiguration zu verlieren — erst beim Warenkorb-Klick werden alle
     * zusammen übermittelt. */
    saveCurrentConfig() {
      if (!this.isValid) return;
      this.savedConfigs.push({
        id: "cfg-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        // Ohne Eingabe landet das Fenster in einer Sammelgruppe, statt die
        // Zuordnung zu blockieren — Raumnamen sind bewusst kein Pflichtfeld.
        room: this.room.trim() || "Weitere Fenster",
        width: this.width,
        height: this.height,
        fabricId: this.fabricId,
        railId: this.railId,
        bracketId: this.bracketId,
        quantity: this.quantity,
        unitPrice: this.unitPrice,
        // "fenster" (Standard, Brüstungshöhe) oder "tuer" (bodentiefe
        // Glastür) — bestimmt in der 3D-Raumansicht, wie das Fenster an der
        // Wand sitzt (siehe plissee-room-3d.js). wall: "back"/"left"/"right"
        // — an welcher Wand das Fenster in der 3D-Raumansicht hängt. Position:
        // normalisierte Stelle (0–1) entlang DIESER Wand; null = automatisch
        // verteilt, bis der Kunde das Fenster in der 3D-Ansicht selbst
        // verschiebt.
        type: "fenster",
        wall: "back",
        position: null,
      });
      // Formular für das nächste Fenster zurücksetzen. Ohne Reset bliebe die
      // aktuelle Konfiguration identisch zur gerade gemerkten und würde im
      // Gesamtbetrag doppelt gezählt (einmal als Listeneintrag, einmal als
      // "aktuelle" Konfiguration) — genau der Bug, den das behebt.
      this.width = this.config.defaultWidth;
      this.height = this.config.defaultHeight;
      this.railId = this.config.rails[0] ? this.config.rails[0].id : null;
      this.bracketId = this.config.brackets[0] ? this.config.brackets[0].id : null;
      this.fabricId = this.config.fabrics[0] ? this.config.fabrics[0].id : null;
      this.quantity = 1;
      // Der Raumname bleibt bewusst stehen: meist gehört das nächste Fenster
      // zum selben Raum, so kann man mehrere Fenster hintereinander merken,
      // ohne den Raumnamen jedes Mal neu einzutippen.
      this._currentDirty = false;
      this._emit("savedConfigs");
    }

    removeSavedConfig(id) {
      this.savedConfigs = this.savedConfigs.filter((c) => c.id !== id);
      this._emit("savedConfigs");
    }

    /** Bearbeitet ein bereits gemerktes Fenster direkt (Maße, Typ, Position an
     * der Wand) — genutzt von der 3D-Raumansicht, wenn der Kunde dort ein
     * Fenster auswählt, verschiebt oder dessen Größe ändert. Der Preis wird
     * dabei neu berechnet, da er von Breite/Höhe abhängt. */
    updateSavedConfig(id, patch) {
      const cfg = this.savedConfigs.find((c) => c.id === id);
      if (!cfg) return;
      if (patch.width != null) {
        cfg.width = clamp(Math.round(patch.width * 10) / 10, this.config.minWidth, this.config.maxWidth);
      }
      if (patch.height != null) {
        cfg.height = clamp(Math.round(patch.height * 10) / 10, this.config.minHeight, this.config.maxHeight);
      }
      if (patch.type === "fenster" || patch.type === "tuer") cfg.type = patch.type;
      if (patch.wall === "back" || patch.wall === "left" || patch.wall === "right") cfg.wall = patch.wall;
      if (patch.position != null) cfg.position = clamp(patch.position, 0.04, 0.96);
      cfg.unitPrice = computeUnitPrice(this.config, cfg);
      this._emit("savedConfigs");
    }

    clearSavedConfigs() {
      this.savedConfigs = [];
      this._emit("savedConfigs");
    }

    /** Lädt eine gemerkte Konfiguration zurück in die aktive Bearbeitung
     * (und entfernt sie aus der Liste, damit sie nicht doppelt gezählt wird). */
    loadSavedConfig(id) {
      const cfg = this.savedConfigs.find((c) => c.id === id);
      if (!cfg) return;
      this.savedConfigs = this.savedConfigs.filter((c) => c.id !== id);
      this.width = cfg.width;
      this.height = cfg.height;
      this.fabricId = cfg.fabricId;
      this.railId = cfg.railId;
      this.bracketId = cfg.bracketId;
      this.room = cfg.room;
      this.quantity = cfg.quantity;
      // Die zurückgeholte Konfiguration ist wieder eine echte, gewollte
      // Bestellposition — zählt also wieder im Gesamtbetrag mit.
      this._currentDirty = true;
      this._emit("load");
    }

    get savedConfigsTotal() {
      return Math.round(this.savedConfigs.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0) * 100) / 100;
    }

    /** Gruppiert die Merkliste nach Raum (in der Reihenfolge, in der jeder Raum
     * zuerst vorkam) — das ist die Grundlage für die Haus-Planung: pro Raum
     * eine Gruppe mit allen zugehörigen Fenstern und einer Raum-Zwischensumme. */
    get roomGroups() {
      const order = [];
      const map = new Map();
      this.savedConfigs.forEach((cfg) => {
        if (!map.has(cfg.room)) {
          map.set(cfg.room, []);
          order.push(cfg.room);
        }
        map.get(cfg.room).push(cfg);
      });
      return order.map((room) => {
        const items = map.get(room);
        const subtotal = Math.round(items.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0) * 100) / 100;
        return { room, items, subtotal };
      });
    }

    get savedRoomCount() {
      return new Set(this.savedConfigs.map((c) => c.room)).size;
    }

    get savedWindowCount() {
      return this.savedConfigs.length;
    }

    /** Vorschlagsliste für das Raum-Eingabefeld: typische Räumlichkeiten
     * (ROOM_NAME_PRESETS) zuerst, danach bereits verwendete, davon abweichende
     * Raumnamen — so ist der Raum meist per Auswahl statt per Freitext-Tipparbeit
     * zu bestimmen, individuelle Bezeichnungen bleiben aber möglich. */
    get knownRoomNames() {
      const used = this.savedConfigs.map((c) => c.room).filter(Boolean);
      return Array.from(new Set([...ROOM_NAME_PRESETS, ...used]));
    }

    /** Ob die aktuelle Konfiguration als weiteres Stück mitzählt — nur, wenn
     * noch nichts gemerkt wurde (dann ist sie die einzige Bestellposition),
     * oder wenn sie seit dem letzten Speichern/Zurücksetzen bewusst verändert
     * wurde. Direkt nach "Merken" ist das Formular nur ein frischer, noch
     * unbearbeiteter Ausgangspunkt für die nächste Konfiguration und wird
     * deshalb NICHT automatisch als zusätzliches Stück berechnet. */
    get currentCountsTowardTotal() {
      return this.savedConfigs.length === 0 || this._currentDirty;
    }

    get grandTotal() {
      const current = this.currentCountsTowardTotal ? this.totalPrice : 0;
      return Math.round((current + this.savedConfigsTotal) * 100) / 100;
    }

    /** Cart-Payload für alle gemerkten Konfigurationen, plus die aktuelle nur
     * dann, wenn sie tatsächlich als eigene Bestellposition zählt (siehe
     * currentCountsTowardTotal) — sonst würde ein unbearbeitetes, frisch
     * zurückgesetztes Formular ungewollt mitbestellt. */
    toCartItemsPayload(variantId) {
      const items = this.savedConfigs.map((cfg) => ({
        id: variantId,
        quantity: cfg.quantity,
        properties: this._propsForSnapshot(cfg),
      }));
      if (this.currentCountsTowardTotal) {
        items.push({
          id: variantId,
          quantity: this.quantity,
          properties: this.toCartProperties(),
        });
      }
      return items;
    }

    _propsForSnapshot(cfg) {
      const fabric = this.config.fabrics.find((f) => f.id === cfg.fabricId);
      const rail = this.config.rails.find((r) => r.id === cfg.railId);
      const bracket = this.config.brackets.find((b) => b.id === cfg.bracketId);
      const sameRoom = this.savedConfigs.filter((c) => c.room === cfg.room);
      const windowIndex = sameRoom.indexOf(cfg) + 1;
      const props = {
        Raum: cfg.room,
        Fenster: "Fenster " + windowIndex,
        Breite: cfg.width + " cm",
        Höhe: cfg.height + " cm",
        Stoff: fabric ? fabric.name : "",
        Schiene: rail ? rail.name : "",
        Klemmträger: bracket ? bracket.name : "",
      };
      if (cfg.type === "tuer") props.Typ = "Glastür (bodentief)";
      if (this.note.trim()) props.Anmerkung = this.note.trim();
      return props;
    }
  }

  /* ---------------------------------------------------------------------
   * View: bindet DOM-Elemente innerhalb eines Root-Containers an den State.
   * ------------------------------------------------------------------- */
  class PlisseeConfiguratorView {
    constructor(root, state) {
      this.root = root;
      this.state = state;
      this.els = this._queryElements();
      this._buildPleatColorStops();
      this._bindEvents();
      this._renderTileGroup(this.els.railGroup, state.config.rails, state.railId, "rail");
      this._renderTileGroup(this.els.bracketGroup, state.config.brackets, state.bracketId, "bracket");
      this._renderFilterOptions();
      this._renderFabricGallery();
      this._renderSavedConfigs();
      this.state.subscribe((s, changeType) => this._onStateChange(s, changeType));
      this._renderAll();
      this._initSingle3d();
      this._setupPhotoAdjustToggle();
    }

    /** Startet die interaktive 3D-Live-Ansicht der Haupt-Vorschau (siehe
     * plissee-room-3d.js) — ersetzt die frühere statische SVG-Illustration.
     * Läuft asynchron (Three.js lädt erst hier nach); bis das Handle steht,
     * bleibt die vorherige _renderAll()-Farbaktualisierung für Grid/Foto-Modus
     * unberührt, nur die Haupt-Stage zeigt kurz einen Ladehinweis. */
    _initSingle3d() {
      if (!this.els.stageSingle3d || !window.PlisseeRoom3D) return;
      this.els.stageSingle3d.classList.add("is-loading");
      window.PlisseeRoom3D.mountSingle(this.els.stageSingle3d, this.state.config)
        .then((handle) => {
          this._single3d = handle;
          this.els.stageSingle3d.classList.remove("is-loading");
          this._updateSingle3d();
        })
        .catch((err) => {
          console.error("Plissee-Konfigurator: 3D-Hauptvorschau konnte nicht geladen werden.", err);
          this.els.stageSingle3d.classList.remove("is-loading");
        });
    }

    _updateSingle3d() {
      if (!this._single3d) return;
      this._single3d.update({
        width: this.state.width,
        height: this.state.height,
        fabricId: this.state.fabricId,
        railId: this.state.railId,
        bracketId: this.state.bracketId,
      });
    }

    _queryElements() {
      const q = (sel) => this.root.querySelector(sel);
      const qa = (sel) => Array.from(this.root.querySelectorAll(sel));
      return {
        widthInput: q("[data-width-input]"),
        heightInput: q("[data-height-input]"),
        widthInc: q("[data-width-inc]"),
        widthDec: q("[data-width-dec]"),
        heightInc: q("[data-height-inc]"),
        heightDec: q("[data-height-dec]"),
        widthRange: q("[data-width-range]"),
        heightRange: q("[data-height-range]"),
        railGroup: q("[data-rail-group]"),
        bracketGroup: q("[data-bracket-group]"),
        filterCollection: q("[data-filter-collection]"),
        filterColor: q("[data-filter-color]"),
        filterOpacity: q("[data-filter-opacity]"),
        fabricGallery: q("[data-fabric-gallery]"),
        fabricEmpty: q("[data-fabric-empty]"),
        selectedFabricSwatch: q("[data-selected-fabric-swatch]"),
        selectedFabricName: q("[data-selected-fabric-name]"),
        selectedFabricSub: q("[data-selected-fabric-sub]"),
        roomSelect: q("[data-room-select]"),
        roomCustomInput: q("[data-room-custom]"),
        noteInput: q("[data-note-input]"),
        enableMultiRoomBtn: q("[data-enable-multiroom]"),
        savedConfigsPanel: q("[data-saved-configs-panel]"),
        saveConfigBtn: q("[data-save-config]"),
        savedList: q("[data-saved-list]"),
        savedEmpty: q("[data-saved-empty]"),
        savedSummary: q("[data-saved-summary]"),
        savedTotal: q("[data-saved-total]"),
        savedCount: q("[data-saved-count]"),
        savedRoomCount: q("[data-saved-rooms]"),
        savedRoomWord: q("[data-saved-room-word]"),
        photoAdjustBtn: q("[data-photo-adjust]"),
        zoomBtn: q("[data-zoom-btn]"),
        stageSingle: q("[data-stage-single]"),
        stageSingle3d: q("[data-stage-single-3d]"),
        pleatGradients: qa("[data-pleat-gradient]"),
        railGradients: qa("[data-rail-gradient]"),
        bracketGradients: qa("[data-bracket-gradient]"),
        photoFabric: qa("[data-photo-fabric]"),
        photoRail: qa("[data-photo-rail]"),
        photoBracket: qa("[data-photo-bracket]"),
        metaWidth: q("[data-meta-width]"),
        metaHeight: q("[data-meta-height]"),
        metaFabric: q("[data-meta-fabric]"),
        price: q("[data-price]"),
        priceTotal: q("[data-price-total]"),
        priceTotalLabel: q("[data-price-total-label]"),
        qtyInput: q("[data-qty-input]"),
        qtyInc: q("[data-qty-inc]"),
        qtyDec: q("[data-qty-dec]"),
        addToCartBtn: q("[data-add-to-cart]"),
        cartForm: q("[data-cart-form]"),
        propsContainer: q("[data-cart-properties]"),
        toast: q("[data-toast]"),
        lightbox: q("[data-lightbox]"),
        lightboxPanel: q(".pc-lightbox__panel"),
        lightboxStage: q("[data-lightbox-stage]"),
        lightboxClose: q("[data-lightbox-close]"),
        previewSelectHint: q("[data-preview-select-hint]"),
      };
    }

    _buildPleatColorStops() {
      // Erzeugt aus jeder Stofffarbe zwei Helligkeitsstufen für die Plissee-Faltenoptik.
      this._colorCache = new Map();
    }

    _shade(hex, percent) {
      const key = hex + "_" + percent;
      if (this._colorCache.has(key)) return this._colorCache.get(key);
      const num = parseInt(hex.replace("#", ""), 16);
      let r = (num >> 16) + Math.round(255 * percent);
      let g = ((num >> 8) & 0x00ff) + Math.round(255 * percent);
      let b = (num & 0x0000ff) + Math.round(255 * percent);
      r = clamp(r, 0, 255);
      g = clamp(g, 0, 255);
      b = clamp(b, 0, 255);
      const result = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      this._colorCache.set(key, result);
      return result;
    }

    /** Schreibt eine Liste von Farben auf die <stop>-Kindelemente jedes übergebenen
     * Gradient-Elements (mehrere Elemente, da Einzel- und Rasteransicht je eine
     * eigene SVG-Instanz mit eigenem Gradient besitzen). */
    _setGradientStops(gradients, colors) {
      gradients.forEach((gradient) => {
        const stops = gradient.querySelectorAll("stop");
        colors.forEach((color, i) => {
          if (stops[i]) stops[i].setAttribute("stop-color", color);
        });
      });
    }

    _bindEvents() {
      const { els, state } = this;

      els.widthInput.addEventListener("change", (e) => state.setWidth(parseFloat(e.target.value)));
      els.heightInput.addEventListener("change", (e) => state.setHeight(parseFloat(e.target.value)));
      els.widthInc.addEventListener("click", () => state.stepWidth(state.config.step));
      els.widthDec.addEventListener("click", () => state.stepWidth(-state.config.step));
      els.heightInc.addEventListener("click", () => state.stepHeight(state.config.step));
      els.heightDec.addEventListener("click", () => state.stepHeight(-state.config.step));

      if (els.widthRange) els.widthRange.addEventListener("input", (e) => state.setWidth(parseFloat(e.target.value)));
      if (els.heightRange) els.heightRange.addEventListener("input", (e) => state.setHeight(parseFloat(e.target.value)));

      els.filterCollection.addEventListener("change", (e) => state.setFilter("collection", e.target.value));
      els.filterColor.addEventListener("change", (e) => state.setFilter("colorGroup", e.target.value));
      els.filterOpacity.addEventListener("change", (e) => state.setFilter("opacity", e.target.value));

      els.zoomBtn.addEventListener("click", () => this._openLightbox({ mode: "preview" }));
      // Klick auf das Vorschaubild selbst springt zur Stoffauswahl (Hover zeigt "Auswählen").
      // Kein Klick-Handler mehr auf der Haupt-Stage: die 3D-Ansicht ist jetzt
      // selbst interaktiv (Ziehen zum Drehen) — ein "Klick springt zur
      // Stoffauswahl"-Handler würde diese Drag-Geste stören.

      // Raum-Auswahl unter "Mein Haus": ein <select> mit typischen
      // Räumlichkeiten statt eines Freitextfelds — "Andere Räumlichkeit…"
      // blendet zusätzlich ein Textfeld für individuelle Namen ein.
      if (els.roomSelect) {
        els.roomSelect.addEventListener("change", (e) => {
          if (e.target.value === "__custom__") {
            if (els.roomCustomInput) {
              els.roomCustomInput.hidden = false;
              els.roomCustomInput.value = "";
              els.roomCustomInput.focus();
            }
            state.setRoom("");
          } else {
            if (els.roomCustomInput) els.roomCustomInput.hidden = true;
            state.setRoom(e.target.value);
          }
        });
      }
      if (els.roomCustomInput) {
        els.roomCustomInput.addEventListener("input", (e) => state.setRoom(e.target.value));
      }
      // Anmerkung (optional): freier Hinweistext des Kunden, unabhängig vom
      // Raum-Planer immer sichtbar — landet auf jeder Warenkorbposition.
      if (els.noteInput) {
        els.noteInput.addEventListener("input", (e) => state.setNote(e.target.value));
      }
      els.saveConfigBtn.addEventListener("click", () => state.saveCurrentConfig());
      if (els.enableMultiRoomBtn) els.enableMultiRoomBtn.addEventListener("click", () => this._enableMultiRoom());

      els.qtyInput.addEventListener("change", (e) => state.setQuantity(parseInt(e.target.value, 10)));
      els.qtyInc.addEventListener("click", () => state.stepQuantity(1));
      els.qtyDec.addEventListener("click", () => state.stepQuantity(-1));

      els.addToCartBtn.addEventListener("click", (e) => this._handleAddToCart(e));

      els.lightboxClose.addEventListener("click", () => this._closeLightbox());
      els.lightbox.addEventListener("click", (e) => {
        if (e.target === els.lightbox) this._closeLightbox();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this._closeLightbox();
      });
    }

    /** Bild hat Vorrang vor Flächenfarbe, sobald ein Options-Foto hinterlegt ist
     * (Theme-Editor image_picker) — sonst Fallback auf die Flächenfarbe. Für
     * Schiene/Klemmträger (Hardware, keine Webstruktur). */
    _swatchStyle(item) {
      if (item.image) {
        return "background-image:url('" + item.image + "');background-size:cover;background-position:center;";
      }
      return "background:" + item.color + ";";
    }

    /** Wie _swatchStyle, aber für Stoffe: ohne Foto wird statt einer Flächenfarbe
     * eine gekachelte Falten-Textur erzeugt (derselbe 5-Stop-Verlauf wie die
     * SVG-Illustration) — foldPx steuert die Kachelgröße (klein für Galerie-
     * Kacheln, groß für die Vollbild-Zoomansicht). */
    _fabricSwatchStyle(fabric, foldPx) {
      if (fabric.image) {
        return "background-image:url('" + fabric.image + "');background-size:cover;background-position:center;";
      }
      const c0 = this._shade(fabric.color, -0.16);
      const c1 = this._shade(fabric.color, 0.3);
      const c2 = this._shade(fabric.color, 0.02);
      const c3 = this._shade(fabric.color, -0.22);
      const p1 = Math.round(foldPx * 0.16);
      const p2 = Math.round(foldPx * 0.55);
      const p3 = Math.round(foldPx * 0.85);
      const gradient =
        "repeating-linear-gradient(180deg, " +
        c0 + " 0px, " + c1 + " " + p1 + "px, " + c2 + " " + p2 + "px, " + c3 + " " + p3 + "px, " + c0 + " " + foldPx + "px)";
      return "background-image:" + gradient + ";background-color:" + fabric.color + ";";
    }

    _renderTileGroup(container, items, activeId, kind) {
      container.innerHTML = "";
      items.forEach((item) => {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "pc-tile";
        tile.setAttribute("aria-pressed", String(item.id === activeId));
        tile.dataset.tileId = item.id;
        tile.innerHTML =
          '<span class="pc-tile__check">' + ICONS.check + "</span>" +
          '<span class="pc-tile__swatch" style="' + this._swatchStyle(item) + '"></span>' +
          '<span class="pc-tile__label">' + item.name + "</span>";
        tile.addEventListener("click", () => {
          if (kind === "rail") this.state.setRail(item.id);
          else this.state.setBracket(item.id);
        });
        container.appendChild(tile);
      });
    }

    _renderFilterOptions() {
      const cfg = this.state.config;
      const uniq = (arr) => Array.from(new Set(arr));
      const fill = (select, values, placeholder) => {
        select.innerHTML = '<option value="">' + placeholder + "</option>";
        values.forEach((v) => {
          const opt = document.createElement("option");
          opt.value = v;
          opt.textContent = v;
          select.appendChild(opt);
        });
      };
      fill(this.els.filterCollection, uniq(cfg.fabrics.map((f) => f.collection)), "Kollektion");
      fill(this.els.filterColor, uniq(cfg.fabrics.map((f) => f.colorGroup)), "Farbton");
      fill(
        this.els.filterOpacity,
        uniq(cfg.fabrics.map((f) => f.opacity)).sort((a, b) => b - a),
        "Verdunkelung"
      );
      // Verdunkelung-Werte mit "%" anzeigen
      Array.from(this.els.filterOpacity.options).forEach((opt) => {
        if (opt.value) opt.textContent = opt.value + " %";
      });
    }

    _renderFabricGallery() {
      const { fabricGallery, fabricEmpty } = this.els;
      const fabrics = this.state.filteredFabrics;
      fabricGallery.innerHTML = "";

      fabricEmpty.classList.toggle("is-visible", fabrics.length === 0);

      fabrics.forEach((fabric) => {
        const tile = document.createElement("div");
        tile.className = "pc-tile pc-tile--fabric";
        tile.setAttribute("aria-pressed", String(fabric.id === this.state.fabricId));
        tile.dataset.fabricId = fabric.id;
        tile.tabIndex = 0;
        tile.setAttribute("role", "button");
        tile.innerHTML =
          '<span class="pc-tile__check">' + ICONS.check + "</span>" +
          '<span class="pc-tile__swatch" style="' + this._fabricSwatchStyle(fabric, 8) + '"></span>' +
          '<button type="button" class="pc-tile__zoom" data-fabric-zoom="' + fabric.id + '" aria-label="' + fabric.name + " vergrößern\">" + ICONS.zoom + "</button>" +
          '<span class="pc-tile__label">' + fabric.name + "</span>";

        tile.addEventListener("click", (e) => {
          if (e.target.closest("[data-fabric-zoom]")) return;
          this.state.setFabric(fabric.id);
        });
        tile.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.state.setFabric(fabric.id);
          }
        });
        tile.querySelector("[data-fabric-zoom]").addEventListener("click", (e) => {
          e.stopPropagation();
          this._openLightbox({ mode: "fabric", fabric });
        });

        fabricGallery.appendChild(tile);
      });
    }

    _onStateChange(state, changeType) {
      if (changeType === "rail") this._syncTileGroup(this.els.railGroup, state.railId);
      if (changeType === "bracket") this._syncTileGroup(this.els.bracketGroup, state.bracketId);
      if (changeType === "filters") this._renderFabricGallery();
      if (changeType === "fabric") this._syncFabricSelection();
      // Nur syncen, wenn das Feld nicht gerade selbst bedient wird — sonst
      // würde eine aktive Eingabe unnötig zurückgesetzt. Wichtig für den
      // "+ Fenster"-Schnellzugriff einer Raumgruppe: der setzt state.room
      // programmatisch, ohne dass ein Feld je editiert wurde.
      if (changeType === "room") this._syncRoomFields(state);
      if (changeType === "load" || changeType === "savedConfigs") {
        // Eine gemerkte Konfiguration wurde zur Bearbeitung zurückgeholt, oder
        // "Merken" hat das Formular zurückgesetzt — alle abhängigen UI-Teile
        // müssen komplett neu synchronisiert werden (nicht nur die Liste).
        this._syncTileGroup(this.els.railGroup, state.railId);
        this._syncTileGroup(this.els.bracketGroup, state.bracketId);
        this._syncFabricSelection();
        this._syncRoomFields(state);
        this._renderSavedConfigs();
      }
      this._renderAll();
    }

    /** Hält Raum-Select + Freitextfeld mit state.room synchron, ohne eine
     * gerade aktive Eingabe zu unterbrechen. */
    _syncRoomFields(state) {
      const { roomSelect, roomCustomInput } = this.els;
      const isKnown = state.room === "" || this.state.knownRoomNames.includes(state.room);
      if (roomSelect && document.activeElement !== roomSelect) {
        roomSelect.value = isKnown ? state.room : "__custom__";
      }
      if (roomCustomInput) {
        roomCustomInput.hidden = isKnown;
        if (!isKnown && document.activeElement !== roomCustomInput) {
          roomCustomInput.value = state.room;
        }
      }
    }

    /** Rendert die Merkliste gruppiert nach Raum — jede Gruppe ist ein Zimmer
     * mit seinen Fenstern, so lässt sich das ganze Haus Raum für Raum planen. */
    _renderSavedConfigs() {
      const { savedList, savedEmpty, savedSummary, savedTotal, savedCount, savedRoomCount, savedRoomWord } = this.els;
      const groups = this.state.roomGroups;
      const currency = this.state.config.currency;
      savedList.innerHTML = "";
      savedEmpty.classList.toggle("is-visible", groups.length === 0);
      savedSummary.hidden = groups.length === 0;

      groups.forEach((group) => {
        const roomLi = document.createElement("li");
        roomLi.className = "pc-saved-room";
        roomLi.innerHTML =
          '<div class="pc-saved-room__header">' +
          '<span class="pc-saved-room__name"></span>' +
          '<span class="pc-saved-room__meta"></span>' +
          '<button type="button" class="pc-saved-room__view" data-saved-room-view>' +
          ICONS.eye +
          " Raum ansehen</button>" +
          '<button type="button" class="pc-saved-room__add" data-saved-room-add>+ Fenster</button>' +
          "</div>" +
          '<ul class="pc-saved-room__windows"></ul>';
        roomLi.querySelector(".pc-saved-room__name").textContent = group.room;
        roomLi.querySelector(".pc-saved-room__meta").textContent =
          (group.items.length === 1 ? "1 Fenster" : group.items.length + " Fenster") + " · " + formatMoney(group.subtotal, currency);
        roomLi.querySelector("[data-saved-room-view]").addEventListener("click", () => this._openLightbox({ mode: "room", group }));
        roomLi.querySelector("[data-saved-room-add]").addEventListener("click", () => {
          this.state.setRoom(group.room);
          this.els.widthInput.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        const windowsEl = roomLi.querySelector(".pc-saved-room__windows");
        group.items.forEach((cfg, index) => {
          const fabric = this.state.config.fabrics.find((f) => f.id === cfg.fabricId);
          const li = document.createElement("li");
          li.className = "pc-saved-item";

          const swatch = document.createElement("span");
          swatch.className = "pc-saved-item__swatch";
          if (fabric) swatch.setAttribute("style", this._fabricSwatchStyle(fabric, 6));
          li.appendChild(swatch);

          const info = document.createElement("span");
          info.className = "pc-saved-item__info";
          info.innerHTML = '<strong class="pc-saved-item__label"></strong><span class="pc-saved-item__meta"></span>';
          info.querySelector(".pc-saved-item__label").textContent = "Fenster " + (index + 1);
          info.querySelector(".pc-saved-item__meta").textContent =
            cfg.width.toFixed(0) + "×" + cfg.height.toFixed(0) + " cm · " + (fabric ? fabric.name : "") + " · " + formatMoney(cfg.unitPrice * cfg.quantity, currency);
          li.appendChild(info);

          const actions = document.createElement("span");
          actions.className = "pc-saved-item__actions";
          actions.innerHTML =
            '<button type="button" class="pc-saved-item__edit" data-saved-edit aria-label="Bearbeiten">' +
            ICONS.edit +
            "</button>" +
            '<button type="button" class="pc-saved-item__remove" data-saved-remove aria-label="Entfernen">' +
            ICONS.close +
            "</button>";
          actions.querySelector("[data-saved-edit]").addEventListener("click", () => this.state.loadSavedConfig(cfg.id));
          actions.querySelector("[data-saved-remove]").addEventListener("click", () => this.state.removeSavedConfig(cfg.id));
          li.appendChild(actions);

          windowsEl.appendChild(li);
        });

        savedList.appendChild(roomLi);
      });

      if (groups.length > 0) {
        savedTotal.textContent = formatMoney(this.state.savedConfigsTotal, currency);
        savedCount.textContent = String(this.state.savedWindowCount);
        if (savedRoomCount) savedRoomCount.textContent = String(this.state.savedRoomCount);
        if (savedRoomWord) savedRoomWord.textContent = this.state.savedRoomCount === 1 ? "Raum" : "Räume";
      }

      this._renderRoomSuggestions();
    }

    /** Baut das Raum-<select> aus typischen Räumlichkeiten + bereits
     * verwendeten eigenen Namen neu auf und hält es mit state.room synchron
     * — inklusive der "Andere Räumlichkeit…"-Option für Freitext. */
    _renderRoomSuggestions() {
      const select = this.els.roomSelect;
      if (!select) return;
      select.innerHTML = "";
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Raum wählen…";
      select.appendChild(placeholder);
      this.state.knownRoomNames.forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
      });
      const customOpt = document.createElement("option");
      customOpt.value = "__custom__";
      customOpt.textContent = "Andere Räumlichkeit…";
      select.appendChild(customOpt);
      this._syncRoomFields(this.state);
    }

    _syncTileGroup(container, activeId) {
      Array.from(container.children).forEach((tile) => {
        tile.setAttribute("aria-pressed", String(tile.dataset.tileId === activeId));
      });
    }

    _syncFabricSelection() {
      Array.from(this.els.fabricGallery.children).forEach((tile) => {
        tile.setAttribute("aria-pressed", String(tile.dataset.fabricId === this.state.fabricId));
      });
    }

    _renderBlindVisual() {
      const fabric = this.state.fabric;
      const rail = this.state.rail;
      const bracket = this.state.bracket;
      if (!fabric) return;

      // Foto-Modus: ein echtes Foto ist die feste Grundlage, Stoff/Schiene/
      // Klemmträger werden per mix-blend-mode:multiply eingefärbt (siehe
      // plissee-blind-photo.liquid). Ohne hochgeladenes Foto existieren diese
      // Elemente nicht im DOM und die SVG-Illustration darunter greift wie bisher.
      if (this.els.photoFabric.length) {
        this._renderPhotoOverlays(fabric, rail, bracket);
        return;
      }

      // Jede einzelne Falte bekommt eine eigene Licht-/Schattenkante (statt einer
      // einzigen groben Gesamtfläche) — das Pattern kachelt diesen 5-Stop-Verlauf
      // über die ganze Stoffhöhe, was deutlich plastischer wirkt als ein Flächenfüller.
      this._setGradientStops(this.els.pleatGradients, [
        this._shade(fabric.color, -0.16), // Schattenkante der Falte
        this._shade(fabric.color, 0.3), // Lichtkante der Falte
        this._shade(fabric.color, 0.02), // Grundton (nahe Originalfarbe)
        this._shade(fabric.color, -0.22), // Knickschatten
        this._shade(fabric.color, -0.16), // nahtloser Übergang zur nächsten Kachel
      ]);

      // Schiene: dünner Profilquerschnitt, vertikal schattiert (Lichtkante oben,
      // Schattenkante unten) statt einer Fläche in Volltonfarbe.
      const railColor = rail ? rail.color : "#2b2a28";
      this._setGradientStops(this.els.railGradients, [
        this._shade(railColor, 0.22),
        this._shade(railColor, -0.02),
        this._shade(railColor, -0.24),
      ]);

      const bracketColor = bracket ? bracket.color : "#2b2a28";
      this._setGradientStops(this.els.bracketGradients, [
        this._shade(bracketColor, 0.2),
        this._shade(bracketColor, -0.22),
      ]);

      // Der Fensterrahmen ist bewusst fix (siehe Snippet-Kommentar) — nur Stoff,
      // Schiene und Klemmträger oben werden eingefärbt, keine Geometrie-Anpassung
      // anhand von Breite/Höhe.
    }

    /** Foto-Modus: Referenzfoto zeigt bewusst das LEERE Fensterloch (siehe
     * plissee-blind-photo.liquid) — das Plissee selbst, inklusive echter
     * Falten-Optik, kommt komplett vom CSS-Overlay, nicht vom Foto. Grund:
     * ein Foto mit bereits sichtbarem Plissee würde beim Zurückziehen
     * ("Verstellung zeigen") ein zweites, unbewegliches Plissee freilegen
     * statt Glas — ergibt keinen Sinn (siehe Recherche zu CSS-Fensterladen-
     * Effekten: dieselbe repeating-linear-gradient-Technik, angewandt auf
     * ein leeres Referenzbild, nicht als Tönung eines bereits vorhandenen
     * Fotos). Die Falten-Formel ist dieselbe 5-Stopp-Verlaufsformel wie die
     * SVG-Illustration (_shade), nur als CSS-Kachel statt als SVG-Gradient.
     * Schiene und Klemmträger bleiben schlichte Flächenfarben (kein Foto-Tönen
     * mehr nötig). Ein Stoff-Foto (fabric.image) legt sich als zweite
     * Hintergrund-Ebene UNTER den Falten-Verlauf (multipliziert), damit auch
     * echte Stoff-Texturfotos die Faltenschattierung bekommen. */
    _pleatGradientCSS(color) {
      const c0 = this._shade(color, -0.16);
      const c1 = this._shade(color, 0.3);
      const c2 = this._shade(color, 0.02);
      const c3 = this._shade(color, -0.22);
      const c4 = this._shade(color, -0.16);
      return (
        "repeating-linear-gradient(180deg, " +
        c0 + " 0px, " + c1 + " 2px, " + c2 + " 4px, " + c3 + " 6px, " + c4 + " 8px)"
      );
    }

    _renderPhotoOverlays(fabric, rail, bracket) {
      const pleatGradient = this._pleatGradientCSS(fabric.color);
      this.els.photoFabric.forEach((el) => {
        el.style.backgroundColor = "";
        if (fabric.image) {
          el.style.backgroundImage = pleatGradient + ", url('" + fabric.image + "')";
          el.style.backgroundBlendMode = "multiply, normal";
          el.style.backgroundSize = "100% 8px, cover";
          el.style.backgroundRepeat = "repeat-y, no-repeat";
        } else {
          el.style.backgroundImage = pleatGradient;
          el.style.backgroundBlendMode = "";
          el.style.backgroundSize = "100% 8px";
          el.style.backgroundRepeat = "repeat-y";
        }
      });

      const railColor = rail ? rail.color : "#2b2a28";
      this.els.photoRail.forEach((el) => {
        if (rail && rail.image) {
          el.style.backgroundImage = "url('" + rail.image + "')";
          el.style.backgroundColor = "";
        } else {
          el.style.backgroundImage = "";
          el.style.backgroundColor = railColor;
        }
      });

      const bracketColor = bracket ? bracket.color : "#2b2a28";
      this.els.photoBracket.forEach((el) => {
        if (bracket && bracket.image) {
          el.style.backgroundImage = "url('" + bracket.image + "')";
          el.style.backgroundColor = "";
        } else {
          el.style.backgroundImage = "";
          el.style.backgroundColor = bracketColor;
        }
      });
    }

    /** "Verstellung zeigen": simuliert im Foto-Modus, wie sich ein Plissee an
     * einer echten Glastür oben UND unten verstellen lässt — zieht Stoff- und
     * Schienen-Overlay per CSS-Transition symmetrisch zur Mitte zusammen (und
     * beim erneuten Klick wieder auseinander), ohne das feste Referenzfoto
     * selbst zu verändern. Nur sichtbar, wenn ein Foto konfiguriert ist (siehe
     * plissee-blind-photo.liquid) — ohne Foto existieren die Overlay-Elemente
     * nicht im DOM, dann bleibt der Button versteckt (Standard: hidden). */
    _setupPhotoAdjustToggle() {
      const { photoAdjustBtn, photoFabric, photoRail } = this.els;
      if (!photoAdjustBtn) return;
      if (!photoFabric.length) {
        photoAdjustBtn.hidden = true;
        return;
      }
      const INSET = 0.25; // Anteil der Stoffhöhe, der je Seite eingezogen wird
      const fabricEl = photoFabric[0];
      const topRailEl = photoRail[0] || null;
      const bottomRailEl = photoRail[1] || null;
      const original = {
        top: parseFloat(fabricEl.style.top) || 0,
        height: parseFloat(fabricEl.style.height) || 0,
        railHeight: topRailEl ? parseFloat(topRailEl.style.height) || 0 : 0,
      };
      let adjusted = false;

      const apply = () => {
        const top = adjusted ? original.top + original.height * INSET : original.top;
        const height = adjusted ? original.height * (1 - INSET * 2) : original.height;
        fabricEl.style.top = top + "%";
        fabricEl.style.height = height + "%";
        if (topRailEl) topRailEl.style.top = "calc(" + top + "% - " + original.railHeight + "%)";
        if (bottomRailEl) bottomRailEl.style.top = "calc(" + top + "% + " + height + "%)";
        photoAdjustBtn.setAttribute("aria-pressed", String(adjusted));
        photoAdjustBtn.setAttribute("aria-label", adjusted ? "Verstellung zurücksetzen" : "Verstellung zeigen");
      };

      photoAdjustBtn.hidden = false;
      photoAdjustBtn.addEventListener("click", () => {
        adjusted = !adjusted;
        apply();
      });
    }

    _renderAll() {
      const { state, els } = this;

      if (document.activeElement !== els.widthInput) els.widthInput.value = state.width.toFixed(1);
      if (document.activeElement !== els.heightInput) els.heightInput.value = state.height.toFixed(1);
      if (els.widthRange) els.widthRange.value = state.width;
      if (els.heightRange) els.heightRange.value = state.height;
      if (document.activeElement !== els.qtyInput) els.qtyInput.value = state.quantity;

      els.metaWidth.textContent = state.width.toFixed(1) + " cm";
      els.metaHeight.textContent = state.height.toFixed(1) + " cm";
      els.metaFabric.textContent = state.fabric ? state.fabric.name : "–";

      if (state.fabric) {
        els.selectedFabricSwatch.setAttribute("style", this._fabricSwatchStyle(state.fabric, 8));
        els.selectedFabricName.textContent = state.fabric.name;
        els.selectedFabricSub.textContent = state.fabric.collection + " · " + state.fabric.colorGroup + " · " + state.fabric.opacity + "% Verdunkelung";
      }

      els.price.textContent = formatMoney(state.unitPrice, state.config.currency);
      // "Gesamt" schließt gemerkte Konfigurationen mit ein, damit der Betrag
      // beim Merken/Entfernen sofort korrekt mitwächst/-schrumpft. Die aktuelle
      // Konfiguration zählt dabei nur mit, wenn sie seit dem letzten Merken
      // auch wirklich bearbeitet wurde (siehe currentCountsTowardTotal).
      els.priceTotal.textContent = formatMoney(state.grandTotal, state.config.currency);
      if (state.savedConfigs.length === 0) {
        els.priceTotalLabel.textContent = "Gesamt";
      } else {
        const roomWord = state.savedRoomCount === 1 ? "Raum" : "Räume";
        const winWord = state.savedWindowCount === 1 ? "Fenster" : "Fenster";
        const base = state.savedRoomCount + " " + roomWord + " · " + state.savedWindowCount + " " + winWord;
        els.priceTotalLabel.textContent = state.currentCountsTowardTotal ? "Gesamt (" + base + " + aktuelles)" : "Gesamt (" + base + ")";
      }

      els.addToCartBtn.disabled = !state.isValid;

      this._renderBlindVisual();
      this._updateSingle3d();
      this._syncPropertiesForm();
    }

    _syncPropertiesForm() {
      const props = this.state.toCartProperties();
      this.els.propsContainer.innerHTML = "";
      Object.entries(props).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "properties[" + key + "]";
        input.value = value;
        this.els.propsContainer.appendChild(input);
      });
      const qtyField = this.els.cartForm.querySelector('[name="quantity"]');
      if (qtyField) qtyField.value = this.state.quantity;
    }

    /** Vermeidet doppelte IDs (Gradient/Pattern), wenn eine <svg>-Instanz für die
     * Zoom-Ansicht geklont wird, während das Original weiter im DOM steht. */
    _rekeyClonedSvgIds(svg) {
      const suffix = "-clone-" + Math.random().toString(36).slice(2, 8);
      svg.querySelectorAll("[id]").forEach((el) => {
        const oldId = el.id;
        const newId = oldId + suffix;
        el.id = newId;
        ["fill", "filter"].forEach((attr) => {
          svg.querySelectorAll("[" + attr + '="url(#' + oldId + ')"]').forEach((ref) => {
            ref.setAttribute(attr, "url(#" + newId + ")");
          });
        });
      });
    }

    /** Schaltet den Raum-Planer frei ("Mehrere Räume ausstatten"). Standardmäßig
     * ist der Konfigurator für Käufer eines einzelnen Plissees ausgelegt — nur
     * "Mein Haus" (inkl. Raum-Auswahl) bleibt unsichtbar, bis diese Aktion
     * bewusst gewählt wird. Das Anmerkungsfeld ist davon unabhängig immer
     * sichtbar. Kein Weg zurück in dieser Sitzung: einmal aktiviert, bleibt
     * der Raum-Planer sichtbar (vermeidet Datenverlust bei bereits gemerkten
     * Fenstern durch versehentliches Wieder-Einklappen). */
    _enableMultiRoom() {
      if (this.els.enableMultiRoomBtn) this.els.enableMultiRoomBtn.hidden = true;
      if (this.els.savedConfigsPanel) this.els.savedConfigsPanel.hidden = false;
    }

    /** Vollbild-Zoom. Drei Varianten:
     * - "fabric": Stofftextur füllt den ganzen Bildschirm, Metadaten-Karte unten
     *   rechts (Name/Material/Kollektion/Farbton/Verdunkelung).
     * - "preview": vergrößerte Plissee-Vorschau zentriert, Caption unten links.
     * - "room": interaktive 3D-Ansicht des Raums — alle gemerkten Fenster auf
     *   Wand/Boden platziert, per Drag frei umsehbar (siehe plissee-room-3d.js). */
    _openLightbox({ mode, fabric, group }) {
      const { lightbox, lightboxStage, lightboxPanel } = this.els;
      // Eine evtl. noch laufende 3D-Szene sauber abbauen, bevor neuer Inhalt
      // reinkommt — sonst rendert eine verwaiste Three.js-Instanz unsichtbar
      // weiter und verbraucht CPU/GPU.
      if (this._active3dMount && window.PlisseeRoom3D) {
        window.PlisseeRoom3D.dispose(this._active3dMount);
        this._active3dMount = null;
      }
      this._active3dHandle = null;
      this._roomEditor = null;
      lightboxStage.innerHTML = "";
      lightboxPanel.querySelectorAll(".pc-lightbox__caption, .pc-lightbox__window-editor").forEach((el) => el.remove());

      if (mode === "room" && group) {
        const mount = document.createElement("div");
        mount.className = "pc-lightbox__room3d is-loading";
        lightboxStage.appendChild(mount);

        const caption = document.createElement("div");
        caption.className = "pc-lightbox__caption";
        lightboxPanel.appendChild(caption);
        this._renderRoomCaption(caption, group);

        const editor = this._buildRoomWindowEditor(group, () => this._renderRoomCaption(caption, group));
        lightboxPanel.appendChild(editor.el);
        this._roomEditor = editor;

        if (window.PlisseeRoom3D) {
          this._active3dMount = mount;
          window.PlisseeRoom3D.mount(mount, group, this.state.config, {
            // Klick auf ein Fenster (ohne Ziehen) → Bearbeitungspanel öffnen.
            onSelect: (cfgId) => this._selectRoomWindow(cfgId, group),
            // Fenster wurde per Drag an eine neue Stelle an der Wand gezogen —
            // nur die Position persistieren, die 3D-Ansicht hat sich selbst
            // schon live mitbewegt (kein refreshWindow nötig).
            onPositionChange: (cfgId, position) => {
              this.state.updateSavedConfig(cfgId, { position });
              if (this._roomEditor) this._roomEditor.syncPosition(cfgId, position);
            },
          })
            .then((handle) => {
              this._active3dHandle = handle;
              mount.classList.remove("is-loading");
            })
            .catch((err) => {
              console.error("Plissee-Konfigurator: 3D-Raumansicht konnte nicht geladen werden.", err);
              mount.classList.remove("is-loading");
              mount.classList.add("has-error");
              mount.textContent = "3D-Ansicht konnte nicht geladen werden.";
            });
        } else {
          mount.classList.remove("is-loading");
          mount.classList.add("has-error");
          mount.textContent = "3D-Ansicht nicht verfügbar.";
        }
      } else if (mode === "fabric" && fabric) {
        const box = document.createElement("div");
        box.className = "pc-lightbox__fabric-box";

        const fill = document.createElement("div");
        fill.className = "pc-lightbox__fabric-fill";
        fill.setAttribute("style", this._fabricSwatchStyle(fabric, 52));
        box.appendChild(fill);

        const meta = document.createElement("div");
        meta.className = "pc-lightbox__meta";
        const rows = [
          ["Name des Stoffes", fabric.name],
          ["Material", fabric.material || "Polyester"],
          ["Kollektion", fabric.collection],
          ["Farbton", fabric.colorGroup],
          ["Verdunkelung", fabric.opacity + "%"],
        ];
        meta.innerHTML = rows
          .map(
            ([label, value]) =>
              '<div class="pc-lightbox__meta-row"><span class="pc-lightbox__meta-label">' +
              label +
              '</span><span class="pc-lightbox__meta-value">' +
              value +
              "</span></div>"
          )
          .join("");
        box.appendChild(meta);

        lightboxStage.appendChild(box);
      } else {
        const wrap = document.createElement("div");
        wrap.className = "pc-lightbox__preview-wrap";
        const clone = this.root.querySelector("[data-blind-visual]").cloneNode(true);
        this._rekeyClonedSvgIds(clone);
        wrap.appendChild(clone);
        lightboxStage.appendChild(wrap);

        const caption = document.createElement("div");
        caption.className = "pc-lightbox__caption";
        const fabricName = this.state.fabric ? this.state.fabric.name : "";
        caption.innerHTML =
          '<p class="pc-lightbox__title">Vorschau ' +
          this.state.width.toFixed(0) +
          " × " +
          this.state.height.toFixed(0) +
          ' cm</p><p class="pc-lightbox__sub">' +
          fabricName +
          "</p>";
        lightboxPanel.appendChild(caption);
      }

      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    }

    /** Aktualisiert die Bildunterschrift der Raumansicht (Fensterzahl + Summe)
     * — als eigene Methode, damit sie nach jeder Bearbeitung im Fensterpanel
     * (Maße/Typ geändert → anderer Preis) live neu berechnet werden kann,
     * statt die Zahlen vom Öffnungszeitpunkt einzufrieren. */
    _renderRoomCaption(caption, group) {
      const subtotal = Math.round(group.items.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0) * 100) / 100;
      caption.innerHTML =
        '<p class="pc-lightbox__title">' +
        group.room +
        '</p><p class="pc-lightbox__sub">' +
        group.items.length +
        " Fenster · " +
        formatMoney(subtotal, this.state.config.currency) +
        " · Fenster antippen zum Bearbeiten, ziehen zum Verschieben</p>";
    }

    /** Öffnet das Bearbeitungspanel für ein per Klick in der 3D-Raumansicht
     * ausgewähltes Fenster (siehe plissee-room-3d.js mount()-Callback
     * onSelect). */
    _selectRoomWindow(cfgId, group) {
      const cfg = group.items.find((c) => c.id === cfgId);
      if (!cfg || !this._roomEditor) return;
      this._roomEditor.show(cfg);
    }

    /** Baut das Bearbeitungspanel für "Raum ansehen": Typ (Fenster/Glastür),
     * Breite, Höhe, Position an der Wand — alles direkt in der 3D-Ansicht
     * änderbar, ohne den Konfigurator-Dialog zu verlassen. Jede Änderung
     * schreibt sofort über state.updateSavedConfig() zurück (das aktualisiert
     * automatisch auch die Merkliste/den Preis) und stößt bei Bedarf einen
     * gezielten Rebuild nur dieses einen Fensters in der 3D-Szene an. */
    _buildRoomWindowEditor(group, onChange) {
      const el = document.createElement("div");
      el.className = "pc-lightbox__window-editor";
      el.hidden = true;
      el.innerHTML =
        '<div class="pc-window-editor__head">' +
        '<span class="pc-window-editor__title" data-editor-title></span>' +
        '<button type="button" class="pc-window-editor__close" data-editor-close aria-label="Bearbeitung schließen">' +
        ICONS.close +
        "</button>" +
        "</div>" +
        '<label class="pc-window-editor__field"><span>Typ</span><select data-editor-type>' +
        '<option value="fenster">Fenster</option>' +
        '<option value="tuer">Glastür (bodentief)</option>' +
        "</select></label>" +
        '<label class="pc-window-editor__field"><span>Wand</span><select data-editor-wall>' +
        '<option value="back">Rückwand</option>' +
        '<option value="left">Linke Wand</option>' +
        '<option value="right">Rechte Wand</option>' +
        "</select></label>" +
        '<label class="pc-window-editor__field"><span>Breite <b data-editor-width-value></b></span>' +
        '<input type="range" data-editor-width min="' +
        this.state.config.minWidth +
        '" max="' +
        this.state.config.maxWidth +
        '" step="1"></label>' +
        '<label class="pc-window-editor__field"><span>Höhe <b data-editor-height-value></b></span>' +
        '<input type="range" data-editor-height min="' +
        this.state.config.minHeight +
        '" max="' +
        this.state.config.maxHeight +
        '" step="1"></label>' +
        '<label class="pc-window-editor__field"><span>Position an der Wand</span>' +
        '<input type="range" data-editor-position min="0" max="100" step="1"></label>';

      const typeEl = el.querySelector("[data-editor-type]");
      const wallEl = el.querySelector("[data-editor-wall]");
      const widthEl = el.querySelector("[data-editor-width]");
      const widthValueEl = el.querySelector("[data-editor-width-value]");
      const heightEl = el.querySelector("[data-editor-height]");
      const heightValueEl = el.querySelector("[data-editor-height-value]");
      const positionEl = el.querySelector("[data-editor-position]");
      const titleEl = el.querySelector("[data-editor-title]");

      let currentId = null;

      const refreshValueLabels = () => {
        widthValueEl.textContent = widthEl.value + " cm";
        heightValueEl.textContent = heightEl.value + " cm";
      };

      const applyDimensionChange = () => {
        if (!currentId) return;
        this.state.updateSavedConfig(currentId, { width: Number(widthEl.value), height: Number(heightEl.value) });
        refreshValueLabels();
        if (this._active3dHandle) this._active3dHandle.refreshWindow(currentId);
        onChange();
      };

      typeEl.addEventListener("change", () => {
        if (!currentId) return;
        this.state.updateSavedConfig(currentId, { type: typeEl.value });
        if (this._active3dHandle) this._active3dHandle.refreshWindow(currentId);
        onChange();
      });
      // Wandwechsel setzt die Position bewusst auf die Wandmitte zurück —
      // eine entlang der alten Wand gespeicherte Stelle (0–1) hätte auf der
      // neuen Wand eine andere, unvorhersehbare Bedeutung.
      wallEl.addEventListener("change", () => {
        if (!currentId) return;
        this.state.updateSavedConfig(currentId, { wall: wallEl.value, position: 0.5 });
        positionEl.value = "50";
        if (this._active3dHandle) this._active3dHandle.refreshWindow(currentId);
        onChange();
      });
      widthEl.addEventListener("input", applyDimensionChange);
      heightEl.addEventListener("input", applyDimensionChange);
      positionEl.addEventListener("input", () => {
        if (!currentId) return;
        const normalized = Number(positionEl.value) / 100;
        this.state.updateSavedConfig(currentId, { position: normalized });
        if (this._active3dHandle) this._active3dHandle.setPosition(currentId, normalized);
      });
      el.querySelector("[data-editor-close]").addEventListener("click", () => {
        hide();
        if (this._active3dHandle) this._active3dHandle.selectWindow(null);
      });

      const hide = () => {
        currentId = null;
        el.hidden = true;
      };

      const show = (cfg) => {
        currentId = cfg.id;
        const index = group.items.indexOf(cfg);
        titleEl.textContent = "Fenster " + (index + 1);
        typeEl.value = cfg.type === "tuer" ? "tuer" : "fenster";
        wallEl.value = cfg.wall === "left" || cfg.wall === "right" ? cfg.wall : "back";
        widthEl.value = String(cfg.width);
        heightEl.value = String(cfg.height);
        positionEl.value = String(Math.round((cfg.position != null ? cfg.position : 0.5) * 100));
        refreshValueLabels();
        el.hidden = false;
      };

      // Hält den Positions-Regler mit einem Drag direkt in der 3D-Ansicht
      // synchron, falls gerade dasselbe Fenster im Panel offen ist.
      const syncPosition = (cfgId, normalized) => {
        if (cfgId !== currentId) return;
        positionEl.value = String(Math.round(normalized * 100));
      };

      return { el, show, hide, syncPosition };
    }

    _closeLightbox() {
      this.els.lightbox.classList.remove("is-open");
      this.els.lightbox.setAttribute("aria-hidden", "true");
      if (this._active3dMount && window.PlisseeRoom3D) {
        window.PlisseeRoom3D.dispose(this._active3dMount);
        this._active3dMount = null;
      }
      this._active3dHandle = null;
      this._roomEditor = null;
    }

    _handleAddToCart(e) {
      e.preventDefault();
      const savedCount = this.state.savedConfigs.length;
      const includesCurrent = this.state.currentCountsTowardTotal;
      // Nichts zu bestellen: aktuelle Konfiguration zählt nicht (frisch
      // zurückgesetzt) UND es ist nichts gemerkt.
      if (!includesCurrent && savedCount === 0) return;
      // Zählt die aktuelle Konfiguration mit, muss sie auch gültig sein.
      if (includesCurrent && !this.state.isValid) return;
      this._syncPropertiesForm();

      const variantId = this.els.cartForm.querySelector('[name="id"]').value;

      this.els.addToCartBtn.disabled = true;
      const originalHtml = this.els.addToCartBtn.innerHTML;
      this.els.addToCartBtn.innerHTML = ICONS.check + " Hinzugefügt";

      if (savedCount > 0 && typeof this.onAddToCartMulti === "function") {
        this.onAddToCartMulti(this.state.toCartItemsPayload(variantId), this.els.cartForm);
      } else if (typeof this.onAddToCart === "function") {
        this.onAddToCart(this.state, this.els.cartForm);
      }

      const totalCount = savedCount + (includesCurrent ? 1 : 0);
      let message;
      if (totalCount > 1) {
        message = totalCount + " Plissees in den Warenkorb gelegt (" + formatMoney(this.state.grandTotal, this.state.config.currency) + " gesamt).";
      } else if (includesCurrent) {
        message =
          this.state.quantity + "× Plissee (" + this.state.width.toFixed(0) + "×" + this.state.height.toFixed(0) + " cm, " + this.state.fabric.name + ") in den Warenkorb gelegt.";
      } else {
        // Genau eine gemerkte Konfiguration wird bestellt, die aktuelle
        // (unbearbeitete) zählt nicht mit — Nachricht bezieht sich auf den
        // tatsächlich übermittelten gemerkten Eintrag, nicht das leere Formular.
        const cfg = this.state.savedConfigs[0];
        const fabric = this.state.config.fabrics.find((f) => f.id === cfg.fabricId);
        message =
          cfg.quantity + "× Plissee (" + cfg.width.toFixed(0) + "×" + cfg.height.toFixed(0) + " cm, " + (fabric ? fabric.name : "") + ") in den Warenkorb gelegt.";
      }
      this._showToast(message);

      if (savedCount > 0) {
        this.state.clearSavedConfigs();
      }

      window.setTimeout(() => {
        this.els.addToCartBtn.innerHTML = originalHtml;
        this.els.addToCartBtn.disabled = !this.state.isValid;
      }, 1600);
    }

    _showToast(message) {
      const toast = this.els.toast;
      toast.textContent = message;
      toast.classList.add("is-visible");
      window.clearTimeout(this._toastTimer);
      this._toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
    }
  }

  const ICONS = {
    check: '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    zoom: '<svg viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.6"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    edit: '<svg viewBox="0 0 16 16" fill="none"><path d="M11 2.5l2.5 2.5L5 13.5H2.5V11L11 2.5z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    eye: '<svg viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/></svg>',
  };

  function init(root) {
    if (!root || root.dataset.pcInitialized) return;
    root.dataset.pcInitialized = "true";

    const dataEl = root.querySelector("[data-pc-config]");
    if (!dataEl) {
      console.error("Plissee-Konfigurator: Kein data-pc-config JSON gefunden.");
      return;
    }
    let config;
    try {
      config = JSON.parse(dataEl.textContent);
    } catch (err) {
      console.error("Plissee-Konfigurator: Ungültiges Konfigurations-JSON.", err);
      return;
    }

    const state = new PlisseeConfiguratorState(config);
    const view = new PlisseeConfiguratorView(root, state);

    view.onAddToCart = function (currentState, form) {
      if (typeof window.PlisseeConfiguratorOnAddToCart === "function") {
        window.PlisseeConfiguratorOnAddToCart(currentState, form);
        return;
      }
      // Standard-Integration: echter Shopify AJAX-Warenkorb.
      var formData = new FormData(form);
      var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || "/";
      fetch(root.replace(/\/$/, "") + "/cart/add.js", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Warenkorb-Request fehlgeschlagen (" + res.status + ")");
          return res.json();
        })
        .then(function () {
          document.dispatchEvent(new CustomEvent("cart:updated"));
        })
        .catch(function (err) {
          console.error("Plissee-Konfigurator: Fehler beim Hinzufügen zum Warenkorb.", err);
        });
    };

    view.onAddToCartMulti = function (items) {
      if (typeof window.PlisseeConfiguratorOnAddToCartMulti === "function") {
        window.PlisseeConfiguratorOnAddToCartMulti(items);
        return;
      }
      // Standard-Integration: alle gemerkten Konfigurationen + aktuelle in
      // einem Request an den Shopify AJAX-Warenkorb (/cart/add.js unterstützt
      // ein "items"-Array für mehrere Zeilen in einem Aufruf).
      var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || "/";
      fetch(root.replace(/\/$/, "") + "/cart/add.js", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ items: items }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Warenkorb-Request fehlgeschlagen (" + res.status + ")");
          return res.json();
        })
        .then(function () {
          document.dispatchEvent(new CustomEvent("cart:updated"));
        })
        .catch(function (err) {
          console.error("Plissee-Konfigurator: Fehler beim Hinzufügen mehrerer Konfigurationen.", err);
        });
    };

    root.__pcState = state;
    root.__pcView = view;
  }

  function initAll() {
    document.querySelectorAll("[data-pc-root]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  window.PlisseeConfigurator = { init, PlisseeConfiguratorState, PlisseeConfiguratorView };
})();
