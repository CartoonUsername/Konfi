module.exports = {
  slug: "12-skript-vorlage", file: "Skript-Vorlage-UGC", format: "A4", style: "salbei",
  title: "Skript-Vorlage für UGC-Videos", sub: "Vom Hook bis zum Call-to-Action in 30 Sekunden", price: 9,
  pills: ["4 Seiten", "mit Beispiel-Skript", "inkl. Shotlist"],
  build(k) {
    const { C, S, W, H, M, T, caps, serif, hand, label, rule, vrule, photo, polaroid, box, table } = k;
    const ACC = C.accent1, CW = W - 2 * M;
    const parts = [["0–3 s", "HOOK", "Der erste Satz. Er entscheidet, ob jemand weiterschaut."], ["3–8 s", "PROBLEM", "Was nervt deine Zielgruppe? Zeig, dass du es kennst."], ["8–18 s", "LÖSUNG & DEMO", "Das Produkt in Aktion. Zeig, nicht nur erzählen."], ["18–25 s", "BEWEIS", "Ergebnis, Vorher-Nachher oder dein ehrliches Fazit."], ["25–30 s", "CALL TO ACTION", "Was soll die Person jetzt tun?"]];

    // 1 Cover + Aufbau
    let s = k.page("Sand");
    caps(s, "SKRIPT", { x: M, y: 0.6, w: 5, h: 1.6, fontSize: 110 });
    serif(s, "für 30-Sekunden-Videos", { x: M, y: 2.2, w: 5, h: 0.6, fontSize: 28, italic: true, color: ACC });
    polaroid(s, "f_setup", 6.15, 1.85, 2.0, 2.3, 5, "", 1, { fy: 0.5 });
    T(s, "Ein gutes UGC-Video folgt fast immer diesem Aufbau. Plane jeden Abschnitt, bevor du drehst. So sparst du dir das Nachdrehen.", { x: M, y: 3.25, w: 5.2, h: 0.8, fontSize: 10.5, lineSpacingMultiple: 1.35 });
    parts.forEach(([t, a, b], i) => {
      const y = 4.4 + i * 1.18;
      box(s, M, y, 1.25, 0.95, i === 0 ? C.accent3 : C.accent2);
      T(s, t, { x: M, y, w: 1.25, h: 0.95, fontSize: 12, bold: true, align: "center", valign: "middle", color: i === 0 ? k.CREAM : C.text1 });
      caps(s, a, { x: M + 1.5, y: y + 0.05, w: 4.5, h: 0.45, fontSize: 20 });
      T(s, b, { x: M + 1.5, y: y + 0.52, w: 5.4, h: 0.4, fontSize: 9.5, color: C.text2 });
    });
    hand(s, "Tipp: laut vorlesen, bevor du drehst", { x: M, y: 10.45, w: 5, h: 0.5, fontSize: 12, rotate: -2 });

    // 2 Leere Vorlage
    s = k.page("Sand");
    caps(s, "MEIN SKRIPT", { x: M, y: 0.5, w: 5, h: 0.9, fontSize: 48 });
    [["PRODUKT", 2.3], ["MARKE", 2.0], ["LÄNGE", 1.2], ["FORMAT", 1.4]].reduce((x, [l, w]) => { label(s, l, { x, y: 1.5, w, h: 0.2, color: C.text2 }); rule(s, x, 2.0, w - 0.15, C.accent5); return x + w; }, M);
    parts.forEach(([t, a], i) => {
      const y = 2.35 + i * 1.72;
      label(s, `${a} · ${t}`, { x: M, y, w: 3, h: 0.22, color: ACC });
      label(s, "WAS MAN SIEHT", { x: M + CW * 0.58, y, w: 2.5, h: 0.22, color: C.text2 });
      for (let l = 0; l < 3; l++) { rule(s, M, y + 0.6 + l * 0.38, CW * 0.55, C.accent5); rule(s, M + CW * 0.58, y + 0.6 + l * 0.38, CW * 0.42, C.accent5); }
    });

    // 3 Beispiel
    s = k.page("Rose");
    caps(s, "BEISPIEL", { x: M, y: 0.5, w: 4, h: 0.9, fontSize: 48 });
    serif(s, "Trinkflasche, 30 Sekunden, TikTok", { x: M, y: 1.4, w: 6, h: 0.45, fontSize: 18, italic: true, color: ACC });
    const ex = [
      ["HOOK", "„Mein Wasser ist nach 12 Stunden im Auto immer noch eiskalt. Ich zeig's euch.“", "Nahaufnahme: Flasche im heißen Auto, Hand greift danach"],
      ["PROBLEM", "„Ich hab früher ständig Plastikflaschen gekauft, weil meine alte Flasche alles warm gemacht hat.“", "Kurzer Schnitt auf leere Plastikflaschen"],
      ["LÖSUNG & DEMO", "„Die hier ist doppelwandig, passt in jeden Getränkehalter und ist auslaufsicher.“", "Flasche umdrehen, schütteln, in den Halter stellen"],
      ["BEWEIS", "„Eiswürfel um 8 Uhr rein, und um 20 Uhr sind sie immer noch da.“", "Uhr im Bild, Eiswürfel klirren hörbar"],
      ["CALL TO ACTION", "„Link ist in der Bio, mit meinem Code gibt's 10 Prozent.“", "Lächeln in die Kamera, Flasche anheben"],
    ];
    ex.forEach(([a, b, c], i) => {
      const y = 2.2 + i * 1.62;
      label(s, a, { x: M, y, w: 2, h: 0.22, color: ACC });
      T(s, b, { x: M, y: y + 0.28, w: CW * 0.58, h: 1.1, fontSize: 11, italic: true, lineSpacingMultiple: 1.3 });
      vrule(s, M + CW * 0.61, y + 0.05, 1.25, C.accent5);
      T(s, c, { x: M + CW * 0.64, y: y + 0.28, w: CW * 0.36, h: 1.1, fontSize: 9, color: C.text2, lineSpacingMultiple: 1.3 });
    });
    hand(s, "Code und Link immer am Ende!", { x: M, y: 10.45, w: 4, h: 0.5, fontSize: 12, rotate: -2 });

    // 4 Shotlist
    s = k.page("Sand");
    caps(s, "SHOTLIST", { x: M, y: 0.5, w: 4, h: 0.9, fontSize: 48 });
    T(s, "Alle Aufnahmen auf einen Blick. Abhaken, sobald sie im Kasten sind.", { x: M, y: 1.45, w: 6, h: 0.3, fontSize: 10 });
    table(s, [["NR.", "EINSTELLUNG", "ORT", "DAUER", "✓"]].concat(Array.from({ length: 14 }, (_, i) => [String(i + 1), "", "", "", ""])), M, 2.0, CW, [0.55, 3.5, 1.6, 0.8, 0.62], { rowH: 0.55 });
    label(s, "B-ROLL-IDEEN", { x: M, y: 10.35, w: 3, h: 0.2, color: ACC });
    T(s, "Hände · Verpackung · Produkt im Alltag · Spiegel · Fensterlicht · Übergang", { x: M, y: 10.6, w: CW, h: 0.3, fontSize: 9.5 });
  },
};
