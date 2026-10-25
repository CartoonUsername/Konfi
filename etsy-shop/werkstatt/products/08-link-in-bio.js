module.exports = {
  slug: "08-link-in-bio", file: "Link-in-Bio-Seite", format: "STORY", style: "kobalt",
  title: "Link-in-Bio-Seite", sub: "Deine eigene Linkseite statt Standard-Linktree", price: 9,
  pills: ["3 Designs", "Handyformat", "als Canva-Website nutzbar"],
  build(k) {
    const { C, S, W, H, M, T, caps, serif, hand, label, photo, pill, circlePhoto, phone, mark } = k;
    const BLUE = C.accent1, BUTTER = "FFF1C2", INK = C.text1;
    const links = ["Mein Media-Kit", "Kooperation anfragen", "Neuestes Video ansehen", "Meine Lieblingsfunde", "Newsletter: Sonntagspost"];

    // 1 light
    let s = k.page("Sand");
    circlePhoto(s, "m3", W / 2 - 1.1, 0.9, 2.2, { fy: 0.15, ring: BLUE });
    caps(s, "MIRA OKAFOR", { x: M, y: 3.35, w: W - 2 * M, h: 0.7, fontSize: 34, align: "center" });
    T(s, "UGC & Interior aus Berlin · Second-Hand-Liebe", { x: M, y: 4.0, w: W - 2 * M, h: 0.3, fontSize: 11, align: "center", color: C.text2 });
    links.forEach((t, i) => pill(s, t, M + 0.2, 4.75 + i * 0.95, W - 2 * M - 0.4, 0.72, i === 0 ? BLUE : C.background1, i === 0 ? "FFFFFF" : INK, { line: i === 0 ? null : INK, text: { fontSize: 13 } }));
    T(s, "TikTok   ·   Instagram   ·   Pinterest   ·   E-Mail", { x: M, y: 9.75, w: W - 2 * M, h: 0.3, fontSize: 10.5, bold: true, align: "center" });
    hand(s, "neu: mein Flohmarkt-Guide!", { x: 3.6, y: 3.0, w: 2.8, h: 0.5, fontSize: 13, rotate: -8, color: BLUE });
    T(s, "@mira.macht", { x: M, y: 11.2, w: W - 2 * M, h: 0.3, fontSize: 9, align: "center", color: C.text2 });

    // 2 photo top
    s = k.page("Rose");
    photo(s, "m5", 0, 0, W, 5.2, { fy: 0.3, alt: "Mira auf dem Dach" });
    s.addShape(S.ROUNDED_RECTANGLE, { x: M, y: 4.45, w: W - 2 * M, h: 1.5, fill: { color: "FFFFFF" }, line: { color: INK, width: 1.5 }, rectRadius: 0.2, shadow: k.shadow() });
    caps(s, "HI, ICH BIN MIRA", { x: M + 0.3, y: 4.62, w: W - 2 * M - 0.6, h: 0.6, fontSize: 26, color: INK });
    T(s, "Ich zeige dir schöne Dinge für wenig Geld und wie du sie in Szene setzt.", { x: M + 0.3, y: 5.25, w: W - 2 * M - 0.6, h: 0.55, fontSize: 10.5 });
    links.slice(0, 4).forEach((t, i) => {
      const y = 6.35 + i * 1.0;
      s.addShape(S.RECTANGLE, { x: M + 0.08, y: y + 0.08, w: W - 2 * M, h: 0.75, fill: { color: INK }, line: { color: INK, width: 0 } });
      s.addShape(S.RECTANGLE, { x: M, y, w: W - 2 * M, h: 0.75, fill: { color: i % 2 ? BUTTER : "FFFFFF" }, line: { color: INK, width: 1.5 } });
      T(s, t, { x: M + 0.3, y, w: W - 2 * M - 1, h: 0.75, fontSize: 13, bold: true, valign: "middle" });
      T(s, "→", { x: W - M - 0.7, y, w: 0.5, h: 0.75, fontSize: 18, bold: true, valign: "middle", align: "right" });
    });
    T(s, "@mira.macht", { x: M, y: 10.6, w: W - 2 * M, h: 0.3, fontSize: 10, bold: true, align: "center" });

    // 3 dark with latest videos
    s = k.page("Dunkel");
    circlePhoto(s, "m1", M, 0.7, 1.3, { fy: 0.1, ring: BUTTER });
    caps(s, "MIRA\nOKAFOR", { x: M + 1.6, y: 0.75, w: 3.8, h: 1.3, fontSize: 30, color: "FFFFFF" });
    T(s, "UGC · Interior · Berlin", { x: M + 1.6, y: 1.85, w: 3.8, h: 0.3, fontSize: 10, color: BUTTER });
    label(s, "NEUESTE VIDEOS", { x: M, y: 2.55, w: 4, h: 0.22, color: BUTTER });
    [["m1", -3], ["m2", 3]].forEach(([key, r], i) => phone(s, key, M + 0.15 + i * 2.85, 2.95, 2.4, r));
    links.slice(0, 3).forEach((t, i) => pill(s, t, M, 8.35 + i * 0.85, W - 2 * M, 0.65, i === 0 ? BUTTER : "FFFFFF", INK, { text: { fontSize: 12 } }));
    hand(s, "tipp mich an!", { x: 3.9, y: 2.45, w: 2.2, h: 0.5, fontSize: 13, rotate: -6, color: BUTTER });
    T(s, "Namen, Links und Bilder sind Beispiele.", { x: M, y: 11.25, w: W - 2 * M, h: 0.25, fontSize: 7.5, color: "C9CEDD", align: "center" });
  },
};
