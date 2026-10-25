const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/7d806dbd-5dd6-4667-84c9-72658829b4b7_22d8ece4-65ab-428c-9049-f7d10f055204/pptx/scripts/apply_theme.js");

const A = __dirname + "/v5/";
const CAPS = "Anton", SERIF = "Bodoni Moda", HAND = "Homemade Apple", BODY = "Work Sans";
const THEME = {
  name: "Lena Media-Kit",
  headFontFace: CAPS,
  bodyFontFace: BODY,
  colors: {
    dk1: "1F1A17", lt1: "FFFFFF", dk2: "6E6259", lt2: "F2EAE1",
    accent1: "A9542F", accent2: "ECDED2", accent3: "2E2420",
    accent4: "4A3F38", accent5: "BCAEA2", accent6: "FBF8F4",
    hlink: "A9542F", folHlink: "6E6259",
  },
};
const W = 8.27, H = 11.69, M = 0.6;
const rad = (d) => (d * Math.PI) / 180;

function setup(title) {
  const pres = new pptxgen();
  pres.defineLayout({ name: "A4P", width: W, height: H });
  pres.layout = "A4P";
  pres.title = title;
  pres.theme = { headFontFace: CAPS, bodyFontFace: BODY };
  pres.defineSlideMaster({ title: "Sand", background: { path: A + "bg_sand.jpg" }, objects: [] });
  pres.defineSlideMaster({ title: "Dunkel", background: { path: A + "bg_dark.jpg" }, objects: [] });
  pres.defineSlideMaster({ title: "Rose", background: { path: A + "bg_blush.jpg" }, objects: [] });
  return pres;
}

function kit(pres) {
  const C = pres.SchemeColor, S = pres.shapes;
  const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, valign: "top", color: C.text1, fontFace: BODY, fontSize: 10.5 }, o));
  const caps = (s, text, o) => T(s, text, Object.assign({ fontFace: CAPS, lineSpacingMultiple: 0.82 }, o));
  const serif = (s, text, o) => T(s, text, Object.assign({ fontFace: SERIF }, o));
  const hand = (s, text, o) => T(s, text, Object.assign({ fontFace: HAND, fontSize: 11, color: C.accent1 }, o));
  const label = (s, text, o) => T(s, text, Object.assign({ fontSize: 8, bold: true, charSpacing: 2 }, o));
  const shadow = () => ({ type: "outer", color: "000000", blur: 7, offset: 2.5, angle: 90, opacity: 0.22 });
  const off = (vx, vy, rot) => [vx * Math.cos(rad(rot)) - vy * Math.sin(rad(rot)), vx * Math.sin(rad(rot)) + vy * Math.cos(rad(rot))];
  const tape = (s, cx, cy, rot, n) => s.addImage({ path: A + `tape${n % 3}.png`, x: cx - 0.65, y: cy - 0.19, w: 1.3, h: 0.37, rotate: rot, altText: "Klebeband" });

  // Polaroid: white frame, photo, handwritten caption, tape on top. (cx, cy) = frame centre.
  function polaroid(s, file, cx, cy, iw, ih, rot, caption, tapeN, alt) {
    const fw = iw + 0.24, fh = ih + 0.79;
    s.addShape(S.RECTANGLE, { x: cx - fw / 2, y: cy - fh / 2, w: fw, h: fh, rotate: rot, fill: { color: C.background1 }, line: { color: C.background1, width: 0 }, shadow: shadow(), objectName: "Polaroid-Rahmen" });
    const [ix, iy] = off(0, -0.275, rot);
    s.addImage({ path: A + file, x: cx + ix - iw / 2, y: cy + iy - ih / 2, w: iw, h: ih, rotate: rot, altText: alt });
    if (caption) {
      const [tx, ty] = off(0, fh / 2 - 0.3, rot);
      T(s, caption, { x: cx + tx - (fw - 0.3) / 2, y: cy + ty - 0.18, w: fw - 0.3, h: 0.36, fontFace: HAND, fontSize: 10, color: C.text1, align: "center", valign: "middle", rotate: rot });
    }
    if (tapeN != null) { const [ax, ay] = off(0, -fh / 2, rot); tape(s, cx + ax, cy + ay, rot + (tapeN % 2 ? 4 : -5), tapeN); }
  }
  // Plain photo with tape
  function photo(s, file, x, y, w, h, rot, tapeN, alt) {
    s.addImage({ path: A + file, x, y, w, h, rotate: rot, altText: alt });
    if (tapeN != null) { const [ax, ay] = off(0, -h / 2, rot); tape(s, x + w / 2 + ax, y + h / 2 + ay, rot - 6, tapeN); }
  }
  const mark = (s, f, x, y, w, h, rot, alt) => s.addImage({ path: A + f, x, y, w, h, rotate: rot || 0, altText: alt || "Handgezeichnetes Element" });
  // Paper note with rotated text inside (text box shares the note's geometry so both rotate together)
  function note(s, x, y, w, h, rot, runs, tapeN, fill) {
    s.addShape(S.RECTANGLE, { x, y, w, h, rotate: rot, fill: { color: fill || C.accent6 }, line: { color: fill || C.accent6, width: 0 }, shadow: shadow(), objectName: "Notizzettel" });
    T(s, runs, { x, y, w, h, rotate: rot, margin: [22, 24, 18, 24], lineSpacingMultiple: 1.22 });
    if (tapeN != null) { const [ax, ay] = off(0, -h / 2, rot); tape(s, x + w / 2 + ax, y + h / 2 + ay, rot + 3, tapeN); }
  }
  return { C, S, T, caps, serif, hand, label, polaroid, photo, mark, note, tape };
}

