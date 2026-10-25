module.exports = {
  slug: "04-angebot-kooperation", file: "Angebot-Kooperation", format: "A4", style: "salbei",
  title: "Angebotsvorlage für Kooperationen", sub: "Professionell anbieten, schneller zusagen lassen", price: 10,
  pills: ["2 Seiten", "mit Rechenbeispiel", "Deutsch"],
  build(k) {
    const { C, W, M, T, caps, serif, hand, label, rule, photo, box, table, field } = k;
    let s = k.page("Sand");
    caps(s, "ANGEBOT", { x: M, y: 0.55, w: 5, h: 1.3, fontSize: 88 });
    serif(s, "für eine UGC-Kooperation", { x: M, y: 1.75, w: 5, h: 0.5, fontSize: 22, italic: true, color: C.accent1 });
    T(s, "Paula Wendt\nContent Creatorin\nMusterstraße 12\n01067 Dresden\nhallo@deinewebsite.de", { x: W - M - 2.4, y: 0.7, w: 2.4, h: 1.4, fontSize: 8.5, align: "right", lineSpacingMultiple: 1.3, color: C.text2 });
    rule(s, M, 2.55, W - 2 * M, C.text1);
    label(s, "FÜR", { x: M, y: 2.75, w: 3, h: 0.2, color: C.text2 });
    T(s, "nordlicht GmbH\nz. Hd. Anna Weber\nBeispielweg 5, 20095 Hamburg", { x: M, y: 3.0, w: 3.5, h: 0.8, fontSize: 9.5, lineSpacingMultiple: 1.3 });
    [["ANGEBOT NR.", "2026-014"], ["DATUM", "14.10.2026"], ["GÜLTIG BIS", "28.10.2026"], ["PROJEKT", "Herbstkampagne Hydra-Serum"]].forEach(([a, b], i) => {
      const x = 4.45, y = 2.75 + i * 0.36;
      label(s, a, { x, y: y + 0.04, w: 1.2, h: 0.2, color: C.text2 });
      T(s, b, { x: x + 1.25, y, w: 2.0, h: 0.28, fontSize: 9.5, bold: true });
    });
    table(s, [["POS.", "LEISTUNG", "MENGE", "EINZELPREIS", "GESAMT"],
      ["1", "UGC-Video, 20–30 Sek., Hochformat, mit Untertiteln", "3", "180,00 €", "540,00 €"],
      ["2", "Hook-Variante für Video 1", "2", "25,00 €", "50,00 €"],
      ["3", "Werbenutzung, 30 Tage (+30 %)", "1", "162,00 €", "162,00 €"],
      ["4", "Rohmaterial aller Drehs", "1", "60,00 €", "60,00 €"]],
      M, 4.3, W - 2 * M, [0.5, 3.47, 0.65, 1.1, 1.05], { rowH: 0.38 });
    [["Zwischensumme", "812,00 €"], ["Paketrabatt (10 %)", "– 81,20 €"], ["Netto", "730,80 €"], ["zzgl. 19 % USt.", "138,85 €"]].forEach(([a, b], i) => {
      const y = 6.35 + i * 0.3;
      T(s, a, { x: 4.6, y, w: 1.8, h: 0.28, fontSize: 9.5, color: C.text2, valign: "middle" });
      T(s, b, { x: 6.4, y, w: 1.27, h: 0.28, fontSize: 9.5, align: "right", valign: "middle" });
    });
    box(s, 4.5, 7.6, W - M - 4.5, 0.55, C.accent3);
    T(s, "Gesamt", { x: 4.65, y: 7.6, w: 1.5, h: 0.55, fontSize: 11, bold: true, color: k.CREAM, valign: "middle" });
    caps(s, "869,65 €", { x: 5.6, y: 7.6, w: 2.0, h: 0.55, fontSize: 22, color: k.CREAM, align: "right", valign: "middle" });
    label(s, "KONDITIONEN", { x: M, y: 6.35, w: 3, h: 0.2 });
    T(s, "Lieferung: 7 Werktage nach Erhalt des Produkts\nÜberarbeitungen: 1 Runde inklusive\nNutzung: organisch 12 Monate, Werbung 30 Tage\nZahlung: 14 Tage nach Rechnungsstellung",
      { x: M, y: 6.62, w: 3.5, h: 1.3, fontSize: 9, lineSpacingMultiple: 1.4 });
    rule(s, M, 8.55, W - 2 * M, C.accent5);
    T(s, "Ich freue mich auf die Zusammenarbeit! Mit deiner Unterschrift wird das Angebot verbindlich angenommen.", { x: M, y: 8.7, w: W - 2 * M, h: 0.45, fontSize: 9.5 });
    field(s, "ORT, DATUM", M, 9.5, 2.8);
    field(s, "UNTERSCHRIFT AUFTRAGGEBER", 4.0, 9.5, W - M - 4.0);
    hand(s, "Paula Wendt", { x: M, y: 10.35, w: 3, h: 0.5, fontSize: 16, color: C.text1, rotate: -2 });
    T(s, "Beispielwerte. Ohne USt.-Ausweis bei Kleinunternehmerregelung (§ 19 UStG).", { x: M, y: 11.05, w: W - 2 * M, h: 0.22, fontSize: 7, italic: true, color: C.text2 });

    // Page 2: scope and timeline
    s = k.page("Rose");
    k.title(s, "SO LÄUFT", "unsere Zusammenarbeit", M, 0.55, { capsSize: 84, serifSize: 34 });
    const steps = [
      ["Angebot annehmen", "Du unterschreibst das Angebot oder bestätigst per Mail."],
      ["Briefing & Produkt", "Ich bekomme das Briefing und das Produkt per Post."],
      ["Konzept", "Innerhalb von 2 Tagen schicke ich dir Hook-Ideen und Skript zur Freigabe."],
      ["Dreh & Schnitt", "Ich drehe bei mir zu Hause bei natürlichem Licht und schneide das Video."],
      ["Abgabe", "Du bekommst die fertigen Videos per Link, inklusive einer Überarbeitungsrunde."],
      ["Rechnung", "Nach der Freigabe schicke ich die Rechnung, zahlbar in 14 Tagen."],
    ];
    steps.forEach(([a, b], i) => {
      const y = 2.6 + i * 1.05;
      k.box(s, M, y, 0.55, 0.55, C.accent3);
      caps(s, String(i + 1), { x: M, y, w: 0.55, h: 0.55, fontSize: 22, color: k.CREAM, align: "center", valign: "middle" });
      serif(s, a, { x: M + 0.8, y: y - 0.02, w: 4.2, h: 0.38, fontSize: 16 });
      T(s, b, { x: M + 0.8, y: y + 0.38, w: 3.9, h: 0.5, fontSize: 9.5 });
      if (i < steps.length - 1) k.vrule(s, M + 0.275, y + 0.55, 0.5, C.text1);
    });
    k.polaroid(s, "f_film", 6.45, 4.35, 1.9, 2.4, 4, "so drehe ich", 1);
    hand(s, "Fragen? Einfach melden!", { x: 5.3, y: 6.3, w: 2.4, h: 0.5, fontSize: 10, rotate: -4 });
    label(s, "WAS DU BEKOMMST", { x: M, y: 9.0, w: 4, h: 0.22 });
    T(s, "3 fertige Videos im MP4-Format (1080 × 1920)\n2 zusätzliche Hook-Varianten\nAlle Rohaufnahmen per Download-Link\nNutzungsrechte wie im Angebot vereinbart", { x: M, y: 9.3, w: 5, h: 1.3, fontSize: 9.5, lineSpacingMultiple: 1.4 });
  },
};
