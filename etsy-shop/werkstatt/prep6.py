import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
import assets
B = os.path.dirname(os.path.abspath(__file__))
G, I, O = B + "/gen/", B + "/img/", B + "/v5/"
DPI = 170
def crop(src, w_in, h_in, out, fx=0.5, fy=0.5, pre=None):
    im = Image.open(src).convert("RGB")
    if pre: W, H = im.size; im = im.crop((int(pre[0]*W), int(pre[1]*H), int(pre[2]*W), int(pre[3]*H)))
    ar = w_in / h_in; W, H = im.size
    if W / H > ar:
        nw = int(H * ar); x0 = int((W - nw) * fx); im = im.crop((x0, 0, x0 + nw, H))
    else:
        nh = int(W / ar); y0 = int((H - nh) * fy); im = im.crop((0, y0, W, y0 + nh))
    im.resize((int(w_in * DPI), int(h_in * DPI)), Image.LANCZOS).save(O + out, quality=88)
crop(G + "cover_b.png", 4.3, 5.8, "cover_big.jpg", fy=0.3)
crop(G + "street_a.png", 2.2, 2.6, "cover_pol.jpg", fy=0.15)
crop(G + "sofa_b.png", 3.0, 3.4, "mk2_pol.jpg", fx=0.55, fy=0.2)
crop(G + "bts_a.png", 3.4, 3.35, "mk2_bts.jpg", fy=0.45)
crop(G + "product_a.png", 2.6, 3.0, "mk3_pol.jpg", fx=0.6, fy=0.3, pre=(0.25, 0.1, 1.0, 1.0))
crop(I + "n5.png", 2.3, 2.3, "mk4_unbox.jpg")
crop(I + "n5.png", 2.2, 2.2, "pg_unbox.jpg")
crop(G + "contact_a.png", 8.27, 6.2, "mk7.jpg", fx=0.6)
for i, n in ((1, "serum_a.png"), (2, "latte_a.png"), (3, "cream_a.png")):
    assets.phone(G + n, f"phone{i}.png")
if os.path.exists(G + "desk_a.png"):
    crop(G + "desk_a.png", 2.3, 2.3, "mk2_small.jpg", pre=(0.3, 0.05, 0.85, 0.6))
    crop(G + "desk_a.png", 3.2, 3.8, "pg_cover.jpg", fy=0.2, pre=(0.25, 0.0, 0.85, 0.66))
print("ok")
