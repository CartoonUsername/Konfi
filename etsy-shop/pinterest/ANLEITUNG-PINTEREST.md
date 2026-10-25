# So schaltest du das automatische Hochladen frei

Dauert etwa 20 Minuten. Die Pinterest-Seiten ändern sich ab und zu, die Namen der Knöpfe können leicht anders heißen.

## 1. Pinterest-Unternehmenskonto
- Auf pinterest.de ein Konto anlegen oder dein Konto in den Einstellungen in ein **Unternehmenskonto** umwandeln (kostenlos).
- Deinen Shop-Link im Profil eintragen und die Website bestätigen, wenn Pinterest das anbietet.

## 2. Entwickler-Zugang beantragen
- Auf **developers.pinterest.com** mit demselben Konto anmelden.
- **Meine Apps** öffnen und eine neue App anlegen. Name z. B. „Vorlagen Planer“, Zweck: eigene Pins automatisch veröffentlichen.
- Website und Datenschutz-Link deines Shops angeben.
- Zuerst gibt es meist einen **Test-Zugang** (Trial). Damit kann Pinterest Pins eingeschränkt oder nur in einer Testumgebung erlauben.
  Für echte, öffentliche Pins den **Standard-Zugang** beantragen. Die Prüfung kann einige Tage dauern.

## 3. Schlüssel erzeugen
- In deiner App **Token erzeugen** wählen und diese Rechte anhaken: `boards:read`, `boards:write`, `pins:read`, `pins:write`, `user_accounts:read`.
- Den **Access Token** kopieren. Falls auch ein **Refresh Token** angezeigt wird, den ebenfalls kopieren, dazu **App-ID** und **App-Secret**.
  Mit Refresh Token erneuert sich der Zugang von selbst, sonst läuft der Access Token nach etwa 30 Tagen ab.

## 4. In GitHub hinterlegen
- Repo öffnen > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
- Anlegen: `PINTEREST_ACCESS_TOKEN` (und wenn vorhanden `PINTEREST_REFRESH_TOKEN`, `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET`).
- Nur beim Test-Zugang mit Testumgebung: unter **Variables** `PINTEREST_API` = `https://api-sandbox.pinterest.com/v5`.

## 5. Links eintragen
- In `config.json` bei jedem Produkt den Link zum Etsy- oder Shopify-Angebot eintragen (oder Claude schicken, dann trägt Claude sie ein).

## 6. Starten
- Das Tool muss im Hauptzweig des Repos liegen, damit GitHub es täglich startet (Claude legt dafür einen Pull Request an, du klickst auf „Merge“).
- Test: Repo > **Actions** > **Pinterest Pins** > **Run workflow**, bei „Nur testen“ `1` eintragen. Im Protokoll steht dann, welche Pins gepostet würden.
- Danach läuft es jeden Tag um ca. 17 Uhr automatisch: erst 3 Pins pro Tag, ab Woche 5 vier, ab Woche 9 fünf.
- Pausieren: in `config.json` `"aktiv": false` setzen.

Falls Pinterest den Entwickler-Zugang ablehnt: Die fertigen Pins aus `bilder/` kannst du auch in Tailwind hochladen.
