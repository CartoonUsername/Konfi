"""Renders every pin idea with status "neu" in ../pinterest/ideen.json into ../pinterest/bilder/<id>.jpg (1000 x 1500)
and sets its status to "bereit". Six layouts: faecher, geraet, zoom, foto, liste, frage; three backgrounds: hell, dunkel, farbe.
usage: python3 fabrik.py [--alle | --layout=foto]   (re-render everything, or one layout, except posted pins)"""
import os, sys, json, glob
from PIL import Image, ImageDraw
from etsy import Kit, place, fit, device, B
W, H = 1000, 1500
PIN = os.path.join(B, "..", "pinterest"); IMG = os.path.join(PIN, "bilder"); os.makedirs(IMG, exist_ok=True)
PHOTOS = {"01": ["balcony_a", "street_a", "sofa_b", "desk", "latte"], "02": ["m1", "m3", "mira0", "m5"], "03": ["j1", "j3", "jonas0", "j4"],
          "04": ["f_film", "f_desk"], "05": ["f_cup", "f_flatlay"], "06": ["f_desk", "f_setup"], "07": ["a1", "a2", "aylin0", "a4"],
          "08": ["m2", "m6", "mira0"], "09": ["j2", "j5", "jonas0"], "10": ["f_desk", "f_cup"], "11": ["f_setup", "f_film"], "12": ["f_setup", "f_film"],
          "13": ["a3", "a5", "a6"], "14": ["m4", "m1", "m6"], "15": ["j1", "j6", "j3"], "16": ["f_desk", "f_flatlay"], "17": ["f_balcony", "f_cup"],
          "18": ["f_setup", "f_desk"], "21": ["n2", "n4"], "22": ["n3", "n1"], "23": ["n6", "n5"], "24": ["n6", "n1"], "25": ["n1", "n3"], "26": ["n5", "n2"]}

def pages(slug, bundle):
    if bundle:
        out = []
        for n in bundle:
            d = glob.glob(os.path.join(B, "seiten", n + "-*"))[0]
            out.append(Image.open(sorted(glob.glob(d + "/p-*.jpg"))[0]).convert("RGBA"))
        return out
    return [Image.open(f).convert("RGBA") for f in sorted(glob.glob(os.path.join(B, "seiten", slug, "p-*.jpg")))]

def style_of(slug, bundle):
    if bundle: return {"19": "terra", "20": "zitrus", "27": "noir"}[slug[:2]]
    return json.load(open(os.path.join(B, "seiten", slug, "meta.json")))["style"]

def bottom(k, d, xy, text, size, anchor="la"):
    return d.multiline_textbbox(xy, text, font=k.f("caps", size), anchor=anchor, spacing=int(size * 0.08), align="center" if anchor[0] == "m" else "left")[3]

def headline(k, d, xy, text, size, fill, maxw, maxbottom, anchor="la"):
    while size > 44 and (bottom(k, d, xy, text, size, anchor) > maxbottom or max(d.textlength(l, font=k.f("caps", size)) for l in text.split("\n")) > maxw): size -= 4
    k.caps(d, xy, text, size, fill, maxw, anchor=anchor)
    return bottom(k, d, xy, text, size, anchor)

def photo(key, w, h, fy=0.3):
    im = Image.open(os.path.join(B, "pool", key + ".jpg")).convert("RGBA")
    r = max(w / im.width, h / im.height); im = im.resize((int(im.width * r) + 1, int(im.height * r) + 1), Image.LANCZOS)
    x = (im.width - w) // 2; y = int((im.height - h) * fy)
    return im.crop((x, y, x + w, y + h))

