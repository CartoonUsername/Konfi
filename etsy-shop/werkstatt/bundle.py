import zipfile, json, glob, os
B = os.path.dirname(os.path.abspath(__file__)); K = os.path.dirname(B)
S = json.load(open(B + "/styles.json"))
README = """LIES MICH

Danke für deinen Kauf!

SO BEARBEITEST DU DIE VORLAGEN
1. Canva: Auf canva.com "Erstellen" > "Importieren" und die .pptx-Datei hochladen.
2. PowerPoint oder Keynote: Die .pptx-Datei einfach öffnen.
3. Die .pdf-Datei ist die fertige Vorschau zum Ansehen oder Drucken.

SCHRIFTEN (kostenlos bei Google Fonts)
{fonts}
Fehlt eine Schrift, ersetzt Canva sie automatisch. Du kannst jede Schrift frei austauschen.

FOTOS
Die Beispielfotos wurden mit KI erstellt und zeigen keine echten Personen.
Ersetze sie durch deine eigenen Fotos.

NUTZUNG
Für deine eigene, auch geschäftliche Nutzung. Weiterverkauf oder Weitergabe
der Vorlagen ist nicht erlaubt. Die Inhalte sind keine Rechts- oder Steuerberatung.
"""
def items(slugs):
    out = []
    for sl in slugs:
        if sl == "01":
            out += [(K + "/" + f, "01-UGC-Starter-Kit/" + f) for f in ("Media-Kit.pdf", "Media-Kit.pptx", "Pitch-Guide.pdf", "Pitch-Guide.pptx")]; continue
        d = glob.glob(B + f"/dist/{sl}-*")[0]; m = json.load(open(d + "/meta.json"))
        out += [(f"{d}/{m['file']}.{e}", f"{os.path.basename(d)}/{m['file']}.{e}") for e in ("pdf", "pptx")]
    return out
def styles(slugs):
    st = {"terra"} if "01" in slugs else set()
    for sl in slugs:
        if sl != "01": st.add(json.load(open(glob.glob(B + f"/dist/{sl}-*")[0] + "/meta.json"))["style"])
    fs = sorted({S[s][k] for s in st for k in ("caps", "serif", "hand", "body")})
    return "\n".join("- " + f for f in fs)
LIMIT = 19.0e6
def make(name, slugs):
    # split into parts under Etsy's 20 MB per-file limit, keeping each product whole
    parts, cur, size = [], [], 0
    for sl in slugs:
        sz = sum(os.path.getsize(a) for a, _ in items([sl]))
        if cur and size + sz > LIMIT: parts.append(cur); cur, size = [], 0
        cur.append(sl); size += sz
    parts.append(cur)
    for i, ps in enumerate(parts):
        fn = name + (f"-Teil-{i + 1}-von-{len(parts)}" if len(parts) > 1 else "")
        z = zipfile.ZipFile(B + f"/bundles/{fn}.zip", "w", zipfile.ZIP_DEFLATED)
        for src, arc in items(ps): z.write(src, arc)
        z.writestr("LIES-MICH.txt", README.format(fonts=styles(slugs)))
        z.close(); print(fn, round(os.path.getsize(B + f"/bundles/{fn}.zip") / 1e6, 1), "MB")
make("19-Creator-Komplettpaket", ["01", "02", "03", "04", "05", "06", "07", "08", "09", "16", "17", "18"])
make("20-Content-Paket", ["10", "11", "12", "13", "14", "15"])
make("27-Abo-Creator-Komplettpaket", ["21", "22", "23", "24", "25", "26"])
# single product zips too (Etsy allows 5 files, a zip keeps PDF + PPTX + readme together)
os.makedirs(B + "/bundles/einzeln", exist_ok=True)
for d in sorted(glob.glob(B + "/dist/*/")):
    make("einzeln/" + os.path.basename(d.rstrip("/")), [os.path.basename(d.rstrip("/"))[:2]])
make("einzeln/01-ugc-starter-kit", ["01"])
