module.exports = {
  slug: "02-media-kit-1-seite", file: "Media-Kit-1-Seite", format: "A4", style: "kobalt",
  title: "Media-Kit auf einer Seite", sub: "Alles Wichtige auf einen Blick", price: 12,
  pills: ["2 Farbvarianten", "A4", "Deutsch"],
  build(k) {
    const { C, W, H, M, T, caps, serif, hand, label, rule, photo, polaroid, mark } = k;
    const variant = (bg, main, small, smallCap, dark) => {
      const s = k.page(bg);
      const ink = dark ? k.CREAM : C.text1, soft = dark ? C.accent5 : C.text2;
      photo(s, main, 0, 0, 3.35, 7.2, { fy: 0.25, alt: "Porträt der Creatorin" });
      const x = 3.8, w = W - x - M;
      label(s, "MEDIA-KIT 2026", { x, y: 0.7, w, h: 0.22, color: C.accent1 });
      caps(s, "MIRA\nOKAFOR", { x, y: 0.95, w, h: 2.2, fontSize: 58, color: ink });
      serif(s, "UGC-Creatorin für Lifestyle & Interior", { x, y: 2.75, w, h: 0.4, fontSize: 15, italic: true, color: dark ? C.accent2 : C.accent1 });
      T(s, "Ich mache Videos über Second-Hand-Funde, schöne Dinge für die Wohnung und das Leben in Berlin. Bunt, schnell geschnitten und immer mit einer kleinen Geschichte.",
        { x, y: 3.3, w, h: 1.2, fontSize: 10, color: ink, lineSpacingMultiple: 1.35 });
      label(s, "KONTAKT", { x, y: 4.75, w, h: 0.22, color: soft });
      T(s, "hallo@deinewebsite.de\n@mira.macht\nBerlin", { x, y: 5.0, w, h: 0.9, fontSize: 10, color: ink, lineSpacingMultiple: 1.35 });
      hand(s, "Drehs in Berlin & online", { x, y: 6.05, w, h: 0.4, fontSize: 9.5, rotate: -3, color: dark ? C.accent2 : C.accent1 });
      // numbers
      rule(s, M, 7.55, W - 2 * M, ink);
      [["41K", "TikTok"], ["12,3K", "Instagram"], ["26K", "Ø Aufrufe"], ["7,1 %", "Engagement"]].forEach(([v, l], i) => {
        const cx = M + i * ((W - 2 * M) / 4);
        caps(s, v, { x: cx, y: 7.7, w: 1.7, h: 0.6, fontSize: 32, color: i === 0 ? (dark ? C.accent2 : C.accent1) : ink });
        T(s, l, { x: cx, y: 8.3, w: 1.7, h: 0.25, fontSize: 8.5, color: soft });
      });
      rule(s, M, 8.7, W - 2 * M, ink);
      // services
      label(s, "LEISTUNGEN", { x: M, y: 8.95, w: 3, h: 0.22, color: soft });
      [["Einzelvideo", "ab 220 €"], ["3er-Paket", "ab 590 €"], ["Story-Paket", "ab 150 €"], ["Fotos (5 Stück)", "140 €"]].forEach(([a, b], i) => {
        const y = 9.25 + i * 0.36;
        T(s, a, { x: M, y, w: 2.6, h: 0.3, fontSize: 10.5, color: ink, valign: "middle" });
        serif(s, b, { x: M + 2.6, y, w: 1.4, h: 0.3, fontSize: 12, color: ink, align: "right", valign: "middle" });
      });
      polaroid(s, small, 6.15, 9.85, 1.65, 1.65, 5, smallCap, 1, { capSize: 8.5 });
      T(s, "Zahlen und Preise sind Beispiele.", { x: M, y: 11.05, w: 4, h: 0.22, fontSize: 7, italic: true, color: soft });
    };
    variant("Sand", "m3", "m1", "Matcha-Liebe", false);
    variant("Dunkel", "m5", "m2", "Drehtag", true);
  },
};
