// Content calendar for subscription creators (A4 landscape).
module.exports = {
  slug: "23-content-kalender-abo", file: "Content-Kalender-Abo-Creator", format: "A4Q", style: "noir",
  title: "Content-Kalender für Abo-Creator", sub: "Feed, Nachrichten, Promo und Shootings planen", price: 10,
  pills: ["4 Seiten", "Querformat", "Monat + Woche"],
  build(k) {
    const { C, W, H, M, T, caps, serif, hand, label, rule, box, frame, table, photo, polaroid, checkbox } = k;
    const GOLD = C.accent1, CREAM = k.CREAM, CW = W - 2 * M;
    // 1 Monat
    let s = k.page("Sand");
    caps(s, "MONATSPLAN", { x: M, y: 0.45, w: 5, h: 0.8, fontSize: 40, noFit: true });
    serif(s, "Monat: ____________", { x: W - M - 3.2, y: 0.55, w: 3.2, h: 0.45, fontSize: 16, italic: true, align: "right" });
    const days = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"], dw = CW / 7, dh = 1.18;
    days.forEach((d, i) => { box(s, M + i * dw, 1.4, dw - 0.04, 0.32, C.accent3); T(s, d, { x: M + i * dw, y: 1.4, w: dw, h: 0.32, fontSize: 8, bold: true, color: CREAM, align: "center", valign: "middle" }); });
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) frame(s, M + c * dw, 1.78 + r * dh, dw - 0.04, dh - 0.05, C.accent5);
    const LEG = [["F", "Feed-Beitrag"], ["N", "Massen-Nachricht"], ["P", "Promo auf Social Media"], ["S", "Shooting"], ["L", "Live"]];
    LEG.forEach(([a, b], i) => { serif(s, a, { x: M + i * 2.1, y: 7.75, w: 0.3, h: 0.35, fontSize: 15, color: GOLD, bold: true }); T(s, b, { x: M + i * 2.1 + 0.3, y: 7.8, w: 1.8, h: 0.3, fontSize: 8.5 }); });
    // 2 Woche
    s = k.page("Rose");
    caps(s, "MEINE WOCHE", { x: M, y: 0.45, w: 5, h: 0.8, fontSize: 40, noFit: true });
    hand(s, "ein freier Tag ist Pflicht", { x: W - M - 3.6, y: 0.6, w: 3.6, h: 0.45, fontSize: 13, rotate: -2, align: "right" });
    const rows = ["FEED", "NACHRICHTEN", "PROMO", "SHOOTING", "NOTIZEN"];
    table(s, [[""].concat(days)].concat(rows.map((r) => [r, "", "", "", "", "", "", ""])), M, 1.4, CW, [1.45].concat(Array(7).fill((CW - 1.45) / 7)), { rowH: 1.2, size: 8, headFill: C.accent1 });
    // 3 Ideen
    s = k.page("Dunkel");
    polaroid(s, "n6", W - M - 1.6, 2.6, 2.6, 3.3, 4, "Serien-Idee: Stadtspaziergang", 1, { fy: 0.35 });
    caps(s, "IDEEN-\nSPEICHER", { x: M, y: 0.6, w: 6, h: 2.0, fontSize: 52, color: CREAM });
    serif(s, "Serien, Themen, Wünsche der Fans", { x: M, y: 2.55, w: 6, h: 0.5, fontSize: 18, italic: true, color: GOLD });
    for (let i = 0; i < 9; i++) {
      const y = 3.4 + i * 0.47; checkbox(s, M, y + 0.06, 0.22, false); rule(s, M + 0.4, y + 0.32, 6.4, C.accent5);
    }
    T(s, "Beispiele: Morgenroutine-Serie · Outfit der Woche · Fragen-Freitag · Bücher, die ich lese", { x: M, y: 7.75, w: 7, h: 0.3, fontSize: 8.5, color: C.accent5 });
    // 4 Shooting-Plan
    s = k.page("Sand");
    caps(s, "SHOOTING-PLAN", { x: M, y: 0.45, w: 6, h: 0.8, fontSize: 40, noFit: true });
    photo(s, "n4", W - M - 2.4, 0.45, 2.4, 3.0, { fy: 0.3, rot: -2, tape: 2 });
    [["DATUM", 1.5], ["ORT", 1.5], ["THEMA / SERIE", 1.5], ["OUTFITS", 3.6]].forEach(([l, w], i) => k.field(s, l, M, 1.5 + i * 0.8, i === 3 ? 6.3 : 4.5));
    label(s, "SHOTLISTE", { x: M, y: 4.85, w: 3, h: 0.2, color: GOLD });
    table(s, [["NR.", "MOTIV", "FORMAT", "FÜR", "✓"]].concat(Array.from({ length: 6 }, (_, i) => [String(i + 1), "", "", "", ""])), M, 5.1, CW, [0.6, 5.0, 1.6, 2.4, CW - 9.6], { rowH: 0.42 });
  },
};
