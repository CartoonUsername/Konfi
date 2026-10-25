module.exports = {
  slug: "07-ugc-portfolio", file: "UGC-Portfolio", format: "A4Q", style: "rosa",
  title: "UGC-Portfolio im Querformat", sub: "Zeig deine besten Videos wie in einem Magazin", price: 15,
  pills: ["6 Seiten", "Querformat", "Handy-Mockups"],
  build(k) {
    const { C, S, W, H, M, T, caps, serif, hand, label, photo, polaroid, phone, pill, mark } = k;
    const DARK = C.accent3, PINK = C.accent1, SOFT = C.accent2;

    // 1 Cover
    let s = k.page("Rose");
    caps(s, "UGC\nPORTFOLIO", { x: M, y: 1.0, w: 5.6, h: 3.4, fontSize: 92, color: DARK });
    serif(s, "Aylin Demir", { x: M + 0.05, y: 4.45, w: 5, h: 0.8, fontSize: 36, color: PINK });
    T(s, "Content Creatorin aus Köln · Beauty, Food & Lifestyle", { x: M + 0.05, y: 5.3, w: 5, h: 0.3, fontSize: 11, bold: true });
    pill(s, "Portfolio 2026", M + 0.05, 5.85, 1.7, 0.42, DARK, k.CREAM);
    pill(s, "@aylin.dreht", M + 1.9, 5.85, 1.6, 0.42, C.background1, DARK, { line: DARK });
    photo(s, "a6", 6.4, 0.7, 3.4, 4.6, { rot: 4, tape: 0, fy: 0.3, alt: "Aylin mit Fahrrad" });
    photo(s, "a4", 8.35, 3.9, 2.6, 3.3, { rot: -5, tape: 1, fy: 0.25, alt: "Aylin mit Smoothie" });
    mark(s, "star_terra.png", 6.0, 5.6, 0.7, 0.7, 12);
    hand(s, "schön, dass du\nreinschaust!", { x: 5.9, y: 6.4, w: 2.4, h: 0.9, fontSize: 13, rotate: -6 });

    // 2 Über mich
    s = k.page("Sand");
    photo(s, "a3", 0, 0, 4.6, H, { fx: 0.5, fy: 0.3, alt: "Aylin tanzt in der Küche" });
    const x = 5.15, w = W - x - M;
    caps(s, "HI, ICH BIN\nAYLIN!", { x, y: 0.7, w, h: 2.2, fontSize: 64, color: DARK });
    T(s, "Ich bin 26, wohne in Köln-Ehrenfeld und mache Videos, die sich anfühlen wie eine Sprachnachricht von deiner besten Freundin. Laut, ehrlich und meistens mit etwas zu viel Glitzer.\n\nMarken buchen mich, wenn ihr Produkt nahbar wirken soll: Lipgloss, Snacks, Wohnkram und alles, was gute Laune macht.",
      { x, y: 2.85, w: w - 0.2, h: 2.4, fontSize: 11, lineSpacingMultiple: 1.35 });
    label(s, "DAS BIN ICH", { x, y: 5.45, w, h: 0.22, color: PINK });
    [["Köln", 0], ["26 Jahre", 0], ["Deutsch & Türkisch", 1], ["Hunde-Mama", 0], ["Matcha > Kaffee", 1], ["seit 2022 UGC", 0]].forEach(([t, d], i) => {
      const px = x + (i % 3) * 2.0, py = 5.8 + Math.floor(i / 3) * 0.55;
      pill(s, t, px, py, 1.85, 0.4, d ? DARK : SOFT, d ? k.CREAM : DARK, { text: { fontSize: 9.5 } });
    });
    hand(s, "und ja, ich tanze beim Kochen", { x, y: 7.15, w: 4, h: 0.5, fontSize: 12, rotate: -2 });

    // 3 Leistungen
    s = k.page("Sand");
    caps(s, "WAS ICH FÜR\nDICH MACHE", { x: M, y: 0.6, w: 6.2, h: 2.2, fontSize: 60, color: DARK });
    const offers = [
      ["UGC-Videos", "Kurze Hochkant-Videos für TikTok, Reels und Ads. Mit Hook, Story und klarer Botschaft.", "ab 190 €"],
      ["Unboxings", "Das erste Auspacken, echt und ungeschnitten wirkend. Perfekt für neue Produkte.", "ab 160 €"],
      ["Get Ready With Me", "Dein Produkt als Teil meiner Morgen- oder Abendroutine.", "ab 210 €"],
      ["Produktfotos", "Helle Alltagsfotos in meiner Wohnung, keine sterile Studio-Optik.", "ab 120 €"],
    ];
    offers.forEach(([a, b, p], i) => {
      const y = 2.75 + i * 1.2;
      s.addShape(S.OVAL, { x: M, y, w: 0.75, h: 0.75, fill: { color: i % 2 ? DARK : PINK }, line: { color: i % 2 ? DARK : PINK, width: 0 } });
      caps(s, String(i + 1), { x: M, y, w: 0.75, h: 0.75, fontSize: 24, color: k.CREAM, align: "center", valign: "middle", noFit: true });
      T(s, a, { x: M + 1.0, y: y - 0.02, w: 3.6, h: 0.35, fontSize: 15, bold: true, color: DARK });
      T(s, b, { x: M + 1.0, y: y + 0.36, w: 4.4, h: 0.6, fontSize: 9.5, lineSpacingMultiple: 1.3 });
      serif(s, p, { x: 5.6, y: y + 0.05, w: 1.3, h: 0.5, fontSize: 15, color: PINK, align: "right" });
    });
    polaroid(s, "a5", 9.1, 4.15, 3.1, 3.6, 4, "Unboxing-Tag!", 2, { fy: 0.3 });

    // 4 Arbeitsproben
    s = k.page("Dunkel");
    caps(s, "ARBEITSPROBEN", { x: M, y: 0.55, w: 6.5, h: 1.1, fontSize: 60, color: k.CREAM });
    hand(s, "tipp drauf für's Video", { x: 7.6, y: 0.75, w: 3.4, h: 0.6, fontSize: 13, rotate: -4, color: SOFT });
    [["a2", "Lipgloss-Review", "318.000 Aufrufe", -5], ["a1", "Outfit des Tages", "127.000 Aufrufe", 2], ["a3", "Snack-Test", "602.000 Aufrufe", -2]].forEach(([key, a, b, r], i) => {
      const px = M + 0.3 + i * 3.5;
      phone(s, key, px, 1.75, 2.45, r);
      pill(s, a, px - 0.05, 7.1, 2.55, 0.42, C.background1, DARK, { text: { fontSize: 10 } });
      T(s, b, { x: px, y: 7.6, w: 2.45, h: 0.3, fontSize: 9, color: SOFT, align: "center" });
    });
    mark(s, "star_cream.png", 10.5, 2.0, 0.7, 0.7, 10);

    // 5 Ergebnisse
    s = k.page("Rose");
    caps(s, "ZAHLEN, DIE\nMICH FREUEN", { x: M, y: 0.6, w: 5.5, h: 2.2, fontSize: 56, color: DARK });
    [["1,4 Mio.", "Aufrufe mit Kunden-Videos"], ["8,3 %", "Ø Engagement-Rate"], ["52", "Kooperationen seit 2022"], ["3,1×", "ROAS bei Ads mit meinen Videos"]].forEach(([v, l], i) => {
      const bx = M + (i % 2) * 2.9, by = 2.95 + Math.floor(i / 2) * 1.7;
      s.addShape(S.ROUNDED_RECTANGLE, { x: bx, y: by, w: 2.7, h: 1.5, fill: { color: i === 0 || i === 3 ? DARK : C.background1 }, line: { color: DARK, width: 0 }, rectRadius: 0.25 });
      caps(s, v, { x: bx + 0.2, y: by + 0.2, w: 2.3, h: 0.7, fontSize: 34, color: i === 0 || i === 3 ? k.CREAM : PINK });
      T(s, l, { x: bx + 0.2, y: by + 0.95, w: 2.3, h: 0.45, fontSize: 9.5, color: i === 0 || i === 3 ? k.CREAM : C.text1 });
    });
    k.note(s, 6.8, 1.3, 4.2, 2.3, 3, [
      { text: "„Aylins Video war unser bester Ad-Creative im ganzen Quartal. Und sie war super entspannt in der Abstimmung.“", options: { fontSize: 12, italic: true, breakLine: true, paraSpaceAfter: 8 } },
      { text: "Marie, Social Media bei Glanzstück", options: { fontSize: 9, bold: true } }], 0);
    k.note(s, 7.1, 4.3, 3.8, 2.0, -2.5, [
      { text: "„Schnell, kreativ und die Zielgruppe hat sich direkt angesprochen gefühlt.“", options: { fontSize: 12, italic: true, breakLine: true, paraSpaceAfter: 8 } },
      { text: "Deniz, Gründer von Knusperhaus", options: { fontSize: 9, bold: true } }], 1);
    T(s, "Zahlen, Namen und Marken sind Beispiele.", { x: M, y: 7.7, w: 5, h: 0.25, fontSize: 8, italic: true, color: C.text2 });

    // 6 Kontakt
    s = k.page("Dunkel");
    photo(s, "a4", 6.9, 0, W - 6.9, H, { fy: 0.3, alt: "Aylin im Café" });
    caps(s, "LASS UNS WAS\nSCHÖNES\nMACHEN!", { x: M, y: 0.8, w: 5.9, h: 3.6, fontSize: 64, color: k.CREAM });
    [["E-MAIL", "hallo@deinewebsite.de"], ["TIKTOK & INSTAGRAM", "@aylin.dreht"], ["ORT", "Köln & überall per Post"]].forEach(([a, b], i) => {
      const y = 4.75 + i * 0.75;
      label(s, a, { x: M, y, w: 4, h: 0.22, color: SOFT });
      T(s, b, { x: M, y: y + 0.24, w: 5, h: 0.4, fontSize: 15, bold: true, color: k.CREAM });
    });
    hand(s, "ich freu mich auf deine Mail!", { x: M, y: 7.1, w: 4.5, h: 0.6, fontSize: 14, rotate: -3, color: SOFT });
  },
};
