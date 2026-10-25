import sys, json, os
from PIL import Image
B = os.path.dirname(os.path.abspath(__file__)); P = B + "/pool/"
sizes = json.load(open(P + "sizes.json"))
for a in sys.argv[1:]:
    key, src = a.split("=")
    im = Image.open(src).convert("RGB"); s = 1700 / max(im.size)
    im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS); im.save(P + key + ".jpg", quality=86)
    sizes[key] = list(im.size)
json.dump(sizes, open(P + "sizes.json", "w"))
print("pool", len(sizes))
