import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import assets
from PIL import Image
B = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(B + "/styles.json"))
h = lambda x: tuple(int(x[i:i+2], 16) for i in (0, 2, 4))
for name, st in S.items():
    d = B + f"/pool/{name}/"; os.makedirs(d, exist_ok=True)
    assets.D = d
    assets.paper(h(st["paper"]), "bg_light.jpg", grain=st["grain"], fiber=max(2, st["grain"] - 3))
    assets.paper(h(st["alt"]), "bg_alt.jpg", grain=st["grain"], fiber=max(2, st["grain"] - 3))
    assets.paper(h(st["dark"]), "bg_dark.jpg", grain=max(3, st["grain"] - 3), fiber=3)
    for i in range(3):
        assets.tape(f"tape{i}.png", seed=i)
        im = Image.open(d + f"tape{i}.png").convert("RGBA"); px = im.load(); r, g, b = st["tape"]
        for y in range(im.height):
            for x in range(im.width):
                pr, pg, pb, pa = px[x, y]
                if pa: dd = pr - 236; px[x, y] = (max(0, min(255, r + dd)), max(0, min(255, g + dd)), max(0, min(255, b + dd)), pa)
        im.save(d + f"tape{i}.png")
    A = h(st["accent"]) + (255,); L = h(st["paper"]) + (255,)
    assets.arrow("arrow_terra.png", A); assets.arrow("arrow_terra_l.png", A, flip=True, seed=9)
    assets.arrow("arrow_cream.png", L, seed=11); assets.arrow("arrow_cream_l.png", L, flip=True, seed=13)
    assets.scribble_circle("circle_terra.png", A); assets.underline("underline_terra.png", A)
    assets.star("star_terra.png", A); assets.star("star_cream.png", L, seed=8); assets.check("check_terra.png", A)
    print("style", name)
