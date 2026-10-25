module.exports = {
  slug: "06-briefing-formular", file: "Briefing-Formular", format: "A4", style: "salbei",
  title: "Briefing-Formular für Marken", sub: "Damit Marken dir sagen, was sie wirklich wollen", price: 9,
  pills: ["3 Seiten", "zum Ausfüllen", "Deutsch"],
  build(k) {
    const { C, W, M, T, caps, serif, hand, label, rule, field, checkbox } = k;
    const CW = W - 2 * M, half = (CW - 0.4) / 2;
    const section = (s, n, t, y) => {
      caps(s, n, { x: M, y, w: 0.6, h: 0.45, fontSize: 24, color: C.accent1 });
      serif(s, t, { x: M + 0.6, y: y + 0.02, w: 5, h: 0.4, fontSize: 17 });
      rule(s, M, y + 0.48, CW, C.text1);
    };
    const lines = (s, x, y, w, n) => { for (let i = 0; i < n; i++) k.rule(s, x, y + i * 0.38, w, C.accent5); };

    // Page 1
    let s = k.page("Sand");
    k.title(s, "BRIEFING", "für unsere Kooperation", M, 0.5, { capsSize: 88, serifSize: 28, w: 5.2 });
    k.polaroid(s, "f_desk", 6.4, 1.55, 1.6, 1.6, 5, "", 1);
    T(s, "Liebe Marke, damit das Video genau zu euch passt, beantwortet bitte kurz diese Fragen. Das dauert etwa 10 Minuten.", { x: M, y: 2.35, w: 4.9, h: 0.6, fontSize: 9.5, lineSpacingMultiple: 1.3 });
    section(s, "01", "Über euch", 3.2);
    field(s, "UNTERNEHMEN", M, 3.85, half); field(s, "WEBSITE", M + half + 0.4, 3.85, half);
    field(s, "ANSPRECHPERSON", M, 4.6, half); field(s, "E-MAIL / TELEFON", M + half + 0.4, 4.6, half);
    section(s, "02", "Produkt", 5.5);
    field(s, "PRODUKTNAME", M, 6.15, half); field(s, "PRODUKT-LINK", M + half + 0.4, 6.15, half);
    label(s, "WAS MACHT DAS PRODUKT BESONDERS? (2–3 PUNKTE)", { x: M, y: 6.95, w: CW, h: 0.2, color: C.text2, fontSize: 7.5 });
    lines(s, M, 7.5, CW, 3);
    section(s, "03", "Ziel der Kampagne", 8.65);
    [["Bekanntheit", false], ["Verkäufe / Conversions", false], ["Produkteinführung", false], ["Content für die eigenen Kanäle", false], ["Werbeanzeigen (Paid Ads)", false], ["Sonstiges", false]].forEach(([t], i) => {
      const x = M + (i % 2) * (half + 0.4), y = 9.3 + Math.floor(i / 2) * 0.45;
      checkbox(s, x, y + 0.05, 0.22, false);
      T(s, t, { x: x + 0.38, y, w: half - 0.4, h: 0.32, fontSize: 10.5, valign: "middle" });
    });

    // Page 2
    s = k.page("Sand");
    section(s, "04", "Zielgruppe & Botschaft", 0.6);
    label(s, "WER SOLL DAS VIDEO SEHEN? (ALTER, INTERESSEN, PROBLEM)", { x: M, y: 1.25, w: CW, h: 0.2, color: C.text2, fontSize: 7.5 });
    lines(s, M, 1.8, CW, 2);
    label(s, "DIE EINE SACHE, DIE ZUSCHAUER SICH MERKEN SOLLEN", { x: M, y: 2.45, w: CW, h: 0.2, color: C.text2, fontSize: 7.5 });
    lines(s, M, 3.0, CW, 2);
    const ldo = M, ldn = M + half + 0.4;
    serif(s, "Bitte zeigen / sagen", { x: ldo, y: 3.7, w: half, h: 0.35, fontSize: 13, italic: true, color: C.accent1 });
    serif(s, "Bitte nicht", { x: ldn, y: 3.7, w: half, h: 0.35, fontSize: 13, italic: true, color: C.accent1 });
    lines(s, ldo, 4.4, half, 4); lines(s, ldn, 4.4, half, 4);
    section(s, "05", "Formate & Umfang", 6.1);
    [["Anzahl Videos", ""], ["Länge pro Video", ""], ["Format", "Hochformat 9:16"], ["Hook-Varianten", ""], ["Produktfotos", ""], ["Rohmaterial", "ja / nein"]].forEach(([a, v], i) => {
      field(s, a.toUpperCase(), M + (i % 2) * (half + 0.4), 6.75 + Math.floor(i / 2) * 0.75, half, { value: v, color: C.text2 });
    });
    section(s, "06", "Nutzung", 9.1);
    ["Nur organisch auf euren Kanälen", "Als Werbeanzeige", "Auf der Website / im Shop", "Exklusivität gewünscht"].forEach((t, i) => {
      const x = M + (i % 2) * (half + 0.4), y = 9.75 + Math.floor(i / 2) * 0.45;
      checkbox(s, x, y + 0.05, 0.22, false);
      T(s, t, { x: x + 0.38, y, w: half - 0.4, h: 0.32, fontSize: 10.5, valign: "middle" });
    });
    field(s, "WIE LANGE? (Z. B. 3 MONATE)", M, 10.7, half);

    // Page 3
    s = k.page("Sand");
    section(s, "07", "Zeitplan & Budget", 0.6);
    field(s, "PRODUKT KOMMT AM", M, 1.25, half); field(s, "DEADLINE FÜR DIE VIDEOS", M + half + 0.4, 1.25, half);
    field(s, "GEPLANTER START DER KAMPAGNE", M, 2.0, half); field(s, "BUDGET (OPTIONAL)", M + half + 0.4, 2.0, half);
    section(s, "08", "Freigabe", 2.95);
    field(s, "WER GIBT DAS VIDEO FREI?", M, 3.6, half); field(s, "WIE VIELE ÜBERARBEITUNGEN?", M + half + 0.4, 3.6, half);
    section(s, "09", "Inspiration", 4.55);
    label(s, "LINKS ZU VIDEOS, DIE EUCH GEFALLEN", { x: M, y: 5.2, w: CW, h: 0.2, color: C.text2, fontSize: 7.5 });
    lines(s, M, 5.75, CW, 3);
    section(s, "10", "Noch etwas?", 7.0);
    lines(s, M, 7.95, CW, 3);
    k.note(s, M + 0.1, 9.25, 4.6, 1.45, -1.5, [
      { text: "Danke!", options: { fontFace: k.SERIF, italic: true, fontSize: 16, breakLine: true, paraSpaceAfter: 4 } },
      { text: "Schickt das ausgefüllte Briefing an hallo@deinewebsite.de. Ich melde mich innerhalb von zwei Werktagen mit ersten Ideen.", options: { fontSize: 9 } }], 0);
    hand(s, "Paula", { x: 5.5, y: 9.9, w: 2, h: 0.6, fontSize: 18, color: C.text1, rotate: -4 });
  },
};
