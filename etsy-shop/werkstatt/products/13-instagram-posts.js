// 30 Instagram posts (4:5): 10 layouts x 3 rounds with different text, photo and background.
const R = [
  { bg: "Sand", quote: "„Ehrlichkeit verkauft besser als jeder Filter.“", photo: "a4", cap: "Smoothie-Date mit mir selbst", tipsT: "3 TIPPS FÜR\nBESSERE REELS", tips: ["Tageslicht vom Fenster nutzen", "Die ersten 3 Sekunden planen", "Untertitel immer einblenden"], cover: "MEINE\nMORGEN-\nROUTINE", coverP: "a2", ba: ["f_flatlay", "a5"], baL: ["VORHER", "NACHHER"], test: "„Bestes Unboxing-Video, das wir je hatten!“", testN: "Marie, Glanzstück", news: "NEUE\nKOOPERATION!", newsP: "a5", q: "WAS IST DEIN\nLIEBLINGS-\nSNACK?", opts: ["süß", "salzig"], tt: ["a4", "f_cup"], ttL: ["MATCHA", "KAFFEE"], checkT: "SPEICHER DIR DAS\nFÜR DEN DREHTAG", checks: ["Akku geladen", "Linse geputzt", "Produkt bereit", "Licht geprüft", "Skript da"] },
  { bg: "Rose", quote: "„Kleine Wohnung, große Pläne.“", photo: "a6", cap: "Ehrenfeld am Sonntag", tipsT: "3 FEHLER BEI\nUGC-VIDEOS", tips: ["Zu lange Einleitung", "Produkt erst am Ende zeigen", "Kein klarer Call to Action"], cover: "SNACK-\nTEST\nTEIL 3", coverP: "a3", ba: ["f_setup", "a1"], baL: ["SET", "ERGEBNIS"], test: "„Schnell, kreativ und super entspannt.“", testN: "Deniz, Knusperhaus", news: "NEUES\nVIDEO\nIST ONLINE", newsP: "a2", q: "STORY ODER\nREEL?", opts: ["Story", "Reel"], tt: ["a1", "a3"], ttL: ["OUTFIT", "KÜCHE"], checkT: "MEINE GOLDENEN\nREGELN", checks: ["Immer ehrlich bleiben", "Nur Produkte, die ich mag", "Pünktlich liefern", "Zahlen offen zeigen", "Spaß haben"] },
  { bg: "Dunkel", quote: "„Wenn's nicht ich ist, poste ich's nicht.“", photo: "aylin0", cap: "Bett-Büro, heute mal wieder", tipsT: "SO SCHREIBE\nICH HOOKS", tips: ["Mit einer Frage starten", "Ein Problem ansprechen", "Eine Zahl einbauen"], cover: "WAS ICH\nIM MONAT\nVERDIENE", coverP: "aylin0", ba: ["a3", "a4"], baL: ["MONTAG", "FREITAG"], test: "„Unser bester Ad-Creative im Quartal.“", testN: "Lea, Klarwasser", news: "ICH BIN\nWIEDER DA!", newsP: "a6", q: "WOHIN SOLL\nICH REISEN?", opts: ["Istanbul", "Lissabon"], tt: ["a6", "a5"], ttL: ["DRAUSSEN", "DRINNEN"], checkT: "BEVOR DU DIE\nMAIL SCHICKST", checks: ["Name richtig", "Produkt genannt", "Link getestet", "Preis klar", "Freundlich?"] },
];
module.exports = {
  slug: "13-instagram-posts", file: "30-Instagram-Posts", format: "POST", style: "rosa",
  title: "30 Instagram-Post-Vorlagen", sub: "Für Creator: Tipps, Zitate, Karussells und mehr", price: 17,
  pills: ["30 Posts", "4:5 Hochformat", "10 Layouts"],
  build(k) {
    const { C, S, W, H, M, T, caps, serif, hand, label, photo, polaroid, pill, mark, checkbox } = k;
    const PINK = C.accent1;
    const handle = (s, dark) => T(s, "@aylin.dreht", { x: M, y: H - 0.75, w: W - 2 * M, h: 0.3, fontSize: 11, bold: true, align: "center", color: dark ? k.CREAM : C.text1 });
    R.forEach((r) => {
      const dark = r.bg === "Dunkel", ink = dark ? k.CREAM : C.accent3, txt = dark ? k.CREAM : C.text1;
      // L1 quote
      let s = k.page(r.bg);
      mark(s, dark ? "star_cream.png" : "star_terra.png", W - 1.6, 0.8, 0.8, 0.8, 10);
      serif(s, r.quote, { x: M, y: 2.4, w: W - 2 * M, h: 3.8, fontSize: 40, color: ink, align: "center", valign: "middle" });
      hand(s, "– ich, jeden Tag", { x: M, y: 6.6, w: W - 2 * M, h: 0.5, fontSize: 16, align: "center", color: dark ? C.accent2 : PINK });
      handle(s, dark);
      // L2 photo + caption
      s = k.page(r.bg);
      photo(s, r.photo, 0, 0, W, H, { fy: 0.3 });
      pill(s, r.cap, M, H - 1.6, W - 2 * M, 0.75, "FFFFFF", C.accent3, { text: { fontSize: 15 } });
      // L3 tips
      s = k.page(r.bg);
      caps(s, r.tipsT, { x: M, y: 0.8, w: W - 2 * M, h: 2.4, fontSize: 52, color: ink });
      r.tips.forEach((t, i) => {
        const y = 3.7 + i * 1.5;
        s.addShape(S.OVAL, { x: M, y, w: 0.95, h: 0.95, fill: { color: PINK }, line: { color: PINK, width: 0 } });
        caps(s, String(i + 1), { x: M, y, w: 0.95, h: 0.95, fontSize: 30, color: "FFFFFF", align: "center", valign: "middle", noFit: true });
        T(s, t, { x: M + 1.25, y, w: W - 2 * M - 1.3, h: 0.95, fontSize: 18, bold: true, valign: "middle", color: txt });
      });
      handle(s, dark);
      // L4 carousel cover
      s = k.page(r.bg);
      polaroid(s, r.coverP, W - 2.2, 2.35, 2.6, 3.0, 5, "", 1, { fy: 0.3 });
      caps(s, r.cover, { x: M, y: 4.85, w: 5.0, h: 3.2, fontSize: 60, color: ink });
      pill(s, "Swipe  →", M, H - 1.25, 2.2, 0.6, PINK, "FFFFFF", { text: { fontSize: 13 } });
      // L5 before/after
      s = k.page(r.bg);
      photo(s, r.ba[0], 0, 0, W / 2 - 0.05, H, {});
      photo(s, r.ba[1], W / 2 + 0.05, 0, W / 2 - 0.05, H, {});
      r.baL.forEach((l, i) => pill(s, l, i ? W / 2 + 0.6 : 0.6, 0.6, 2.4, 0.6, i ? PINK : "FFFFFF", i ? "FFFFFF" : C.accent3, { text: { fontSize: 14 } }));
      // L6 testimonial
      s = k.page(r.bg);
      T(s, "★★★★★", { x: M, y: 1.4, w: W - 2 * M, h: 0.8, fontSize: 34, color: dark ? C.accent2 : PINK, align: "center" });
      k.note(s, M + 0.2, 2.6, W - 2 * M - 0.4, 3.6, -2, [{ text: r.test, options: { fontSize: 24, bold: true, breakLine: true, paraSpaceAfter: 12 } }, { text: r.testN, options: { fontSize: 13 } }], 0, { margin: [36, 34, 30, 34] });
      hand(s, "Kundenstimme", { x: M, y: 6.9, w: W - 2 * M, h: 0.6, fontSize: 18, align: "center", color: dark ? C.accent2 : PINK, rotate: -3 });
      handle(s, dark);
      // L7 announcement
      s = k.page(r.bg);
      photo(s, r.newsP, M, M, W - 2 * M, 5.3, { fy: 0.3, rot: -2, tape: 2 });
      caps(s, r.news, { x: M, y: 6.25, w: W - 2 * M, h: 2.4, fontSize: 54, color: ink });
      // L8 question
      s = k.page(r.bg);
      caps(s, r.q, { x: M, y: 1.3, w: W - 2 * M, h: 4.0, fontSize: 60, color: ink, align: "center", valign: "middle" });
      r.opts.forEach((o, i) => pill(s, o, M + 0.3 + i * ((W - 2 * M) / 2), 6.2, (W - 2 * M) / 2 - 0.6, 0.85, i ? PINK : (dark ? "FFFFFF" : C.accent2), i ? "FFFFFF" : C.accent3, { text: { fontSize: 18 } }));
      hand(s, "schreib's in die Kommentare!", { x: M, y: 7.35, w: W - 2 * M, h: 0.6, fontSize: 16, align: "center", rotate: -2, color: dark ? C.accent2 : PINK });
      // L9 this or that
      s = k.page(r.bg);
      caps(s, "THIS OR THAT?", { x: M, y: 0.6, w: W - 2 * M, h: 1.0, fontSize: 44, color: ink, align: "center" });
      r.tt.forEach((p, i) => {
        const x = M + i * ((W - 2 * M) / 2 + 0.1);
        photo(s, p, x, 1.9, (W - 2 * M) / 2 - 0.1, 5.4, { fy: 0.3 });
        pill(s, r.ttL[i], x + 0.3, 7.55, (W - 2 * M) / 2 - 0.7, 0.62, i ? PINK : "FFFFFF", i ? "FFFFFF" : C.accent3, { text: { fontSize: 14 } });
      });
      // L10 checklist
      s = k.page(r.bg);
      caps(s, r.checkT, { x: M, y: 0.8, w: W - 2 * M, h: 2.3, fontSize: 44, color: ink });
      r.checks.forEach((t, i) => {
        const y = 3.55 + i * 0.95;
        checkbox(s, M, y + 0.12, 0.42, i < 2);
        T(s, t, { x: M + 0.75, y, w: W - 2 * M - 0.8, h: 0.65, fontSize: 19, valign: "middle", color: txt });
      });
      handle(s, dark);
    });
  },
};
