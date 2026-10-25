// Abo-Creator price menu, styled like a restaurant / bar menu.
const TIERS = [["BASIS", "9,99 €", "im Monat", ["alle Feed-Beiträge", "3 neue Sets pro Woche", "Antwort auf Nachrichten in 48 h"]], ["NAH DRAN", "19,99 €", "im Monat", ["alles aus Basis", "Behind-the-Scenes jeden Freitag", "monatliche Umfrage: du bestimmst mit", "Antwort in 24 h"]], ["INNER CIRCLE", "39,99 €", "im Monat", ["alles aus Nah dran", "persönliche Sprachnachricht im Monat", "Wunsch-Thema einmal im Monat", "früher Zugang zu neuen Serien"]]];
const EXTRAS = [["Persönliche Sprachnachricht", "1 Minute", "8 €"], ["Wunschfoto-Set", "10 Bilder, dein Thema", "25 €"], ["Kurzvideo nach Wunsch", "bis 60 Sek.", "35 €"], ["Persönlicher Gruß", "Geburtstag, Jubiläum", "12 €"], ["Ein Tag mit mir", "Tagesvlog, nur für dich", "45 €"], ["Archiv-Paket", "ältere Sets gesammelt", "15 €"]];
module.exports = {
  slug: "21-preismenue-abo", file: "Preismenue-Abo-Creator", format: "A4", style: "noir",
  title: "Preismenü für Abo-Creator", sub: "Abo-Stufen und Extras klar und edel präsentiert", price: 12,
  pills: ["3 Seiten", "Abo-Stufen + Extras", "Canva & PowerPoint"],
  build(k) {
    const { C, W, H, M, T, caps, serif, hand, label, rule, box, frame, photo, circlePhoto } = k;
    const GOLD = C.accent1, CREAM = k.CREAM, CW = W - 2 * M;
    // 1 Abo-Stufen (dark menu card)
    let s = k.page("Dunkel");
    frame(s, M * 0.55, M * 0.55, W - M * 1.1, H - M * 1.1, GOLD);
    circlePhoto(s, "n2", W / 2 - 0.75, 0.95, 1.5, { ring: GOLD, fy: 0.2 });
    caps(s, "MENÜ", { x: M, y: 2.65, w: CW, h: 1.1, fontSize: 72, color: CREAM, align: "center", noFit: true });
    serif(s, "für meine Abonnent:innen", { x: M, y: 3.7, w: CW, h: 0.5, fontSize: 20, italic: true, color: GOLD, align: "center" });
    TIERS.forEach(([n, p, per, items], i) => {
      const y = 4.65 + i * 2.05;
      caps(s, n, { x: M + 0.35, y, w: 4, h: 0.5, fontSize: 26, color: CREAM, noFit: true });
      serif(s, p, { x: W - M - 2.6, y: y - 0.05, w: 2.25, h: 0.55, fontSize: 26, color: GOLD, align: "right" });
      T(s, per, { x: W - M - 2.6, y: y + 0.5, w: 2.25, h: 0.25, fontSize: 8, color: C.accent5, align: "right" });
      T(s, items.join("  ·  "), { x: M + 0.35, y: y + 0.58, w: CW - 3.2, h: 0.9, fontSize: 9.5, color: CREAM, lineSpacingMultiple: 1.4 });
      if (i < 2) rule(s, W / 2 - 0.6, y + 1.72, 1.2, GOLD);
    });
    hand(s, "kündbar jederzeit, ohne Fragen", { x: M, y: 10.5, w: CW, h: 0.45, fontSize: 13, color: GOLD, align: "center", rotate: -1 });

    // 2 Extras (light, à la carte)
    s = k.page("Sand");
    photo(s, "n4", W - M - 2.9, M, 2.9, 3.9, { fy: 0.3 });
    caps(s, "À LA\nCARTE", { x: M, y: 0.95, w: 4.2, h: 2.4, fontSize: 64, noFit: true });
    serif(s, "Extras, die du einzeln bestellen kannst", { x: M, y: 3.3, w: 4.3, h: 0.9, fontSize: 18, italic: true, color: GOLD });
    EXTRAS.forEach(([a, b, p], i) => {
      const y = 5.15 + i * 0.86;
      serif(s, a, { x: M, y, w: 4.6, h: 0.4, fontSize: 17 });
      T(s, b, { x: M, y: y + 0.4, w: 4.6, h: 0.25, fontSize: 8.5, color: C.text2 });
      s.addShape(k.S.LINE, { x: M + 4.7, y: y + 0.3, w: CW - 5.6, h: 0, line: { color: C.accent5, width: 0.75, dashType: "sysDot" } });
      serif(s, p, { x: W - M - 0.9, y, w: 0.9, h: 0.4, fontSize: 17, align: "right", color: GOLD });
    });
    label(s, "SO BESTELLST DU", { x: M, y: 10.35, w: 3, h: 0.2, color: GOLD });
    T(s, "Schreib mir eine Nachricht mit dem Stichwort EXTRA. Lieferung innerhalb von 3 Tagen.", { x: M, y: 10.6, w: CW, h: 0.3, fontSize: 9 });

    // 3 Leere Vorlage
    s = k.page("Rose");
    caps(s, "MEIN MENÜ", { x: M, y: 0.8, w: CW, h: 0.9, fontSize: 48, align: "center", noFit: true });
    serif(s, "zum Selbst-Ausfüllen", { x: M, y: 1.65, w: CW, h: 0.45, fontSize: 18, italic: true, color: GOLD, align: "center" });
    for (let i = 0; i < 3; i++) {
      const y = 2.5 + i * 1.75;
      frame(s, M, y, CW, 1.5, C.accent5);
      k.field(s, "NAME DER STUFE", M + 0.25, y + 0.2, 3.2);
      k.field(s, "PREIS IM MONAT", W - M - 2.45, y + 0.2, 2.2);
      k.field(s, "DAS IST DRIN", M + 0.25, y + 0.8, CW - 0.5);
    }
    label(s, "EXTRAS", { x: M, y: 7.85, w: 3, h: 0.2, color: GOLD });
    for (let i = 0; i < 5; i++) { k.rule(s, M, 8.55 + i * 0.45, CW - 1.4, C.accent5); k.rule(s, W - M - 1.1, 8.55 + i * 0.45, 1.1, C.accent5); }
    T(s, "Halte dich an die Regeln deiner Plattform. Preise sind Beispiele, keine Empfehlung.", { x: M, y: 10.95, w: CW, h: 0.25, fontSize: 7.5, color: C.text2, align: "center" });
  },
};
