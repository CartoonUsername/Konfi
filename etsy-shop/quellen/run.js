// node run.js products/02-media-kit-1seite.js  -> dist/<slug>/<slug>.pptx
const path = require("path"), fs = require("fs");
const { create } = require("./lib");
(async () => {
  for (const f of process.argv.slice(2)) {
    const p = require(path.resolve(f));
    const k = create(p.title, p.format, p.style);
    await p.build(k);
    const dir = path.join(__dirname, "dist", p.slug); fs.mkdirSync(dir, { recursive: true });
    await k.save(path.join(dir, p.file + ".pptx"));
    fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ slug: p.slug, file: p.file, title: p.title, sub: p.sub, price: p.price, format: p.format, style: p.style || "terra", pills: p.pills || [] }, null, 1));
    console.log("built", p.slug);
  }
})();
