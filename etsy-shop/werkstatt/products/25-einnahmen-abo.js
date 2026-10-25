// Income tracker for subscription creators.
module.exports = {
  slug: "25-einnahmen-tracker-abo", file: "Einnahmen-Tracker-Abo-Creator", format: "A4", style: "noir",
  title: "Einnahmen-Tracker für Abo-Creator", sub: "Abos, Trinkgeld, Nachrichten-Verkäufe und Gebühren", price: 11,
  pills: ["4 Seiten", "zum Ausfüllen", "mit Gebühren-Rechner"],
  build(k) {
    const { C, W, H, M, T, caps, serif, hand, label, rule, box, frame, table, photo } = k;
    const GOLD = C.accent1, CREAM = k.CREAM, CW = W - 2 * M;
    // 1 cover
    let s = k.page("Sand");
    photo(s, "n1", M, M, CW, 5.6, { fy: 0.4 });
    caps(s, "ZAHLEN,\nBITTE", { x: M, y: 6.3, w: CW, h: 2.6, fontSize: 70 });
    serif(s, "der Einnahmen-Tracker für Abo-Creator", { x: M, y: 9.25, w: CW, h: 0.5, fontSize: 20, italic: true, color: GOLD });
    T(s, "Monatsübersicht · Abonnenten-Entwicklung · Gebühren · Jahr", { x: M, y: 9.85, w: CW, h: 0.3, fontSize: 9.5, color: C.text2 });
    // 2 Monat
    s = k.page("Rose");
    caps(s, "MEIN MONAT", { x: M, y: 0.6, w: 5, h: 0.8, fontSize: 40, noFit: true });
    T(s, "Monat: ______________", { x: W - M - 3, y: 0.8, w: 3, h: 0.3, fontSize: 10, align: "right" });
    const src = ["Abos", "Trinkgeld", "Nachrichten-Verkäufe", "Extras / Wunschcontent", "Live", "Sonstiges"];
    table(s, [["QUELLE", "WOCHE 1", "WOCHE 2", "WOCHE 3", "WOCHE 4", "SUMME"]].concat(src.map((x) => [x, "", "", "", "", ""]), [["GESAMT", "", "", "", "", ""]]), M, 1.6, CW, [2.07, 1.0, 1.0, 1.0, 1.0, 1.0], { rowH: 0.5 });
    label(s, "ABONNENTEN", { x: M, y: 5.7, w: 3, h: 0.2, color: GOLD });
    [["START", ""], ["NEU", ""], ["GEKÜNDIGT", ""], ["ENDE", ""]].forEach(([a], i) => { const x = M + i * (CW / 4); frame(s, x, 6.0, CW / 4 - 0.12, 1.2, C.accent5); label(s, a, { x: x + 0.15, y: 6.12, w: 1.5, h: 0.2, color: C.text2 }); });
    label(s, "WAS HAT AM BESTEN FUNKTIONIERT?", { x: M, y: 7.6, w: 5, h: 0.2, color: GOLD });
    for (let i = 0; i < 4; i++) rule(s, M, 8.25 + i * 0.45, CW, C.accent5);
    hand(s, "ehrlich eintragen, auch schwache Monate", { x: M, y: 10.35, w: CW, h: 0.45, fontSize: 13, rotate: -2, align: "right" });
    // 3 Gebühren
    s = k.page("Dunkel");
    caps(s, "BRUTTO\nIST NICHT\nNETTO", { x: M, y: 0.8, w: CW, h: 3.6, fontSize: 62, color: CREAM });
    serif(s, "So viel bleibt wirklich bei dir", { x: M, y: 4.4, w: CW, h: 0.5, fontSize: 19, italic: true, color: GOLD });
    const steps = [["Einnahmen laut Plattform", "1.000,00 €"], ["minus Plattformgebühr (z. B. 20 %)", "– 200,00 €"], ["= Auszahlung", "800,00 €"], ["minus Ausgaben (Licht, Outfits, Apps)", "– 60,00 €"], ["= Gewinn", "740,00 €"], ["Rücklage für Steuern (dein %)", "– ______ €"]];
    steps.forEach(([a, b], i) => {
      const y = 5.3 + i * 0.68, strong = a.startsWith("=");
      T(s, a, { x: M, y, w: 4.8, h: 0.4, fontSize: strong ? 12 : 10.5, bold: strong, color: CREAM });
      serif(s, b, { x: W - M - 2.2, y: y - 0.05, w: 2.2, h: 0.45, fontSize: 17, color: strong ? GOLD : CREAM, align: "right" });
      rule(s, M, y + 0.52, CW, C.accent4);
    });
    T(s, "Beispielrechnung. Gebühren je nach Plattform prüfen. Keine Steuerberatung.", { x: M, y: 10.95, w: CW, h: 0.25, fontSize: 7.5, color: C.accent5 });
    // 4 Jahr
    s = k.page("Sand");
    caps(s, "MEIN JAHR", { x: M, y: 0.6, w: 5, h: 0.8, fontSize: 40, noFit: true });
    table(s, [["MONAT", "BRUTTO", "GEBÜHREN", "NETTO", "ABOS ENDE"]].concat(["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember", "GESAMT"].map((m) => [m, "", "", "", ""])), M, 1.6, CW, [1.67, 1.35, 1.35, 1.35, 1.35], { rowH: 0.52 });
    label(s, "ZIEL FÜR NÄCHSTES JAHR", { x: M, y: 9.2, w: 4, h: 0.2, color: GOLD });
    for (let i = 0; i < 2; i++) rule(s, M, 9.85 + i * 0.45, CW, C.accent5);
  },
};