// ======================= MEDIA-KIT =======================
async function mediaKit() {
  const pres = setup("Media-Kit Lena Hoffmann");
  const { C, S, T, caps, serif, hand, label, polaroid, photo, mark, note } = kit(pres);
  const CREAM = C.background2;

  // 1 Cover
  pres.addSection({ title: "Media-Kit" });
  let s = pres.addSlide({ masterName: "Sand", sectionTitle: "Media-Kit" });
  label(s, "UGC-CREATORIN · BEAUTY & LIFESTYLE", { x: M, y: 0.4, w: 5, h: 0.25 });
  label(s, "@LENA.CREATES", { x: W - M - 2.5, y: 0.4, w: 2.5, h: 0.25, align: "right" });
  caps(s, "MEDIA", { x: M - 0.06, y: 0.9, w: 7.3, h: 2.3, fontSize: 168 });
  photo(s, "cover_big.jpg", 3.25, 2.75, 4.3, 5.8, 2.5, 0, "Lena mit Handcreme auf dem Balkon");
  caps(s, "KIT", { x: M - 0.04, y: 2.85, w: 4, h: 2.3, fontSize: 168, color: C.accent1 });
  polaroid(s, "cover_pol.jpg", 1.78, 7.0, 2.2, 2.6, -6, "Sonntag in Leipzig", 1, "Lena in der Stadt mit Kaffee");
  serif(s, [{ text: "Lena ", options: {} }, { text: "Hoffmann", options: { italic: true } }], { x: M, y: 9.05, w: 6, h: 0.8, fontSize: 40 });
  hand(s, "hi, schön, dass du da bist!", { x: 4.75, y: 9.95, w: 3.0, h: 0.45, fontSize: 11, rotate: -4 });
  mark(s, "arrow_terra_l.png", 3.75, 9.6, 1.1, 0.66, 14);
  T(s, "Hautpflege · Kaffee · Wohnen · Alltag", { x: M, y: 10.85, w: 4, h: 0.25, fontSize: 9.5 });
  T(s, "Media-Kit 2026", { x: W - M - 2, y: 10.85, w: 2, h: 0.25, fontSize: 9.5, align: "right" });

  // 2 Über mich
  s = pres.addSlide({ masterName: "Dunkel", sectionTitle: "Media-Kit" });
  caps(s, "ÜBER MICH", { x: M, y: 0.55, w: 7, h: 1.6, fontSize: 104, color: CREAM });
  polaroid(s, "mk2_pol.jpg", 5.75, 4.15, 3.0, 3.4, 3.5, "das bin ich :)", 2, "Lena lacht auf dem Sofa");
  serif(s, "Hallo, ich bin Lena.", { x: M, y: 2.45, w: 3.7, h: 0.5, fontSize: 22, italic: true, color: CREAM });
  T(s, "Ich bin 27, wohne in Leipzig und drehe seit 2023 Videos für Marken aus Hautpflege, Kaffee und Wohnen. Angefangen hat alles mit meiner eigenen Morgenroutine auf TikTok.\n\nIch mag Videos, die nicht nach Werbung aussehen, sondern nach einem ganz normalen Dienstagmorgen. Genau das kaufen mir die Leute ab.",
    { x: M, y: 3.1, w: 3.5, h: 2.6, fontSize: 10.5, color: CREAM, lineSpacingMultiple: 1.35 });
  label(s, "AM LIEBSTEN FILME ICH", { x: M, y: 5.85, w: 3.5, h: 0.25, color: C.accent2 });
  T(s, "Hautpflege\nKaffee und Frühstück\nWohnen und Deko\nAlltag in der Stadt", { x: M, y: 6.15, w: 3.5, h: 1.2, fontSize: 11, color: CREAM, lineSpacingMultiple: 1.3 });
  photo(s, "mk2_bts.jpg", M, 7.6, 3.4, 3.35, -2, 0, "Lena beim Aufbau eines Drehs");
  polaroid(s, "mk2_small.jpg", 5.85, 8.75, 2.3, 2.3, 5, "Skripte schreibe ich von Hand", 1, "Lena schreibt in ein Notizbuch");
  hand(s, "so sieht ein Drehtag aus", { x: 4.35, y: 10.6, w: 3.0, h: 0.4, fontSize: 10, color: CREAM, rotate: -2 });
  mark(s, "arrow_cream_l.png", 3.75, 10.15, 0.9, 0.54, 20);

  // 3 Community
  s = pres.addSlide({ masterName: "Sand", sectionTitle: "Media-Kit" });
  caps(s, "MEINE", { x: M, y: 0.5, w: 4.5, h: 1.6, fontSize: 110 });
  serif(s, "Community", { x: M, y: 1.95, w: 4.5, h: 0.9, fontSize: 50, italic: true, color: C.accent1 });
  polaroid(s, "mk3_pol.jpg", 5.95, 2.75, 2.6, 3.0, 4, "mein meistgesehenes Video", 2, "Lena mit Keramikdose");
  caps(s, "24,8K", { x: M, y: 3.05, w: 4, h: 1.6, fontSize: 112, color: C.accent1 });
  T(s, "Follower auf TikTok", { x: M, y: 4.65, w: 3, h: 0.3, fontSize: 11, bold: true });
  [["9.100", "Follower auf Instagram"], ["18K", "Aufrufe pro Video im Schnitt"], ["6,4 %", "Engagement-Rate"], ["210", "Videos seit 2023"]].forEach(([v, l], i) => {
    const x = M + (i % 2) * 1.95, y = 5.3 + Math.floor(i / 2) * 1.05;
    caps(s, v, { x, y, w: 1.8, h: 0.6, fontSize: 38 });
    T(s, l, { x, y: y + 0.6, w: 1.8, h: 0.3, fontSize: 9 });
  });
  serif(s, "Wer zuschaut", { x: 4.65, y: 5.3, w: 3, h: 0.45, fontSize: 20, italic: true });
  caps(s, "82 %", { x: 4.65, y: 5.85, w: 2.5, h: 1.0, fontSize: 64 });
  mark(s, "circle_terra.png", 4.4, 5.75, 2.3, 1.05, -3);
  T(s, "Frauen, die meisten zwischen 25 und 34", { x: 4.65, y: 6.9, w: 2.9, h: 0.45, fontSize: 9.5 });
  s.addShape(S.LINE, { x: M, y: 7.8, w: W - 2 * M, h: 0, line: { color: C.text1, width: 0.75 } });
  label(s, "ALTER", { x: M, y: 8.05, w: 2, h: 0.25 });
  [["18–24", 31], ["25–34", 47], ["35–44", 15], ["45+", 7]].forEach(([a, p], i) => {
    const y = 8.45 + i * 0.47;
    T(s, a, { x: M, y, w: 0.7, h: 0.28, fontSize: 10, valign: "middle" });
    s.addShape(S.RECTANGLE, { x: M + 0.75, y: y + 0.07, w: 2.3 * p / 47, h: 0.15, fill: { color: i === 1 ? C.accent1 : C.text1 }, line: { color: C.text1, width: 0 } });
    T(s, p + " %", { x: M + 0.85 + 2.3 * p / 47, y, w: 0.7, h: 0.28, fontSize: 10, valign: "middle" });
  });
  label(s, "WOHER", { x: 4.65, y: 8.05, w: 2, h: 0.25 });
  [["Deutschland", "71 %"], ["Österreich", "14 %"], ["Schweiz", "9 %"], ["andere", "6 %"]].forEach(([a, p], i) => {
    const y = 8.45 + i * 0.47;
    T(s, a, { x: 4.65, y, w: 1.8, h: 0.28, fontSize: 10, valign: "middle" });
    serif(s, p, { x: 6.45, y: y - 0.04, w: 1.2, h: 0.34, fontSize: 15, align: "right", valign: "middle" });
  });
  hand(s, "Stand: Oktober 2026", { x: M, y: 10.6, w: 3, h: 0.4, fontSize: 10, rotate: -2 });

  // 4 Pakete
  s = pres.addSlide({ masterName: "Rose", sectionTitle: "Media-Kit" });
  caps(s, "PAKETE", { x: M, y: 0.5, w: 5, h: 1.6, fontSize: 116 });
  serif(s, "& Preise", { x: M, y: 1.95, w: 4, h: 0.9, fontSize: 50, italic: true, color: C.accent1 });
  polaroid(s, "mk4_unbox.jpg", 6.25, 2.15, 2.3, 2.3, 6, "Unboxing für nordlicht", 0, "Hände öffnen ein Paket");
  const pk = [
    ["STARTER", "1 Video mit 15 bis 30 Sekunden\nUntertitel und eine Überarbeitung", "180 €", false],
    ["STANDARD", "3 Videos mit je 15 bis 30 Sekunden\n2 Hook-Varianten und alle Rohdaten", "520 €", true],
    ["PREMIUM", "5 Videos und 5 Produktfotos\n3 Hook-Varianten, 30 Tage Werbenutzung", "890 €", false],
  ];
  pk.forEach(([n, d, p, dark], i) => {
    const y = 4.05 + i * 1.85;
    if (dark) s.addShape(S.RECTANGLE, { x: 0.35, y: y - 0.15, w: W - 0.7, h: 1.75, fill: { color: C.accent3 }, line: { color: C.accent3, width: 0 }, rotate: -1, objectName: "Hervorgehobenes Paket" });
    else s.addShape(S.LINE, { x: M, y: y - 0.12, w: W - 2 * M, h: 0, line: { color: C.text1, width: 0.75 } });
    const col = dark ? CREAM : C.text1;
    caps(s, n, { x: M + 0.15, y: y + 0.05, w: 3.5, h: 0.6, fontSize: 34, color: col });
    T(s, d, { x: M + 0.15, y: y + 0.72, w: 4.3, h: 0.7, fontSize: 10.5, color: col, lineSpacingMultiple: 1.3 });
    serif(s, p, { x: W - M - 2.35, y: y + 0.2, w: 2.2, h: 0.8, fontSize: 40, color: dark ? CREAM : C.text1, align: "right" });
  });
  hand(s, "am beliebtesten!", { x: 5.35, y: 5.25, w: 2.4, h: 0.4, fontSize: 11, rotate: -5 });
  label(s, "EXTRAS", { x: M, y: 9.6, w: 2, h: 0.25 });
  [["Express in 48 Stunden", "+ 25 %"], ["Weitere Überarbeitung", "40 €"], ["Werbenutzung pro Monat", "+ 15 %"], ["Rohmaterial einzeln", "60 €"]].forEach(([a, b], i) => {
    const x = M + (i % 2) * 3.65, y = 9.92 + Math.floor(i / 2) * 0.33;
    T(s, a, { x, y, w: 2.5, h: 0.28, fontSize: 10, valign: "middle" });
    T(s, b, { x: x + 2.5, y, w: 0.8, h: 0.28, fontSize: 10, bold: true, align: "right", valign: "middle" });
  });
  T(s, "Alle Preise zzgl. MwSt. Die organische Nutzung für 12 Monate ist immer dabei.", { x: M, y: 10.85, w: 6, h: 0.25, fontSize: 8.5, color: C.text2 });

  // 5 Arbeitsproben
  s = pres.addSlide({ masterName: "Dunkel", sectionTitle: "Media-Kit" });
  caps(s, "ARBEITSPROBEN", { x: M, y: 0.55, w: 7.2, h: 1.3, fontSize: 76, color: CREAM });
  mark(s, "star_cream.png", 6.85, 1.75, 0.55, 0.55, 12);
  const ph = [["phone1.png", 0.5, 2.3, -5, "Serum-Routine", "412.000 Aufrufe"], ["phone2.png", 2.96, 2.0, 0, "Iced Latte", "96.000 Aufrufe"], ["phone3.png", 5.42, 2.3, 5, "Abendroutine", "1,2 Mio. Aufrufe"]];
  ph.forEach(([f, x, y, r, a, b]) => {
    s.addImage({ path: A + f, x, y, w: 2.35, h: 4.935, rotate: r, altText: "Video: " + a });
    T(s, a, { x: x, y: y + 5.15, w: 2.35, h: 0.4, fontFace: HAND, fontSize: 11, color: CREAM, align: "center" });
    T(s, b, { x: x, y: y + 5.55, w: 2.35, h: 0.25, fontSize: 9, color: C.accent5, align: "center" });
  });
  serif(s, "„Kein Teleprompter, kein Skript zum Ablesen. Ich erkläre Produkte so, wie ich sie meiner Schwester erklären würde.“",
    { x: M, y: 8.95, w: 6.6, h: 1.4, fontSize: 21, italic: true, color: CREAM, lineSpacingMultiple: 1.15 });
  T(s, "Mehr Videos auf TikTok und Instagram: @lena.creates", { x: M, y: 10.85, w: 6, h: 0.25, fontSize: 9.5, color: C.accent5 });

  // 6 Marken & Stimmen
  s = pres.addSlide({ masterName: "Sand", sectionTitle: "Media-Kit" });
  caps(s, "MARKEN", { x: M, y: 0.5, w: 5, h: 1.6, fontSize: 116 });
  serif(s, "& Stimmen", { x: M, y: 1.95, w: 4, h: 0.9, fontSize: 50, italic: true, color: C.accent1 });
  hand(s, "danke für euer Vertrauen!", { x: 4.7, y: 2.25, w: 2.8, h: 0.45, fontSize: 11, rotate: 5 });
  const brands = [
    ["nordlicht", { fontFace: SERIF, fontSize: 26 }], ["KAFFEEWERK", { fontFace: CAPS, fontSize: 22, charSpacing: 3 }], ["Mila & Moos", { fontFace: SERIF, fontSize: 24, italic: true }],
    ["HAUT.LABOR", { fontFace: BODY, fontSize: 17, bold: true, charSpacing: 2 }], ["feldstück", { fontFace: HAND, fontSize: 15 }], ["OSTWIND", { fontFace: SERIF, fontSize: 21, charSpacing: 5 }],
  ];
  brands.forEach(([n, o], i) => {
    const x = M + (i % 3) * 2.36, y = 3.35 + Math.floor(i / 3) * 0.95;
    T(s, n, Object.assign({ x, y, w: 2.3, h: 0.7, align: "center", valign: "middle", color: C.text1 }, o));
  });
  T(s, "Die Markennamen sind Beispiele. Trag hier deine echten Kunden ein.", { x: M, y: 5.35, w: 6, h: 0.25, fontSize: 8, italic: true, color: C.text2 });
  note(s, 0.7, 6.05, 3.45, 3.2, -2.5, [
    { text: "„Lena hat unser Serum besser erklärt als unsere eigene Produktseite. Das Video läuft seit vier Monaten als Anzeige.“", options: { fontFace: SERIF, italic: true, fontSize: 14, breakLine: true, paraSpaceAfter: 10 } },
    { text: "Julia, Marketing bei nordlicht", options: { fontSize: 9, bold: true } }], 0);
  note(s, 4.25, 6.55, 3.35, 3.0, 2.5, [
    { text: "„Pünktlich, unkompliziert und mit eigenen Ideen. Wir haben direkt das nächste Paket gebucht.“", options: { fontFace: SERIF, italic: true, fontSize: 14, breakLine: true, paraSpaceAfter: 10 } },
    { text: "Tom, Gründer von Kaffeewerk", options: { fontSize: 9, bold: true } }], 2);
  mark(s, "star_terra.png", 7.0, 9.75, 0.45, 0.45, -10);
  [["38", "Kooperationen seit 2023"], ["94 %", "der Marken buchen nochmal"]].forEach(([v, l], i) => {
    const x = M + i * 3.0;
    caps(s, v, { x, y: 9.85, w: 2.6, h: 0.8, fontSize: 50, color: C.accent1 });
    T(s, l, { x, y: 10.68, w: 2.6, h: 0.3, fontSize: 9.5 });
  });

  // 7 Kontakt
  s = pres.addSlide({ masterName: "Dunkel", sectionTitle: "Media-Kit" });
  s.addImage({ path: A + "mk7.jpg", x: 0, y: 0, w: W, h: 6.2, altText: "Lena winkt auf einer Treppe" });
  caps(s, "LASS UNS", { x: M, y: 6.55, w: 7, h: 1.2, fontSize: 84, color: CREAM });
  serif(s, "zusammenarbeiten", { x: M, y: 7.65, w: 7, h: 0.85, fontSize: 46, italic: true, color: C.accent2 });
  [["E-MAIL", "hallo@deinewebsite.de"], ["TIKTOK & INSTAGRAM", "@lena.creates"], ["ORT", "Leipzig, Drehs in ganz Deutschland"]].forEach(([a, b], i) => {
    const y = 8.9 + i * 0.68;
    label(s, a, { x: M, y, w: 3, h: 0.22, color: C.accent5 });
    serif(s, b, { x: M, y: y + 0.22, w: 4.6, h: 0.38, fontSize: 16, color: CREAM });
  });
  hand(s, "ich antworte meistens noch am selben Tag", { x: 5.1, y: 8.75, w: 2.6, h: 0.8, fontSize: 10, color: CREAM, rotate: -4 });
  mark(s, "arrow_cream_l.png", 3.85, 9.05, 1.0, 0.6, 12);
  T(s, "Media-Kit 2026 · Lena Hoffmann", { x: M, y: 11.1, w: 4, h: 0.25, fontSize: 8.5, color: C.accent5 });

  await pres.writeFile({ fileName: "Media-Kit.pptx" });
  await applyTheme("Media-Kit.pptx", THEME);
}

