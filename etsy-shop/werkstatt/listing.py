"""Etsy listing images (2700 x 2025, 4:3) built from the rendered kit pages."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

B = os.path.dirname(os.path.abspath(__file__))
PG, OUT, V5 = B + "/etsy/pages/", B + "/etsy/", B + "/v5/"
W, H = 2700, 2025
F = os.path.expanduser("~/.fonts/")
INK, TERRA, CREAM, DARK, MUTED = (31, 26, 23), (169, 84, 47), (242, 234, 225), (46, 36, 32), (110, 98, 89)
rng = np.random.default_rng(3)


def font(name, size):
    return ImageFont.truetype(F + {"caps": "anton-latin-400-normal.ttf", "serif": "bodoni-moda-latin-400-normal.ttf",
                                    "serif_i": "bodoni-moda-latin-400-italic.ttf", "hand": "homemade-apple-latin-400-normal.ttf",
                                    "body": "work-sans-latin-400-normal.ttf", "bold": "work-sans-latin-700-normal.ttf"}[name], size)


def paper(color, grain=9):
    a = np.ones((H, W, 3), np.float32) * np.array(color, np.float32) + rng.normal(0, grain, (H, W, 1))
    f = Image.fromarray(np.uint8(np.clip(rng.normal(128, 60, (H // 4, W // 4)), 0, 255))).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(3))
    a += (np.asarray(f, np.float32)[..., None] - 128) / 128 * 6
    return Image.fromarray(np.uint8(np.clip(a, 0, 255))).convert("RGBA")


def page(name, h):
    im = Image.open(PG + name + ".png").convert("RGBA")
    return im.resize((int(im.width * h / im.height), h), Image.LANCZOS)


def place(cv, im, cx, cy, rot=0, shadow=28, sop=110):
    """Paste im centred at (cx, cy), rotated, with a soft drop shadow."""
    pad = shadow * 3
    base = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("L", base.size, 0)
    ImageDraw.Draw(sh).rectangle((pad, pad + shadow // 2, pad + im.width, pad + im.height + shadow // 2), fill=sop)
    sh = sh.filter(ImageFilter.GaussianBlur(shadow))
    base.paste((0, 0, 0, 255), (0, 0), sh)
    base.alpha_composite(im, (pad, pad))
    base = base.rotate(-rot, resample=Image.BICUBIC, expand=True)
    cv.alpha_composite(base, (int(cx - base.width / 2), int(cy - base.height / 2)))


def tablet(im, bezel=34):
    t = Image.new("RGBA", (im.width + 2 * bezel, im.height + 2 * bezel), (0, 0, 0, 0))
    d = ImageDraw.Draw(t)
    d.rounded_rectangle((0, 0, t.width, t.height), 60, fill=(28, 24, 22, 255))
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, im.width, im.height), 22, fill=255)
    t.paste(im, (bezel, bezel), m)
    return t


def pill(d, x, y, text, fg=INK, bg=None, line=INK, size=40):
    f = font("bold", size)
    w = d.textlength(text, font=f)
    box = (x, y, x + w + 70, y + size + 44)
    d.rounded_rectangle(box, (size + 44) // 2, fill=bg, outline=line, width=4)
    d.text((x + 35, y + 18), text, font=f, fill=fg)
    return box[2]


def tape(cv, cx, cy, rot, w=300):
    t = Image.open(V5 + "tape1.png").convert("RGBA")
    t = t.resize((w, int(w * t.height / t.width))).rotate(-rot, expand=True, resample=Image.BICUBIC)
    cv.alpha_composite(t, (int(cx - t.width / 2), int(cy - t.height / 2)))


def mark(cv, f, x, y, w, rot=0):
    m = Image.open(V5 + f).convert("RGBA")
    m = m.resize((w, int(w * m.height / m.width))).rotate(-rot, expand=True, resample=Image.BICUBIC)
    cv.alpha_composite(m, (int(x), int(y)))


def save(cv, n):
    cv.convert("RGB").save(OUT + f"etsy-{n}.jpg", quality=90)


# 1 Hero
cv = paper((242, 234, 225)); d = ImageDraw.Draw(cv)
place(cv, page("mk-2", 1180), 1600, 1050, -9)
place(cv, page("mk-4", 1180), 2220, 1080, 8)
place(cv, page("mk-1", 1360), 1920, 1010, 0, shadow=34)
d.text((150, 230), "CANVA-VORLAGE · AUF DEUTSCH", font=font("bold", 42), fill=TERRA)
d.text((140, 300), "UGC", font=font("caps", 360), fill=INK)
d.text((140, 680), "STARTER-KIT", font=font("caps", 200), fill=INK)
d.text((150, 950), "Media-Kit + Pitch-Guide", font=font("serif_i", 92), fill=TERRA)
x = 150
for t in ("12 Seiten", "A4", "sofort bearbeitbar"):
    x = pill(d, x, 1160, t) + 24
d.text((150, 1340), "für deine ersten\nMarkenkooperationen", font=font("hand", 54), fill=INK, spacing=30)
mark(cv, "arrow_terra.png", 760, 1330, 360, 10)
d.text((150, 1880), "Beispielfotos und Texte ersetzt du durch deine eigenen.", font=font("body", 34), fill=MUTED)
save(cv, 1)

# 2 Was drin ist
cv = paper((242, 234, 225)); d = ImageDraw.Draw(cv)
d.text((150, 120), "WAS DRIN IST", font=font("caps", 170), fill=INK)
d.text((1340, 205), "12 Seiten in zwei Dateien", font=font("serif_i", 80), fill=TERRA)
labels_mk = ["Cover", "Über mich", "Community", "Pakete", "Arbeitsproben", "Marken", "Kontakt"]
th = 640; tw = int(th * 1241 / 1754); gap = (W - 300 - 7 * tw) / 6
d.text((150, 420), "MEDIA-KIT · 7 SEITEN", font=font("bold", 40), fill=TERRA)
for i, l in enumerate(labels_mk):
    x = 150 + i * (tw + gap)
    place(cv, page(f"mk-{i+1}", th), x + tw / 2, 500 + th / 2, 0, shadow=14, sop=90)
    d.text((x + tw / 2, 500 + th + 40), l, font=font("body", 36), fill=INK, anchor="mt")
d.text((150, 1300), "PITCH-GUIDE · 5 SEITEN", font=font("bold", 40), fill=TERRA)
labels_pg = ["Cover", "Mails 1 + 2", "Mails 3 + 4", "Mail 5 + Betreffzeilen", "Checkliste"]
th2 = 560; tw2 = int(th2 * 1241 / 1754)
for i, l in enumerate(labels_pg):
    x = 150 + i * (tw2 + 70)
    place(cv, page(f"pg-{i+1}", th2), x + tw2 / 2, 1380 + th2 / 2, 0, shadow=14, sop=90)
    d.text((x + tw2 / 2, 1380 + th2 + 36), l, font=font("body", 34), fill=INK, anchor="mt")
d.text((1100, 1290), "+ als PDF und zum Bearbeiten in Canva", font=font("hand", 40), fill=TERRA)
save(cv, 2)

# 3 Media-Kit Spotlight (dunkel)
cv = paper((46, 36, 32), grain=7); d = ImageDraw.Draw(cv)
place(cv, tablet(page("mk-2", 1500)), 1720, 1010, -4, shadow=40, sop=150)
place(cv, page("mk-3", 1150), 2350, 1180, 7, shadow=34, sop=150)
tape(cv, 2330, 610, 12)
d.text((150, 230), "MEDIA-KIT", font=font("caps", 230), fill=CREAM)
d.text((155, 520), "7 Seiten, die alles zeigen,\nwas Marken wissen wollen", font=font("serif_i", 66), fill=(236, 222, 210), spacing=22)
items = ["Über mich mit Fotos", "Community und Zielgruppe", "Pakete und Preise", "Video-Arbeitsproben", "Marken und Kundenstimmen", "Kontakt"]
for i, t in enumerate(items):
    y = 820 + i * 105
    d.ellipse((160, y + 18, 184, y + 42), fill=TERRA)
    d.text((215, y), t, font=font("body", 48), fill=CREAM)
save(cv, 3)

# 4 Pitch-Guide Spotlight
cv = paper((236, 222, 210)); d = ImageDraw.Draw(cv)
place(cv, page("pg-2", 1700), 1950, 1015, 3, shadow=36)
place(cv, page("pg-4", 1250), 1330, 1200, -6, shadow=30)
d.text((150, 230), "PITCH-", font=font("caps", 200), fill=INK)
d.text((150, 470), "GUIDE", font=font("caps", 200), fill=INK)
d.text((155, 760), "5 Mails +\n15 Betreffzeilen", font=font("serif_i", 64), fill=TERRA, spacing=8)
d.text((155, 960), "Erste Anfrage, Antwort,\nIdee pitchen, Nachfassen\nund Preis nennen.", font=font("body", 46), fill=INK, spacing=20)
d.text((150, 1700), "einfach kopieren\nund anpassen", font=font("hand", 50), fill=TERRA, spacing=34)
mark(cv, "arrow_terra.png", 620, 1600, 300, -15)
save(cv, 4)

# 5 Detail Pakete (Zoom)
cv = paper((242, 234, 225)); d = ImageDraw.Draw(cv)
pk = page("mk-4", 2600)
crop = pk.crop((0, int(pk.height * 0.0), pk.width, int(pk.height * 0.62)))
place(cv, crop.resize((int(crop.width * 0.86), int(crop.height * 0.86))), 1760, 1010, 2, shadow=30)
d.text((150, 300), "PREISE", font=font("caps", 200), fill=INK)
d.text((150, 540), "schon\nvorbereitet", font=font("serif_i", 90), fill=TERRA, spacing=10)
d.text((155, 820), "Drei Pakete, Extras und\nNutzungsrechte. Du trägst\nnur noch deine Preise ein.", font=font("body", 44), fill=INK, spacing=20)
save(cv, 5)

# 6 So funktioniert's
cv = paper((242, 234, 225)); d = ImageDraw.Draw(cv)
d.text((150, 120), "SO FUNKTIONIERT'S", font=font("caps", 170), fill=INK)
steps = [("1", "Datei öffnen", "Lade die Vorlage herunter und\nöffne sie in Canva oder PowerPoint.", "mk-1"),
         ("2", "Anpassen", "Ersetze Texte, Zahlen, Fotos und\nFarben durch deine eigenen.", "mk-2"),
         ("3", "Verschicken", "Speichere dein Media-Kit als PDF\nund schick es an Marken.", "mk-7")]
for i, (n, t, s, p) in enumerate(steps):
    x = 150 + i * 840
    place(cv, page(p, 900), x + 340, 900, [-3, 2, -2][i], shadow=22)
    d.text((x, 1440), n, font=font("caps", 150), fill=TERRA)
    d.text((x + 130, 1475), t, font=font("bold", 56), fill=INK)
    d.text((x + 130, 1560), s, font=font("body", 38), fill=INK, spacing=14)
save(cv, 6)

# 7 Features (dunkel)
cv = paper((46, 36, 32), grain=7); d = ImageDraw.Draw(cv)
place(cv, tablet(page("mk-5", 1600)), 2000, 1010, 3, shadow=40, sop=150)
d.text((150, 230), "ALLES", font=font("caps", 220), fill=CREAM)
d.text((150, 500), "anpassbar", font=font("serif_i", 120), fill=(236, 222, 210))
feats = ["komplett auf Deutsch", "Fotos einfach austauschen", "kostenlose Schriften", "A4, digital und druckbar", "Sofort-Download"]
for i, t in enumerate(feats):
    y = 820 + i * 120
    mark(cv, "check_terra.png", 150, y - 10, 70)
    d.text((250, y), t, font=font("body", 52), fill=CREAM)
save(cv, 7)
print("ok")
