# Übergabe: Titelbilder für Ratgeber und Branchenseiten einbauen

Stand: 26.09.2026. Diese Datei beschreibt, was die nächste Sitzung tun soll. Sie wird nicht veröffentlicht (`tools/` steht in `.vercelignore`).

## Voraussetzung
In der Cloud-Umgebung der neuen Sitzung muss unter **Network access** die Domain
`d8j0ntlcm91z4.cloudfront.net` erlaubt sein. Test:
```bash
curl -sS -o /dev/null -w "%{http_code}\n" "$(awk 'NR==1{print $2}' tools/bilder_quellen.txt)"   # erwartet: 200
```

## Projekt in Kürze
- Repo: `spacedugg/Kontaktstoff`. Standard-Branch (= Live-Stand): `claude/elegant-gates-7dbhxh` (es gibt kein `main`).
- Statische Website, gehostet bei Vercel. Live-Domain: `https://www.kontaktstoff.com` (`kontaktstoff.com` leitet per 308 dorthin weiter).
- Vercel: Team `team_Vyv0twXP6L6yNj9OwIUx6QnQ`, Projekt `prj_cbapjBiAjmqdVZ0WRYUGTXavUwyu` (Name `kontaktstoff`).
- **Wichtig:** Der Production Branch ist in Vercel nicht auf `claude/elegant-gates-7dbhxh` gesetzt. Ein Merge geht deshalb nicht automatisch live. Nach jedem Merge ein Production-Deployment anstoßen (Vercel-MCP `create_deployment`):
  ```json
  {"name":"kontaktstoff","project":"prj_cbapjBiAjmqdVZ0WRYUGTXavUwyu","target":"production",
   "gitSource":{"type":"github","org":"spacedugg","repo":"Kontaktstoff","ref":"claude/elegant-gates-7dbhxh","sha":"<merge-sha>"}}
  ```
  Danach mit `list_deployment_aliases` prüfen, dass `www.kontaktstoff.com` auf das neue Deployment zeigt.
- Seiten entstehen per `python3 tools/seiten_bauen.py` aus `inhalte/ratgeber/*.html` und `inhalte/branchen/*.html`. Das Skript erzeugt auch den Footer der Startseite und die `sitemap.xml`. Verbindliche Fakten stehen in `inhalte/FAKTEN.md`.
- Ratgeber- und Branchenseiten erscheinen als eigenständiges Fachmagazin **„Akquise-Wissen“**: neutraler Kopfbereich ohne Kontaktstoff-Logo und ohne Verkaufsbutton, Seitentitel `… | Akquise-Wissen`, Autorenzeile „Redaktion Akquise-Wissen“ (Konstante `MAGAZIN` im Generator). Footer mit Kontaktstoff und Impressum bleibt bewusst stehen: Nach § 5a UWG muss erkennbar bleiben, wer kommerziell dahintersteht (kein Verstecken des Absenders). Startseite und Rechtsseiten behalten den Kontaktstoff-Kopf.
- Der Nutzer ist Programmieranfänger: auf Deutsch antworten und Schritte kurz erklären. Der Nutzer möchte, dass fertige Änderungen direkt gemergt und live gestellt werden (PR anlegen → mergen → Production-Deployment).

## Aufgabe
1. Die 12 Bilder aus `tools/bilder_quellen.txt` (Format: `<slug> <url>`) herunterladen:
   ```bash
   mkdir -p /tmp/quellbilder && while read slug url; do curl -sS -o "/tmp/quellbilder/$slug.png" "$url"; done < tools/bilder_quellen.txt
   ```
2. Aufbereiten (erzeugt `assets/artikel/<slug>.webp` in 1600 px, `<slug>-640.webp` und `<slug>-og.jpg` in 1200 × 630, jeweils ohne Metadaten):
   ```bash
   pip install -q pillow && python3 tools/bilder_aufbereiten.py /tmp/quellbilder
   ```
