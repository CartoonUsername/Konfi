# Briefing: Plissee 3D-Modell für Web-Konfigurator

## Kontext
Wir betreiben einen Shopify-Produktkonfigurator für Plissees (Plissee-Jalousien). Kunden stellen Breite, Höhe, Stoff, Schiene und Klemmträger ein und sehen eine Live-Vorschau — unter anderem eine interaktive 3D-Ansicht (Three.js, im Browser, frei drehbar per Maus/Touch).

## Was gebraucht wird
Ein **ausgezogenes** Plissee, montiert an einem Fenster — kein eingerolltes/zusammengeschobenes Rollo. Referenz für den gewünschten Look: stofftex.com (Screenshot liegt bei).

## Technische Anforderungen
- **Format:** glTF/GLB (Three.js-kompatibel), zusätzlich Ausgangsdatei (Blender `.blend` bevorzugt)
- **Polygon-Budget:** niedrig bis mittel (unter ~5.000 Tris für das komplette Modell) — läuft im Browser, auch auf Mobilgeräten
- **PBR-Materialien:** Metal/Roughness-Workflow (Base Color, Roughness, Normal Map), keine gebackenen Lightmaps
- **Separates Fabric-Material:** Der Stoff MUSS ein eigenes, eindeutig benanntes Material/Mesh sein (z. B. `Fabric` oder `Stoff`), dessen `baseColor` wir zur Laufzeit per Code austauschen — Kunden wählen aus ~70 Stofffarben
- **Separates Rail-Material:** Kopf-/Fußschiene ebenfalls als eigenes benanntes Material (`Rail`), austauschbar zwischen Anthrazit/Weiß/Silber/Braun
- **Separates Bracket-Material:** Klemmträger als eigenes benanntes Material (`Bracket`), gleiche Farboptionen wie Rail

## Geometrie-Details
- Echte gefaltete Zickzack-Geometrie des Stoffs (kein Textur-Trick) — feine, dichte Falten (~1,5–2 cm Faltenhöhe), nicht grob
- Kopfschiene: sichtbares rundes/D-förmiges Aluprofil, nicht flache Box
- Klemmträger: kleine, an beiden oberen Ecken sichtbare Halterungen
- Modell sollte **parametrisch skalierbar** sein (Breite/Höhe per Code anpassbar) ODER als Referenz für uns dienen, damit wir die Skalierung selbst in Three.js nachbauen — bitte im Gespräch mit dem Artist klären, was einfacher umsetzbar ist

## Lieferumfang
- `.glb`-Datei (produktionsfertig, komprimiert wo möglich, z. B. Draco falls unterstützt)
- Texturen separat (falls nicht embedded im glb)
- Kurze Doku: welches Mesh/Material welchen Namen trägt

## Nicht gebraucht
- Kein Fensterrahmen/Wand (bauen wir bereits selbst in Three.js)
- Keine Animation (Hoch-/Runterfahren) — statische Geometrie reicht
