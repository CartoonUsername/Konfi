"""Runs once a day (GitHub Action): posts the next pins from ideen.json to Pinterest.
- only pins with status "bereit" and a link (config.json) are posted
- products take turns, so the same product never shows up twice in a row
- how many per day ramps up (config.json: pins_pro_tag)
Set DRY_RUN=1 to only print what would be posted."""
import os, json, datetime, sys
D = os.path.dirname(os.path.abspath(__file__))
cfg = json.load(open(os.path.join(D, "config.json")))
ideas = json.load(open(os.path.join(D, "ideen.json")))
today = datetime.date.today().isoformat()
dry = os.environ.get("DRY_RUN") == "1"
if not cfg.get("aktiv", True): sys.exit("Upload ist in config.json pausiert (aktiv: false).")
posted = [x for x in ideas if x.get("status") == "gepostet"]
first = min((x["datum"] for x in posted), default=today)
day_no = (datetime.date.fromisoformat(today) - datetime.date.fromisoformat(first)).days + 1
per_day = next(n for upto, n in cfg["pins_pro_tag"] if day_no <= upto)
already = sum(1 for x in posted if x.get("datum") == today)
left = per_day - already
if left <= 0: sys.exit(f"Heute schon {already} Pins gepostet.")
link = lambda s: cfg["links"].get(s) or cfg.get("standard_link", "")
ready = [x for x in ideas if x.get("status") == "bereit" and link(x["slug"]) and os.path.exists(os.path.join(D, x["bild"]))]
# fairness: products with the fewest posted pins first, higher 'prio' first, never the same product twice today
count = {}
for x in posted: count[x["slug"]] = count.get(x["slug"], 0) + 1
today_slugs = {x["slug"] for x in posted if x.get("datum") == today}
ready.sort(key=lambda x: (-x.get("prio", 0), count.get(x["slug"], 0), x["id"]))
batch, used = [], set(today_slugs)
for x in ready:
    if len(batch) >= left: break
    if x["slug"] in used: continue
    batch.append(x); used.add(x["slug"])
if not batch: sys.exit("Keine Pins bereit (fehlen Links in config.json?).")
if dry:
    for x in batch: print("würde posten:", x["id"], x["title"], "->", link(x["slug"]))
    sys.exit(0)
from pinterest_api import Pinterest
p = Pinterest(); boards = p.boards()
for x in batch:
    try:
        x["pin_id"] = p.create_pin(p.board_id(x["board"], boards), os.path.join(D, x["bild"]), x["title"], x["desc"], link(x["slug"]),
                                   x["headline"].replace("\n", " ") + " – " + x["sub"])
        x["status"], x["datum"] = "gepostet", today
        print("gepostet:", x["id"], x["pin_id"])
    except Exception as e:
        x["fehler"] = str(e)[:300]; print("Fehler bei", x["id"], e)
json.dump(ideas, open(os.path.join(D, "ideen.json"), "w"), ensure_ascii=False, indent=1)
