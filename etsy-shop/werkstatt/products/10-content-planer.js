module.exports = {
  slug: "10-content-planer", file: "Content-Planer", format: "A4Q", style: "terra",
  title: "Content-Planer für einen Monat", sub: "Monat, Woche, Ideen und Rückblick", price: 10,
  pills: ["5 Seiten", "Querformat", "zum Ausfüllen & Drucken"],
  build(k) {
    const { C, S, W, H, M, T, caps, serif, hand, label, rule, vrule, photo, polaroid, box, frame, table, checkbox } = k;
    const INK = C.text1, ACC = C.accent1, CW = W - 2 * M;
    const types = [["Reel", ACC], ["Story", C.accent3], ["Post", "BCAEA2"], ["Kooperation", "D8A47F"]];
    const legend = (s, x, y) => types.forEach(([t, c], i) => {
      s.addShape(S.OVAL, { x: x + i * 1.45, y: y + 0.05, w: 0.18, h: 0.18, fill: { color: c }, line: { color: c, width: 0 } });
      T(s, t, { x: x + i * 1.45 + 0.27, y, w: 1.1, h: 0.28, fontSize: 9.5, valign: "middle" });
    });

    // 1 Cover
    let s = k.page("Sand");
    caps(s, "CONTENT\nPLANER", { x: M, y: 0.9, w: 6.2, h: 3.4, fontSize: 120 });
    serif(s, "für einen ganzen Monat", { x: M, y: 4.4, w: 6, h: 0.7, fontSize: 32, italic: true, color: ACC });
    T(s, "Monatsübersicht · Wochenplan · Ideen-Sammlung · Rückblick", { x: M, y: 5.2, w: 6, h: 0.3, fontSize: 11, bold: true });
    field3(s, M, 6.3);
    polaroid(s, "f_desk", 8.8, 3.6, 3.4, 4.2, 4, "Sonntag = Planungstag", 0, { fy: 0.4 });
    function field3(s, x, y) { [["MONAT", 2.2], ["MEIN FOKUS", 3.2]].forEach(([l, w], i) => { label(s, l, { x: x + i * 2.6, y, w, h: 0.2, color: C.text2 }); rule(s, x + i * 2.6, y + 0.6, w - 0.2, C.accent5); }); }

    // 2 Monat
    s = k.page("Sand");
    caps(s, "MONATSÜBERSICHT", { x: M, y: 0.45, w: 6, h: 0.75, fontSize: 40 });
    T(s, "Monat: ______________", { x: W - M - 3, y: 0.6, w: 3, h: 0.3, fontSize: 11, align: "right" });
    const days = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"], cw = CW / 7, ch = 1.17, top = 1.55;
    days.forEach((d, i) => label(s, d, { x: M + i * cw + 0.08, y: top - 0.3, w: cw, h: 0.22, color: i > 4 ? ACC : INK }));
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
      frame(s, M + c * cw, top + r * ch, cw, ch, C.accent5);
      T(s, "", { x: M + c * cw + 0.08, y: top + r * ch + 0.06, w: 0.4, h: 0.25, fontSize: 9, bold: true });
    }
    legend(s, M, 7.55);
    hand(s, "Farbpunkt = Format", { x: 7.3, y: 7.5, w: 3, h: 0.4, fontSize: 11, rotate: -2 });

    // 3 Woche
    s = k.page("Rose");
    caps(s, "WOCHENPLAN", { x: M, y: 0.45, w: 5, h: 0.75, fontSize: 40 });
    T(s, "Woche vom ________ bis ________", { x: W - M - 4, y: 0.6, w: 4, h: 0.3, fontSize: 11, align: "right" });
    const rows = [["TAG", "PLATTFORM", "FORMAT", "THEMA / HOOK", "STATUS"]].concat(["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"].map((d) => [d, "", "", "", "Idee · Dreh · Schnitt · Online"]));
    table(s, rows, M, 1.45, CW, [1.25, 1.5, 1.3, 4.4, 2.0], { rowH: 0.72, size: 9.5 });
    label(s, "DIESE WOCHE WICHTIG", { x: M, y: 7.45, w: 4, h: 0.2 });
    rule(s, M + 2.3, 7.6, CW - 2.3, C.accent5);

    // 4 Ideen
    s = k.page("Sand");
    caps(s, "IDEEN-SAMMLUNG", { x: M, y: 0.45, w: 6, h: 0.75, fontSize: 40 });
    const pillars = [["Säule 1", "z. B. Morgenroutine"], ["Säule 2", "z. B. Produkt-Tests"], ["Säule 3", "z. B. Behind the Scenes"], ["Säule 4", "z. B. Tipps & Fehler"]];
    label(s, "MEINE CONTENT-SÄULEN", { x: M, y: 1.4, w: 4, h: 0.2, color: ACC });
    pillars.forEach(([a, b], i) => {
      const x = M + i * (CW / 4);
      box(s, x, 1.7, CW / 4 - 0.15, 1.0, i % 2 ? C.accent2 : C.accent6);
      serif(s, a, { x: x + 0.2, y: 1.8, w: 2.2, h: 0.35, fontSize: 15, italic: true });
      T(s, b, { x: x + 0.2, y: 2.2, w: 2.3, h: 0.3, fontSize: 9, color: C.text2 });
    });
    [["Evergreen", "läuft immer"], ["Trends", "schnell umsetzen"], ["Kooperationen", "für Marken"]].forEach(([a, b], i) => {
      const x = M + i * (CW / 3);
      serif(s, a, { x, y: 3.05, w: 3, h: 0.4, fontSize: 18 });
      hand(s, b, { x: x + 1.9, y: 3.05, w: 1.6, h: 0.4, fontSize: 9.5, rotate: -3 });
      for (let l = 0; l < 10; l++) { checkbox(s, x, 3.65 + l * 0.42, 0.17, false); rule(s, x + 0.3, 3.82 + l * 0.42, CW / 3 - 0.5, C.accent5); }
    });

    // 5 Rückblick
    s = k.page("Dunkel");
    caps(s, "MONATSRÜCKBLICK", { x: M, y: 0.45, w: 6.5, h: 0.75, fontSize: 40, color: k.CREAM });
    [["FOLLOWER", "Anfang  →  Ende"], ["AUFRUFE GESAMT", ""], ["BESTES VIDEO", ""], ["KOOPERATIONEN", "Anzahl / Umsatz"]].forEach(([a, b], i) => {
      const x = M + i * (CW / 4);
      label(s, a, { x, y: 1.5, w: 2.4, h: 0.2, color: C.accent5 });
      T(s, b, { x, y: 1.75, w: 2.4, h: 0.25, fontSize: 9, color: C.accent5 });
      rule(s, x, 2.55, CW / 4 - 0.3, C.accent5);
    });
    [["Das lief richtig gut", 0], ["Das mache ich nächsten Monat anders", 1]].forEach(([t, i]) => {
      const x = M + i * (CW / 2);
      serif(s, t, { x, y: 3.1, w: CW / 2 - 0.4, h: 0.45, fontSize: 18, italic: true, color: C.accent2 });
      for (let l = 0; l < 7; l++) rule(s, x, 3.95 + l * 0.48, CW / 2 - 0.4, C.accent5);
    });
    hand(s, "ehrlich sein lohnt sich!", { x: 7.8, y: 7.55, w: 3.2, h: 0.4, fontSize: 11, rotate: -3, color: C.accent2 });
  },
};
