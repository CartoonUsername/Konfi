module.exports = {
  slug: "09-case-study", file: "Case-Study-Vorlage", format: "A4Q", style: "mono",
  title: "Case-Study-Vorlage", sub: "Zeig Marken, was deine Videos gebracht haben", price: 12,
  pills: ["4 Seiten", "Querformat", "mit Ergebnis-Grafik"],
  build(k) {
    const { C, S, W, H, M, T, caps, serif, hand, label, rule, vrule, photo, phone, box } = k;
    const ACC = C.accent1, INK = C.text1;
    const head = (s, n, t, dark) => {
      label(s, `CASE STUDY · ${n} / 04`, { x: M, y: 0.5, w: 4, h: 0.22, color: dark ? "C9C8C2" : C.text2 });
      label(s, "JONAS BREMER × KLARWASSER", { x: W - M - 4, y: 0.5, w: 4, h: 0.22, align: "right", color: dark ? "C9C8C2" : C.text2 });
      rule(s, M, 0.85, W - 2 * M, dark ? "FFFFFF" : INK);
      if (t) caps(s, t, { x: M, y: 1.05, w: 7, h: 0.9, fontSize: 40, color: dark ? "FFFFFF" : INK });
    };

    // 1 Cover
    let s = k.page("Dunkel");
    photo(s, "j6", 6.6, 0, W - 6.6, H, { fy: 0.3, alt: "Jonas mit Trinkflasche" });
    label(s, "CASE STUDY 2026", { x: M, y: 0.7, w: 4, h: 0.22, color: ACC });
    caps(s, "WIE 3 VIDEOS\nDEN ABVERKAUF\nVERDOPPELT\nHABEN", { x: M, y: 1.2, w: 5.6, h: 4.2, fontSize: 48, color: "FFFFFF" });
    rule(s, M, 5.75, 5.4, "FFFFFF");
    [["MARKE", "Klarwasser"], ["PRODUKT", "Isolierte Trinkflasche"], ["ZEITRAUM", "Mai bis Juni 2026"], ["CREATOR", "Jonas Bremer"]].forEach(([a, b], i) => {
      const x = M + (i % 2) * 2.75, y = 5.95 + Math.floor(i / 2) * 0.75;
      label(s, a, { x, y, w: 2.5, h: 0.2, color: "C9C8C2" });
      T(s, b, { x, y: y + 0.24, w: 2.6, h: 0.35, fontSize: 12, bold: true, color: "FFFFFF" });
    });

    // 2 Aufgabe
    s = k.page("Sand");
    head(s, "02", "DIE AUFGABE");
    const col = (W - 2 * M - 0.6) / 3;
    [["Ausgangslage", "Klarwasser hatte gute Produktfotos, aber Anzeigen mit Studio-Videos liefen schlecht. Die Klickrate lag bei 0,6 %."],
     ["Ziel", "Videos, die wie echte Empfehlungen wirken und in Anzeigen auf TikTok und Instagram funktionieren."],
     ["Zielgruppe", "Pendler und Sportler zwischen 25 und 40, die viel draußen unterwegs sind."]].forEach(([a, b], i) => {
      const x = M + i * (col + 0.3);
      caps(s, "0" + (i + 1), { x, y: 2.35, w: 1, h: 0.6, fontSize: 30, color: ACC });
      T(s, a, { x, y: 3.0, w: col, h: 0.35, fontSize: 14, bold: true });
      T(s, b, { x, y: 3.45, w: col - 0.1, h: 1.6, fontSize: 10.5, lineSpacingMultiple: 1.4 });
      if (i) vrule(s, x - 0.15, 2.4, 2.6, C.accent5);
    });
    box(s, M, 5.55, W - 2 * M, 2.0, C.accent2);
    serif(s, "„Wir wollen, dass die Leute denken: Der Typ benutzt die Flasche wirklich.“", { x: M + 0.4, y: 5.85, w: 8.2, h: 1.0, fontSize: 22, italic: true });
    T(s, "Aus dem Briefing von Klarwasser", { x: M + 0.4, y: 6.95, w: 5, h: 0.3, fontSize: 9.5, color: C.text2 });

    // 3 Umsetzung
    s = k.page("Sand");
    head(s, "03", "DIE UMSETZUNG");
    [["j6", "Video A · Produkt-Demo", "Hook: „Diese Flasche hält mein Wasser 24 Stunden kalt. Ich hab's getestet.“"],
     ["j2", "Video B · Alltag", "Hook: „Mein Morgenlauf an der Elbe, und das Einzige, was ich mitnehme.“"],
     ["j5", "Video C · Story", "Hook: „Warum ich keine Plastikflaschen mehr kaufe.“"]].forEach(([key, a, b], i) => {
      const x = M + i * 3.6;
      phone(s, key, x, 2.0, 1.9, 0);
      T(s, a, { x: x + 2.05, y: 2.2, w: 1.45, h: 0.6, fontSize: 10.5, bold: true });
      T(s, b, { x: x + 2.05, y: 2.85, w: 1.45, h: 2.2, fontSize: 9, lineSpacingMultiple: 1.35, color: C.text2 });
    });
    rule(s, M, 6.3, W - 2 * M, INK);
    T(s, "Ablauf: Briefing am 2. Mai · Konzept nach 2 Tagen · Dreh am Wochenende · Abgabe am 9. Mai · 1 Überarbeitung", { x: M, y: 6.45, w: W - 2 * M, h: 0.3, fontSize: 10 });
    hand(s, "Video B lief am besten!", { x: 4.2, y: 7.0, w: 3.4, h: 0.6, fontSize: 14, rotate: -2, color: ACC });

    // 4 Ergebnisse
    s = k.page("Sand");
    head(s, "04", "DIE ERGEBNISSE");
    [["2,1×", "mehr Verkäufe über Ads"], ["1,9 %", "Klickrate (vorher 0,6 %)"], ["480.000", "Aufrufe in 6 Wochen"], ["3,4×", "Return on Ad Spend"]].forEach(([v, l], i) => {
      const x = M + (i % 2) * 3.0, y = 2.2 + Math.floor(i / 2) * 1.75;
      caps(s, v, { x, y, w: 2.8, h: 0.9, fontSize: 46, color: i === 0 ? ACC : INK });
      T(s, l, { x, y: y + 0.95, w: 2.8, h: 0.3, fontSize: 10, color: C.text2 });
    });
    label(s, "KLICKRATE PRO VIDEO", { x: 7.3, y: 2.2, w: 3.5, h: 0.22 });
    [["Vorher (Studio)", 0.6], ["Video A", 1.4], ["Video B", 2.6], ["Video C", 1.7]].forEach(([a, v], i) => {
      const y = 2.65 + i * 0.62;
      T(s, a, { x: 7.3, y, w: 1.4, h: 0.3, fontSize: 9.5, valign: "middle" });
      box(s, 8.75, y + 0.06, 1.9 * v / 2.6, 0.2, i === 2 ? ACC : INK);
      T(s, String(v).replace(".", ",") + " %", { x: 8.8 + 1.9 * v / 2.6, y, w: 0.8, h: 0.3, fontSize: 9.5, valign: "middle" });
    });
    box(s, 7.3, 5.4, W - M - 7.3, 1.9, C.accent3);
    serif(s, "„Video B ist seit sechs Wochen unsere beste Anzeige. Wir haben direkt nachgebucht.“", { x: 7.5, y: 5.6, w: W - M - 7.7, h: 1.1, fontSize: 13, italic: true, color: "FFFFFF" });
    T(s, "Lea, Performance Marketing bei Klarwasser", { x: 7.5, y: 6.8, w: 3.5, h: 0.3, fontSize: 8.5, color: "C9C8C2" });
    T(s, "Alle Zahlen, Namen und Marken sind Beispiele. Trag deine echten Ergebnisse ein.", { x: M, y: 7.75, w: 6, h: 0.25, fontSize: 8, italic: true, color: C.text2 });
  },
};
