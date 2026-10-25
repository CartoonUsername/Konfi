import json, glob, os, sys
D = "/home/user/Konfi/etsy-shop/upload"
# slug: (title, intro, inside list, format line, tags)
P = {
"01-ugc-starter-kit": ("UGC Starter-Kit auf Deutsch | Media-Kit Vorlage + Pitch-Guide für Creator | Canva & PowerPoint | 12 Seiten",
 "Dein Einstieg in bezahlte Markenkooperationen: ein Media-Kit, das professionell aussieht, und fünf fertige Mails, mit denen du Marken anschreibst.",
 ["Media-Kit mit 7 Seiten: Cover, Über mich, Community, Pakete und Preise, Arbeitsproben, Marken, Kontakt", "Pitch-Guide mit 5 Seiten: 5 Mail-Vorlagen und 15 Betreffzeilen", "Checkliste vor dem Abschicken"], "A4, 12 Seiten in 2 Dateien",
 ["ugc media kit", "media kit vorlage", "ugc creator", "pitch vorlage", "canva vorlage", "influencer mediakit", "creator vorlage", "ugc deutsch", "kooperation marke", "rate card", "content creator", "ugc portfolio", "media kit deutsch"]),
"02-media-kit-1-seite": ("Media-Kit Vorlage 1 Seite auf Deutsch | Influencer & UGC Creator | 2 Varianten | Canva & PowerPoint",
 "Alles, was eine Marke wissen will, auf einer einzigen Seite. Ideal als Mail-Anhang, wenn es schnell gehen soll.",
 ["Media-Kit auf einer Seite in 2 Varianten (hell und dunkel)", "Bereiche für Zahlen, Zielgruppe, Pakete und Kontakt", "Platz für Fotos und Arbeitsproben"], "A4, 2 Seiten",
 ["media kit 1 seite", "media kit vorlage", "influencer vorlage", "ugc creator", "canva vorlage", "mediakit deutsch", "creator media kit", "one page media kit", "kooperation", "instagram creator", "tiktok creator", "blogger vorlage", "content creator"]),
"03-preisliste-rate-card": ("Preisliste Vorlage für Creator | Rate Card auf Deutsch | UGC & Influencer | Nutzungsrechte | Canva & PowerPoint",
 "Zeig Marken klar, was du kostest. Pakete, Extras und Nutzungsrechte sind schon vorbereitet, du trägst nur deine Preise ein.",
 ["Preisliste mit Einzelleistungen und Paketen", "Extras wie Express, Überarbeitung, Exklusivität", "Seite zu Nutzungsrechten und Laufzeiten", "Beispielpreise zum Anpassen"], "A4, 3 Seiten",
 ["preisliste vorlage", "rate card", "ugc preisliste", "influencer preise", "creator preisliste", "canva vorlage", "nutzungsrechte ugc", "ugc creator", "preise kooperation", "rate card deutsch", "content creator", "media kit preise", "ugc vorlage"]),
"04-angebot-kooperation": ("Angebot Vorlage für Kooperationen | UGC & Influencer Creator | mit Rechenbeispiel | Deutsch | Canva & PowerPoint",
 "Ein Angebot, das Marken schnell zusagen lässt: Leistungen, Preis, Nutzungsrechte und Zahlungsbedingungen auf einen Blick.",
 ["Angebotsvorlage mit Positionen, Summe und Umsatzsteuer", "Abschnitte für Lieferzeit, Überarbeitungen und Nutzungsrechte", "Beispiel komplett ausgefüllt", "Seite: So läuft die Zusammenarbeit"], "A4, 2 Seiten",
 ["angebot vorlage", "kooperation angebot", "ugc angebot", "influencer angebot", "creator vorlage", "canva vorlage", "angebot deutsch", "ugc creator", "kostenvoranschlag", "freelancer angebot", "content creator", "marken kooperation", "ugc vorlage"]),
"05-rechnung-creator": ("Rechnung Vorlage für Creator | mit Umsatzsteuer und Kleinunternehmer §19 | UGC & Influencer | Deutsch | Canva",
 "Rechnungen schreiben, ohne lange zu suchen, was draufstehen muss. Zwei Varianten und eine Übersicht der Pflichtangaben.",
 ["Rechnung mit ausgewiesener Umsatzsteuer", "Rechnung für Kleinunternehmer nach §19 UStG", "Seite mit allen Pflichtangaben erklärt", "Beispiel ausgefüllt"], "A4, 3 Seiten",
 ["rechnung vorlage", "rechnungsvorlage", "kleinunternehmer", "rechnung creator", "ugc rechnung", "influencer rechnung", "canva vorlage", "rechnung deutsch", "freelancer rechnung", "rechnung 19 ustg", "content creator", "selbstständig", "ugc creator"]),
"06-briefing-formular": ("Briefing Formular Vorlage für UGC Creator | Marken-Briefing auf Deutsch | spart Rückfragen | Canva & PowerPoint",
 "Schick Marken dieses Formular, bevor du drehst. So weißt du genau, was sie wollen, und musst weniger überarbeiten.",
 ["Formular zu Marke, Produkt, Ziel und Zielgruppe", "Abschnitte zu Botschaft, Do's und Don'ts, Deadline", "Platz für Referenzen und Nutzungsrechte"], "A4, 3 Seiten",
 ["briefing vorlage", "ugc briefing", "kunden fragebogen", "creator formular", "canva vorlage", "briefing deutsch", "ugc creator", "influencer briefing", "onboarding kunde", "content briefing", "kooperation", "ugc vorlage", "freelancer vorlage"]),
"07-ugc-portfolio": ("UGC Portfolio Vorlage im Querformat | 6 Seiten auf Deutsch | Video Arbeitsproben | Creator | Canva & PowerPoint",
 "Zeig deine besten Videos wie in einem Magazin. Ein Portfolio, das Marken gern durchblättern.",
 ["6 Seiten: Cover, Über mich, Leistungen, Arbeitsproben, Marken, Kontakt", "Handy-Mockups für deine Videos", "Querformat zum Verschicken als PDF"], "Querformat, 6 Seiten",
 ["ugc portfolio", "portfolio vorlage", "ugc creator", "creator portfolio", "canva portfolio", "video portfolio", "ugc deutsch", "media kit", "content creator", "influencer vorlage", "kooperation marke", "portfolio deutsch", "ugc vorlage"]),
"08-link-in-bio": ("Link in Bio Vorlage auf Deutsch | 3 Designs fürs Handy | Instagram & TikTok Creator | Canva Webseite",
 "Eine Seite für alle deine Links, die nach dir aussieht und nicht nach Baukasten.",
 ["3 Link-in-Bio-Designs im Handyformat", "Bereiche für Links, Angebote und Kontakt", "auch als Canva-Website nutzbar"], "Hochformat, 3 Designs",
 ["link in bio", "linktree vorlage", "link in bio canva", "instagram bio", "tiktok bio", "creator webseite", "canva webseite", "link seite", "ugc creator", "influencer vorlage", "bio link", "content creator", "deutsch vorlage"]),
"09-case-study": ("Case Study Vorlage für UGC Creator | Ergebnisse zeigen | mit Beispiel | Deutsch | Canva & PowerPoint",
 "Zeig Marken nicht nur Videos, sondern was sie gebracht haben. So wirst du von der Creatorin zur Partnerin.",
 ["Case Study: Aufgabe, Umsetzung, Ergebnis", "Zahlen-Grafik und Kundenstimme", "komplettes Beispiel zum Nachmachen"], "Querformat, 4 Seiten",
 ["case study vorlage", "ugc case study", "creator ergebnisse", "fallstudie", "ugc creator", "canva vorlage", "portfolio vorlage", "kooperation", "content creator", "influencer vorlage", "ugc deutsch", "kundenreferenz", "media kit"]),
"10-content-planer": ("Content Planer Vorlage auf Deutsch | Monat, Woche, Ideen | für Creator | Querformat | Canva & PowerPoint",
 "Plan deinen Content einmal im Monat und hör auf, jeden Tag neu zu überlegen, was du postest.",
 ["Monatsübersicht und Wochenplan", "Ideen- und Hook-Sammlung", "Monatsrückblick", "zum Ausfüllen und Drucken"], "Querformat, 5 Seiten",
 ["content planer", "content kalender", "social media planer", "instagram planer", "redaktionsplan", "creator planer", "canva vorlage", "posting plan", "tiktok planer", "ugc creator", "planer deutsch", "content plan", "wochenplaner"]),
"11-hook-sammlung": ("100 Hooks für Videos auf Deutsch | Reels, TikTok & UGC | 10 Kategorien | Videoeinstiege zum Kopieren | PDF",
 "Die ersten 3 Sekunden entscheiden. Hier sind 100 Einstiege, die du sofort für deine Videos nutzen kannst.",
 ["100 Hooks in 10 Kategorien", "für Produkte, Tipps, Storys, Vergleiche und mehr", "zum Kopieren und Anpassen"], "A4",
 ["hooks deutsch", "video hooks", "reels hooks", "tiktok hooks", "ugc hooks", "content ideen", "instagram reels", "hook liste", "creator tipps", "ugc creator", "social media", "video ideen", "content creator"]),
"12-skript-vorlage": ("Skript Vorlage für UGC Videos | Hook bis Call-to-Action | Shotliste | Deutsch | Canva & PowerPoint",
 "Schreib Videos in 10 Minuten statt einer Stunde. Mit Aufbau, Shotliste und Beispielskript.",
 ["Skript-Vorlage: Hook, Problem, Lösung, Beweis, Aufruf", "Shotliste für den Drehtag", "Beispielskript für 30 Sekunden"], "A4, 4 Seiten",
 ["skript vorlage", "video skript", "ugc skript", "reels skript", "tiktok skript", "shotliste", "drehbuch vorlage", "creator vorlage", "canva vorlage", "ugc creator", "content creator", "video planung", "skript deutsch"]),
"13-instagram-posts": ("30 Instagram Post Vorlagen auf Deutsch | Tipps, Zitate, Karussells | 4:5 | Creator | Canva & PowerPoint",
 "Ein Feed, der zusammenpasst, ohne jeden Post neu zu gestalten.",
 ["30 Posts im Format 4:5", "10 Layouts: Tipps, Zitate, Karussell, Foto, Vorher/Nachher und mehr", "Texte und Fotos einfach austauschen"], "4:5, 30 Posts",
 ["instagram vorlagen", "instagram posts", "canva instagram", "social media vorlage", "instagram feed", "post vorlagen", "karussell vorlage", "creator vorlage", "instagram deutsch", "ugc creator", "content vorlage", "feed vorlage", "influencer posts"]),
"14-story-vorlagen": ("20 Instagram Story Vorlagen auf Deutsch | Umfragen, Fragen, Wochenplan | 9:16 | Canva & PowerPoint",
 "Stories, die zum Antworten einladen. Mit Flächen für Umfrage-, Fragen- und Link-Sticker.",
 ["20 Stories im Format 9:16", "Fragen, Umfrage, Wochenplan, Review, Tipp, Countdown und mehr", "Sticker-Flächen schon eingeplant"], "9:16, 20 Stories",
 ["instagram story", "story vorlagen", "canva story", "instagram vorlagen", "story umfrage", "social media vorlage", "story deutsch", "creator vorlage", "instagram creator", "ugc creator", "story template", "content vorlage", "influencer story"]),
"15-reels-cover": ("10 Reels Cover Vorlagen | einheitliches Profil-Raster | 9:16 | Instagram Creator | Deutsch | Canva",
 "Damit dein Profil auf den ersten Blick aufgeräumt aussieht. Die Titel bleiben auch im Raster sichtbar.",
 ["10 Reels-Cover in 3 Layouts", "Titel im sichtbaren Bereich des Rasters", "Fotos einfach austauschen"], "9:16, 10 Cover",
 ["reels cover", "instagram reels", "reel cover vorlage", "canva reels", "instagram raster", "instagram vorlagen", "feed vorlage", "creator vorlage", "reels deutsch", "social media", "ugc creator", "content creator", "tiktok cover"]),
"16-kooperations-tracker": ("Kooperations Tracker Vorlage | Marken, Deals, Zahlungen | Pipeline Board | Creator | Deutsch | Querformat",
 "Alle Kooperationen an einem Ort: wer angefragt hat, was gebucht ist und wer noch nicht bezahlt hat.",
 ["Übersicht aller Kooperationen", "Pipeline-Board von Anfrage bis Bezahlt", "Liste der Marken-Kontakte", "Jahresübersicht"], "Querformat, 4 Seiten",
 ["kooperation tracker", "creator tracker", "ugc tracker", "influencer planer", "kunden tracker", "pipeline vorlage", "creator planer", "canva vorlage", "ugc creator", "auftrag tracker", "freelancer planer", "content creator", "tracker deutsch"]),
"17-finanzplaner-creator": ("Finanzplaner für Creator auf Deutsch | Einnahmen, Ausgaben, Rechnungen, Steuer-Rücklage | A4 | Canva",
 "Einmal im Monat 15 Minuten, und du weißt immer, wie viel du verdienst und was du zurücklegen musst.",
 ["Monatsübersicht für Einnahmen und Ausgaben", "Rechnungs-Tracker", "Steuer-Rücklage pro Monat", "Jahresübersicht"], "A4, 5 Seiten",
 ["finanzplaner", "einnahmen ausgaben", "creator finanzen", "budget planer", "steuer rücklage", "rechnung tracker", "selbstständig", "finanzen vorlage", "ugc creator", "kleinunternehmer", "canva vorlage", "planer deutsch", "content creator"]),
"18-checklisten-set": ("Checklisten Set für Creator | Drehtag, Abgabe, Kooperation, Equipment | 5 Listen | Deutsch | A4",
 "Nie wieder etwas vergessen: fünf Checklisten für die Momente, in denen es zählt.",
 ["Drehtag", "Abgabe an die Marke", "Neue Kooperation", "Equipment-Packliste", "Monatsabschluss"], "A4, 5 Seiten",
 ["checkliste creator", "ugc checkliste", "drehtag checkliste", "creator vorlage", "content checkliste", "packliste", "ugc creator", "canva vorlage", "influencer tipps", "checkliste deutsch", "content creator", "kooperation", "video dreh"]),
"21-preismenue-abo": ("Preismenü Vorlage für Abo Creator | Abo-Stufen und Extras | elegant | Deutsch | Canva & PowerPoint",
 "Zeig deinen Fans klar, was sie in welcher Abo-Stufe bekommen, und biete Extras an wie in einem guten Restaurant.",
 ["Menü mit 3 Abo-Stufen", "Extras à la carte", "leere Vorlage zum Ausfüllen"], "A4, 3 Seiten",
 ["abo creator", "preismenü vorlage", "fan creator", "preisliste creator", "abo preise", "creator menü", "canva vorlage", "creator vorlage", "fan abo", "abo modell", "content creator", "preisliste deutsch", "creator business"]),
"22-dm-vorlagen-abo": ("Willkommensnachrichten und DM Vorlagen für Abo Creator | 33 Nachrichten | Deutsch | zum Kopieren",
 "Fertige Nachrichten für jede Situation: neue Fans begrüßen, Danke sagen, Stille zurückholen und freundlich Grenzen setzen.",
 ["12 Nachrichten in 4 Teilen: Willkommen, Danke, Zurückholen, Grenzen", "21 Schnellantworten", "Platzhalter wie [Name] zum Ersetzen"], "A4, 6 Seiten",
 ["dm vorlagen", "willkommensnachricht", "abo creator", "fan creator", "nachrichten vorlage", "creator nachrichten", "fan nachrichten", "creator vorlage", "chat vorlagen", "abo community", "content creator", "creator business", "deutsch vorlage"]),
"23-content-kalender-abo": ("Content Kalender für Abo Creator | Feed, Nachrichten, Promo, Shootings | Querformat | Deutsch | Canva",
 "Plan Feed, Massen-Nachrichten, Promo und Shootings an einem Ort, damit du nicht jeden Tag improvisierst.",
 ["Monatsplan mit Legende", "Wochenplan nach Bereichen", "Ideenspeicher", "Shooting-Plan mit Shotliste"], "Querformat, 4 Seiten",
 ["content kalender", "abo creator", "fan creator", "creator planer", "content planer", "shooting plan", "redaktionsplan", "canva vorlage", "creator vorlage", "wochenplaner", "content creator", "creator business", "planer deutsch"]),
"24-promo-posts-abo": ("12 Promo Posts für Abo Creator | jugendfreie Werbung für Instagram und Co | 4:5 | Deutsch | Canva",
 "Werbung für dein Abo, die auf jeder Plattform erlaubt ist: elegant, jugendfrei und einheitlich.",
 ["12 Posts im Format 4:5", "4 Layouts: Foto, Typo, Liste, Zitat", "Themen wie neue Serie, Aktion, Live, Danke"], "4:5, 12 Posts",
 ["promo posts", "abo creator", "fan creator", "instagram vorlagen", "creator promo", "canva instagram", "social media vorlage", "abo werbung", "post vorlagen", "creator vorlage", "content creator", "creator business", "instagram deutsch"]),
"25-einnahmen-tracker-abo": ("Einnahmen Tracker für Abo Creator | Abos, Trinkgeld, Gebühren, brutto netto | Deutsch | A4",
 "Wisse genau, was nach Plattformgebühren und Ausgaben wirklich bei dir bleibt.",
 ["Monatsübersicht nach Einnahmequelle", "Abonnenten-Entwicklung", "Rechner brutto bis netto", "Jahresübersicht"], "A4, 4 Seiten",
 ["einnahmen tracker", "abo creator", "fan creator", "creator finanzen", "finanzplaner", "einnahmen planer", "budget tracker", "creator vorlage", "abo einnahmen", "selbstständig", "content creator", "creator business", "tracker deutsch"]),
"26-fan-umfragen-wunschliste": ("Fan Umfragen und Wunschliste | 10 Story Vorlagen für Abo Creator | 9:16 | Deutsch | Canva",
 "Lass deine Fans mitbestimmen. Das bringt Nähe und dir Ideen für die nächsten Wochen.",
 ["10 Stories im Format 9:16", "Umfrage, Dies oder Das, Wunschliste, Quiz, Top 3", "Sticker-Flächen eingeplant"], "9:16, 10 Stories",
 ["fan umfrage", "story vorlagen", "abo creator", "fan creator", "instagram story", "story umfrage", "wunschliste", "canva story", "creator vorlage", "community", "content creator", "creator business", "story deutsch"]),
}
BUN = {
"19-creator-komplettpaket": ("Creator Komplettpaket | 12 Vorlagen auf Deutsch | Media-Kit, Preisliste, Rechnung, Tracker | UGC | Canva", 49, 129,
 "Alles, was du brauchst, um Marken anzuschreiben, Angebote zu machen, Rechnungen zu stellen und den Überblick zu behalten.",
 ["01", "02", "03", "04", "05", "06", "07", "08", "09", "16", "17", "18"], 4,
 ["ugc bundle", "creator bundle", "media kit vorlage", "ugc creator", "rechnung vorlage", "preisliste vorlage", "canva bundle", "creator paket", "influencer vorlage", "ugc deutsch", "content creator", "kooperation", "vorlagen set"]),
"20-content-paket": ("Content Paket für Creator | 6 Vorlagen | Planer, 100 Hooks, Skript, Posts, Stories, Reels Cover | Deutsch", 34, 71,
 "Planen, schreiben, posten: alles für deinen Content in einem Paket.",
 ["10", "11", "12", "13", "14", "15"], 4,
 ["content bundle", "instagram vorlagen", "content planer", "hooks deutsch", "story vorlagen", "reels cover", "canva bundle", "social media paket", "creator vorlage", "ugc creator", "instagram posts", "content creator", "vorlagen set"]),
"27-abo-creator-komplettpaket": ("Abo Creator Komplettpaket | 6 Vorlagen | Preismenü, DM Vorlagen, Kalender, Promo, Tracker | Deutsch", 35, 69,
 "Preise zeigen, Fans begrüßen, Content planen, jugendfrei werben und Einnahmen im Blick behalten.",
 ["21", "22", "23", "24", "25", "26"], 3,
 ["abo creator", "fan creator", "creator bundle", "dm vorlagen", "content kalender", "promo posts", "einnahmen tracker", "canva bundle", "creator vorlage", "creator paket", "content creator", "creator business", "vorlagen set"]),
}
PRICE = {"01-ugc-starter-kit": 14}
for d in glob.glob("/tmp/claude-0/-home-user-Konfi/5744e06e-3b2c-5f52-be59-cda8092ed6e0/scratchpad/ugc-kit/shop/dist/*/meta.json"):
    m = json.load(open(d)); PRICE[m["slug"]] = m["price"]
