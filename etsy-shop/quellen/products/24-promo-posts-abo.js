// 12 SFW promo posts (4:5) for subscription creators to share on Instagram, Threads or X.
const P = [
  ["photo", "n6", "NEUE SERIE", "Stadtgeschichten, ab Freitag", "Sand"],
  ["type", null, "MEHR VON MIR\nGIBT'S NUR\nIM ABO", "Link in Bio", "Dunkel"],
  ["split", "n2", "DAS ERWARTET\nDICH", ["3 neue Sets pro Woche", "Behind-the-Scenes", "persönliche Antworten"], "Rose"],
  ["photo", "n4", "WOCHENENDE\n-30 %", "nur bis Sonntag", "Dunkel"],
  ["quote", null, "„Hier zeige ich die Seiten von mir, die nicht in den Feed passen.“", "Nina", "Sand"],
  ["photo", "n3", "DANKE FÜR\n1.000", "ihr seid die Besten", "Rose"],
  ["split", "n5", "DU\nBESTIMMST", ["Umfrage läuft", "Thema für nächste Woche", "abstimmen im Abo"], "Sand"],
  ["type", null, "FREITAG\n19 UHR\nLIVE", "Fragen vorab per Nachricht", "Rose"],
  ["photo", "n1", "EIN ABEND\nMIT MIR", "neues Video im Abo", "Sand"],
  ["quote", null, "„Kündbar jederzeit. Aber die meisten bleiben.“", "", "Dunkel"],
  ["split", "nina0", "NEU HIER?", ["wer ich bin", "was du bekommst", "was es kostet"], "Rose"],
  ["photo", "n2", "BEHIND\nTHE SCENES", "jeden Freitag", "Dunkel"],
];
module.exports = {
  slug: "24-promo-posts-abo", file: "12-Promo-Posts-Abo-Creator", format: "POST", style: "noir",
  title: "12 Promo-Posts für Abo-Creator", sub: "Jugendfreie Werbung für dein Abo auf Social Media", price: 14,
  pills: ["12 Posts", "4:5", "jugendfrei"],
  build(k) {
    const { C, W, H, M, T, caps, serif, hand, label, rule, box, frame, photo } = k;
    const GOLD = C.accent1, CREAM = k.CREAM, CW = W - 2 * M;
    P.forEach(([lay, pic, head, sub, bg], i) => {
      const s = k.page(bg), dark = bg === "Dunkel", ink = dark ? CREAM : C.text1;
      if (lay === "photo") {
        if (i % 2) { photo(s, pic, 0, 0, W, H, { fy: 0.3 }); box(s, 0, H - 3.0, W, 3.0, "15110F", { fill: { color: "15110F", transparency: 20 } }); caps(s, head, { x: M, y: H - 2.75, w: CW, h: 1.9, fontSize: 54, color: CREAM }); serif(s, sub, { x: M, y: H - 0.95, w: CW, h: 0.45, fontSize: 17, italic: true, color: GOLD }); }
        else { photo(s, pic, M, M, CW, H * 0.62, { fy: 0.3 }); caps(s, head, { x: M, y: M + H * 0.62 + 0.3, w: CW, h: 1.9, fontSize: 52, color: ink }); serif(s, sub, { x: M, y: H - M - 0.5, w: CW, h: 0.45, fontSize: 17, italic: true, color: GOLD }); }
      } else if (lay === "type") {
        frame(s, M * 0.6, M * 0.6, W - M * 1.2, H - M * 1.2, GOLD);
        caps(s, head, { x: M, y: 1.4, w: CW, h: 5.0, fontSize: 82, color: ink, align: "center", valign: "middle" });
        rule(s, W / 2 - 0.8, 6.9, 1.6, GOLD, 1.25);
        T(s, sub.toUpperCase(), { x: M, y: 7.15, w: CW, h: 0.35, fontSize: 10, charSpacing: 4, align: "center", color: GOLD, bold: true });
      } else if (lay === "split") {
        photo(s, pic, 0, 0, W * 0.48, H, { fy: 0.3 });
        const x = W * 0.48 + 0.4, w = W - x - M * 0.8;
        caps(s, head, { x, y: 1.0, w, h: 2.4, fontSize: 46, color: ink });
        sub.forEach((t, j) => { serif(s, "0" + (j + 1), { x, y: 4.0 + j * 1.25, w: 0.7, h: 0.5, fontSize: 22, color: GOLD }); T(s, t, { x: x + 0.7, y: 4.1 + j * 1.25, w: w - 0.7, h: 0.8, fontSize: 12, color: ink }); });
        T(s, "LINK IN BIO", { x, y: H - 1.1, w, h: 0.3, fontSize: 9, bold: true, charSpacing: 3, color: GOLD });
      } else {
        serif(s, "“", { x: M, y: 0.7, w: 2, h: 1.6, fontSize: 130, color: GOLD });
        serif(s, head.replace(/[„“]/g, ""), { x: M + 0.2, y: 2.4, w: CW - 0.4, h: 4.2, fontSize: 34, italic: true, color: ink, lineSpacingMultiple: 1.15 });
        if (sub) hand(s, "— " + sub, { x: M, y: 7.0, w: CW - 0.3, h: 0.6, fontSize: 18, align: "right", rotate: -2 });
        T(s, "@nina.abends", { x: M, y: H - M - 0.3, w: CW, h: 0.3, fontSize: 9, bold: true, color: ink, align: "center" });
      }
    });
  },
};
