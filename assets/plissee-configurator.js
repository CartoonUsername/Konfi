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
      this.note = "";
      this.view = "single";
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

    /** Freiwilliger Hinweistext (z. B. Raumbezeichnung) — kein Pflichtfeld,
     * wird nur als Warenkorb-Eigenschaft mitgeschickt, wenn ausgefüllt. */
    setNote(value) {
      this.note = String(value || "").slice(0, 120);
      this._currentDirty = true;
      this._emit("note");
    }

    setView(view) {
      if (!["single", "grid"].includes(view)) return;
      this.view = view;
      this._emit("view");
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
      const fabric = this.fabric;
      if (!fabric) return 0;
      const base =
        this.config.baseFee +
        (this.width / 100) * this.config.pricePerMeterWidth +
        (this.height / 100) * this.config.pricePerMeterHeight;
      const surcharge =
        (fabric.surcharge || 0) + (this.rail ? this.rail.surcharge : 0) + (this.bracket ? this.bracket.surcharge : 0);
      const unit = Math.max(base + surcharge, this.config.minPrice);
      return Math.round(unit * 100) / 100;
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
      if (this.note.trim()) props.Hinweis = this.note.trim();
      return props;
    }

    /** "Zwischenspeicher": mehrere Plissee-Konfigurationen (z. B. pro Zimmer)
     * sammeln, ohne die aktuelle Konfiguration zu verlieren — erst beim
     * Warenkorb-Klick werden alle zusammen übermittelt. */
    saveCurrentConfig() {
      if (!this.isValid) return;
      this.savedConfigs.push({
        id: "cfg-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        width: this.width,
        height: this.height,
        fabricId: this.fabricId,
        railId: this.railId,
        bracketId: this.bracketId,
        note: this.note,
        quantity: this.quantity,
        unitPrice: this.unitPrice,
      });
      // Formular für die nächste Konfiguration zurücksetzen. Ohne Reset bliebe
      // die aktuelle Konfiguration identisch zur gerade gemerkten und würde im
      // Gesamtbetrag doppelt gezählt (einmal als Listeneintrag, einmal als
      // "aktuelle" Konfiguration) — genau der Bug, den das behebt.
      this.width = this.config.defaultWidth;
      this.height = this.config.defaultHeight;
      this.railId = this.config.rails[0] ? this.config.rails[0].id : null;
      this.bracketId = this.config.brackets[0] ? this.config.brackets[0].id : null;
      this.fabricId = this.config.fabrics[0] ? this.config.fabrics[0].id : null;
      this.note = "";
      this.quantity = 1;
      this._currentDirty = false;
      this._emit("savedConfigs");
    }

    removeSavedConfig(id) {
      this.savedConfigs = this.savedConfigs.filter((c) => c.id !== id);
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
      this.note = cfg.note;
      this.quantity = cfg.quantity;
      // Die zurückgeholte Konfiguration ist wieder eine echte, gewollte
      // Bestellposition — zählt also wieder im Gesamtbetrag mit.
      this._currentDirty = true;
      this._emit("load");
    }

    get savedConfigsTotal() {
      return Math.round(this.savedConfigs.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0) * 100) / 100;
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
      const props = {
        Breite: cfg.width + " cm",
        Höhe: cfg.height + " cm",
        Stoff: fabric ? fabric.name : "",
        Schiene: rail ? rail.name : "",
        Klemmträger: bracket ? bracket.name : "",
      };
      if (cfg.note && cfg.note.trim()) props.Hinweis = cfg.note.trim();
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
        noteInput: q("[data-note-input]"),
        saveConfigBtn: q("[data-save-config]"),
        savedList: q("[data-saved-list]"),
        savedEmpty: q("[data-saved-empty]"),
        savedSummary: q("[data-saved-summary]"),
        savedTotal: q("[data-saved-total]"),
        savedCount: q("[data-saved-count]"),
        viewSingleBtn: q("[data-view-single]"),
        viewGridBtn: q("[data-view-grid]"),
        zoomBtn: q("[data-zoom-btn]"),
        shareLinkBtn: q("[data-share-link]"),
        stageSingle: q("[data-stage-single]"),
        stageGrid: q("[data-stage-grid]"),
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

      els.viewSingleBtn.addEventListener("click", () => state.setView("single"));
      els.viewGridBtn.addEventListener("click", () => state.setView("grid"));
      els.zoomBtn.addEventListener("click", () => this._openLightbox({ mode: "preview" }));
      els.shareLinkBtn.addEventListener("click", () => this._handleShareLink());
      // Jede Kachel der Rasteransicht öffnet ebenfalls die Zoom-Ansicht.
      els.stageGrid.addEventListener("click", () => this._openLightbox({ mode: "preview" }));
      // Klick auf das Vorschaubild selbst springt zur Stoffauswahl (Hover zeigt "Auswählen").
      els.stageSingle.addEventListener("click", () => this._scrollToFabricPicker());

      els.noteInput.addEventListener("input", (e) => state.setNote(e.target.value));
      els.saveConfigBtn.addEventListener("click", () => state.saveCurrentConfig());

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
      if (changeType === "view") this._syncView();
      if (changeType === "load" || changeType === "savedConfigs") {
        // Eine gemerkte Konfiguration wurde zur Bearbeitung zurückgeholt, oder
        // "Merken" hat das Formular zurückgesetzt — alle abhängigen UI-Teile
        // müssen komplett neu synchronisiert werden (nicht nur die Liste).
        this._syncTileGroup(this.els.railGroup, state.railId);
        this._syncTileGroup(this.els.bracketGroup, state.bracketId);
        this._syncFabricSelection();
        this.els.noteInput.value = state.note;
        this._renderSavedConfigs();
      }
      this._renderAll();
    }

    /** Rendert die Liste gemerkter Konfigurationen unter dem Vorschaubild. */
    _renderSavedConfigs() {
      const { savedList, savedEmpty, savedSummary, savedTotal, savedCount } = this.els;
      const configs = this.state.savedConfigs;
      savedList.innerHTML = "";
      savedEmpty.classList.toggle("is-visible", configs.length === 0);
      savedSummary.hidden = configs.length === 0;

      configs.forEach((cfg, index) => {
        const fabric = this.state.config.fabrics.find((f) => f.id === cfg.fabricId);
        const label = cfg.note && cfg.note.trim() ? cfg.note.trim() : "Konfiguration " + (index + 1);
        const li = document.createElement("li");
        li.className = "pc-saved-item";
        li.innerHTML =
          '<span class="pc-saved-item__swatch" style="' +
          (fabric ? this._fabricSwatchStyle(fabric, 6) : "") +
          '"></span>' +
          '<span class="pc-saved-item__info">' +
          '<strong class="pc-saved-item__label"></strong>' +
          '<span class="pc-saved-item__meta"></span>' +
          "</span>" +
          '<span class="pc-saved-item__actions">' +
          '<button type="button" class="pc-saved-item__edit" data-saved-edit aria-label="Bearbeiten">' +
          ICONS.edit +
          "</button>" +
          '<button type="button" class="pc-saved-item__remove" data-saved-remove aria-label="Entfernen">' +
          ICONS.close +
          "</button>" +
          "</span>";
        li.querySelector(".pc-saved-item__label").textContent = label;
        li.querySelector(".pc-saved-item__meta").textContent =
          cfg.width.toFixed(0) + "×" + cfg.height.toFixed(0) + " cm · " + (fabric ? fabric.name : "") + " · " + formatMoney(cfg.unitPrice * cfg.quantity, this.state.config.currency);
        li.querySelector("[data-saved-edit]").addEventListener("click", () => this.state.loadSavedConfig(cfg.id));
        li.querySelector("[data-saved-remove]").addEventListener("click", () => this.state.removeSavedConfig(cfg.id));
        savedList.appendChild(li);
      });

      if (configs.length > 0) {
        savedTotal.textContent = formatMoney(this.state.savedConfigsTotal, this.state.config.currency);
        savedCount.textContent = String(configs.length);
      }
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

    _syncView() {
      const isGrid = this.state.view === "grid";
      this.els.stageGrid.hidden = !isGrid;
      this.els.stageSingle.hidden = isGrid;
      this.els.viewSingleBtn.setAttribute("aria-pressed", String(!isGrid));
      this.els.viewGridBtn.setAttribute("aria-pressed", String(isGrid));
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

    /** Foto-Modus: Stofftextur/-farbe, Schiene und Klemmträger als mix-blend-mode:
     * multiply-Flächen über dem festen Foto positionieren (Positionen kommen aus
     * den Theme-Editor-Prozentwerten, siehe plissee-blind-photo.liquid). Ein
     * Stoff-Foto (fabric.image) hat Vorrang vor der Flächenfarbe, wenn vorhanden. */
    _renderPhotoOverlays(fabric, rail, bracket) {
      this.els.photoFabric.forEach((el) => {
        if (fabric.image) {
          el.style.backgroundImage = "url('" + fabric.image + "')";
          el.style.backgroundColor = "";
        } else {
          el.style.backgroundImage = "";
          el.style.backgroundColor = fabric.color;
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

    _renderAll() {
      const { state, els } = this;

      if (document.activeElement !== els.widthInput) els.widthInput.value = state.width.toFixed(1);
      if (document.activeElement !== els.heightInput) els.heightInput.value = state.height.toFixed(1);
      if (els.widthRange) els.widthRange.value = state.width;
      if (els.heightRange) els.heightRange.value = state.height;
      if (document.activeElement !== els.qtyInput) els.qtyInput.value = state.quantity;
      if (document.activeElement !== els.noteInput) els.noteInput.value = state.note;

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
      } else if (state.currentCountsTowardTotal) {
        els.priceTotalLabel.textContent = "Gesamt (" + state.savedConfigs.length + " gemerkt + aktuelle)";
      } else {
        els.priceTotalLabel.textContent = "Gesamt (" + state.savedConfigs.length + " gemerkt)";
      }

      els.addToCartBtn.disabled = !state.isValid;

      this._renderBlindVisual();
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

    _scrollToFabricPicker() {
      this.els.fabricGallery.scrollIntoView({ behavior: "smooth", block: "center" });
      this.els.filterCollection.focus({ preventScroll: true });
    }

    /** Vollbild-Zoom. Zwei Varianten:
     * - "fabric": Stofftextur füllt den ganzen Bildschirm, Metadaten-Karte unten
     *   rechts (Name/Material/Kollektion/Farbton/Verdunkelung).
     * - "preview": vergrößerte Plissee-Vorschau zentriert, Caption unten links. */
    _openLightbox({ mode, fabric }) {
      const { lightbox, lightboxStage, lightboxPanel } = this.els;
      lightboxStage.innerHTML = "";
      lightboxPanel.querySelectorAll(".pc-lightbox__caption").forEach((el) => el.remove());

      if (mode === "fabric" && fabric) {
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

    _closeLightbox() {
      this.els.lightbox.classList.remove("is-open");
      this.els.lightbox.setAttribute("aria-hidden", "true");
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

    /** Baut eine URL, die die aktuell bearbeitete Konfiguration (Maße, Stoff,
     * Schiene, Klemmträger, Menge, Hinweis) als Query-Parameter enthält, damit
     * sie sich per Link teilen und beim Öffnen automatisch wiederherstellen
     * lässt. Parameter sind mit der Section-ID präfixt, falls mehrere
     * Konfiguratoren auf derselben Seite eingebunden sind. */
    _buildShareUrl() {
      const s = this.state;
      const prefix = shareUrlPrefix(this.root);
      const url = new URL(window.location.href);
      Array.from(url.searchParams.keys()).forEach((key) => {
        if (key.indexOf(prefix) === 0) url.searchParams.delete(key);
      });
      url.searchParams.set(prefix + "w", s.width);
      url.searchParams.set(prefix + "h", s.height);
      if (s.fabricId) url.searchParams.set(prefix + "fabric", s.fabricId);
      if (s.railId) url.searchParams.set(prefix + "rail", s.railId);
      if (s.bracketId) url.searchParams.set(prefix + "bracket", s.bracketId);
      url.searchParams.set(prefix + "qty", s.quantity);
      if (s.note.trim()) url.searchParams.set(prefix + "note", s.note.trim());
      return url.toString();
    }

    _handleShareLink() {
      const url = this._buildShareUrl();
      copyToClipboard(url).then(
        () => this._showToast("Link zur aktuellen Konfiguration kopiert."),
        () => window.prompt("Link zur aktuellen Konfiguration:", url)
      );
    }
  }

  /** Präfix für die Share-Link-Query-Parameter dieser Konfigurator-Instanz. */
  function shareUrlPrefix(root) {
    return "pc_" + (root.dataset.sectionId || "cfg") + "_";
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (ok) resolve();
        else reject(new Error("copy failed"));
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    });
  }

  /** Liest die Share-Link-Query-Parameter dieser Konfigurator-Instanz aus der
   * aktuellen URL (falls vorhanden) und überträgt sie in den State, bevor die
   * View erstmalig rendert — so öffnet ein geteilter Link direkt die passende
   * Konfiguration. */
  function applyStateFromUrl(state, root) {
    const prefix = shareUrlPrefix(root);
    const params = new URLSearchParams(window.location.search);
    if (!Array.from(params.keys()).some((key) => key.indexOf(prefix) === 0)) return;

    const w = params.get(prefix + "w");
    const h = params.get(prefix + "h");
    const fabricId = params.get(prefix + "fabric");
    const railId = params.get(prefix + "rail");
    const bracketId = params.get(prefix + "bracket");
    const qty = params.get(prefix + "qty");
    const note = params.get(prefix + "note");

    if (w !== null) state.setWidth(parseFloat(w));
    if (h !== null) state.setHeight(parseFloat(h));
    if (fabricId) state.setFabric(fabricId);
    if (railId) state.setRail(railId);
    if (bracketId) state.setBracket(bracketId);
    if (qty !== null) state.setQuantity(parseInt(qty, 10));
    if (note !== null) state.setNote(note);
  }

  const ICONS = {
    check: '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    zoom: '<svg viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.6"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    edit: '<svg viewBox="0 0 16 16" fill="none"><path d="M11 2.5l2.5 2.5L5 13.5H2.5V11L11 2.5z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
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
    applyStateFromUrl(state, root);
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
