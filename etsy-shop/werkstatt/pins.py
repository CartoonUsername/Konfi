"""Pinterest pins (1000 x 1500), two variants per product, in each product's style."""
import os, glob, json
from PIL import Image, ImageDraw
from etsy import Kit, place, fit, device, B
W, H = 1000, 1500
K = os.path.dirname(B); OUT = B + "/pins"; os.makedirs(OUT, exist_ok=True)
# slug: (style, headline A, line A, headline B, line B)
PIN = {
 "01-ugc-starter-kit": ("terra", "UGC\nSTARTER-KIT", "Media-Kit + 5 Pitch-Mails auf Deutsch", "SO SCHREIBST\nDU MARKEN AN", "5 Mail-Vorlagen für deine ersten Kooperationen"),
 "02-media-kit-1-seite": ("kobalt", "MEDIA-KIT\nAUF 1 SEITE", "Vorlage für Creator, auf Deutsch", "DEIN MEDIA-KIT\nIN 20 MINUTEN", "einfach Zahlen und Fotos eintragen"),
 "03-preisliste-rate-card": ("mono", "PREISLISTE\nFÜR CREATOR", "Rate Card mit Nutzungsrechten", "WAS KOSTET\nEIN UGC-VIDEO?", "Preisliste zum Anpassen"),
 "04-angebot-kooperation": ("salbei", "ANGEBOT\nVORLAGE", "für Kooperationen mit Marken", "SO SAGEN\nMARKEN JA", "Angebot mit Rechenbeispiel"),
 "05-rechnung-creator": ("rosa", "RECHNUNG\nVORLAGE", "für Creator, auch Kleinunternehmer", "RECHNUNG\nOHNE STRESS", "alle Pflichtangaben erklärt"),
 "06-briefing-formular": ("salbei", "BRIEFING\nFORMULAR", "für UGC-Creator", "WENIGER\nRÜCKFRAGEN", "das Formular, das du Marken schickst"),
 "07-ugc-portfolio": ("rosa", "UGC\nPORTFOLIO", "Vorlage im Querformat", "ZEIG DEINE\nBESTEN VIDEOS", "Portfolio wie ein Magazin"),
 "08-link-in-bio": ("kobalt", "LINK IN BIO\nVORLAGE", "3 Designs fürs Handy", "DEINE BIO\nVERDIENT MEHR", "Link-Seite für Instagram & TikTok"),
 "09-case-study": ("mono", "CASE STUDY\nVORLAGE", "für UGC-Creator", "ZEIG, WAS\nDEINE VIDEOS\nBRINGEN", "Ergebnisse, die Marken überzeugen"),
 "10-content-planer": ("terra", "CONTENT\nPLANER", "Monat, Woche, Ideen", "NIE WIEDER\nNICHTS ZUM\nPOSTEN", "Content-Planer auf Deutsch"),
 "11-hook-sammlung": ("zitrus", "100 HOOKS\nAUF DEUTSCH", "für Reels, TikTok & UGC", "DIE ERSTEN\n3 SEKUNDEN", "100 Videoeinstiege zum Kopieren"),
 "12-skript-vorlage": ("salbei", "SKRIPT\nVORLAGE", "für UGC-Videos", "VIDEO-SKRIPT\nIN 10 MINUTEN", "Hook bis Call-to-Action"),
 "13-instagram-posts": ("rosa", "30 INSTAGRAM\nVORLAGEN", "Tipps, Zitate, Karussells", "DEIN FEED,\nABER SCHÖN", "30 Post-Vorlagen für Canva"),
 "14-story-vorlagen": ("kobalt", "20 STORY\nVORLAGEN", "Umfragen, Fragen, Wochenplan", "STORIES, DIE\nANTWORTEN\nBEKOMMEN", "mit Sticker-Flächen"),
 "15-reels-cover": ("mono", "REELS\nCOVER", "10 Vorlagen für dein Raster", "EIN PROFIL,\nDAS AUFGERÄUMT\nAUSSIEHT", "Reels-Cover für Instagram"),
 "16-kooperations-tracker": ("lavendel", "KOOPERATIONS\nTRACKER", "Marken, Deals, Zahlungen", "WER HAT\nSCHON\nBEZAHLT?", "Tracker mit Pipeline-Board"),
 "17-finanzplaner-creator": ("zitrus", "FINANZPLANER\nFÜR CREATOR", "Einnahmen, Ausgaben, Rücklage", "GELDKRAM\nIN 15 MINUTEN", "einmal im Monat reicht"),
 "18-checklisten-set": ("terra", "CHECKLISTEN\nFÜR CREATOR", "Drehtag, Abgabe, Kooperation", "NIE WIEDER\nWAS\nVERGESSEN", "5 Checklisten zum Abhaken"),
 "21-preismenue-abo": ("noir", "PREISMENÜ\nFÜR ABO-CREATOR", "Abo-Stufen und Extras", "DEINE PREISE,\nELEGANT", "wie eine Speisekarte"),
 "22-dm-vorlagen-abo": ("noir", "DM\nVORLAGEN", "33 Nachrichten für Abo-Creator", "WAS SCHREIBE\nICH NEUEN\nFANS?", "Willkommensnachrichten zum Kopieren"),
 "23-content-kalender-abo": ("noir", "CONTENT\nKALENDER", "für Abo-Creator", "FEED, PROMO,\nSHOOTINGS", "alles in einem Kalender"),
 "24-promo-posts-abo": ("noir", "12 PROMO\nPOSTS", "jugendfrei für dein Abo", "WERBUNG,\nDIE ERLAUBT\nIST", "Promo-Posts für Instagram"),
 "25-einnahmen-tracker-abo": ("noir", "EINNAHMEN\nTRACKER", "für Abo-Creator", "BRUTTO IST\nNICHT NETTO", "was wirklich bei dir bleibt"),
 "26-fan-umfragen-wunschliste": ("noir", "FAN\nUMFRAGEN", "10 Story-Vorlagen", "LASS DEINE\nFANS MIT-\nBESTIMMEN", "Umfragen und Wunschlisten"),
}
def pages(slug):
    if slug == "01-ugc-starter-kit":
        return [Image.open(K + f"/etsy/pages/{n}.png").convert("RGBA") for n in ("mk-1", "mk-2", "pg-2", "mk-4")]
    fs = sorted(glob.glob(B + f"/dist/{slug}/etsy/pages/p-*.png"), key=lambda x: int(x.rsplit("-", 1)[1][:-4]))
    return [Image.open(f).convert("RGBA") for f in fs]
