// 10 story templates (9:16) for fan polls and wish lists.
module.exports = {
  slug: "26-fan-umfragen-wunschliste", file: "Fan-Umfragen-und-Wunschlisten", format: "STORY", style: "noir",
  title: "Fan-Umfragen & Wunschlisten", sub: "10 Story-Vorlagen, damit deine Fans mitbestimmen", price: 10,
  pills: ["10 Stories", "9:16", "mit Sticker-Flächen"],
  build(k) {
    const { C, W, H, M, T, caps, serif, hand, label, rule, box, frame, photo, circlePhoto, checkbox, pill } = k;
    const GOLD = C.accent1, CREAM = k.CREAM, CW = W - 2 * M;
    const sticker = (s, y, h, txt, dark) => { s.addShape(k.S.ROUNDED_RECTANGLE, { x: M + 0.2, y, w: CW - 0.4, h, fill: { color: dark ? "2A2420" : "FFFFFF" }, line: { color: GOLD, width: 1.25, dashType: "dash" }, rectRadius: 0.2 }); T(s, txt, { x: M + 0.2, y, w: CW - 0.4, h, fontSize: 11, italic: true, align: "center", valign: "middle", color: dark ? C.accent5 : C.text2 }); };
    // 1 Was als Nächstes
    let s = k.page("Dunkel");
    photo(s, "n5", 0, 0, W, 5.6, { fy: 0.25 });
    caps(s, "WAS SOLL ICH\nALS NÄCHSTES\nMACHEN?", { x: M, y: 6.0, w: CW, h: 2.6, fontSize: 44, color: CREAM });
    sticker(s, 9.0, 1.6, "Umfrage-Sticker hier", true);
    // 2 Dies oder das
    s = k.page("Sand");
    caps(s, "DIES\nODER DAS?", { x: M, y: 0.8, w: CW, h: 2.0, fontSize: 52, align: "center" });
    [["n6", "Stadt"], ["n4", "Zuhause"]].forEach(([p, l], i) => { photo(s, p, M + i * (CW / 2 + 0.08), 3.2, CW / 2 - 0.08, 5.2, { fy: 0.3 }); pill(s, l, M + 0.25 + i * (CW / 2 + 0.08), 8.7, CW / 2 - 0.58, 0.6, i ? C.accent1 : "FFFFFF", i ? "FFFFFF" : C.text1, { line: C.text1 }); });
    sticker(s, 9.8, 1.1, "Umfrage-Sticker hier", false);
    // 3 Wunschliste
    s = k.page("Rose");
    caps(s, "WUNSCH-\nLISTE", { x: M, y: 0.9, w: CW, h: 2.2, fontSize: 58 });
    serif(s, "Was wünschst du dir im Abo?", { x: M, y: 3.1, w: CW, h: 0.5, fontSize: 19, italic: true, color: GOLD });
    ["mehr Behind-the-Scenes", "Vlogs aus meinem Alltag", "Fragen & Antworten", "neue Fotoserie", "Live-Abende"].forEach((t, j) => { const y = 4.1 + j * 0.85; checkbox(s, M, y + 0.05, 0.35, j === 1); T(s, t, { x: M + 0.6, y, w: CW - 0.6, h: 0.45, fontSize: 15, valign: "middle" }); });
    sticker(s, 8.6, 1.6, "Fragen-Sticker: dein Wunsch", false);
    // 4 Skala
    s = k.page("Dunkel");
    circlePhoto(s, "nina0", W / 2 - 0.9, 1.1, 1.8, { ring: GOLD, fy: 0.2 });
    caps(s, "WIE GEFÄLLT\nDIR DIE\nNEUE SERIE?", { x: M, y: 3.4, w: CW, h: 2.6, fontSize: 44, color: CREAM, align: "center" });
    sticker(s, 6.6, 1.3, "Schieberegler-Sticker hier", true);
    hand(s, "ehrliche Meinung erwünscht", { x: M, y: 8.3, w: CW, h: 0.6, fontSize: 18, color: GOLD, align: "center", rotate: -2 });
    // 5 Frag mich
    s = k.page("Sand");
    photo(s, "n2", M, M + 0.4, CW, 5.0, { fy: 0.3, rot: -2, tape: 1 });
    caps(s, "FRAG MICH\nWAS", { x: M, y: 6.3, w: CW, h: 2.0, fontSize: 54 });
    sticker(s, 8.7, 1.6, "Fragen-Sticker hier", false);
    // 6 Top 3
    s = k.page("Rose");
    caps(s, "DEINE TOP 3", { x: M, y: 1.0, w: CW, h: 1.0, fontSize: 46, align: "center" });
    serif(s, "Welche Sets aus diesem Monat?", { x: M, y: 2.0, w: CW, h: 0.5, fontSize: 18, italic: true, color: GOLD, align: "center" });
    ["n1", "n3", "n6"].forEach((p, j) => { const y = 2.9 + j * 2.6; photo(s, p, M, y, 2.4, 2.3, { fy: 0.3 }); serif(s, "0" + (j + 1), { x: M + 2.7, y: y + 0.6, w: 1, h: 0.8, fontSize: 40, color: GOLD }); rule(s, M + 3.7, y + 1.3, CW - 3.7, C.accent5); });
    // 7 Uhrzeit
    s = k.page("Dunkel");
    caps(s, "WANN BIST\nDU ONLINE?", { x: M, y: 1.2, w: CW, h: 2.2, fontSize: 50, color: CREAM });
    ["morgens", "mittags", "abends", "nachts"].forEach((t, j) => pill(s, t, M + 0.3, 4.0 + j * 1.05, CW - 0.6, 0.75, j % 2 ? "2A2420" : GOLD, j % 2 ? CREAM : "15110F", { line: GOLD, text: { fontSize: 15 } }));
    sticker(s, 8.6, 1.4, "Quiz-Sticker hier", true);
    // 8 Danke-Ergebnis
    s = k.page("Sand");
    caps(s, "IHR HABT\nENTSCHIEDEN", { x: M, y: 1.0, w: CW, h: 2.2, fontSize: 50 });
    serif(s, "68 %", { x: M, y: 3.6, w: CW, h: 1.6, fontSize: 110, color: GOLD });
    T(s, "wollen mehr Vlogs aus meinem Alltag. Kommt ab Montag!", { x: M, y: 5.4, w: CW, h: 0.9, fontSize: 16, bold: true });
    photo(s, "n3", M, 6.6, CW, 4.2, { fy: 0.25 });
    // 9 Countdown
    s = k.page("Rose");
    caps(s, "NOCH 3 TAGE", { x: M, y: 2.2, w: CW, h: 1.2, fontSize: 52, align: "center" });
    serif(s, "dann zeige ich, was ihr euch gewünscht habt", { x: M, y: 3.5, w: CW, h: 0.9, fontSize: 19, italic: true, color: GOLD, align: "center" });
    sticker(s, 5.0, 1.6, "Countdown-Sticker hier", false);
    circlePhoto(s, "n3", W / 2 - 1.1, 7.4, 2.2, { ring: GOLD, fy: 0.2 });
    // 10 Danke
    s = k.page("Dunkel");
    photo(s, "n1", 0, 0, W, H, { fy: 0.3 });
    box(s, 0, H - 3.4, W, 3.4, "15110F", { fill: { color: "15110F", transparency: 15 } });
    caps(s, "DANKE FÜRS\nMITMACHEN", { x: M, y: H - 3.1, w: CW, h: 2.0, fontSize: 46, color: CREAM });
    T(s, "@nina.abends", { x: M, y: H - 0.9, w: CW, h: 0.3, fontSize: 10, bold: true, color: GOLD });
  },
};