3. `python3 tools/seiten_bauen.py` ausführen. Der Generator bindet die Bilder automatisch ein, sobald die Dateien existieren: Titelbild im Artikel (`figure.article-hero`, Alt-Texte in `BILD_ALT` im Skript), Bilder auf den Übersichtskarten und `og:image` bzw. JSON-LD-`image` pro Seite.
4. Prüfen:
   - Alle Seiten lokal ausliefern, mit einem Server, der Vercels cleanUrls nachbildet (`/ratgeber/x` liefert `ratgeber/x.html`). Dann mit Playwright (Chromium unter `/opt/pw-browsers/chromium`) alle internen Links ab `/` crawlen: Status 200, keine JS-Fehler, eine H1 pro Seite, gültiges JSON-LD, keine fehlenden Bilder.
   - Bei 320, 375, 768, 1280 und 1440 px darf die Seite nicht horizontal scrollen (`scrollWidth > clientWidth`).
   - Screenshots eines Artikels und von `/ratgeber` auf Desktop und Handy ansehen.
   - Die Bildgrößen im Blick behalten (Ziel: Titelbild unter ca. 200 KB, Karte unter ca. 50 KB).
5. Committen, PR gegen `claude/elegant-gates-7dbhxh` anlegen, mergen, Production-Deployment anstoßen und prüfen (siehe oben).

## Offene Entscheidung des Nutzers (vor Schritt 1 kurz fragen)
Alle Bilder zeigen Mailings mit dem neongelben Kontaktstoff-Akzent. Vorschlag an den Nutzer: Die **Ratgeber-Bilder (7)** bleiben so, weil sie die Kontaktstoff-Marke zeigen. Die **Branchen-Bilder (5)** könnten neu erzeugt werden, mit Mailings in dezenten Kundenfarben (z. B. Agentur: Terrakotta, IT: Dunkelblau, Recruiting: Petrol, Industrie: Anthrazit/Orange, Energie: Grün). Dann ist klar, dass Mailings in der Marke des Kunden gestaltet werden. Falls gewünscht: mit Higgsfield (`gpt_image_2`, `aspect_ratio 16:9`, `resolution 2k`, `quality high`, höchstens 8 Aufträge gleichzeitig) neu erzeugen. Die bisherigen Prompts stehen unten. In jedem Prompt „neon lime-yellow accent“ durch die jeweilige Kundenfarbe ersetzen und die neuen URLs in `tools/bilder_quellen.txt` eintragen.

Bisherige Prompts der Branchenbilder (Stilbasis: editorial, natürliches Licht, gedämpfte Weiß-/Graphit-Töne, keine lesbare Schrift, keine Logos):
- agenturen: designer in a small creative agency studio holds a printed personalized postcard, moodboard wall and monitor blurred behind
- it-dienstleister: manager of a mid-sized IT service company reads a folded printed selfmailer at a desk, glass-walled server room blurred behind
- recruiting: HR manager in a bright meeting room holds a printed folded card, laptop and coffee on the table
- industrie: engineer in dark workwear in a clean automation production hall holds a printed pop-up mailing, robotic arm blurred behind
- gewerbeenergie: commercial building with photovoltaic panels on a flat roof, facility manager in the foreground holds a printed envelope with a card

## Weitere offene Punkte (nicht Teil dieser Aufgabe, nur zur Info)
- Impressum, Datenschutz, AGB, Widerruf und Kontakt sind Platzhalter (`noindex`, nicht in der Sitemap). Sobald der Nutzer echte Angaben liefert, Texte in `RECHT_INHALT` in `tools/seiten_bauen.py` ersetzen, `noindex` entfernen und die Seiten in die Sitemap aufnehmen.
- Search Console: Die Sitemap `https://www.kontaktstoff.com/sitemap.xml` zeigte „Konnte nicht abgerufen werden“, weil sie beim ersten Einreichen noch 404 lieferte. Empfehlung an den Nutzer: den alten Eintrag entfernen, neu einreichen und mit „Live-URL testen“ prüfen.
- In Vercel unter Settings → Environments/Git den Production Branch auf `claude/elegant-gates-7dbhxh` setzen (oder den Branch in `main` umbenennen). Das kann nur der Nutzer selbst.
