// 10 Reels covers (9:16) in three layouts; titles stay inside the centre 4:5 area so the profile grid crops them well.
const COVERS = [
  ["A", "j1", "KAFFEE-\nROUTINE", "Folge 4"], ["B", "j2", "LAUF-VLOG #12", "Elbe, 7 km"], ["C", "jonas0", "WAS ICH\nVERDIENE", "ehrlich"],
  ["A", "j5", "PASTA IN\n10 MINUTEN", "Rezept"], ["B", "j6", "PRODUKT-TEST", "Trinkflasche"], ["C", "j3", "3 FEHLER\nBEI REELS", "Tipps"],
  ["A", "j4", "HAMBURG\nIM REGEN", "Vlog"], ["B", "f_setup", "SO FILME ICH", "Setup-Tour"], ["C", "j1", "MEIN ERSTER\nUGC-DEAL", "Story"],
  ["A", "j3", "Q&A", "eure Fragen"],
];
module.exports = {
  slug: "15-reels-cover", file: "10-Reels-Cover", format: "STORY", style: "mono",
  title: "10 Reels-Cover-Vorlagen", sub: "Einheitlicher Look für dein Profil-Raster", price: 9,
  pills: ["10 Cover", "9:16", "rastersicher"],
  build(k) {
    const { C, S, W, H, M, T, caps, label, photo, box, circlePhoto, rule } = k;
    const ACC = C.accent1;
    const safeTop = (H - W * 1.25) / 2; // centre 4:5 crop area
    COVERS.forEach(([lay, key, title, tag], i) => {
      const s = k.page(lay === "C" ? (i % 2 ? "Dunkel" : "Rose") : "Sand");
      if (lay === "A") {
        photo(s, key, 0, 0, W, H, { fy: 0.35 });
        box(s, 0, safeTop + W * 1.25 - 2.6, W, 2.6, "111111", { fill: { color: "111111", transparency: 15 } });
        label(s, tag.toUpperCase(), { x: M, y: safeTop + W * 1.25 - 2.35, w: 4, h: 0.3, color: "D9C29A", fontSize: 11 });
        caps(s, title, { x: M, y: safeTop + W * 1.25 - 2.0, w: W - 2 * M, h: 1.8, fontSize: 52, color: "FFFFFF" });
      } else if (lay === "B") {
        photo(s, key, 0, 0, W, H, { fy: 0.4 });
        box(s, M, H / 2 - 0.85, W - 2 * M, 1.7, "FFFFFF");
        caps(s, title, { x: M + 0.25, y: H / 2 - 0.85, w: W - 2 * M - 0.5, h: 1.2, fontSize: 40, color: "111111", align: "center", valign: "middle" });
        T(s, tag, { x: M, y: H / 2 + 0.35, w: W - 2 * M, h: 0.35, fontSize: 12, align: "center", color: ACC, bold: true });
      } else {
        const dark = i % 2;
        circlePhoto(s, key, W / 2 - 1.3, safeTop + 0.5, 2.6, { ring: ACC, fy: 0.2 });
        caps(s, title, { x: M, y: safeTop + 3.5, w: W - 2 * M, h: 2.4, fontSize: 54, color: dark ? "FFFFFF" : "111111", align: "center" });
        rule(s, W / 2 - 1, safeTop + 6.25, 2, ACC, 2);
        T(s, tag.toUpperCase(), { x: M, y: safeTop + 6.45, w: W - 2 * M, h: 0.35, fontSize: 12, bold: true, charSpacing: 3, align: "center", color: ACC });
      }
    });
  },
};
