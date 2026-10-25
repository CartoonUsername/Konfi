// Shared building blocks for every template in the shop (same look as the UGC Starter-Kit).
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const { applyTheme } = require("/root/.claude/skills/synced/7d806dbd-5dd6-4667-84c9-72658829b4b7_22d8ece4-65ab-428c-9049-f7d10f055204/pptx/scripts/apply_theme.js");

const POOL = path.join(__dirname, "pool") + "/";
const SIZES = JSON.parse(fs.readFileSync(POOL + "sizes.json"));
const STYLES = JSON.parse(fs.readFileSync(path.join(__dirname, "styles.json")));
const EXTRA = { terra: { capsLS: 0.82, capsW: 0.47 }, kobalt: { capsLS: 0.9, capsW: 0.78 }, rosa: { capsLS: 0.9, capsW: 0.8, serifNoItalic: true }, mono: { capsLS: 0.95, capsW: 0.66, capsBold: true }, salbei: { capsLS: 0.9, capsW: 0.66, capsBold: true }, noir: { capsLS: 0.95, capsW: 0.62 }, zitrus: { capsLS: 1.0, capsW: 1.02 }, lavendel: { capsLS: 0.95, capsW: 1.15 } };
const FORMATS = { A4: [8.27, 11.69], A4Q: [11.69, 8.27], POST: [7.5, 9.375], STORY: [6.75, 12] };
const rad = (d) => (d * Math.PI) / 180;