NAMES = {k: v[0].split(" | ")[0] for k, v in P.items()}
err = []
def chk(slug, title, tags):
    if len(title) > 140: err.append(f"{slug}: Titel {len(title)}")
    if len(tags) != 13: err.append(f"{slug}: {len(tags)} Tags")
    for t in tags:
        if len(t) > 20: err.append(f"{slug}: Tag zu lang '{t}'")
    if len(set(tags)) != len(tags): err.append(f"{slug}: doppelte Tags")
AI = "Die Personen auf den Beispielfotos wurden mit KI erstellt (Higgsfield) und sind nicht echt. Sie zeigen nur, wie die Vorlage aussehen kann. Du ersetzt sie durch deine eigenen Fotos. Layout, Texte und Gestaltung sind von mir."
FOOT = """SO FUNKTIONIERT'S
1. Nach dem Kauf lädst du die ZIP-Datei herunter (unter "Käufe und Bewertungen").
2. Canva: "Erstellen" > "Importieren" und die PPTX-Datei hochladen. Oder die Datei in PowerPoint oder Keynote öffnen.
3. Texte, Farben und Fotos anpassen und als PDF oder Bild speichern.

WICHTIG
• Das ist ein digitales Produkt. Es wird nichts verschickt.
• Die Schriften sind kostenlos (Google Fonts), die Liste liegt in der ZIP-Datei.
• Farben können am Bildschirm leicht anders aussehen.
• Nur für deine eigene Nutzung, auch geschäftlich. Weiterverkauf oder Weitergabe der Vorlagen ist nicht erlaubt.
• Keine Rechts- oder Steuerberatung.

KI-HINWEIS
""" + AI + """

WIDERRUF
Mit dem Kauf stimmst du zu, dass der Download sofort startet. Dadurch erlischt dein Widerrufsrecht für digitale Inhalte (§ 356 Abs. 5 BGB). Wenn etwas mit der Datei nicht stimmt, schreib mir einfach, ich helfe dir gern."""
out = ["# Etsy-Texte\n", "Pro Angebot: Titel, Preis, Beschreibung und 13 Tags. Alles zum Kopieren.\n",
       "**Bei jedem Angebot in Etsy einstellen:** Art = Digital · Wer hat es gemacht? = Ich · Was ist es? = Ein fertiges Produkt · Wann wurde es gemacht? = 2020–2026 · Kategorie: Papier- & Partybedarf > Papier > Vorlagen (oder Vorschlag von Etsy) · Dateien: die ZIP-Datei(en) aus dem Ordner.\n"]
