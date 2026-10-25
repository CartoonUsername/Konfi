"""Small Pinterest API v5 client using only the Python standard library.
Credentials come from environment variables (GitHub secrets):
  PINTEREST_ACCESS_TOKEN                      or
  PINTEREST_APP_ID + PINTEREST_APP_SECRET + PINTEREST_REFRESH_TOKEN  (token is refreshed on every run)
  PINTEREST_API (optional)  e.g. https://api-sandbox.pinterest.com/v5 for trial access"""
import os, json, base64, urllib.request, urllib.parse, urllib.error

API = os.environ.get("PINTEREST_API", "https://api.pinterest.com/v5").rstrip("/")

def _token():
    rt, app, sec = (os.environ.get(k, "") for k in ("PINTEREST_REFRESH_TOKEN", "PINTEREST_APP_ID", "PINTEREST_APP_SECRET"))
    if rt and app and sec:
        body = urllib.parse.urlencode({"grant_type": "refresh_token", "refresh_token": rt}).encode()
        req = urllib.request.Request(API + "/oauth/token", data=body, method="POST", headers={
            "Authorization": "Basic " + base64.b64encode(f"{app}:{sec}".encode()).decode(), "Content-Type": "application/x-www-form-urlencoded"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                res = json.load(r)
        except urllib.error.HTTPError as e:
            raise SystemExit(f"Pinterest-Zugang abgelaufen oder ungültig ({e.code}). Neuen Refresh Token erzeugen und das GitHub-Secret "
                             "PINTEREST_REFRESH_TOKEN ersetzen (siehe ANLEITUNG-PINTEREST.md).")
        new_rt = res.get("refresh_token")
        if new_rt and new_rt != rt:
            # GitHub secrets cannot be updated from here; warn loudly so the owner replaces it before the old one expires.
            print("::warning::Pinterest hat einen neuen Refresh Token ausgegeben. Bitte das GitHub-Secret PINTEREST_REFRESH_TOKEN "
                  "durch den neuen Token ersetzen (siehe ANLEITUNG-PINTEREST.md, Abschnitt 'Zugang erneuern').")
        return res["access_token"]
    t = os.environ.get("PINTEREST_ACCESS_TOKEN", "")
    if not t: raise SystemExit("Kein Pinterest-Zugang: PINTEREST_ACCESS_TOKEN oder Refresh-Token fehlt (siehe ANLEITUNG-PINTEREST.md).")
    return t

class Pinterest:
    def __init__(self):
        self.t = _token()
    def call(self, method, path, data=None, query=None):
        url = API + path + ("?" + urllib.parse.urlencode(query) if query else "")
        req = urllib.request.Request(url, method=method, data=json.dumps(data).encode() if data is not None else None,
                                     headers={"Authorization": "Bearer " + self.t, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"Pinterest {method} {path}: {e.code} {e.read().decode()[:300]}")
    def boards(self):
        out, bm = {}, None
        while True:
            q = {"page_size": 250}
            if bm: q["bookmark"] = bm
            r = self.call("GET", "/boards", query=q)
            for b in r.get("items", []): out[b["name"]] = b["id"]
            bm = r.get("bookmark")
            if not bm: return out
    def board_id(self, name, cache):
        if name not in cache:
            cache[name] = self.call("POST", "/boards", {"name": name, "description": "Vorlagen auf Deutsch für Creator.", "privacy": "PUBLIC"})["id"]
        return cache[name]
    def create_pin(self, board_id, image_path, title, desc, link, alt):
        data = base64.b64encode(open(image_path, "rb").read()).decode()
        body = {"board_id": board_id, "title": title[:100], "description": desc[:500], "alt_text": alt[:500],
                "media_source": {"source_type": "image_base64", "content_type": "image/jpeg", "data": data}}
        if link: body["link"] = link
        return self.call("POST", "/pins", body)["id"]
    def pin_stats(self, pin_id, start, end):
        r = self.call("GET", f"/pins/{pin_id}/analytics", query={"start_date": start, "end_date": end,
                      "metric_types": "IMPRESSION,SAVE,PIN_CLICK,OUTBOUND_CLICK", "app_types": "ALL"})
        a = r.get("all") or {}
        return a.get("summary_metrics") or a.get("lifetime_metrics") or {}  # summary = the requested date range
