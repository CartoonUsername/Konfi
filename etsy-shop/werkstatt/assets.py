"""Collage assets: paper backgrounds, tape, hand-drawn marks, phone frames."""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np, os, math, random, sys

D = os.path.dirname(os.path.abspath(__file__)) + "/v5/"
os.makedirs(D, exist_ok=True)
rng = np.random.default_rng(7)
random.seed(7)


def paper(color, out, grain=10, fiber=6, w=1240, h=1754):
    base = np.ones((h, w, 3), np.float32) * np.array(color, np.float32)
    n = rng.normal(0, grain, (h, w, 1))
    f = Image.fromarray(np.uint8(np.clip(rng.normal(128, 60, (h // 4, w // 4)), 0, 255))).resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(3))
    f = (np.asarray(f, np.float32)[..., None] - 128) / 128 * fiber
    img = np.clip(base + n + f, 0, 255).astype(np.uint8)
    Image.fromarray(img).save(D + out, quality=90)


def tape(out, w=520, h=150, seed=0):
    r = random.Random(seed)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # torn short edges
    pts = [(r.randint(0, 14), 0)]
    for y in range(0, h + 1, 10):
        pts.append((r.randint(0, 16), y))
    for y in range(h, -1, -10):
        pts.append((w - r.randint(0, 16), y))
    d.polygon(pts, fill=(236, 226, 208, 200))
    a = np.asarray(im).astype(np.int16)
    noise = rng.normal(0, 9, (h, w, 1)).astype(np.int16)
    a[..., :3] = np.clip(a[..., :3] + noise, 0, 255)
    Image.fromarray(a.astype(np.uint8)).save(D + out)


def wobble_line(d, pts, color, width, jitter=1.6, seed=1):
    r = random.Random(seed)
    out = []
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        steps = max(2, int(math.hypot(x1 - x0, y1 - y0) / 6))
        for k in range(steps):
            t = k / steps
            out.append((x0 + (x1 - x0) * t + r.uniform(-jitter, jitter), y0 + (y1 - y0) * t + r.uniform(-jitter, jitter)))
    out.append(pts[-1])
    d.line(out, fill=color, width=width, joint="curve")


def arrow(out, color, flip=False, seed=2):
    w, h = 700, 420
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    pts = [(40 + 620 * t, 330 - 260 * math.sin(math.pi * t * 0.9) + 40 * t) for t in [i / 30 for i in range(31)]]
    wobble_line(d, pts, color, 9, seed=seed)
    ex, ey = pts[-1]
    wobble_line(d, [(ex - 70, ey - 55), (ex, ey), (ex - 85, ey + 25)], color, 9, seed=seed + 1)
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    im.filter(ImageFilter.GaussianBlur(0.6)).save(D + out)


def scribble_circle(out, color, seed=3, w=700, h=300):
    r = random.Random(seed)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    pts = []
    for i in range(0, 430, 5):
        t = math.radians(i)
        rx, ry = (w / 2 - 20) * (1 + 0.04 * math.sin(3 * t)), (h / 2 - 20) * (1 + 0.05 * math.cos(2 * t))
        pts.append((w / 2 + rx * math.cos(t) + r.uniform(-2, 2), h / 2 + ry * math.sin(t) + r.uniform(-2, 2) + (i - 360) * 0.06 * (i > 360)))
    d.line(pts, fill=color, width=8, joint="curve")
    im.filter(ImageFilter.GaussianBlur(0.6)).save(D + out)


def underline(out, color, seed=4, w=900, h=80):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    wobble_line(d, [(10, 50), (w * 0.5, 32), (w - 10, 42)], color, 9, jitter=2, seed=seed)
    wobble_line(d, [(60, 64), (w * 0.6, 50), (w - 80, 58)], color, 6, jitter=2, seed=seed + 5)
    im.filter(ImageFilter.GaussianBlur(0.6)).save(D + out)


def star(out, color, seed=5, s=300):
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c = s / 2
    for k in range(4):
        a = math.radians(45 * k + random.Random(seed + k).uniform(-6, 6))
        wobble_line(d, [(c - math.cos(a) * 120, c - math.sin(a) * 120), (c + math.cos(a) * 120, c + math.sin(a) * 120)], color, 9, seed=seed + k)
    im.filter(ImageFilter.GaussianBlur(0.6)).save(D + out)


def phone(src, out, fx=0.5, W=600, H=1260):
    """Phone frame with the photo as a vertical video inside."""
    S = 2
    big = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    d.rounded_rectangle((0, 0, W * S, H * S), 92 * S, fill=(24, 20, 18, 255))
    inset = 16 * S
    sw, sh = W * S - 2 * inset, H * S - 2 * inset
    im = Image.open(src).convert("RGB")
    ar = sw / sh
    iw, ih = im.size
    if iw / ih > ar:
        nw = int(ih * ar); x0 = int((iw - nw) * fx); im = im.crop((x0, 0, x0 + nw, ih))
    else:
        nh = int(iw / ar); y0 = (ih - nh) // 2; im = im.crop((0, y0, iw, y0 + nh))
    im = im.resize((sw, sh), Image.LANCZOS)
    m = Image.new("L", (sw, sh), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, sw, sh), 78 * S, fill=255)
    big.paste(im, (inset, inset), m)
    d.rounded_rectangle((W * S / 2 - 70 * S, 34 * S, W * S / 2 + 70 * S, 72 * S), 20 * S, fill=(24, 20, 18, 255))
    # play button + progress bar
    cx, cy = W * S / 2, H * S / 2
    d.ellipse((cx - 62 * S, cy - 62 * S, cx + 62 * S, cy + 62 * S), fill=(255, 255, 255, 150))
    d.polygon([(cx - 18 * S, cy - 30 * S), (cx - 18 * S, cy + 30 * S), (cx + 32 * S, cy)], fill=(36, 30, 27, 230))
    d.rounded_rectangle((inset + 40 * S, H * S - inset - 60 * S, W * S - inset - 40 * S, H * S - inset - 52 * S), 4 * S, fill=(255, 255, 255, 110))
    d.rounded_rectangle((inset + 40 * S, H * S - inset - 60 * S, inset + 40 * S + int((sw - 80 * S) * 0.38), H * S - inset - 52 * S), 4 * S, fill=(255, 255, 255, 235))
    big.resize((W, H), Image.LANCZOS).save(D + out)


if __name__ == "__main__":
    paper((242, 234, 225), "bg_sand.jpg")
    paper((236, 222, 210), "bg_blush.jpg", grain=9)
    paper((46, 36, 32), "bg_dark.jpg", grain=7, fiber=5)
    for i in range(3):
        tape(f"tape{i}.png", seed=i)
    TERRA, INK, CREAM = (169, 84, 47, 255), (31, 26, 23, 255), (242, 234, 225, 255)
    arrow("arrow_terra.png", TERRA)
    arrow("arrow_terra_l.png", TERRA, flip=True, seed=9)
    arrow("arrow_cream.png", CREAM, seed=11)
    scribble_circle("circle_terra.png", TERRA)
    underline("underline_terra.png", TERRA)
    star("star_terra.png", TERRA)
    star("star_cream.png", CREAM, seed=8)
    print("ok")


def check(out, color, seed=12, s=300):
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    wobble_line(d, [(40, 160), (115, 240), (270, 50)], color, 16, jitter=2.5, seed=seed)
    im.filter(ImageFilter.GaussianBlur(0.7)).save(D + out)


if __name__ == "__main__":
    arrow("arrow_cream_l.png", (242, 234, 225, 255), flip=True, seed=13)
    check("check_terra.png", (169, 84, 47, 255))
    print("extra ok")
