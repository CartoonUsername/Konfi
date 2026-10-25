"""Fetches Pinterest numbers for every posted pin (last 30 days) and writes statistik.json + STATISTIK.md.
Claude reads these each week to decide which products and layouts get new pins."""
import os, json, datetime
from pinterest_api import Pinterest
D = os.path.dirname(os.path.abspath(__file__))
ideas = json.load(open(os.path.join(D, "ideen.json")))
end = datetime.date.today(); start = end - datetime.timedelta(days=30)
p = Pinterest(); rows = []
for x in ideas:
    if x.get("status") != "gepostet" or not x.get("pin_id"): continue
    try: m = p.pin_stats(x["pin_id"], start.isoformat(), end.isoformat())
    except Exception as e: print("Fehler", x["id"], e); continue
    rows.append({"id": x["id"], "slug": x["slug"], "layout": x["layout"], "bg": x["bg"], "headline": x["headline"].replace("\n", " "),
                 "ansichten": m.get("IMPRESSION", 0), "gespeichert": m.get("SAVE", 0), "klicks_pin": m.get("PIN_CLICK", 0), "klicks_shop": m.get("OUTBOUND_CLICK", 0)})
json.dump({"stand": end.isoformat(), "pins": rows}, open(os.path.join(D, "statistik.json"), "w"), ensure_ascii=False, indent=1)
def agg(key):
    g = {}
    for r in rows:
        a = g.setdefault(r[key], [0, 0, 0, 0])
        a[0] += 1; a[1] += r["ansichten"]; a[2] += r["gespeichert"]; a[3] += r["klicks_shop"]
    return sorted(g.items(), key=lambda kv: -kv[1][3])
md = [f"# Pinterest-Statistik (letzte 30 Tage, Stand {end})\n"]
for key, name in (("slug", "Produkt"), ("layout", "Layout")):
    md += [f"\n## Nach {name}\n", f"| {name} | Pins | Ansichten | Gespeichert | Klicks zum Shop |", "|---|---|---|---|---|"]
    md += [f"| {k} | {a[0]} | {a[1]} | {a[2]} | {a[3]} |" for k, a in agg(key)]
top = sorted(rows, key=lambda r: (-r["klicks_shop"], -r["gespeichert"]))[:10]
md += ["\n## Top 10 Pins\n", "| Pin | Überschrift | Ansichten | Klicks zum Shop |", "|---|---|---|---|"] + [f"| {r['id']} | {r['headline']} | {r['ansichten']} | {r['klicks_shop']} |" for r in top]
open(os.path.join(D, "STATISTIK.md"), "w").write("\n".join(md) + "\n")
print(len(rows), "Pins ausgewertet")
