const CATS = [
  ["Neugier", "Die Zuschauer wollen wissen, wie es weitergeht.", [
    "Das hier hätte ich gern vor drei Jahren gewusst.",
    "Niemand redet darüber, aber [Produkt] kann viel mehr.",
    "Ich zeige dir, was in meiner Tasche wirklich jeden Tag drin ist.",
    "Wartet, bis ihr seht, was nach 10 Sekunden passiert.",
    "Das ist der Grund, warum meine Haut im Winter nicht mehr spannt.",
    "Ich habe etwas gefunden, das meinen Morgen komplett verändert hat.",
    "Diese eine Sache mache ich jeden Abend, bevor ich schlafen gehe.",
    "Ratet mal, was das hier gekostet hat.",
    "Ich dachte, das ist ein Fehlkauf. Dann kam das hier.",
    "Okay, ich muss euch was zeigen."]],
  ["Problem", "Du sprichst ein Problem an, das deine Zielgruppe kennt.", [
    "Wenn dein Kaffee auch immer nach 20 Minuten kalt ist, bleib kurz hier.",
    "Du hast auch keine Lust, morgens 30 Minuten im Bad zu stehen?",
    "Für alle, deren Haare nach dem Duschen aussehen wie ein Vogelnest.",
    "Wenn du jedes Mal Rückenschmerzen nach dem Homeoffice hast, schau dir das an.",
    "Dein Kleiderschrank ist voll, aber du hast nichts zum Anziehen?",
    "Du vergisst auch ständig, genug zu trinken?",
    "Für alle, die keine Zeit zum Kochen haben, aber trotzdem gut essen wollen.",
    "Dein Handy ist auch immer um 15 Uhr leer?",
    "Wenn du beim Packen jedes Mal verzweifelst, ist das für dich.",
    "Dein Balkon sieht aus wie eine Abstellkammer? Meiner auch. Bis gestern."]],
  ["Geständnis", "Ehrlich und persönlich, das schafft Nähe.", [
    "Ich muss was zugeben: Ich habe jahrelang falsch abgeschminkt.",
    "Ich war so skeptisch, dass ich es fast zurückgeschickt hätte.",
    "Ehrlich gesagt hab ich das nur wegen der Verpackung gekauft.",
    "Ich schäme mich ein bisschen, wie lange ich das ignoriert habe.",
    "Ich hab mich lange über Leute lustig gemacht, die das benutzen.",
    "Okay, ich war im Unrecht.",
    "Das ist mir peinlich, aber ich zeig's euch trotzdem.",
    "Ich habe 200 Euro für Produkte ausgegeben, die das hier besser kann.",
    "Mein Freund hat mich ausgelacht. Jetzt benutzt er es selbst.",
    "Ich war die Letzte, die diesen Trend mitgemacht hat."]],
  ["Zahl & Liste", "Zahlen versprechen einen klaren Mehrwert.", [
    "3 Dinge, die ich in meiner Wohnung nie wieder missen will.",
    "5 Produkte unter 20 Euro, die sich wie Luxus anfühlen.",
    "Meine Morgenroutine in 30 Sekunden.",
    "7 Tage, 1 Produkt, mein ehrliches Fazit.",
    "2 Fehler, die fast alle beim Eincremen machen.",
    "In 60 Sekunden zum perfekten Iced Latte.",
    "4 Dinge, die ich nach dem Umzug als Erstes gekauft habe.",
    "Die 3 besten Käufe aus diesem Monat.",
    "10 Sekunden, die dein Bad aufräumen.",
    "1 Trick, 3 Outfits."]],
  ["Vorher & Nachher", "Der Unterschied ist das Versprechen.", [
    "So sah mein Schreibtisch letzte Woche aus. Und so jetzt.",
    "Links: ohne. Rechts: mit. Muss ich mehr sagen?",
    "Tag 1 gegen Tag 30.",
    "Mein Flur vor und nach 15 Euro.",
    "Das passiert, wenn du es eine Woche lang jeden Tag benutzt.",
    "Erst dachte ich, das wird nichts. Dann das.",
    "Gleiche Kamera, gleiches Licht, nur ein Unterschied.",
    "Vorher: Chaos. Nachher: dieses Video.",
    "So wenig hat gefehlt.",
    "Meine Haut am Montag und am Freitag."]],
  ["Mythos & Widerspruch", "Du widersprichst einer gängigen Meinung.", [
    "Hört auf, eure Haare jeden Tag zu waschen.",
    "Teuer heißt nicht besser. Hier ist der Beweis.",
    "Das größte Missverständnis über Sonnencreme.",
    "Du brauchst keine zehn Produkte. Du brauchst eins.",
    "Alle sagen, man soll das nicht machen. Ich mach's trotzdem.",
    "Unpopuläre Meinung: [Produkt] ist besser als sein Ruf.",
    "Nein, du musst dafür nicht früh aufstehen.",
    "Das funktioniert nicht so, wie du denkst.",
    "Warum ich keine Lieblingsprodukte mehr habe.",
    "Das ist kein Lifehack, das ist ein Fehler."]],
  ["Test & Experiment", "Echte Tests wirken glaubwürdig.", [
    "Ich habe das 24 Stunden lang getestet.",
    "Hält das wirklich, was die Werbung verspricht? Finden wir's raus.",
    "Teure Version gegen günstige Version. Blindtest.",
    "Ich trage das jetzt einen ganzen Tag. Mal sehen.",
    "Ich lasse meine Mitbewohnerin entscheiden.",
    "Regentest: Übersteht das einen Tag in Hamburg?",
    "Ich koche eine Woche lang nur damit.",
    "Wie lange bleibt das wirklich kalt? Ich hab die Zeit gestoppt.",
    "Ich teste die drei beliebtesten Varianten.",
    "Experiment: Merkt mein Freund den Unterschied?"]],
  ["Story", "Eine kleine Geschichte hält die Leute im Video.", [
    "Letzten Dienstag ist mir etwas Peinliches im Zug passiert.",
    "Meine Oma hat mir einen Tipp gegeben, den ich nie vergessen werde.",
    "So hat alles angefangen.",
    "Ich stand im Laden und konnte mich nicht entscheiden.",
    "Vor einem Jahr hatte ich keine Ahnung davon.",
    "Das ist die ehrlichste Rezension, die ich je gemacht habe.",
    "Ich erzähle euch, wie mein schlimmster Morgen dieses Jahr aussah.",
    "Mein Paket kam an und ich war ehrlich überrascht.",
    "Es war 6 Uhr morgens und ich hatte genau 10 Minuten.",
    "Ich hab's bei meiner Freundin gesehen und musste es sofort haben."]],
  ["Tipp & Hack", "Du gibst sofort nützliches Wissen.", [
    "Speicher dir das für deinen nächsten Umzug.",
    "Der einfachste Trick für mehr Licht in kleinen Räumen.",
    "So hält dein Lippenstift den ganzen Tag.",
    "Mach das mit deinem Kühlschrank und du sparst jede Woche Geld.",
    "Das macht jeder falsch beim Wäschefalten.",
    "Mein Trick für Videos, die nicht wackeln, ohne Stativ.",
    "So packst du für eine Woche in einen Rucksack.",
    "Diese Einstellung an deinem Handy ändert alles.",
    "Der Trick, den Friseure dir nicht verraten.",
    "So sieht dein Essen auf Fotos endlich gut aus."]],
  ["Empfehlung", "Direkt und persönlich empfehlen.", [
    "Wenn du dir diesen Monat nur eine Sache kaufst, dann die hier.",
    "Das ist mein meistbenutztes Produkt 2026.",
    "Ich kaufe das inzwischen zum dritten Mal nach.",
    "Das schenke ich gerade allen meinen Freundinnen.",
    "Mein Geheimtipp für alle mit wenig Zeit.",
    "Endlich ein Produkt, das hält, was es verspricht.",
    "Dafür würde ich mein Geld wieder ausgeben.",
    "Mein ehrlicher Favorit nach drei Monaten.",
    "Wenn ihr mich fragt, was ich empfehle: das hier.",
    "Ich wurde nicht gebeten, das zu sagen, aber: kaufen."]],
];
module.exports = {
  slug: "11-hook-sammlung", file: "100-Hooks-fuer-Videos", format: "A4", style: "zitrus",
  title: "100 Hooks für deine Videos", sub: "Deutsche Videoeinstiege in 10 Kategorien", price: 12,
  pills: ["100 Hooks", "10 Kategorien", "auf Deutsch"],
  build(k) {
    const { C, W, H, M, T, caps, serif, hand, label, rule, photo, box } = k;
    const ACC = C.accent1;
    let s = k.page("Dunkel");
    caps(s, "100", { x: M, y: 0.8, w: 6, h: 3.0, fontSize: 230, color: ACC });
    caps(s, "HOOKS", { x: M, y: 3.7, w: 6, h: 1.8, fontSize: 130, color: k.CREAM });
    serif(s, "für Videos, die nicht weggewischt werden", { x: M, y: 5.6, w: 6.5, h: 0.6, fontSize: 24, italic: true, color: C.accent2 });
    T(s, CATS.map((c, i) => `${String(i + 1).padStart(2, "0")}  ${c[0]}`).join("\n"), { x: M, y: 6.8, w: 3.5, h: 3.6, fontSize: 11, color: k.CREAM, lineSpacingMultiple: 1.55 });
    hand(s, "die ersten 3 Sekunden\nentscheiden alles", { x: 4.3, y: 7.3, w: 3.3, h: 1.2, fontSize: 13, rotate: -5, color: C.accent2 });
    T(s, "Ersetze [Produkt] durch dein Produkt und passe den Satz an deine Sprache an.", { x: M, y: 10.8, w: W - 2 * M, h: 0.3, fontSize: 8.5, color: C.accent5 });
    let n = 0;
    for (let p = 0; p < 5; p++) {
      s = k.page(p % 2 ? "Rose" : "Sand");
      CATS.slice(p * 2, p * 2 + 2).forEach(([cat, desc, hooks], ci) => {
        const y0 = 0.55 + ci * 5.45;
        caps(s, String(p * 2 + ci + 1).padStart(2, "0"), { x: M, y: y0, w: 1, h: 0.7, fontSize: 40, color: ACC });
        serif(s, cat, { x: M + 1.3, y: y0 + 0.02, w: 5, h: 0.5, fontSize: 24 });
        T(s, desc, { x: M + 1.3, y: y0 + 0.55, w: 6, h: 0.25, fontSize: 9, color: C.text2 });
        rule(s, M, y0 + 0.9, W - 2 * M, C.text1);
        hooks.forEach((h, i) => {
          n++;
          const y = y0 + 1.05 + i * 0.42;
          T(s, String(n), { x: M, y, w: 0.45, h: 0.35, fontSize: 9, bold: true, color: ACC, valign: "middle" });
          T(s, h, { x: M + 0.5, y, w: W - 2 * M - 0.5, h: 0.35, fontSize: 10.5, valign: "middle" });
        });
      });
    }
  },
};
