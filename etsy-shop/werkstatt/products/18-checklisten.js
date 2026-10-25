const LISTS = [
  ["DREHTAG", "Bevor du auf Aufnahme drückst", ["Akku von Handy und Licht geladen", "Speicherplatz frei (mind. 10 GB)", "Linse geputzt", "Produkt sauber und ohne Preisschild", "Hintergrund aufgeräumt", "Licht von vorn oder von der Seite", "Ton getestet, Fenster zu", "Skript und Hooks griffbereit", "Hochformat 9:16 eingestellt", "Jede Szene zweimal gedreht"]],
  ["ABGABE", "Bevor das Video an die Marke geht", ["Länge passt zum Briefing", "Hook in den ersten 3 Sekunden", "Produkt gut sichtbar", "Untertitel ohne Tippfehler", "Keine fremden Marken im Bild", "Musik lizenzfrei oder ohne Musik", "Export in 1080 × 1920", "Datei sinnvoll benannt", "Hook-Varianten beigelegt", "Rechnung vorbereitet"]],
  ["NEUE KOOPERATION", "Damit nichts vergessen wird", ["Briefing erhalten und gelesen", "Umfang schriftlich bestätigt", "Nutzungsrechte und Laufzeit geklärt", "Preis und Zahlungsziel vereinbart", "Deadline im Kalender", "Lieferadresse fürs Produkt geschickt", "Ansprechperson notiert", "Anzahl Überarbeitungen festgelegt", "Kennzeichnung (Werbung) geklärt", "Kooperation im Tracker eingetragen"]],
  ["EQUIPMENT", "Meine Packliste für Drehs unterwegs", ["Handy + Ladekabel", "Powerbank", "Mini-Stativ", "Ansteck-Mikrofon", "Kleines Licht", "Reinigungstuch", "Produkt + Ersatz", "Wechsel-Outfit", "Wasser und Snack", "Klebeband und Clips"]],
  ["MONATSABSCHLUSS", "Einmal im Monat, 20 Minuten", ["Alle Rechnungen geschrieben", "Offene Zahlungen geprüft", "Belege fotografiert und abgelegt", "Rücklage für Steuern überwiesen", "Zahlen im Finanzplaner eingetragen", "Beste Videos des Monats notiert", "Media-Kit-Zahlen aktualisiert", "Drei neue Marken auf die Wunschliste", "Content für nächsten Monat geplant", "Einen Tag frei eingeplant"]],
];
module.exports = {
  slug: "18-checklisten-set", file: "Checklisten-Set-Creator", format: "A4", style: "terra",
  title: "Checklisten-Set für Creator", sub: "Drehtag, Abgabe, Kooperation, Equipment, Monatsabschluss", price: 8,
  pills: ["5 Checklisten", "A4", "zum Abhaken"],
  build(k) {
    const { C, S, W, H, M, T, caps, serif, hand, label, rule, checkbox, photo, polaroid, box } = k;
    const ACC = C.accent1, CW = W - 2 * M;
    const bgs = ["Sand", "Rose", "Sand", "Dunkel", "Rose"];
    const pics = ["f_setup", null, "f_desk", null, "f_balcony"];
    LISTS.forEach(([title, sub, items], i) => {
      const s = k.page(bgs[i]), dark = bgs[i] === "Dunkel", ink = dark ? k.CREAM : C.text1;
      label(s, `CHECKLISTE ${i + 1} / ${LISTS.length}`, { x: M, y: 0.6, w: 4, h: 0.22, color: ACC });
      caps(s, title, { x: M, y: 0.85, w: pics[i] ? 4.9 : CW, h: 1.3, fontSize: 80, color: ink });
      serif(s, sub, { x: M, y: 2.2, w: 5, h: 0.5, fontSize: 18, italic: true, color: dark ? C.accent2 : ACC });
      if (pics[i]) polaroid(s, pics[i], 6.35, 1.75, 1.95, 1.95, i % 2 ? -5 : 5, "", i % 3, { fy: 0.45 });
      items.forEach((t, j) => {
        const y = 3.2 + j * 0.74;
        checkbox(s, M, y + 0.08, 0.3, false);
        T(s, t, { x: M + 0.6, y, w: CW - 0.6, h: 0.46, fontSize: 13, valign: "middle", color: ink });
        rule(s, M + 0.6, y + 0.56, CW - 0.6, dark ? C.accent4 : C.accent5);
      });
      if (i === 2) T(s, "Werbung muss in Deutschland klar gekennzeichnet werden. Keine Rechtsberatung.", { x: M, y: 10.85, w: CW, h: 0.25, fontSize: 7.5, color: C.text2 });
      if (i === 4) T(s, "Allgemeine Hinweise, keine Steuerberatung.", { x: M, y: 10.85, w: CW, h: 0.25, fontSize: 7.5, color: C.text2 });
      if (i === 3) hand(s, "einmal ausdrucken, in den Rucksack!", { x: M, y: 10.6, w: 5, h: 0.5, fontSize: 12, rotate: -2, color: C.accent2 });
    });
  },
};
