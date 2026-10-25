"""Etsy listing images (2700 x 2025) per product, in the product's own style.
usage: python3 etsy.py <slug> [...]   -> dist/<slug>/etsy/etsy-1..5.jpg"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np, os, sys, json, glob, subprocess

B = os.path.dirname(os.path.abspath(__file__))
F = (os.path.join(B, "fonts") + "/") if os.path.isdir(os.path.join(B, "fonts")) else os.path.expanduser("~/.fonts/")
S = json.load(open(B + "/styles.json"))
W, H = 2700, 2025
FONT = {"Anton": "anton-latin-400-normal", "Archivo Black": "archivo-black-400-normal", "Bagel Fat One": "bagel-fat-one-400-normal",
        "IBM Plex Sans": "ibm-plex-sans-700-normal", "Cormorant Garamond": "cormorant-garamond-600-normal", "Italiana": "italiana-400-normal",
        "Dela Gothic One": "dela-gothic-one-400-normal", "Syne": "syne-800-normal"}
SERIF = {"Bodoni Moda": "bodoni-moda-latin-400-italic", "Libre Baskerville": "libre-baskerville-400-italic", "Pacifico": "pacifico-400-normal",
         "Cormorant Garamond": "cormorant-garamond-400-italic", "DM Serif Display": "dm-serif-display-latin-400-italic", "Libre Caslon Text": "libre-caslon-text-400-italic"}
HAND = {"Homemade Apple": ("homemade-apple-latin-400-normal", 1.0), "Caveat": ("caveat-400-normal", 1.35), "Gochi Hand": ("gochi-hand-400-normal", 1.15),
        "Kalam": ("kalam-400-normal", 1.0), "Reenie Beanie": ("reenie-beanie-400-normal", 1.5), "Nothing You Could Do": ("nothing-you-could-do-400-normal", 1.0),
        "Shadows Into Light": ("shadows-into-light-400-normal", 1.3), "Indie Flower": ("indie-flower-400-normal", 1.2)}
BODY = {"Work Sans": "work-sans-latin-%d-normal", "Karla": "karla-%d-normal", "Nunito Sans": "nunito-sans-%d-normal", "IBM Plex Sans": "ibm-plex-sans-%d-normal",
        "Jost": "jost-%d-normal", "Montserrat": "montserrat-%d-normal", "Outfit": "outfit-%d-normal", "Figtree": "figtree-%d-normal"}
rng = np.random.default_rng(7)
hx = lambda h: tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

# What each listing promises (shown on image 3).
BUL = {
 "02-media-kit-1-seite": ["Media-Kit auf einer Seite", "2 Varianten: hell und dunkel", "Zahlen, Pakete, Kontakt", "perfekt als Mail-Anhang"],
 "03-preisliste-rate-card": ["3 Seiten Preisliste", "Pakete, Extras, Nutzungsrechte", "Beispielpreise zum Anpassen", "wirkt sofort professionell"],
 "04-angebot-kooperation": ["Angebot mit Leistungen und Preis", "Nutzungsrechte und Laufzeit", "Zahlungsbedingungen", "Beispiel fertig ausgefüllt"],
 "05-rechnung-creator": ["Rechnung mit Umsatzsteuer", "Variante Kleinunternehmer §19", "alle Pflichtangaben erklärt", "zum Ausfüllen und Versenden"],
 "06-briefing-formular": ["Briefing-Formular für Marken", "Ziel, Produkt, Botschaft, Deadline", "spart Rückfragen", "zum Ausfüllen"],
 "07-ugc-portfolio": ["6 Seiten Portfolio", "Videos, Fotos, Marken, Ergebnisse", "Querformat", "zum Verschicken als PDF"],
 "08-link-in-bio": ["3 Link-in-Bio-Designs", "Hochformat fürs Handy", "Links, Angebote, Kontakt", "für jede Plattform"],
 "09-case-study": ["Case Study mit Beispiel", "Aufgabe, Umsetzung, Ergebnis", "Zahlen und Kundenstimme", "überzeugt neue Marken"],
 "10-content-planer": ["Monats- und Wochenplan", "Ideen- und Hook-Liste", "Posting-Tracker", "Querformat zum Ausdrucken"],
 "11-hook-sammlung": ["100 Hooks auf Deutsch", "10 Kategorien", "zum Kopieren und Anpassen", "für Reels, TikTok und UGC"],
 "12-skript-vorlage": ["Skript-Vorlage für Videos", "Hook, Problem, Lösung, Aufruf", "Shotliste und Beispiel", "für 15 bis 60 Sekunden"],
 "13-instagram-posts": ["30 Instagram-Posts", "Tipps, Zitate, Karussells, Fotos", "Format 4:5", "einheitlicher Feed"],
 "14-story-vorlagen": ["20 Story-Vorlagen", "Fragen, Umfragen, Wochenplan", "Sticker-Flächen eingeplant", "Format 9:16"],
 "15-reels-cover": ["10 Reels-Cover", "3 Layouts", "Titel bleiben im Raster sichtbar", "Format 9:16"],
 "16-kooperations-tracker": ["Übersicht aller Kooperationen", "Pipeline-Board", "Marken-Kontakte", "Jahr in Zahlen"],
 "17-finanzplaner-creator": ["Einnahmen und Ausgaben", "Rechnungs-Tracker", "Steuer-Rücklage", "Jahresübersicht"],
 "18-checklisten-set": ["5 Checklisten", "Drehtag, Abgabe, Kooperation", "Equipment, Monatsabschluss", "zum Abhaken"],
 "21-preismenue-abo": ["Abo-Stufen wie eine Speisekarte", "Extras à la carte", "leere Vorlage zum Ausfüllen", "elegant und jugendfrei"],
 "22-dm-vorlagen-abo": ["33 fertige Nachrichten", "Willkommen, Danke, Zurückholen", "Grenzen freundlich setzen", "Schnellantworten"],
 "23-content-kalender-abo": ["Monats- und Wochenplan", "Feed, Nachrichten, Promo", "Ideenspeicher", "Shooting-Plan mit Shotliste"],
 "24-promo-posts-abo": ["12 Promo-Posts", "jugendfrei für Instagram und Co.", "4 Layouts", "Format 4:5"],
 "25-einnahmen-tracker-abo": ["Einnahmen nach Quelle", "Abonnenten-Entwicklung", "Gebühren-Rechner brutto/netto", "Jahresübersicht"],
 "26-fan-umfragen-wunschliste": ["10 Story-Vorlagen", "Umfragen, Wunschliste, Quiz", "Sticker-Flächen eingeplant", "Format 9:16"],
}


class Kit:
    def __init__(s, style):
        st = S[style]; s.st = st
        s.ink, s.paper, s.alt, s.dark, s.acc, s.muted = (hx(st[c]) for c in ("ink", "paper", "alt", "dark", "accent", "muted"))
        s.light = hx("FFFFFF") if style != "noir" else s.paper
        s.pool = B + "/pool/" + style + "/"
        s.hand_f, s.hand_k = HAND[st["hand"]]
        s.grain = st.get("grain", 8)

    def f(s, kind, size):
        st = s.st
        name = {"caps": lambda: FONT[st["caps"]], "serif": lambda: SERIF[st["serif"]], "hand": lambda: s.hand_f,
                "body": lambda: BODY[st["body"]] % 400, "bold": lambda: BODY[st["body"]] % 700}[kind]()
        if kind == "hand": size = int(size * s.hand_k)
        return ImageFont.truetype(F + name + ".ttf", size)

    def bg(s, color):
        a = np.ones((H, W, 3), np.float32) * np.array(color, np.float32) + rng.normal(0, s.grain, (H, W, 1))
        fz = Image.fromarray(np.uint8(np.clip(rng.normal(128, 60, (H // 4, W // 4)), 0, 255))).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(3))
        a += (np.asarray(fz, np.float32)[..., None] - 128) / 128 * 5
        return Image.fromarray(np.uint8(np.clip(a, 0, 255))).convert("RGBA")

    def caps(s, d, xy, text, size, fill, maxw, anchor="la", spacing=None):
        while size > 40:
            fo = s.f("caps", size)
            if max(d.textlength(l, font=fo) for l in text.split("\n")) <= maxw: break
            size -= 6
        d.multiline_text(xy, text, font=fo, fill=fill, anchor=anchor, spacing=spacing if spacing is not None else int(size * 0.08), align="center" if anchor[0] == "m" else "left",
                         stroke_width=max(1, size // 70) if s.st["caps"] == "Italiana" else 0, stroke_fill=fill)
        return size

    def wrap(s, d, text, fo, maxw):
        out = []
        for para in text.split("\n"):
            line = ""
            for w in para.split():
                t = (line + " " + w).strip()
                if d.textlength(t, font=fo) > maxw and line: out.append(line); line = w
                else: line = t
            out.append(line)
        return "\n".join(out)

    def pill(s, d, x, y, text, fg, line, bg=None, size=40):
        fo = s.f("bold", size); w = d.textlength(text, font=fo)
        d.rounded_rectangle((x, y, x + w + 70, y + size + 44), (size + 44) // 2, fill=bg, outline=line, width=4)
        d.text((x + 35, y + 18), text, font=fo, fill=fg)
        return x + w + 70

    def mark(s, cv, f, x, y, w, rot=0):
        if not os.path.exists(s.pool + f): return
        m = Image.open(s.pool + f).convert("RGBA")
        m = m.resize((w, int(w * m.height / m.width))).rotate(-rot, expand=True, resample=Image.BICUBIC)
        cv.alpha_composite(m, (int(x), int(y)))


def place(cv, im, cx, cy, rot=0, shadow=28, sop=110):
    pad = shadow * 3
    base = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("L", base.size, 0)
    ImageDraw.Draw(sh).rectangle((pad, pad + shadow // 2, pad + im.width, pad + im.height + shadow // 2), fill=sop)
    base.paste((0, 0, 0, 255), (0, 0), sh.filter(ImageFilter.GaussianBlur(shadow)))
    base.alpha_composite(im, (pad, pad))
    base = base.rotate(-rot, resample=Image.BICUBIC, expand=True)
    cv.alpha_composite(base, (int(cx - base.width / 2), int(cy - base.height / 2)))


def device(im, phone=False):
    bz = 26 if phone else 34
    t = Image.new("RGBA", (im.width + 2 * bz, im.height + 2 * bz), (0, 0, 0, 0))
    ImageDraw.Draw(t).rounded_rectangle((0, 0, t.width, t.height), 90 if phone else 60, fill=(24, 22, 21, 255))
    m = Image.new("L", im.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, im.width, im.height), 64 if phone else 22, fill=255)
    t.paste(im, (bz, bz), m)
    return t


def fit(im, maxw, maxh):
    r = min(maxw / im.width, maxh / im.height)
    return im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)


def render_pages(d, meta):
    out = d + "/etsy/pages"; os.makedirs(out, exist_ok=True)
    if not glob.glob(out + "/p-*.png"):
        subprocess.run(["pdftoppm", "-png", "-r", "110", f"{d}/{meta['file']}.pdf", out + "/p"], check=True)
    return [Image.open(p).convert("RGBA") for p in sorted(glob.glob(out + "/p-*.png"), key=lambda x: int(x.rsplit("-", 1)[1][:-4]))]


def build(slug, idx):
    d = B + "/dist/" + slug
    meta = json.load(open(d + "/meta.json"))
    k = Kit(meta["style"]); P = render_pages(d, meta); n = len(P)
    tall = P[0].height > P[0].width * 1.5; land = P[0].width > P[0].height
    out = d + "/etsy"
    title, sub, pills = meta["title"], meta["sub"], meta["pills"]
    save = lambda cv, i: cv.convert("RGB").save(f"{out}/etsy-{i}.jpg", quality=88, optimize=True)
    pick = lambda i: P[min(i, n - 1)]
    big = title.upper().replace(" FÜR ", "\nFÜR ").replace(" & ", " &\n") if len(title) > 16 else title.upper()

    # 1 Hero, three layouts
    lay = idx % 3
    if lay == 0:
        cv = k.bg(k.paper); dr = ImageDraw.Draw(cv)
        sel = [pick(1), pick(2), pick(0)]
        for (im, cx, cy, r) in zip(sel, [1760, 2300, 2030], [1060, 1080, 1010], [-7, 6, 0]):
            if land: im = fit(im, 1250, 900)
            elif tall: im = fit(im, 760, 1600)
            else: im = fit(im, 1000, 1450)
            place(cv, im, cx + (120 if land else 0), cy, r)
        dr.text((150, 210), "VORLAGE AUF DEUTSCH", font=k.f("bold", 40), fill=k.acc)
        cs = k.caps(dr, (150, 290), big, 200, k.ink, 1000)
        y = 290 + int(cs * 1.1) * (big.count("\n") + 1) + 40
        dr.multiline_text((150, y), k.wrap(dr, sub, k.f("serif", 64), 950), font=k.f("serif", 64), fill=k.acc, spacing=14)
        for i, t in enumerate(pills): k.pill(dr, 150, 1480 + i * 120, t, k.ink, k.ink, size=36)
    elif lay == 1:
        cv = k.bg(k.alt); dr = ImageDraw.Draw(cv)
        k.caps(dr, (W // 2, 170), title.upper(), 190, k.ink, 2300, anchor="ma")
        dr.text((W // 2, 420), sub, font=k.f("serif", 72), fill=k.acc, anchor="ma")
        m = min(n, 5); sel = [P[int(i * (n - 1) / max(m - 1, 1))] for i in range(m)]
        sz = (900, 700) if land else ((480, 1150) if tall else (620, 1000))
        span = 2200 / max(m - 1, 1)
        for i, im in enumerate(sel):
            place(cv, fit(im, *sz), 480 + i * ((W - 960) / max(m - 1, 1)), 1200 + (i % 2) * 40, [-6, 3, -2, 5, -4][i], shadow=24)
        x = W // 2 - 600
        for t in pills: x = k.pill(dr, x, 1860, t, k.ink, k.ink, k.light, size=36) + 20
    else:
        cv = k.bg(k.paper); dr = ImageDraw.Draw(cv)
        dr.rectangle((0, 0, 1180, H), fill=k.dark + (255,))
        dr.text((140, 220), "SOFORT-DOWNLOAD", font=k.f("bold", 38), fill=k.acc)
        lt = k.paper if meta["style"] != "zitrus" else hx("FFFBEA")
        cs = k.caps(dr, (140, 300), big, 190, lt, 940)
        y = 300 + int(cs * 1.1) * (big.count("\n") + 1) + 40
        dr.multiline_text((140, y), k.wrap(dr, sub, k.f("serif", 62), 920), font=k.f("serif", 62), fill=k.acc, spacing=14)
        for i, t in enumerate(pills): k.pill(dr, 140, 1480 + i * 120, t, lt, lt, size=36)
        if tall: place(cv, device(fit(pick(0), 720, 1600), True), 1700, 1010, -3, 36, 140); place(cv, device(fit(pick(1), 640, 1420), True), 2330, 1080, 5, 30, 120)
        elif land: place(cv, device(fit(pick(0), 1350, 950)), 1950, 900, -2, 36, 130); place(cv, fit(pick(1), 900, 640), 2150, 1550, 4, 26)
        else: place(cv, fit(pick(1), 1050, 1500), 2250, 1080, 6, 28); place(cv, fit(pick(0), 1120, 1600), 1800, 1010, -3, 34)
    save(cv, 1)

    # 2 Alles drin: grid of pages
    cv = k.bg(k.paper); dr = ImageDraw.Draw(cv)
    k.caps(dr, (150, 120), "WAS DRIN IST", 160, k.ink, 1300)
    dr.text((W - 150, 190), f"{n} Seiten" if n < 10 else f"{n} Vorlagen", font=k.f("serif", 84), fill=k.acc, anchor="ra")
    show = P[:12] if n > 12 else P
    cols = 6 if (tall or n > 8) and not land else (3 if land else 4)
    if n <= 3: cols = n
    rows = -(-len(show) // cols)
    cw, ch = (W - 300) / cols, (1600 if rows == 1 else 1560 / rows)
    for i, im in enumerate(show):
        r, c = divmod(i, cols)
        place(cv, fit(im, cw - 50, ch - 60), 150 + c * cw + cw / 2, 420 + r * ch + ch / 2, 0, shadow=12, sop=80)
    if n > 12: dr.text((W - 150, 1960), f"+ {n - 12} weitere", font=k.f("hand", 54), fill=k.acc, anchor="rb")
    save(cv, 2)

    # 3 Spotlight on dark with bullets
    cv = k.bg(k.dark); dr = ImageDraw.Draw(cv)
    lt = k.paper
    im = pick(1 if n > 1 else 0)
    if tall: place(cv, device(fit(im, 760, 1700), True), 2050, 1010, 3, 40, 160)
    elif land: place(cv, device(fit(im, 1450, 1050)), 1880, 1010, -3, 40, 160)
    else: place(cv, device(fit(im, 1100, 1650)), 2050, 1010, 3, 40, 160)
    k.caps(dr, (150, 230), "DAS BEKOMMST DU", 150, lt, 1000 if not land else 950)
    for i, t in enumerate(BUL.get(slug, pills)):
        y = 620 + i * 150
        dr.ellipse((160, y + 22, 188, y + 50), fill=k.acc)
        dr.multiline_text((225, y), k.wrap(dr, t, k.f("body", 54), 820 if land else 1000), font=k.f("body", 54), fill=lt, spacing=8)
    dr.text((150, 1800), "komplett auf Deutsch", font=k.f("hand", 58), fill=k.acc)
    save(cv, 3)

    # 4 Detail zoom
    cv = k.bg(k.alt); dr = ImageDraw.Draw(cv)
    im = pick(2 if n > 2 else n - 1)
    z = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    cw_, chh = (1700, 1700)
    cx0 = 0
    crop = z.crop((cx0, int(z.height * 0.05), min(z.width, cx0 + cw_), int(z.height * 0.05) + min(chh, z.height)))
    place(cv, fit(crop, 1600, 1700), 1850, 1010, 2, 30)
    k.caps(dr, (150, 300), "IM\nDETAIL", 200, k.ink, 800)
    dr.multiline_text((155, 820), "Durchdacht bis zur\nletzten Zeile. Texte,\nFarben und Fotos\nänderst du in Minuten.", font=k.f("body", 46), fill=k.ink, spacing=20)
    k.mark(cv, "arrow_terra.png", 700, 1350, 360, -10)
    save(cv, 4)

    # 5 How it works + AI note
    cv = k.bg(k.paper); dr = ImageDraw.Draw(cv)
    k.caps(dr, (150, 120), "SO FUNKTIONIERT'S", 150, k.ink, 2300)
    steps = [("1", "Herunterladen", "PDF und PPTX direkt\nnach dem Kauf."), ("2", "Anpassen", "In Canva importieren oder\nmit PowerPoint öffnen."), ("3", "Loslegen", "Als PDF oder Bild\nspeichern und nutzen.")]
    for i, (num, t, s_) in enumerate(steps):
        x = 150 + i * 840
        im = fit(pick([0, 1, n - 1][i]), 620 if not land else 760, 900 if not tall else 1000)
        place(cv, im, x + 340, 880, [-3, 2, -2][i], shadow=20)
        dr.text((x, 1450), num, font=k.f("caps", 140), fill=k.acc)
        dr.text((x + 130, 1475), t, font=k.f("bold", 54), fill=k.ink)
        dr.multiline_text((x + 130, 1555), s_, font=k.f("body", 38), fill=k.ink, spacing=14)
    dr.text((150, 1910), "Beispielfotos wurden mit KI erstellt und dienen nur der Vorschau. Du ersetzt sie durch deine eigenen.", font=k.f("body", 32), fill=k.muted)
    save(cv, 5)
    print("etsy", slug)


if __name__ == "__main__":
    slugs = sys.argv[1:] or sorted(os.path.basename(p) for p in glob.glob(B + "/dist/*") if os.path.exists(p + "/meta.json"))
    for s in slugs:
        i = int(s.split("-")[0])
        build(s, i)
