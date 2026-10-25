module.exports = {
  slug: "17-finanzplaner-creator", file: "Finanzplaner-Creator", format: "A4", style: "zitrus",
  title: "Finanzplaner für Creator", sub: "Einnahmen, Ausgaben, Rechnungen und Rücklagen", price: 11,
  pills: ["5 Seiten", "zum Ausfüllen", "mit Steuer-Rücklage"],
  build(k) {
    const { C, S, W, H, M, T, caps, serif, hand, label, rule, box, frame, table, polaroid, checkbox } = k;
    const ACC = C.accent1, CW = W - 2 * M;

    // 1 Cover
    let s = k.page("Dunkel");
    caps(s, "GELD\nKRAM", { x: M, y: 0.9, w: CW, h: 4.4, fontSize: 150, color: "FFFBEA" });
    serif(s, "der Finanzplaner für Creator", { x: M, y: 5.3, w: CW, h: 0.7, fontSize: 30, italic: true, color: ACC });
    T(s, "Monatsübersicht · Rechnungs-Tracker · Ausgaben · Steuer-Rücklage · Jahresübersicht", { x: M, y: 6.15, w: CW - 1, h: 0.6, fontSize: 11, color: "FFFBEA", lineSpacingMultiple: 1.3 });
    polaroid(s, "f_balcony", 5.6, 8.9, 2.6, 2.6, -5, "Montagsbuchhaltung", 0, { fy: 0.5 });
    hand(s, "einmal im Monat\n15 Minuten reichen", { x: M, y: 8.3, w: 3.6, h: 1.2, fontSize: 16, color: C.accent2, rotate: -4 });

    // 2 Monat
    s = k.page("Sand");
    caps(s, "MEIN MONAT", { x: M, y: 0.5, w: 5, h: 0.9, fontSize: 44 });
    T(s, "Monat: ______________", { x: W - M - 3, y: 0.7, w: 3, h: 0.3, fontSize: 11, align: "right" });
    label(s, "EINNAHMEN", { x: M, y: 1.6, w: 3, h: 0.22, color: ACC });
    table(s, [["DATUM", "QUELLE", "BETRAG"]].concat(Array.from({ length: 8 }, () => ["", "", ""])), M, 1.9, CW, [1.2, 4.37, 1.5], { rowH: 0.38 });
    label(s, "AUSGABEN", { x: M, y: 5.5, w: 3, h: 0.22, color: ACC });
    table(s, [["DATUM", "WOFÜR", "BETRAG"]].concat(Array.from({ length: 8 }, () => ["", "", ""])), M, 5.8, CW, [1.2, 4.37, 1.5], { rowH: 0.38 });
    [["EINNAHMEN", ""], ["AUSGABEN", ""], ["GEWINN", ""]].forEach(([a], i) => {
      const x = M + i * (CW / 3);
      box(s, x, 9.5, CW / 3 - 0.15, 1.2, i === 2 ? ACC : C.accent2);
      label(s, a, { x: x + 0.2, y: 9.62, w: 2, h: 0.22, color: i === 2 ? "FFFFFF" : C.text1 });
      T(s, "€", { x: x + 0.2, y: 10.0, w: CW / 3 - 0.55, h: 0.5, fontSize: 20, bold: true, align: "right", color: i === 2 ? "FFFFFF" : C.text1 });
    });

    // 3 Rechnungen
    s = k.page("Rose");
    caps(s, "RECHNUNGEN", { x: M, y: 0.5, w: 5, h: 0.9, fontSize: 44 });
    T(s, "Wer hat schon bezahlt? Hier siehst du es sofort.", { x: M, y: 1.45, w: 6, h: 0.3, fontSize: 10 });
    table(s, [["NR.", "KUNDE", "DATUM", "BETRAG", "FÄLLIG", "BEZAHLT"]].concat(Array.from({ length: 18 }, () => ["", "", "", "", "", ""])), M, 1.95, CW, [0.9, 2.2, 1.0, 1.1, 1.0, 0.87], { rowH: 0.43 });
    hand(s, "nach 14 Tagen freundlich erinnern!", { x: M, y: 10.35, w: 5, h: 0.5, fontSize: 13, rotate: -2 });

    // 4 Rücklage
    s = k.page("Sand");
    caps(s, "RÜCKLAGE", { x: M, y: 0.5, w: 5, h: 0.9, fontSize: 44 });
    serif(s, "Damit die Steuer dich nicht überrascht", { x: M, y: 1.45, w: CW, h: 0.45, fontSize: 18, italic: true, color: ACC });
    T(s, "Viele Selbstständige legen pauschal einen festen Anteil jeder Einnahme zur Seite, oft zwischen 25 und 35 Prozent. Wie viel es bei dir wirklich sein muss, hängt von deinem Einkommen und deiner Situation ab.", { x: M, y: 2.1, w: CW, h: 0.9, fontSize: 10, lineSpacingMultiple: 1.35 });
    serif(s, "Mein Prozentsatz:  ______ %", { x: M, y: 3.15, w: 5, h: 0.45, fontSize: 18 });
    table(s, [["MONAT", "EINNAHMEN", "RÜCKLAGE", "AUFS KONTO ✓"]].concat(["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"].map((m) => [m, "", "", ""])), M, 3.9, CW, [1.8, 1.9, 1.9, 1.47], { rowH: 0.42 });
    T(s, "Allgemeine Orientierung, keine Steuerberatung.", { x: M, y: 10.85, w: CW, h: 0.25, fontSize: 8, italic: true, color: C.text2 });

    // 5 Jahr
    s = k.page("Sand");
    caps(s, "MEIN JAHR", { x: M, y: 0.5, w: 5, h: 0.9, fontSize: 44 });
    T(s, "Jahr: ________", { x: W - M - 2.5, y: 0.7, w: 2.5, h: 0.3, fontSize: 11, align: "right" });
    table(s, [["MONAT", "EINNAHMEN", "AUSGABEN", "GEWINN", "KOOPS"]].concat(["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez", "GESAMT"].map((m) => [m, "", "", "", ""])), M, 1.6, CW, [1.3, 1.55, 1.55, 1.55, 1.12], { rowH: 0.5 });
    label(s, "MEIN ZIEL FÜR NÄCHSTES JAHR", { x: M, y: 8.95, w: 5, h: 0.22, color: ACC });
    for (let i = 0; i < 3; i++) rule(s, M, 9.6 + i * 0.42, CW, C.accent5);
  },
};