for slug in sorted(P):
    t, intro, inside, fmt, tags = P[slug]; chk(slug, t, tags)
    files = sorted(os.path.basename(f) for f in glob.glob(f"{D}/{slug}/*.zip"))
    desc = f"{intro}\n\nDAS BEKOMMST DU\n" + "\n".join("• " + i for i in inside) + f"\n\nFORMAT\n{fmt}, als PDF und als bearbeitbare PPTX-Datei (für Canva, PowerPoint, Keynote). Komplett auf Deutsch.\n\n{FOOT}"
    out += [f"\n---\n\n## {slug}\n", f"**Preis:** {PRICE[slug]} €  \n**Dateien:** {', '.join(files)}  \n**Bilder:** etsy-1.jpg bis etsy-{len(glob.glob(f'{D}/{slug}/*.jpg'))}.jpg (in dieser Reihenfolge)\n",
            "**Titel**\n```\n" + t + "\n```\n", "**Beschreibung**\n```\n" + desc + "\n```\n", "**Tags**\n```\n" + ", ".join(tags) + "\n```\n"]
for slug, (t, pr, tot, intro, sls, nparts, tags) in BUN.items():
    chk(slug, t, tags)
    files = sorted(os.path.basename(f) for f in glob.glob(f"{D}/{slug}/*.zip"))
    names = [NAMES[next(k for k in P if k.startswith(s + "-"))] for s in sls]
    desc = (f"{intro}\n\nDu sparst {tot - pr} € gegenüber dem Einzelkauf (einzeln {tot} €, im Paket {pr} €).\n\nDAS IST DRIN ({len(sls)} VORLAGEN)\n" + "\n".join("• " + n for n in names) +
            f"\n\nDATEIEN\nWegen der Dateigröße kommt das Paket in {len(files)} ZIP-Dateien. Lade bitte alle herunter.\nJede Vorlage als PDF und als bearbeitbare PPTX-Datei (für Canva, PowerPoint, Keynote). Komplett auf Deutsch.\n\n{FOOT}")
    out += [f"\n---\n\n## {slug} (Paket)\n", f"**Preis:** {pr} €  \n**Dateien:** {', '.join(files)}  \n**Bilder:** etsy-1.jpg und etsy-2.jpg (gern noch Titelbilder der Einzelprodukte dazu)\n",
            "**Titel**\n```\n" + t + "\n```\n", "**Beschreibung**\n```\n" + desc + "\n```\n", "**Tags**\n```\n" + ", ".join(tags) + "\n```\n"]