def caps(k, d, xy, text, size, fill, maxw, anchor="la"):
    return k.caps(d, xy, text, size, fill, maxw, anchor=anchor)
def bottom(k, d, xy, text, size, anchor="la"):
    return d.multiline_textbbox(xy, text, font=k.f("caps", size), anchor=anchor, spacing=int(size * 0.08), align="center" if anchor[0] == "m" else "left")[3]
for slug, (style, ha, la, hb, lb) in PIN.items():
    k = Kit(style); P = pages(slug); n = len(P)
    land = P[0].width > P[0].height; tall = P[0].height > P[0].width * 1.5
    pick = lambda i: P[min(i, n - 1)]
    # A: light, headline top, fanned pages below
    cv = k.bg(k.paper).resize((W, H)); d = ImageDraw.Draw(cv)
    d.text((W // 2, 70), "VORLAGE AUF DEUTSCH", font=k.f("bold", 26), fill=k.acc, anchor="ma")
    sz = caps(k, d, (W // 2, 120), ha, 130, k.ink, 860, anchor="ma")
    y = bottom(k, d, (W // 2, 120), ha, sz, "ma") + 28
    d.text((W // 2, y), la, font=k.f("serif", 44), fill=k.acc, anchor="ma")
    top = y + 90
    box = (760, 560) if land else ((360, 760) if tall else (480, 680))
    cy = top + (H - 120 - top) / 2
    for im, dx, r in ((pick(1), -190, -8), (pick(2), 190, 8), (pick(0), 0, 0)):
        place(cv, fit(im, *box), W / 2 + dx * (0.6 if land else 1), cy + (20 if r else 0), r, shadow=16)
    d.rounded_rectangle((W // 2 - 260, H - 110, W // 2 + 260, H - 45), 33, fill=k.dark + (255,))
    d.text((W // 2, H - 78), "Canva & PowerPoint", font=k.f("bold", 30), fill=k.paper, anchor="mm")
    cv.convert("RGB").save(f"{OUT}/{slug}-a.jpg", quality=86, optimize=True)
    # B: dark, big page/device top, statement bottom
    cv = k.bg(k.dark).resize((W, H)); d = ImageDraw.Draw(cv)
    im = pick(1 if n > 1 else 0)
    if tall: place(cv, device(fit(im, 400, 820), True), W / 2, 500, -3, 22, 150)
    elif land: place(cv, device(fit(im, 860, 620)), W / 2, 440, -2, 22, 150)
    else: place(cv, fit(im, 600, 820), W / 2, 480, 3, 24, 160)
    yb = 960 if not land else 860
    sz = 112
    while sz > 50 and (bottom(k, d, (80, yb), hb, sz) > H - 210 or max(d.textlength(l, font=k.f("caps", sz)) for l in hb.split("\n")) > 840): sz -= 4
    sz = caps(k, d, (80, yb), hb, sz, k.paper, 840)
    d.text((80, bottom(k, d, (80, yb), hb, sz) + 28), lb, font=k.f("serif", 42), fill=k.acc)
    d.text((80, H - 90), "Vorlage auf Deutsch · Sofort-Download", font=k.f("body", 28), fill=k.muted)
    cv.convert("RGB").save(f"{OUT}/{slug}-b.jpg", quality=86, optimize=True)
    print("pin", slug)
