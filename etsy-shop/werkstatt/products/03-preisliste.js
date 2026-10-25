module.exports = {
  slug: "03-preisliste-rate-card", file: "Preisliste-Rate-Card", format: "A4", style: "mono",
  title: "Preisliste / Rate Card", sub: "Deine Preise klar und professionell", price: 10,
  pills: ["3 Seiten", "2 Designs", "inkl. Nutzungsrechte-Guide"],
  build(k) {
    const { C, W, M, T, caps, serif, hand, label, rule, photo, polaroid, mark, box } = k;
    const items = [
      ["Einzelvideo", "15 bis 30 Sekunden, Hochformat, mit Untertiteln", "180 €"],
      ["Videopaket", "3 Videos mit je 15 bis 30 Sekunden", "490 €"],
      ["Produktfotos", "5 bearbeitete Fotos in hoher Auflösung", "120 €"],
      ["Hook-Variante", "Alternativer Einstieg für ein fertiges Video", "25 €"],
      ["Rohmaterial", "Alle ungeschnittenen Aufnahmen eines Drehs", "60 €"],
      ["Voiceover", "Sprechertext für ein vorhandenes Video", "70 €"],
    ];
    const extras = [["Weitere Überarbeitung", "40 €"], ["Express in 48 Stunden", "+ 25 %"], ["Werbenutzung, 30 Tage", "+ 30 %"], ["Jeder weitere Monat", "+ 10 %"], ["Exklusivität pro Monat", "+ 20 %"]];

    // Page 1: light, menu style
    let s = k.page("Sand");
    label(s, "JONAS BREMER · UGC-CREATOR", { x: M, y: 0.6, w: 5, h: 0.22, color: C.accent1 });
    k.title(s, "PREISLISTE", "2026", M, 0.85, { capsSize: 96, serifSize: 44, w: 5.0 });
    polaroid(s, "j1", 6.35, 1.85, 1.85, 1.85, 5, "Drehtag", 2);
    rule(s, M, 3.35, W - 2 * M, C.text1);
    items.forEach(([a, d, p], i) => {
      const y = 3.45 + i * 0.78;
      serif(s, a, { x: M, y, w: 3.4, h: 0.4, fontSize: 19 });
      T(s, d, { x: M, y: y + 0.4, w: 4.8, h: 0.25, fontSize: 9, color: C.text2 });
      caps(s, p, { x: W - M - 1.5, y: y + 0.02, w: 1.5, h: 0.45, fontSize: 24, align: "right" });
      rule(s, M, y + 0.72, W - 2 * M, C.accent5);
    });
    const col = (W - 2 * M - 0.5) / 2;
    label(s, "EXTRAS", { x: M, y: 8.3, w: col, h: 0.22 });
    extras.forEach(([a, b], i) => {
      const y = 8.6 + i * 0.32;
      T(s, a, { x: M, y, w: col - 0.8, h: 0.28, fontSize: 9.5, valign: "middle" });
      T(s, b, { x: M + col - 0.8, y, w: 0.8, h: 0.28, fontSize: 9.5, bold: true, align: "right", valign: "middle" });
    });
    const c2 = M + col + 0.5;
    label(s, "IMMER DABEI", { x: c2, y: 8.3, w: col, h: 0.22 });
    T(s, "Konzept und Skript, eine Überarbeitungsrunde, Lieferung in sieben Werktagen und organische Nutzung für zwölf Monate.", { x: c2, y: 8.6, w: col, h: 1.0, fontSize: 9.5, lineSpacingMultiple: 1.3 });
    hand(s, "Pakete gibt's auf Anfrage!", { x: c2, y: 9.75, w: col, h: 0.4, fontSize: 10, rotate: -3 });
    T(s, "Alle Preise zzgl. MwSt. · hallo@deinewebsite.de · @jonas.dreht", { x: M, y: 10.95, w: W - 2 * M, h: 0.25, fontSize: 8.5, color: C.text2 });

    // Page 2: dark, compact two-column card
    s = k.page("Dunkel");
    photo(s, "j4", 0, 0, W, 4.2, { fy: 0.35, alt: "Creator am Hafen" });
    caps(s, "RATE CARD", { x: M, y: 4.5, w: 6, h: 1.2, fontSize: 80, color: k.CREAM });
    serif(s, "Jonas Bremer · 2026", { x: M, y: 5.6, w: 5, h: 0.5, fontSize: 20, italic: true, color: C.accent2 });
    items.forEach(([a, d, p], i) => {
      const x = M + (i % 2) * ((W - 2 * M) / 2 + 0.1), y = 6.45 + Math.floor(i / 2) * 1.05;
      caps(s, p, { x, y, w: 1.4, h: 0.5, fontSize: 26, color: C.accent1 });
      T(s, a, { x: x + 1.45, y: y + 0.02, w: 2.0, h: 0.28, fontSize: 10.5, bold: true, color: k.CREAM });
      T(s, d, { x: x + 1.45, y: y + 0.3, w: 1.9, h: 0.55, fontSize: 8.5, color: C.accent5 });
    });
    rule(s, M, 9.75, W - 2 * M, C.accent5);
    T(s, extras.map(([a, b]) => `${a} ${b}`).join("   ·   "), { x: M, y: 9.9, w: W - 2 * M, h: 0.6, fontSize: 8.5, color: k.CREAM, lineSpacingMultiple: 1.3 });
    T(s, "Alle Preise zzgl. MwSt. · hallo@deinewebsite.de", { x: M, y: 10.95, w: 5, h: 0.25, fontSize: 8.5, color: C.accent5 });

    // Page 3: usage rights explained
    s = k.page("Rose");
    k.title(s, "NUTZUNGS-\nRECHTE", "einfach erklärt", M, 0.55, { capsSize: 64, serifSize: 30 });
    const y0 = k.lastTitleBottom + 0.35;
    const rows = [
      ["Organische Nutzung", "Die Marke postet dein Video auf ihren eigenen Kanälen, ohne Werbebudget.", "meist im Preis enthalten"],
      ["Werbenutzung (Paid Usage)", "Die Marke schaltet dein Video als Anzeige, zum Beispiel auf TikTok oder Instagram.", "+ 30 % für 30 Tage"],
      ["Laufzeit", "Wie lange darf die Marke das Video nutzen? Je länger, desto teurer.", "+ 10 % pro Monat"],
      ["Exklusivität", "Du arbeitest in der Zeit nicht für Konkurrenzmarken.", "+ 20 % pro Monat"],
      ["Rohmaterial", "Die Marke bekommt alle Aufnahmen und schneidet selbst.", "pauschal oder + 30 %"],
    ];
    rows.forEach(([a, b, c], i) => {
      const y = y0 + i * 1.32;
      k.caps(s, String(i + 1).padStart(2, "0"), { x: M, y, w: 0.8, h: 0.6, fontSize: 34, color: C.accent1 });
      serif(s, a, { x: M + 0.9, y, w: 4.5, h: 0.4, fontSize: 17 });
      T(s, b, { x: M + 0.9, y: y + 0.45, w: 4.3, h: 0.7, fontSize: 9.5, lineSpacingMultiple: 1.3 });
      hand(s, c, { x: 5.6, y: y + 0.1, w: 2.1, h: 0.7, fontSize: 13, rotate: -3 });
    });
    T(s, "Typische Aufschläge im deutschsprachigen Raum als Orientierung. Setze deine eigenen Werte ein. Keine Rechtsberatung.", { x: M, y: 10.6, w: W - 2 * M, h: 0.45, fontSize: 8, color: C.text2 });
  },
};
