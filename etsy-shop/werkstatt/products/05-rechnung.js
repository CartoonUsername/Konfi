module.exports = {
  slug: "05-rechnung-creator", file: "Rechnungsvorlage-Creator", format: "A4", style: "rosa",
  title: "Rechnungsvorlage für Creator", sub: "Mit Umsatzsteuer und als Kleinunternehmer", price: 9,
  pills: ["2 Varianten", "inkl. Pflichtangaben-Check", "Deutsch"],
  build(k) {
    const { C, W, M, T, caps, serif, hand, label, rule, box, table, field } = k;
    const invoice = (small) => {
      const s = k.page("Sand");
      caps(s, "RECHNUNG", { x: M, y: 0.55, w: 5, h: 1.3, fontSize: 84 });
      serif(s, small ? "Kleinunternehmerin nach § 19 UStG" : "mit ausgewiesener Umsatzsteuer", { x: M, y: 1.7, w: 5, h: 0.45, fontSize: 15, italic: true, color: C.accent1 });
      T(s, "Leonie Kraus\nMusterstraße 12, 50667 Köln\nhallo@deinewebsite.de\nSteuernummer: 231/123/45678", { x: W - M - 2.7, y: 0.7, w: 2.7, h: 1.2, fontSize: 8.5, align: "right", lineSpacingMultiple: 1.3, color: C.text2 });
      rule(s, M, 2.4, W - 2 * M, C.text1);
      label(s, "RECHNUNG AN", { x: M, y: 2.6, w: 3, h: 0.2, color: C.text2 });
      T(s, "nordlicht GmbH\nAnna Weber\nBeispielweg 5\n20095 Hamburg", { x: M, y: 2.85, w: 3.4, h: 1.0, fontSize: 9.5, lineSpacingMultiple: 1.3 });
      [["RECHNUNGSNR.", "2026-031"], ["RECHNUNGSDATUM", "04.11.2026"], ["LEISTUNGSZEITRAUM", "20.10. – 31.10.2026"], ["IHR ZEICHEN", "Angebot 2026-014"]].forEach(([a, b], i) => {
        const y = 2.6 + i * 0.36;
        label(s, a, { x: 4.0, y: y + 0.04, w: 1.8, h: 0.2, color: C.text2 });
        T(s, b, { x: 5.85, y, w: 1.85, h: 0.28, fontSize: 9.5, bold: true });
      });
      table(s, [["POS.", "LEISTUNG", "MENGE", "EINZELPREIS", "GESAMT"],
        ["1", "UGC-Video Hydra-Serum, 20–30 Sek.", "3", "180,00 €", "540,00 €"],
        ["2", "Hook-Variante", "2", "25,00 €", "50,00 €"],
        ["3", "Werbenutzung 30 Tage", "1", "162,00 €", "162,00 €"],
        ["4", "Rohmaterial", "1", "60,00 €", "60,00 €"],
        ["5", "Paketrabatt 10 %", "1", "– 81,20 €", "– 81,20 €"]],
        M, 4.25, W - 2 * M, [0.5, 3.47, 0.65, 1.1, 1.05], { rowH: 0.38 });
      const sums = small ? [["Summe", "730,80 €"]] : [["Nettobetrag", "730,80 €"], ["Umsatzsteuer 19 %", "138,85 €"]];
      sums.forEach(([a, b], i) => {
        const y = 6.65 + i * 0.32;
        T(s, a, { x: 4.6, y, w: 1.8, h: 0.28, fontSize: 9.5, color: C.text2, valign: "middle" });
        T(s, b, { x: 6.4, y, w: 1.27, h: 0.28, fontSize: 9.5, align: "right", valign: "middle" });
      });
      const gy = small ? 7.1 : 7.4;
      box(s, 4.5, gy, W - M - 4.5, 0.55, C.accent3);
      T(s, "Rechnungsbetrag", { x: 4.65, y: gy, w: 1.8, h: 0.55, fontSize: 10, bold: true, color: k.CREAM, valign: "middle" });
      caps(s, small ? "730,80 €" : "869,65 €", { x: 5.6, y: gy, w: 2.0, h: 0.55, fontSize: 22, color: k.CREAM, align: "right", valign: "middle" });
      if (small) T(s, "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.", { x: M, y: 6.65, w: 3.6, h: 0.5, fontSize: 9.5, bold: true });
      label(s, "ZAHLUNG", { x: M, y: 8.4, w: 3, h: 0.2 });
      T(s, "Bitte überweise den Betrag bis zum 18.11.2026 (14 Tage) auf folgendes Konto:\nLeonie Kraus · IBAN DE00 0000 0000 0000 0000 00 · BIC XXXXDEXX\nVerwendungszweck: 2026-031", { x: M, y: 8.68, w: W - 2 * M, h: 0.9, fontSize: 9.5, lineSpacingMultiple: 1.4 });
      hand(s, "Danke für die tolle Zusammenarbeit!", { x: M, y: 9.85, w: 4.5, h: 0.5, fontSize: 11, rotate: -2 });
      rule(s, M, 10.75, W - 2 * M, C.accent5);
      T(s, "Leonie Kraus · Content Creatorin · Musterstraße 12 · 50667 Köln · Steuernr. 231/123/45678 · Musterbank", { x: M, y: 10.85, w: W - 2 * M, h: 0.25, fontSize: 7.5, color: C.text2, align: "center" });
    };
    invoice(false);
    invoice(true);

    // Checklist page
    const s = k.page("Rose");
    k.title(s, "PFLICHT-\nANGABEN", "auf jeder Rechnung", M, 0.45, { capsSize: 60, serifSize: 30 });
    const items = [
      "Dein vollständiger Name und deine Anschrift",
      "Name und Anschrift der Marke",
      "Deine Steuernummer oder Umsatzsteuer-ID",
      "Rechnungsdatum",
      "Fortlaufende, einmalige Rechnungsnummer",
      "Menge und Art der Leistung",
      "Zeitpunkt oder Zeitraum der Leistung",
      "Nettobetrag, Steuersatz und Steuerbetrag",
      "Als Kleinunternehmer: Hinweis auf § 19 UStG statt Steuer",
    ];
    items.forEach((t, i) => {
      const y = 2.85 + i * 0.6;
      k.checkbox(s, M, y + 0.06, 0.26, i < 2);
      T(s, t, { x: M + 0.5, y, w: 6.5, h: 0.4, fontSize: 12, valign: "middle" });
    });
    k.note(s, M + 0.1, 8.5, 4.4, 1.7, -1.5, [
      { text: "Gut zu wissen", options: { fontFace: k.SERIF, italic: true, fontSize: 14, breakLine: true, paraSpaceAfter: 6 } },
      { text: "Rechnungen musst du zehn Jahre aufbewahren. Für Kleinunternehmer gilt die neue E-Rechnungspflicht beim Ausstellen nicht, eine PDF-Rechnung reicht.", options: { fontSize: 9 } }], 0);
    T(s, "Allgemeine Hinweise, keine Steuerberatung. Im Zweifel frag dein Finanzamt oder eine Steuerberatung.", { x: M, y: 10.85, w: W - 2 * M, h: 0.25, fontSize: 7.5, color: C.text2 });
  },
};