// ======================= PITCH-GUIDE =======================
async function pitchGuide() {
  const pres = setup("Pitch-Guide");
  const { C, S, T, caps, serif, hand, label, polaroid, photo, mark, note } = kit(pres);
  const CREAM = C.background2;

  pres.addSection({ title: "Pitch-Guide" });
  let s = pres.addSlide({ masterName: "Dunkel", sectionTitle: "Pitch-Guide" });
  label(s, "UGC STARTER-KIT · TEIL 2", { x: M, y: 0.4, w: 5, h: 0.25, color: C.accent5 });
  caps(s, "PITCH", { x: M - 0.05, y: 0.95, w: 7, h: 2.1, fontSize: 160, color: CREAM });
  serif(s, "Guide", { x: M, y: 3.0, w: 5, h: 1.0, fontSize: 64, italic: true, color: C.accent2 });
  T(s, "Fünf Mails und 15 Betreffzeilen für deine ersten Kooperationen. Einfach kopieren, anpassen, abschicken.", { x: M, y: 4.2, w: 4.2, h: 0.8, fontSize: 11, color: CREAM, lineSpacingMultiple: 1.3 });
  polaroid(s, "pg_cover.jpg", 5.35, 7.45, 3.2, 3.8, -3, "Montag, 9 Uhr: Pitch-Zeit", 1, "Lena schreibt in ihr Notizbuch");
  T(s, [["01", "Die erste Anfrage"], ["02", "Die Antwort"], ["03", "Deine Idee pitchen"], ["04", "Freundlich nachfassen"], ["05", "Preis und Budget"], ["+", "15 Betreffzeilen"], ["+", "Checkliste"]].flatMap(([n, t], i, arr) => [
    { text: n + "   ", options: { color: C.accent2, bold: true } }, { text: t, options: { breakLine: i < arr.length - 1 } }]),
    { x: M, y: 6.5, w: 2.8, h: 2.6, fontSize: 10.5, color: CREAM, lineSpacingMultiple: 1.6 });

  const mails = [
    { n: "01", t: "DIE ERSTE ANFRAGE", wann: "Für den ersten Kontakt mit einer Marke.", subj: "Videoidee für euer Hydra-Serum",
      body: "Hallo liebes nordlicht-Team,\n\nich bin Lena, UGC-Creatorin aus Leipzig, und filme vor allem Hautpflege und Morgenroutinen. Euer Hydra-Serum ist mir letzte Woche in der Drogerie aufgefallen, vor allem wegen der Glasflasche mit Pipette.\n\nIch hätte eine Idee für ein kurzes Video: meine Morgenroutine in 30 Sekunden, mit eurem Serum als letztem Schritt.\n\nHier ist mein Media-Kit mit Arbeitsproben: deinewebsite.de/mediakit\n\nWenn UGC für euch gerade ein Thema ist, schicke ich euch gern ein konkretes Angebot.\n\nViele Grüße\nLena Hoffmann",
      notes: [["Produkt konkret nennen!", 0.28], ["Link zum Media-Kit nicht vergessen", 0.62]] },
    { n: "02", t: "DIE ANTWORT", wann: "Wenn eine Marke dich zuerst anfragt.", subj: "Re: UGC-Anfrage Herbstkampagne",
      body: "Hallo Anna,\n\ndanke für deine Nachricht, eure Herbstkampagne klingt spannend! Damit ich dir ein passendes Angebot schicken kann, habe ich drei kurze Fragen:\n\n1. Welche Formate und wie viele Videos plant ihr?\n2. Bis wann braucht ihr die Inhalte?\n3. Wo und wie lange sollen die Videos laufen?\n\nMein Media-Kit findest du hier: deinewebsite.de/mediakit\n\nViele Grüße\nLena",
      notes: [["erst fragen, dann Preis nennen", 0.4]] },
    { n: "03", t: "DEINE IDEE PITCHEN", wann: "Wenn du ein konkretes Video vorschlagen willst.", subj: "Idee für euer Hydra-Serum",
      body: "Hallo Anna,\n\nich hätte eine Idee für euer Hydra-Serum: Ich zeige meine Morgenroutine im echten Badezimmerlicht, erst mit müder Haut, am Ende mit frischem Glow.\n\nDie ersten drei Sekunden: „Ich habe sieben Seren getestet. Dieses ist geblieben.“\n\nGeplant wären drei Videos mit je 20 bis 30 Sekunden. Arbeitsproben findest du in meinem Media-Kit.\n\nWenn dir die Richtung gefällt, schicke ich dir gern ein Angebot.\n\nViele Grüße\nLena",
      notes: [["die ersten 3 Sekunden entscheiden", 0.42]] },
    { n: "04", t: "FREUNDLICH NACHFASSEN", wann: "Wenn nach einer Woche keine Antwort kam.", subj: "Kurze Rückfrage zu meiner Videoidee",
      body: "Hallo Anna,\n\nich wollte kurz nachfragen, ob meine Mail vom 14. Oktober bei dir angekommen ist. Die Idee zu eurem Hydra-Serum würde ich gern weiter ausarbeiten.\n\nUnd falls UGC gerade nicht passt, ist das völlig okay. Dann melde ich mich einfach nicht noch einmal.\n\nViele Grüße\nLena",
      notes: [["höchstens 1x nachfassen", 0.4]] },
    { n: "05", t: "PREIS UND BUDGET", wann: "Wenn die Marke nach deinem Preis fragt.", subj: "Re: Angebot Herbstkampagne",
      body: "Hallo Anna,\n\ndanke, dass du das Budget so offen nennst. Für drei Videos und zwei Hook-Varianten liegt mein Preis bei 520 €. Dabei sind eine Überarbeitungsrunde und die organische Nutzung für zwölf Monate.\n\nWenn das Budget nicht ganz reicht, können wir auch kleiner starten, zum Beispiel mit zwei Videos für 360 €.\n\nViele Grüße\nLena",
      notes: [["lieber Umfang kürzen als den Preis", 0.45]] },
  ];
  const mailRuns = (m) => [
    { text: m.n + "  " + m.t, options: { fontFace: CAPS, fontSize: 22, breakLine: true, paraSpaceAfter: 2 } },
    { text: m.wann, options: { fontFace: SERIF, italic: true, fontSize: 11.5, color: C.text2, breakLine: true, paraSpaceAfter: 10 } },
    { text: "Betreff: ", options: { fontSize: 10, color: C.text2 } },
    { text: m.subj, options: { fontSize: 10, bold: true, breakLine: true, paraSpaceAfter: 10 } },
  ].concat((() => {
    const out = [], paras = m.body.split("\n\n");
    paras.forEach((p, pi) => p.split("\n").forEach((ln, li, arr) => {
      const last = pi === paras.length - 1 && li === arr.length - 1;
      out.push({ text: ln, options: { fontSize: 9.5, breakLine: !last, paraSpaceAfter: li === arr.length - 1 ? 7 : 0 } });
    }));
    return out;
  })());
  const NX = 0.6, NW = 5.25;
  const place = (s, m, y, h, rot, tn) => {
    note(s, NX, y, NW, h, rot, mailRuns(m), tn);
    m.notes.forEach(([t, fy], k) => {
      hand(s, t, { x: 6.05, y: y + h * fy, w: 1.75, h: 0.75, fontSize: 9.5, rotate: k % 2 ? 4 : -4 });
      mark(s, "arrow_terra_l.png", 5.55, y + h * fy - 0.25, 0.7, 0.42, 25);
    });
  };
  pres.addSection({ title: "Mails" });
  s = pres.addSlide({ masterName: "Sand", sectionTitle: "Mails" });
  place(s, mails[0], 0.75, 5.35, -1, 0); place(s, mails[1], 6.55, 4.55, 1, 2);
  s = pres.addSlide({ masterName: "Sand", sectionTitle: "Mails" });
  place(s, mails[2], 0.75, 5.0, 1, 1); place(s, mails[3], 6.35, 3.6, -1.2, 0);
  hand(s, "Tipp: Mails am Dienstag- oder Mittwochvormittag verschicken", { x: 0.9, y: 10.4, w: 5, h: 0.6, fontSize: 9.5, color: C.text1, rotate: -1.5 });

  s = pres.addSlide({ masterName: "Sand", sectionTitle: "Mails" });
  place(s, mails[4], 0.75, 3.9, -1, 2);
  caps(s, "15 BETREFFZEILEN", { x: M, y: 5.2, w: 7, h: 0.9, fontSize: 48 });
  serif(s, "zum Ausprobieren", { x: M, y: 5.95, w: 5, h: 0.6, fontSize: 24, italic: true, color: C.accent1 });
  const groups = [
    ["Erste Anfrage", ["Morgenroutine mit nordlicht: eine kurze Idee", "UGC-Creatorin für Hautpflege, passt das zu euch?", "Kleine Videoidee zu eurem Serum"]],
    ["Antwort", ["Re: Ein paar Fragen zu eurer Herbstkampagne", "Re: Kurze Rückfragen für mein Angebot", "Re: Ich bin dabei, noch drei Fragen"]],
    ["Idee", ["Hook-Idee für euer Hydra-Serum", "So würde ich euer Serum zeigen", "Drei Videos für eure Herbstkampagne"]],
    ["Nachfassen", ["Noch aktuell? Meine Idee zu eurem Serum", "Kurze Erinnerung an meine Videoidee", "Re: Videoidee für euer Hydra-Serum"]],
    ["Preis", ["Re: Angebot in zwei Varianten", "Re: Budget und Umfang Herbstkampagne", "Re: Mein Angebot für drei Videos"]],
  ];
  groups.forEach(([g, ls], i) => {
    const x = i < 3 ? M : 4.3, y = 6.75 + (i < 3 ? i : i - 3) * 1.4;
    label(s, g.toUpperCase(), { x, y, w: 3.3, h: 0.22, color: C.accent1 });
    T(s, ls.join("\n"), { x, y: y + 0.27, w: 3.4, h: 0.95, fontSize: 9.5, lineSpacingMultiple: 1.35 });
  });

  pres.addSection({ title: "Checkliste" });
  s = pres.addSlide({ masterName: "Rose", sectionTitle: "Checkliste" });
  caps(s, "VOR DEM", { x: M, y: 0.5, w: 6, h: 1.6, fontSize: 104 });
  serif(s, "Absenden", { x: M, y: 1.95, w: 5, h: 0.9, fontSize: 50, italic: true, color: C.accent1 });
  polaroid(s, "pg_unbox.jpg", 6.35, 2.85, 2.1, 2.1, 5, "gleich geht's los", 0, "Hände öffnen ein Paket");
  ["Der Name der Ansprechperson stimmt.", "Du nennst ein konkretes Produkt der Marke.", "Alle Links funktionieren.", "Umfang, Lieferzeit und Nutzung sind klar.",
   "Deine Preise sind aktuell.", "Alle Beispieltexte sind ersetzt.", "Die Rechtschreibung ist geprüft.", "Der Termin zum Nachfassen steht im Kalender."].forEach((t, i) => {
    const y = 4.0 + i * 0.72;
    s.addShape(S.RECTANGLE, { x: M, y: y + 0.08, w: 0.26, h: 0.26, fill: { color: C.accent6 }, line: { color: C.text1, width: 1 } });
    if (i < 2) mark(s, "check_terra.png", M - 0.05, y - 0.1, 0.45, 0.45, 0);
    T(s, t, { x: M + 0.5, y, w: 6.5, h: 0.42, fontSize: 13, valign: "middle" });
  });
  T(s, "Dieses Kit ist keine Rechtsberatung und enthält keinen Vertrag. Für Kooperationen mit Nutzungsrechten empfiehlt sich ein schriftlicher Vertrag. Das Kit garantiert keine Kooperationen oder Einnahmen.",
    { x: M, y: 10.5, w: 6.2, h: 0.55, fontSize: 8, color: C.text2 });

  await pres.writeFile({ fileName: "Pitch-Guide.pptx" });
  await applyTheme("Pitch-Guide.pptx", THEME);
}

(async () => { await mediaKit(); await pitchGuide(); console.log("written"); })();