def render(idea, n):
    slug, L, bgk = idea["slug"], idea["layout"], idea["bg"]
    bun = idea.get("bundle") or []
    k = Kit(style_of(slug, bun)); P = pages(slug, bun); np_ = len(P)
    pick = lambda i: P[min(i, np_ - 1)]
    land = P[0].width > P[0].height; tall = P[0].height > P[0].width * 1.5
    bgc = {"hell": k.paper, "dunkel": k.dark, "farbe": k.alt}[bgk]
    ink = k.paper if bgk == "dunkel" else k.ink
    cv = k.bg(bgc).resize((W, H)); d = ImageDraw.Draw(cv)
    hl, sub = idea["headline"], idea["sub"]
    off = n % 3  # small variety in which pages are shown
    if L == "faecher":
        d.text((W // 2, 70), "VORLAGE AUF DEUTSCH", font=k.f("bold", 26), fill=k.acc, anchor="ma")
        y = headline(k, d, (W // 2, 120), hl, 130, ink, 860, 520, "ma") + 28
        d.text((W // 2, y), sub, font=k.f("serif", 42), fill=k.acc, anchor="ma")
        top = y + 90; cy = top + (H - 120 - top) / 2
        box = (760, 560) if land else ((360, 760) if tall else (480, 680))
        if bun:
            m = len(P)
            for i, im in enumerate(P):
                a = i / max(m - 1, 1); place(cv, fit(im, 300, 420), 190 + a * 620, cy + (-1) ** i * 40, -10 + a * 20, shadow=12)
        else:
            for im, dx, r in ((pick(1 + off), -190, -8), (pick(2 + off), 190, 8), (pick(off), 0, 0)):
                place(cv, fit(im, *box), W / 2 + dx * (0.6 if land else 1), cy + (20 if r else 0), r, shadow=16)
        d.rounded_rectangle((W // 2 - 260, H - 110, W // 2 + 260, H - 45), 33, fill=(k.acc if bgk == "dunkel" else k.dark) + (255,))
        d.text((W // 2, H - 78), "Canva & PowerPoint", font=k.f("bold", 30), fill=k.paper, anchor="mm")
    elif L == "geraet":
        im = pick(1 + off if np_ > 1 else 0)
        if tall: place(cv, device(fit(im, 400, 820), True), W / 2, 500, -3, 22, 150)
        elif land: place(cv, device(fit(im, 860, 620)), W / 2, 440, -2, 22, 150)
        else: place(cv, fit(im, 600, 820), W / 2, 480, 3, 24, 160)
        yb = 960 if not land else 860
        y = headline(k, d, (80, yb), hl, 112, ink, 840, H - 210)
        d.text((80, y + 28), sub, font=k.f("serif", 42), fill=k.acc)
        d.text((80, H - 90), "Vorlage auf Deutsch · Sofort-Download", font=k.f("body", 28), fill=k.muted)
    elif L == "zoom":
        im = pick(off + (1 if np_ > 2 else 0))
        z = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
        crop = z.crop((0, int(z.height * 0.04), min(z.width, int(z.width * 0.8)), int(z.height * 0.04) + int(min(z.width * 0.8, z.width) * 1.05)))
        place(cv, fit(crop, 860, 900), W / 2, 520, -2, 22)
        d.rectangle((0, 1000, W, H), fill=(k.dark if bgk != "dunkel" else k.acc) + (255,))
        lt = k.paper
        y = headline(k, d, (80, 1060), hl, 104, lt, 840, H - 190)
        d.text((80, y + 24), sub, font=k.f("serif", 40), fill=(k.acc if bgk != "dunkel" else k.dark))
        d.text((80, H - 80), "Ausschnitt aus der Vorlage", font=k.f("body", 26), fill=k.muted if bgk != "dunkel" else k.dark)
    elif L == "foto":
        keys = PHOTOS.get(slug[:2], ["f_desk"]); key = keys[n % len(keys)]
        ph = photo(key, W, 860, 0.25); cv.alpha_composite(ph, (0, 0))
        im = pick(off)
        place(cv, fit(im, 320 if not land else 480, 440 if not land else 340), W - 230, 680, 5, 18, 140)
        y = headline(k, d, (80, 930), hl, 110, ink, 600 if not land else 560, H - 200)
        d.text((80, y + 26), sub, font=k.f("serif", 40), fill=k.acc)
        d.text((80, H - 90), "Beispielfoto mit KI erstellt · Vorlage auf Deutsch", font=k.f("body", 24), fill=k.muted)
    elif L == "liste":
        d.text((80, 90), "DAS IST DRIN", font=k.f("bold", 28), fill=k.acc)
        y = headline(k, d, (80, 140), hl, 110, ink, 840, 520) + 50
        for j, t in enumerate((idea.get("bullets") or [])[:4]):
            yy = y + j * 105
            d.ellipse((84, yy + 12, 114, yy + 42), fill=k.acc + (255,))
            d.text((140, yy), t, font=k.f("body", 46), fill=ink)
        place(cv, fit(pick(off), 420 if not land else 620, 560 if not land else 440), W - 300, H - 330, -5, 18)
        d.text((80, H - 90), sub, font=k.f("serif", 38), fill=k.acc)
    else:  # frage
        d.rectangle((0, 0, W, H), fill=(k.acc if bgk != "dunkel" else k.dark) + (255,))
        lt = k.paper if bgk == "dunkel" or style_of(slug, bun) not in ("zitrus",) else k.dark
        lt = (255, 255, 255) if bgk != "dunkel" else k.paper
        y = headline(k, d, (W // 2, 200), hl, 140, lt, 860, 760, "ma")
        d.text((W // 2, y + 36), sub, font=k.f("serif", 44), fill=lt, anchor="ma")
        if bun:
            for i, im in enumerate(P[:4]): place(cv, fit(im, 320, 440), 200 + i * 200, 1250, -8 + i * 5, 14)
        else:
            for im, dx, r in ((pick(off), -150, -7), (pick(off + 1), 150, 7)):
                place(cv, fit(im, 520 if land else 400, 380 if land else 560), W / 2 + dx, 1240, r, 18)
    out = os.path.join(IMG, idea["id"] + ".jpg")
    cv.convert("RGB").save(out, quality=86, optimize=True, progressive=True)
    return out

if __name__ == "__main__":
    f = os.path.join(PIN, "ideen.json"); ideas = json.load(open(f))
    lay = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--layout=")), None)
    todo = [x for x in ideas if x["status"] == "neu" or "--alle" in sys.argv or (lay and x["layout"] == lay and x["status"] != "gepostet")]
    for n, idea in enumerate(todo):
        render(idea, n); idea["status"] = "bereit" if idea["status"] in ("neu", "bereit") else idea["status"]
        idea["bild"] = "bilder/" + idea["id"] + ".jpg"
    json.dump(ideas, open(f, "w"), ensure_ascii=False, indent=1)
    print(len(todo), "Pins gebaut")