out += ["\n---\n\n## Shop-Texte\n",
        "**Shop-Name (Ideen, vorher bei Etsy prüfen):** Studio Vorlagenwerk · Creatorpapier · Klarvorlage\n",
        "**Shop-Titel (max. 55 Zeichen)**\n```\nVorlagen auf Deutsch für Creator: Media-Kit, Planer, Posts\n```\n",
        "**Shop-Ankündigung**\n```\nVorlagen auf Deutsch für Creator, die professionell auftreten wollen, ohne Stunden in Canva zu verbringen. Media-Kits, Preislisten, Rechnungen, Planer, Instagram-Vorlagen und Pakete für Abo-Creator. Alles als PDF und bearbeitbare PPTX-Datei für Canva und PowerPoint. Fragen? Schreib mir gern.\n```\n",
        "**Über mich / Hinweis im Shop**\n```\nIch gestalte Vorlagen für Creator im deutschsprachigen Raum. Layouts und Texte entwerfe ich selbst. Für die Beispielfotos nutze ich KI-generierte Personen, damit du siehst, wie die Vorlage mit Fotos wirkt, ohne echte Menschen zu zeigen. Du ersetzt sie durch deine eigenen Bilder.\n```\n",
        "**Automatische Nachricht nach dem Kauf**\n```\nDanke für deinen Kauf! Deine Dateien findest du unter \"Käufe und Bewertungen\". In der ZIP-Datei liegt eine Lies-mich-Datei mit allen Schritten für Canva und PowerPoint. Wenn etwas nicht klappt, schreib mir einfach. Viel Erfolg mit deinen Kooperationen!\n```\n"]
open("/home/user/Konfi/etsy-shop/ETSY-TEXTE.md", "w").write("\n".join(out))
print("Fehler:", err or "keine")
