// Welcome messages and DM templates for subscription creators (SFW).
const GROUPS = [
  ["WILLKOMMEN", "Die erste Nachricht nach dem Abo", "n2", [
    "Hey [Name], schön, dass du da bist! Ich bin Nina. Schau dich in Ruhe um, die neuesten Sets findest du ganz oben. Gibt es etwas, das du hier gern öfter sehen würdest?",
    "Willkommen im Inner Circle, [Name]! Jeden Freitag gibt's hier Behind-the-Scenes. Erzähl mir gern, wie du mich gefunden hast.",
    "Hi [Name], danke für dein Abo! Kleiner Tipp: In der Umfrage oben darfst du mitbestimmen, was ich als Nächstes mache."]],
  ["DANKE", "Für Trinkgeld, Treue und liebe Worte", "n1", [
    "Wow, danke [Name]! Damit hast du mir den Abend gerettet. Das nächste Set widme ich dir.",
    "Du bist jetzt seit 6 Monaten dabei, [Name]. Danke, dass du bleibst! Als kleines Dankeschön: [Geschenk].",
    "Deine Nachricht hat mich echt gefreut. Genau dafür mache ich das hier."]],
  ["ZURÜCKHOLEN", "Wenn jemand länger still war", "n5", [
    "Hey [Name], lange nichts gehört! Diese Woche ist eine neue Serie gestartet, die dir gefallen könnte.",
    "Hi [Name], dein Abo läuft in 3 Tagen aus. Falls du bleiben magst: Bis Sonntag gibt's [Angebot].",
    "Ich vermisse deine Kommentare, [Name]! Was soll ich als Nächstes zeigen? Du darfst wünschen."]],
  ["GRENZEN", "Freundlich, aber klar", "n6", [
    "Danke für deine Anfrage! Das biete ich nicht an. Schau gern ins Menü, da steht alles, was ich mache.",
    "Ich antworte meistens abends, du hörst spätestens morgen von mir. Danke für deine Geduld!",
    "Bitte bleib respektvoll, sonst muss ich dich leider blockieren. Danke fürs Verständnis."]],
];
module.exports = {
  slug: "22-dm-vorlagen-abo", file: "Willkommens-und-DM-Vorlagen", format: "A4", style: "noir",
  title: "Willkommensnachrichten & DM-Vorlagen", sub: "33 fertige Nachrichten für Abo-Creator", price: 12,
  pills: ["6 Seiten", "33 Vorlagen", "zum Kopieren"],
  build(k) {
    const { C, W, H, M, T, caps, serif, hand, label, rule, box, photo, polaroid } = k;
    const GOLD = C.accent1, CREAM = k.CREAM, CW = W - 2 * M;
    // 1 cover
    let s = k.page("Dunkel");
    photo(s, "n3", 0, 0, W, H * 0.58, { fy: 0.3 });
    box(s, 0, H * 0.58, W, 0.04, GOLD);
    caps(s, "NACHRICHTEN,\nDIE BLEIBEN", { x: M, y: H * 0.6 + 0.35, w: CW, h: 2.4, fontSize: 52, color: CREAM });
    serif(s, "Willkommen, Danke, Zurückholen, Grenzen", { x: M, y: H * 0.6 + 2.65, w: CW, h: 0.5, fontSize: 18, italic: true, color: GOLD });
    T(s, "33 Vorlagen zum Kopieren und Anpassen. [Name] und [Angebot] einfach ersetzen.", { x: M, y: H * 0.6 + 3.3, w: CW - 1, h: 0.5, fontSize: 10, color: CREAM });
    // 4 group pages, alternating layouts
    GROUPS.forEach(([t, sub, pic, msgs], gi) => {
      s = k.page(gi % 2 ? "Rose" : "Sand");
      const left = gi % 2 === 0;
      polaroid(s, pic, left ? W - M - 1.3 : M + 1.3, 1.85, 2.1, 2.3, left ? 4 : -4, "", gi % 3, { fy: 0.3 });
      const tx = left ? M : M + 2.9;
      label(s, `TEIL ${gi + 1} / 4`, { x: tx, y: 0.8, w: 3, h: 0.2, color: GOLD });
      caps(s, t, { x: tx, y: 1.05, w: CW - 2.9, h: 1.0, fontSize: 50 });
      serif(s, sub, { x: tx, y: 2.05, w: CW - 2.9, h: 0.45, fontSize: 17, italic: true, color: GOLD });
      const all = msgs;
      all.forEach((m, i) => {
        const y = 3.65 + i * 2.25;
        serif(s, "0" + (i + 1), { x: M, y, w: 0.8, h: 0.6, fontSize: 30, color: GOLD });
        s.addShape(k.S.ROUNDED_RECTANGLE, { x: M + 0.9, y, w: CW - 0.9, h: 1.8, fill: { color: i % 2 ? C.accent6 : C.background1 }, line: { color: C.accent5, width: 0.5 }, rectRadius: 0.18 });
        T(s, m, { x: M + 1.15, y: y + 0.2, w: CW - 1.4, h: 1.4, fontSize: 11.5, lineSpacingMultiple: 1.35, valign: "middle" });
      });
      if (gi === 3) hand(s, "Grenzen setzen ist professionell.", { x: M, y: 10.6, w: CW, h: 0.45, fontSize: 13, align: "right", rotate: -2 });
    });
    // 6 Schnellantworten
    s = k.page("Dunkel");
    caps(s, "SCHNELL-\nANTWORTEN", { x: M, y: 0.8, w: CW, h: 2.2, fontSize: 54, color: CREAM });
    serif(s, "als gespeicherte Antworten anlegen", { x: M, y: 3.0, w: CW, h: 0.5, fontSize: 18, italic: true, color: GOLD });
    const QUICK = ["Danke dir, das freut mich sehr!", "Gute Frage, ich antworte dir heute Abend ausführlich.", "Das neue Set kommt am Freitag.", "Schau mal ins Menü, da steht alles drin.", "Haha, du bist lustig.", "Ich bin gerade unterwegs, melde mich später.", "Schön, dass du schon so lange dabei bist!", "Wünsche nehme ich in der Umfrage auf.", "Das Angebot gilt bis Sonntag.", "Gute Nacht und bis morgen!", "Danke für dein Verständnis.", "Ich überlege es mir und sag dir Bescheid.", "Du hast den Bonus freigeschaltet!", "Freut mich, dass es dir gefällt.", "Genieß dein Wochenende!", "Ich hab dir etwas in die Nachrichten gelegt.", "Danke fürs Teilen!", "Bis zum nächsten Set!", "Erzähl mir mehr!", "Kein Problem, alles gut.", "Danke, dass du so respektvoll bist."];
    QUICK.forEach((q, i) => {
      const col = i % 2, row = Math.floor(i / 2), x = M + col * (CW / 2), y = 3.9 + row * 0.62;
      T(s, "—", { x, y, w: 0.3, h: 0.4, fontSize: 10, color: GOLD });
      T(s, q, { x: x + 0.3, y, w: CW / 2 - 0.45, h: 0.5, fontSize: 9.5, color: CREAM });
    });
    T(s, "Allgemeine Vorlagen. Halte dich an die Richtlinien deiner Plattform.", { x: M, y: 10.95, w: CW, h: 0.25, fontSize: 7.5, color: C.accent5 });
  },
};
