# Wöchentliche Aufgabe für Claude

Diese Anweisung nutzt die geplante Aufgabe, die einmal pro Woche läuft.

1. Repo `cartoonusername/konfi`, Branch mit dem Pinterest-Tool, auschecken und `etsy-shop/werkstatt/setup.sh` ausführen.
2. `etsy-shop/pinterest/STATISTIK.md` und `statistik.json` lesen. Wenn noch keine Zahlen da sind: gleichmäßig weitermachen.
3. Zählen, wie viele Pins in `ideen.json` noch den Status `bereit` haben. Ziel: immer mindestens 6 Wochen Vorrat (ca. 200 Pins).
4. Neue Ideen anhängen (gleiches Format wie die vorhandenen, neue `id` pro Produkt fortlaufend):
   - 60 % für die Produkte und Layouts mit den meisten Klicks zum Shop, 30 % für mittlere, 10 % zum Testen neuer Überschriften.
   - Jede Überschrift höchstens zweimal pro Produkt, Texte auf Deutsch, jugendfrei, keine Markennamen fremder Plattformen.
   - Gute Pins bekommen `"prio": 1`.
5. `python3 etsy-shop/werkstatt/fabrik.py` ausführen und 6 neue Pins stichprobenartig ansehen (Text lesbar, nichts abgeschnitten, nichts überlappt).
6. Alle 2 Wochen: 1–2 neue Vorlagen bauen (Variante eines Bestsellers in anderer Farbe/Person oder englische Version),
   im Ordner `etsy-shop/neu/<datum>-<name>/` mit PDF, PPTX, 5 Etsy-Bildern, Texten. Nicht automatisch auf Etsy einstellen.
7. Commit und Push auf denselben Branch. Kurze Zusammenfassung: Zahlen der Woche, Anzahl neuer Pins, neue Vorlagen.
