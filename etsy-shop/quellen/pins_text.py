import sys, re
sys.path.insert(0, "/tmp/claude-0/-home-user-Konfi/5744e06e-3b2c-5f52-be59-cda8092ed6e0/scratchpad/texte")
src = open("/tmp/claude-0/-home-user-Konfi/5744e06e-3b2c-5f52-be59-cda8092ed6e0/scratchpad/texte/gen.py").read()
ns = {}; exec(src.split("BUN = {")[0], ns)
P = ns["P"]
out = ["# Pinterest-Texte\n", "Pro Produkt 2 Pins (a = hell, b = dunkel). Gleicher Text für beide, Link = Produktseite in deinem Shopify-Shop.\n",
       "Tipp: Lege Pinnwände an wie „Media Kit Vorlagen“, „Instagram Vorlagen“, „Content Planer“, „Abo Creator Tipps“ und pinne 1–3 Pins pro Tag statt alle auf einmal.\n"]
for slug, (t, intro, inside, fmt, tags) in sorted(P.items()):
    title = t.split(" | ")[0][:100]
    desc = f"{intro} {inside[0]}. Auf Deutsch, für Canva und PowerPoint, Sofort-Download. " + " ".join("#" + re.sub(r"[^a-zäöüß0-9]", "", x.lower()) for x in tags[:5])
    out += [f"\n## {slug}\nDateien: pins/{slug}-a.jpg, pins/{slug}-b.jpg\n", "**Titel**\n```\n" + title + "\n```\n", "**Beschreibung**\n```\n" + desc[:500] + "\n```\n"]
open("/home/user/Konfi/etsy-shop/PINTEREST-TEXTE.md", "w").write("\n".join(out)); print("ok", len(P))
