"""Listing images for the three bundles: hero + overview of all products."""
import os, glob, json, subprocess
from PIL import Image, ImageDraw
from etsy import Kit, place, fit, W, H, B
K = os.path.dirname(B)
def cover(sl):
    if sl == "01":
        p = K + "/etsy/pages/mk-1.png"; return Image.open(p).convert("RGBA"), "UGC Starter-Kit", 14
    d = glob.glob(B + f"/dist/{sl}-*")[0]; m = json.load(open(d + "/meta.json"))
    return Image.open(sorted(glob.glob(d + "/etsy/pages/p-*.png"))[0]).convert("RGBA"), m["title"], m["price"]
BUN = [("19-creator-komplettpaket", "terra", "CREATOR-\nKOMPLETTPAKET", "Pitchen, verkaufen, organisieren", 49, ["01", "02", "03", "04", "05", "06", "07", "08", "09", "16", "17", "18"]),
       ("20-content-paket", "zitrus", "CONTENT-\nPAKET", "Planen, schreiben, posten", 34, ["10", "11", "12", "13", "14", "15"]),
       ("27-abo-creator-komplettpaket", "noir", "ABO-CREATOR\nKOMPLETTPAKET", "Preise, Nachrichten, Planung, Promo", 35, ["21", "22", "23", "24", "25", "26"])]
for slug, style, t, sub, price, sls in BUN:
    k = Kit(style); out = B + f"/bundles/etsy/{slug}"; os.makedirs(out, exist_ok=True)
    cs = [cover(s) for s in sls]; total = sum(c[2] for c in cs)
    # 1 hero
    cv = k.bg(k.paper); d = ImageDraw.Draw(cv)
    n = len(cs)
    for i, (im, _, _) in enumerate(cs[:8]):
        a = i / max(min(n, 8) - 1, 1)
        place(cv, fit(im, 480, 660), 1560 + a * 950, 1050 + (-1) ** i * 90, -12 + a * 24, shadow=20)
    d.text((150, 210), f"{n} VORLAGEN IN EINEM PAKET", font=k.f("bold", 40), fill=k.acc)
    sz = k.caps(d, (150, 290), t, 190, k.ink, 1100)
    y = 290 + int(sz * 1.1) * 2 + 40
    d.text((150, y), sub, font=k.f("serif", 66), fill=k.acc)
    d.rounded_rectangle((150, 1500, 1050, 1800), 40, fill=k.dark + (255,))
    d.text((210, 1545), f"einzeln {total} €", font=k.f("body", 52), fill=k.muted)
    d.line((210, 1580, 210 + d.textlength(f"einzeln {total} €", font=k.f("body", 52)), 1580), fill=k.muted, width=4)
    d.text((210, 1620), f"im Paket {price} €", font=k.f("bold", 80), fill=k.paper)
    cv.convert("RGB").save(out + "/etsy-1.jpg", quality=88, optimize=True)
    # 2 overview
    cv = k.bg(k.alt); d = ImageDraw.Draw(cv)
    k.caps(d, (150, 120), "ALLES IM PAKET", 150, k.ink, 1600)
    cols = 6; rows = -(-n // cols); cw = (W - 300) / cols; ch = 1650 / rows
    for i, (im, name, pr) in enumerate(cs):
        r, c = divmod(i, cols); cx = 150 + c * cw + cw / 2; cy = 400 + r * ch
        place(cv, fit(im, cw - 70, ch - 220), cx, cy + (ch - 220) / 2, 0, shadow=12, sop=80)
        lines = k.wrap(d, name, k.f("bold", 30), cw - 40)
        d.multiline_text((cx, cy + ch - 190), lines, font=k.f("bold", 30), fill=k.ink, anchor="ma", align="center", spacing=6)
    cv.convert("RGB").save(out + "/etsy-2.jpg", quality=88, optimize=True)
    print(slug, total, "->", price)
