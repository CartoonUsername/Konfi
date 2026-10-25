// 20 Instagram stories (9:16): 10 layouts x 2 rounds.
const R = [
  { bg: "Sand", qa: "FRAG MICH\nWAS!", qaSub: "zu UGC, Preisen oder Second Hand", poll: "WAS SOLL ICH\nALS NÄCHSTES\nTESTEN?", pollP: ["m4", "f_cup"], pollL: ["Vase", "Tasse"], week: [["MO", "Flohmarkt-Haul drehen"], ["DI", "Schnitt & Untertitel"], ["MI", "Kooperation abgeben"], ["DO", "Q&A live"], ["FR", "Frei!"]], bts: "m2", btsT: "so sieht ein Drehtag\nwirklich aus", cd: "NEUES VIDEO\nIN 2 TAGEN", phone: "m1", rev: "m4", revT: "FLOHMARKT-\nFUND DER WOCHE", pros: ["5 Euro bezahlt", "passt zu allem"], cons: ["kleiner Riss"], tipN: "01", tip: "Stell dich mit dem Gesicht zum Fenster. Gratis-Licht, besser als jeder Ringlicht.", tt: ["m5", "m3"], ttL: ["Dach", "Treppenhaus"], link: "HIER GEHT'S\nZU MEINEM\nMEDIA-KIT" },
  { bg: "Dunkel", qa: "AMA:\nUGC-\nEDITION", qaSub: "ich beantworte alles am Freitag", poll: "SOLL ICH MEINE\nPREISE ZEIGEN?", pollP: ["m6", "m2"], pollL: ["Ja!", "Lieber nicht"], week: [["MO", "Briefing lesen"], ["DI", "Konzept schicken"], ["MI", "Dreh-Tag"], ["DO", "Feedback"], ["FR", "Rechnung schreiben"]], bts: "m6", btsT: "Skript-Zeit im Café", cd: "LIVE AM\nDONNERSTAG\n19 UHR", phone: "m2", rev: "f_flatlay", revT: "MEINE PFLEGE-\nFAVORITEN", pros: ["zieht schnell ein", "duftet kaum"], cons: ["Tube schwer leer"], tipN: "02", tip: "Schreib den Hook zuerst. Dann den Rest des Videos.", tt: ["m1", "f_balcony"], ttL: ["Matcha", "Iced Coffee"], link: "NEUE\nPREISLISTE\nIST DA" },
];
module.exports = {
  slug: "14-story-vorlagen", file: "20-Story-Vorlagen", format: "STORY", style: "kobalt",
  title: "20 Instagram-Story-Vorlagen", sub: "Fragen, Umfragen, Wochenplan, Reviews und mehr", price: 14,
  pills: ["20 Stories", "9:16", "mit Sticker-Flächen"],
  build(k) {
    const { C, S, W, H, M, T, caps, serif, hand, label, photo, pill, phone, mark, circlePhoto } = k;
    const BLUE = C.accent1, BUTTER = "FFF1C2";
    const sticker = (s, y, h, txt, dark) => {
      s.addShape(S.ROUNDED_RECTANGLE, { x: M + 0.2, y, w: W - 2 * M - 0.4, h, fill: { color: "FFFFFF", transparency: dark ? 10 : 0 }, line: { color: dark ? "FFFFFF" : C.text1, width: 1.5, dashType: "dash" }, rectRadius: 0.25 });
      T(s, txt, { x: M + 0.2, y, w: W - 2 * M - 0.4, h, fontSize: 11, color: C.text2, align: "center", valign: "middle", italic: true });
    };
    R.forEach((r) => {
      const dark = r.bg === "Dunkel", ink = dark ? "FFFFFF" : C.text1, hc = dark ? BUTTER : BLUE;
      // 1 Q&A
      let s = k.page(r.bg);
      circlePhoto(s, "mira0", W / 2 - 1.0, 1.4, 2.0, { fy: 0.2, ring: dark ? BUTTER : BLUE });
      caps(s, r.qa, { x: M, y: 3.9, w: W - 2 * M, h: 3.0, fontSize: 60, color: ink, align: "center" });
      T(s, r.qaSub, { x: M, y: 7.0, w: W - 2 * M, h: 0.4, fontSize: 13, color: ink, align: "center" });
      sticker(s, 7.8, 1.9, "Platz für den Fragen-Sticker", dark);
      // 2 poll
      s = k.page(r.bg);
      caps(s, r.poll, { x: M, y: 0.9, w: W - 2 * M, h: 3.0, fontSize: 48, color: ink });
      r.pollP.forEach((p, i) => { photo(s, p, M + i * ((W - 2 * M) / 2 + 0.1), 4.2, (W - 2 * M) / 2 - 0.1, 4.4, { fy: 0.3 }); pill(s, r.pollL[i], M + 0.2 + i * ((W - 2 * M) / 2 + 0.1), 8.85, (W - 2 * M) / 2 - 0.5, 0.6, i ? BUTTER : "FFFFFF", C.text1, { line: C.text1 }); });
      sticker(s, 9.85, 1.1, "Umfrage-Sticker hier", dark);
      // 3 week
      s = k.page(r.bg);
      caps(s, "DIESE WOCHE\nBEI MIR", { x: M, y: 0.9, w: W - 2 * M, h: 2.2, fontSize: 52, color: ink });
      r.week.forEach(([d, t], i) => {
        const y = 3.6 + i * 1.35;
        s.addShape(S.RECTANGLE, { x: M + 0.07, y: y + 0.07, w: W - 2 * M, h: 1.05, fill: { color: dark ? "141B33" : C.text1 }, line: { width: 0, color: "141B33" } });
        s.addShape(S.RECTANGLE, { x: M, y, w: W - 2 * M, h: 1.05, fill: { color: i % 2 ? BUTTER : "FFFFFF" }, line: { color: C.text1, width: 1.5 } });
        caps(s, d, { x: M + 0.25, y, w: 1.0, h: 1.05, fontSize: 26, color: BLUE, valign: "middle", noFit: true });
        T(s, t, { x: M + 1.35, y, w: W - 2 * M - 1.5, h: 1.05, fontSize: 15, bold: true, valign: "middle", color: C.text1 });
      });
      // 4 BTS
      s = k.page(r.bg);
      photo(s, r.bts, 0, 0, W, H, { fy: 0.4 });
      hand(s, r.btsT, { x: M, y: 8.9, w: W - 2 * M, h: 1.4, fontSize: 24, color: "FFFFFF", rotate: -4 });
      mark(s, "arrow_cream.png", 3.6, 7.6, 1.8, 1.08, -150);
      // 5 countdown
      s = k.page(r.bg);
      caps(s, r.cd, { x: M, y: 2.0, w: W - 2 * M, h: 4.0, fontSize: 60, color: ink, align: "center", valign: "middle" });
      hand(s, "Erinnerung aktivieren!", { x: M, y: 6.3, w: W - 2 * M, h: 0.7, fontSize: 20, color: hc, align: "center", rotate: -3 });
      sticker(s, 7.4, 1.6, "Countdown-Sticker hier", dark);
      // 6 new video
      s = k.page(r.bg);
      caps(s, "NEUES VIDEO!", { x: M, y: 0.8, w: W - 2 * M, h: 1.0, fontSize: 44, color: ink, align: "center" });
      phone(s, r.phone, W / 2 - 1.85, 2.1, 3.7, -3);
      pill(s, "Link in Bio  →", M + 0.6, 10.3, W - 2 * M - 1.2, 0.75, hc, dark ? C.text1 : "FFFFFF", { text: { fontSize: 15 } });
      // 7 review
      s = k.page(r.bg);
      photo(s, r.rev, M, M + 0.3, W - 2 * M, 5.2, { fy: 0.35, rot: 2, tape: 1 });
      caps(s, r.revT, { x: M, y: 6.25, w: W - 2 * M, h: 1.8, fontSize: 40, color: ink });
      T(s, "★★★★☆", { x: M, y: 8.15, w: 4, h: 0.6, fontSize: 26, color: hc });
      T(s, r.pros.map((p) => "+  " + p).concat(r.cons.map((c) => "–  " + c)).join("\n"), { x: M, y: 8.95, w: W - 2 * M, h: 1.8, fontSize: 16, bold: true, color: ink, lineSpacingMultiple: 1.4 });
      // 8 tip
      s = k.page(r.bg);
      label(s, "TIPP DES TAGES", { x: M, y: 1.0, w: 4, h: 0.3, color: hc, fontSize: 11 });
      caps(s, r.tipN, { x: M, y: 1.5, w: 4, h: 2.6, fontSize: 160, color: hc, noFit: true });
      T(s, r.tip, { x: M, y: 4.6, w: W - 2 * M, h: 3.6, fontSize: 26, bold: true, color: ink, lineSpacingMultiple: 1.2 });
      hand(s, "speichern & später ausprobieren", { x: M, y: 9.6, w: W - 2 * M, h: 0.7, fontSize: 17, color: hc, rotate: -2 });
      // 9 this or that
      s = k.page(r.bg);
      caps(s, "THIS OR THAT?", { x: M, y: 0.8, w: W - 2 * M, h: 0.9, fontSize: 40, color: ink, align: "center" });
      r.tt.forEach((p, i) => { photo(s, p, M, 2.0 + i * 4.75, W - 2 * M, 4.1, { fy: 0.35 }); pill(s, r.ttL[i], M + 0.3, 5.55 + i * 4.75, 2.6, 0.6, i ? BUTTER : "FFFFFF", C.text1, { line: C.text1 }); });
      // 10 link
      s = k.page(r.bg);
      caps(s, r.link, { x: M, y: 1.6, w: W - 2 * M, h: 4.0, fontSize: 58, color: ink });
      mark(s, dark ? "arrow_cream.png" : "arrow_terra.png", 2.4, 6.0, 2.4, 1.44, 70);
      sticker(s, 8.2, 1.3, "Link-Sticker hier", dark);
      T(s, "@mira.macht", { x: M, y: 11.1, w: W - 2 * M, h: 0.3, fontSize: 10, bold: true, color: ink, align: "center" });
    });
  },
};