function create(title, format, styleName) {
  styleName = styleName || "terra";
  const st = Object.assign({}, STYLES[styleName], EXTRA[styleName]);
  const CAPS = st.caps, SERIF = st.serif, HAND = st.hand, BODY = st.body, SP = POOL + styleName + "/";
  const THEME = { name: "Creator Studio " + styleName, headFontFace: CAPS, bodyFontFace: BODY,
    colors: { dk1: st.ink, lt1: "FFFFFF", dk2: st.muted, lt2: st.paper, accent1: st.accent, accent2: st.soft, accent3: st.dark, accent4: st.ink2, accent5: st.line, accent6: st.note, hlink: st.accent, folHlink: st.muted } };
  const [W, H] = FORMATS[format];
  const pres = new pptxgen();
  pres.defineLayout({ name: "F", width: W, height: H });
  pres.layout = "F";
  pres.title = title;
  pres.theme = { headFontFace: CAPS, bodyFontFace: BODY };
  for (const [n, f] of [["Sand", "bg_light.jpg"], ["Dunkel", "bg_dark.jpg"], ["Rose", "bg_alt.jpg"]])
    pres.defineSlideMaster({ title: n, background: { path: SP + f }, objects: [] });
  const C = pres.SchemeColor, S = pres.shapes;
  const k = { pres, C, S, W, H, M: Math.min(W, H) * 0.0725, CREAM: C.background2, CAPS, SERIF, HAND, BODY, style: styleName, st };

  k.page = (bg) => pres.addSlide({ masterName: bg || "Sand" });
  k.T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, valign: "top", color: C.text1, fontFace: BODY, fontSize: 10.5 }, o));
  k.fit = (text, w, size) => { const n = Math.max(...String(text).split("\n").map((l) => l.length)); return Math.min(size, Math.floor((w * 72 * 0.96) / (n * st.capsW))); };
  k.caps = (s, text, o) => { o = Object.assign({ fontFace: CAPS, lineSpacingMultiple: st.capsLS, bold: !!st.capsBold }, o); if (typeof text === "string" && o.w && !o.noFit) o.fontSize = k.fit(text, o.w, o.fontSize || 10.5); return k.T(s, text, o); };
  k.serif = (s, text, o) => { o = Object.assign({ fontFace: SERIF }, o); if (st.serifNoItalic) delete o.italic; if (Array.isArray(text) && st.serifNoItalic) text.forEach((r) => r.options && delete r.options.italic); return k.T(s, text, o); };
  k.hand = (s, text, o) => { o = Object.assign({ fontFace: HAND, fontSize: 11, color: C.accent1 }, o); o.fontSize = Math.round(o.fontSize * ({ Caveat: 1.25, "Reenie Beanie": 1.45, "Gochi Hand": 1.1, Kalam: 0.95, "Nothing You Could Do": 0.95, "Shadows Into Light": 1.25, "Indie Flower": 1.15 }[HAND] || 1) * 2) / 2; return k.T(s, text, o); };
  k.label = (s, text, o) => k.T(s, text, Object.assign({ fontSize: 8, bold: true, charSpacing: 2 }, o));
  k.rule = (s, x, y, w, color, width) => s.addShape(S.LINE, { x, y, w, h: 0, line: { color: color || C.accent3, width: width || 0.75 } });
  k.vrule = (s, x, y, h, color) => s.addShape(S.LINE, { x, y, w: 0, h, line: { color: color || C.accent5, width: 0.75 } });
  k.box = (s, x, y, w, h, fill, o) => s.addShape(S.RECTANGLE, Object.assign({ x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 } }, o));
  k.frame = (s, x, y, w, h, color, o) => s.addShape(S.RECTANGLE, Object.assign({ x, y, w, h, fill: { color: C.background1, transparency: 100 }, line: { color: color || C.text1, width: 0.75 } }, o));
  k.shadow = () => ({ type: "outer", color: "000000", blur: 7, offset: 2.5, angle: 90, opacity: 0.22 });
  const off = (vx, vy, r) => [vx * Math.cos(rad(r)) - vy * Math.sin(rad(r)), vx * Math.sin(rad(r)) + vy * Math.cos(rad(r))];
  k.tape = (s, cx, cy, rot, n, w) => { w = w || 1.3; s.addImage({ path: SP + `tape${(n || 0) % 3}.png`, x: cx - w / 2, y: cy - w * 0.142, w, h: w * 0.285, rotate: rot, altText: "Klebeband" }); };
  k.mark = (s, f, x, y, w, h, rot) => s.addImage({ path: SP + f, x, y, w, h, rotate: rot || 0, altText: "Handgezeichnetes Element" });
  // Photo from the pool, cropped to the box (fx/fy choose the visible part).
  k.photo = (s, key, x, y, w, h, o) => {
    o = o || {};
    const [iw, ih] = SIZES[key], r = iw / ih, b = w / h;
    let sw, sh; if (r > b) { sh = h; sw = h * r; } else { sw = w; sh = w / r; }
    const cx = (sw - w) * (o.fx == null ? 0.5 : o.fx), cy = (sh - h) * (o.fy == null ? 0.5 : o.fy);
    s.addImage({ path: POOL + key + ".jpg", x, y, w: sw, h: sh, sizing: { type: "crop", x: cx, y: cy, w, h }, rotate: o.rot || 0, altText: o.alt || "Beispielfoto" });
    if (o.tape != null) { const [ax, ay] = off(0, -h / 2, o.rot || 0); k.tape(s, x + w / 2 + ax, y + h / 2 + ay, (o.rot || 0) - 6, o.tape); }
  };
  k.polaroid = (s, key, cx, cy, iw, ih, rot, caption, tapeN, o) => {
    o = o || {};
    const fw = iw + 0.24, fh = ih + 0.79;
    s.addShape(S.RECTANGLE, { x: cx - fw / 2, y: cy - fh / 2, w: fw, h: fh, rotate: rot, fill: { color: C.background1 }, line: { color: C.background1, width: 0 }, shadow: k.shadow(), objectName: "Polaroid" });
    const [ix, iy] = off(0, -0.275, rot);
    k.photo(s, key, cx + ix - iw / 2, cy + iy - ih / 2, iw, ih, { rot, fx: o.fx, fy: o.fy, alt: o.alt });
    if (caption) { const [tx, ty] = off(0, fh / 2 - 0.3, rot); k.T(s, caption, { x: cx + tx - (fw - 0.3) / 2, y: cy + ty - 0.18, w: fw - 0.3, h: 0.36, fontFace: HAND, fontSize: Math.round((o.capSize || 10) * ({ Caveat: 1.25, "Reenie Beanie": 1.45, "Gochi Hand": 1.1, "Shadows Into Light": 1.25, "Indie Flower": 1.15 }[HAND] || 1)), color: C.text1, align: "center", valign: "middle", rotate: rot }); }
    if (tapeN != null) { const [ax, ay] = off(0, -fh / 2, rot); k.tape(s, cx + ax, cy + ay, rot + (tapeN % 2 ? 4 : -5), tapeN); }
  };
  k.note = (s, x, y, w, h, rot, runs, tapeN, o) => {
    o = o || {};
    s.addShape(S.RECTANGLE, { x, y, w, h, rotate: rot, fill: { color: o.fill || C.accent6 }, line: { color: o.fill || C.accent6, width: 0 }, shadow: k.shadow(), objectName: "Notizzettel" });
    k.T(s, runs, { x, y, w, h, rotate: rot, margin: o.margin || [20, 22, 16, 22], lineSpacingMultiple: o.ls || 1.25, fontSize: o.fontSize || 10, color: o.color });
    if (tapeN != null) { const [ax, ay] = off(0, -h / 2, rot); k.tape(s, x + w / 2 + ax, y + h / 2 + ay, rot + 3, tapeN); }
  };
  // Big title: CAPS word + serif italic accent line
  k.title = (s, capsText, serifText, x, y, o) => {
    o = o || {};
    const cs = k.fit(capsText, o.w || W - 2 * k.M, o.capsSize || 104), ss = o.serifSize || 48;
    const lh = (cs / 72) * 1.18 * st.capsLS, n = capsText.split("\n").length;
    k.caps(s, capsText, { x, y, w: o.w || W - 2 * k.M, h: lh * n + 0.1, fontSize: cs, color: o.capsColor || C.text1 });
    k.lastTitleBottom = y + lh * n + (serifText ? ss / 72 * 1.4 : 0);
    if (serifText) k.serif(s, serifText, { x, y: y + lh * n + (o.gap || 0), w: o.w || W - 2 * k.M, h: ss / 72 * 1.4, fontSize: ss, italic: true, color: o.serifColor || C.accent1 });
  };
  // Editable line field: label above, rule below (for forms)
  k.field = (s, lab, x, y, w, o) => {
    o = o || {};
    k.label(s, lab, { x, y, w, h: 0.2, color: o.labelColor || C.text2, fontSize: 7.5 });
    if (o.value) k.T(s, o.value, { x, y: y + 0.22, w, h: 0.3, fontSize: o.size || 10.5, color: o.color });
    k.rule(s, x, y + 0.55, w, o.lineColor || C.accent5);
  };
  // Simple editable table
  k.table = (s, rows, x, y, w, colW, o) => {
    o = o || {};
    const head = rows[0].map((t) => ({ text: t, options: { bold: true, fontSize: o.headSize || 8, color: o.headColor || C.background2, fill: { color: o.headFill || C.accent3 }, fontFace: BODY } }));
    const body = rows.slice(1).map((r, i) => r.map((t) => ({ text: t, options: { fontSize: o.size || 9, color: C.text1, fill: { color: i % 2 ? C.accent6 : C.background1 }, fontFace: BODY } })));
    s.addTable([head].concat(body), { x, y, w, colW, rowH: o.rowH || 0.32, valign: "middle", margin: [0, 0.08, 0, 0.08], border: { type: "solid", pt: 0.5, color: "D9CEC3" } });
  };
  k.checkbox = (s, x, y, size, checked) => {
    s.addShape(S.RECTANGLE, { x, y, w: size, h: size, fill: { color: C.accent6 }, line: { color: C.text1, width: 1 } });
    if (checked) k.mark(s, "check_terra.png", x - size * 0.2, y - size * 0.4, size * 1.7, size * 1.7);
  };
  k.phone = (s, key, x, y, w, rot) => s.addImage({ path: POOL + "phone_" + key + ".png", x, y, w, h: w * 2.1, rotate: rot || 0, altText: "Video-Arbeitsprobe" });
  k.pill = (s, text, x, y, w, h, fill, color, o) => { s.addShape(S.ROUNDED_RECTANGLE, Object.assign({ x, y, w, h, fill: { color: fill }, line: { color: (o && o.line) || fill, width: (o && o.line) ? 1 : 0 }, rectRadius: h / 2 }, o && o.shape)); k.T(s, text, Object.assign({ x, y, w, h, align: "center", valign: "middle", fontSize: 10, bold: true, color }, o && o.text)); };
  k.circlePhoto = (s, key, x, y, d, o) => { o = o || {}; s.addShape(S.OVAL, { x: x - 0.06, y: y - 0.06, w: d + 0.12, h: d + 0.12, fill: { color: o.ring || C.accent1 }, line: { color: o.ring || C.accent1, width: 0 } }); const [iw, ih] = SIZES[key]; const r = iw / ih; let sw, sh; if (r > 1) { sh = d; sw = d * r; } else { sw = d; sh = d / r; } s.addImage({ path: POOL + key + ".jpg", x, y, w: sw, h: sh, sizing: { type: "crop", x: (sw - d) * (o.fx == null ? 0.5 : o.fx), y: (sh - d) * (o.fy == null ? 0.3 : o.fy), w: d, h: d }, rounding: true, altText: o.alt || "Profilbild" }); };
  k.save = async (file) => { await pres.writeFile({ fileName: file }); await applyTheme(file, THEME); };
  return k;
}
module.exports = { create, FORMATS, POOL };
