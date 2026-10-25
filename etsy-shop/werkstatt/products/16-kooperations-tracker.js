module.exports = {
  slug: "16-kooperations-tracker", file: "Kooperations-Tracker", format: "A4Q", style: "lavendel",
  title: "Kooperations-Tracker", sub: "Alle Marken, Deals und Zahlungen im Blick", price: 10,
  pills: ["4 Seiten", "Querformat", "mit Pipeline-Board"],
  build(k) {
    const { C, S, W, H, M, T, caps, serif, hand, label, rule, box, frame, table, photo, polaroid } = k;
    const ACC = C.accent1, CW = W - 2 * M;

    // 1 Übersicht
    let s = k.page("Sand");
    caps(s, "KOOPERATIONEN", { x: M, y: 0.45, w: 7, h: 0.8, fontSize: 44 });
    serif(s, "Jahr: ________", { x: W - M - 2.6, y: 0.6, w: 2.6, h: 0.4, fontSize: 14, italic: true, align: "right" });
    const head = ["MARKE", "ANSPRECHPERSON", "LEISTUNG", "BETRAG", "DEADLINE", "STATUS", "BEZAHLT"];
    const ex = [["Klarwasser", "Lea Hartmann", "3 Videos + Ads", "870 €", "09.05.", "abgegeben", "✓"], ["Knusperhaus", "Deniz Aydın", "Unboxing", "160 €", "21.05.", "gedreht", ""], ["nordlicht", "Anna Weber", "GRWM-Video", "210 €", "02.06.", "gebucht", ""]];
    table(s, [head].concat(ex, Array.from({ length: 9 }, () => ["", "", "", "", "", "", ""])), M, 1.45, CW, [1.6, 1.8, 2.0, 1.0, 1.1, 1.6, 1.39], { rowH: 0.5, size: 9.5 });
    hand(s, "die ersten 3 Zeilen sind Beispiele", { x: W - M - 4, y: 7.65, w: 4, h: 0.4, fontSize: 11, rotate: -2, align: "right" });

    // 2 Pipeline
    s = k.page("Rose");
    caps(s, "PIPELINE", { x: M, y: 0.45, w: 5.2, h: 0.8, fontSize: 44 });
    T(s, "Schreib jede Kooperation auf einen Zettel und schieb sie weiter, sobald sich etwas tut.", { x: W - M - 4.6, y: 0.62, w: 4.6, h: 0.5, fontSize: 9.5, align: "right" });
    const cols = ["ANGEFRAGT", "IN VERHANDLUNG", "GEBUCHT", "GEDREHT", "ABGEGEBEN", "BEZAHLT"], cw = CW / 6;
    cols.forEach((c, i) => {
      const x = M + i * cw;
      box(s, x + 0.05, 1.45, cw - 0.1, 0.5, i === 5 ? C.accent3 : ACC);
      T(s, c, { x: x + 0.05, y: 1.45, w: cw - 0.1, h: 0.5, fontSize: 9, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
      frame(s, x + 0.05, 2.0, cw - 0.1, 5.8, C.accent5);
    });
    [[0, "Glanzstück", "Lipgloss, 2 Videos"], [1, "Ostwind", "Rucksack-Review"], [2, "nordlicht", "GRWM, 02.06."], [3, "Knusperhaus", "Unboxing"], [4, "Klarwasser", "3 Videos + Ads"]].forEach(([c, a, b], i) => {
      k.note(s, M + c * cw + 0.15, 2.2 + (i % 2) * 0.2, cw - 0.3, 1.2, i % 2 ? 2 : -2, [{ text: a, options: { bold: true, fontSize: 10, breakLine: true } }, { text: b, options: { fontSize: 8.5 } }], null, { margin: [10, 10, 8, 10], fill: i % 2 ? "FFFFFF" : C.accent2 });
    });

    // 3 Kontakte
    s = k.page("Sand");
    caps(s, "MARKEN-KONTAKTE", { x: M, y: 0.45, w: 7, h: 0.8, fontSize: 44 });
    table(s, [["MARKE", "NAME", "E-MAIL", "TELEFON", "ZULETZT GESPROCHEN", "NOTIZ"]].concat(Array.from({ length: 12 }, () => ["", "", "", "", "", ""])), M, 1.45, CW, [1.6, 1.7, 2.6, 1.5, 1.6, 1.49], { rowH: 0.47, size: 9.5 });

    // 4 Jahresübersicht
    s = k.page("Dunkel");
    caps(s, "MEIN JAHR IN ZAHLEN", { x: M, y: 0.45, w: 8, h: 0.8, fontSize: 44, color: "FFFFFF" });
    const months = ["JAN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"], mw = CW / 12;
    months.forEach((m, i) => {
      const x = M + i * mw;
      frame(s, x + 0.05, 1.6, mw - 0.1, 3.6, C.accent5);
      T(s, m, { x, y: 5.3, w: mw, h: 0.3, fontSize: 9, bold: true, align: "center", color: "FFFFFF" });
      T(s, "____ €", { x, y: 5.6, w: mw, h: 0.3, fontSize: 8, align: "center", color: C.accent5 });
    });
    hand(s, "Balken einfach hochziehen", { x: M, y: 6.15, w: 4, h: 0.4, fontSize: 12, rotate: -2, color: C.accent2 });
    [["KOOPERATIONEN GESAMT", ""], ["UMSATZ GESAMT", ""], ["BESTER MONAT", ""], ["LIEBLINGSMARKE", ""]].forEach(([a], i) => {
      const x = M + i * (CW / 4);
      label(s, a, { x, y: 6.75, w: 2.5, h: 0.22, color: C.accent5 });
      rule(s, x, 7.5, CW / 4 - 0.3, C.accent5);
    });
  },
};
