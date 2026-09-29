# ZYVO / BewertungsPush · Kundenmailings

Überarbeitete DIN-lang-Selfmailer, 4 Seiten auf 2 offenen Druckseiten (210 × 198 mm, Falz bei 99 mm). Die Styles in `studio/src/client-refresh.js` werden ausdrücklich angewendet und überschreiben keine Projekte automatisch.

## Gestaltung und Quellen
- ZYVO: originale Marken- und Produktbilder aus `assets/clients/zyvo`, Quellen dokumentiert in `assets/clients/cart-sources.json`. Produktmotiv und Produktname wechseln mit `product_id`. Keine zusätzlichen Rabatte erfunden.
- BewertungsPush: bestehendes Markenlogo, neu gezeichnete Stern-/Rating- und Rückkehrmotive. Neukunden und Rückgewinnung haben eigenständige Texte. 4,2 → 4,7 ist explizit ein Beispiel, keine gemessene Entwicklung oder Zusage.
- Markenauftritte und Zielseiten geprüft am 29.09.2026: https://zyvo.de/ und https://bewertungspush.de/. Der erfolgsbasierte Zahlungsansatz entspricht den Angaben von BewertungsPush. Keine Übernahme der unbestätigten Erfolgsquoten oder Ranking-Versprechen.

## Technik und Prüfung
`node scripts/client-refresh-art.mjs` erstellt die editierbaren SVG-Dateien. Browserexport als PNG in 2520 × 1188 bzw. 2520 × 2376 px, dadurch über 300 dpi im Endformat. `client-refresh-art.js` enthält die PNGs zur Speicherung in den bestehenden Backendprojekten. Logo bleibt separat.

Geprüft: Feldgeometrie, Platzhalter, alle drei ZYVO-Produktvarianten, Bildauflösung, Postzonen, PDF-Export (je zwei Seiten 210 × 198 mm), aus den exportierten PNGs dekodierte QR-Codes. Produktseiten und BewertungsPush-Suche antworten mit HTTP 200.

## Vor Versand offen
Die Designvorschauen enthalten fiktive Beispiele. Echte Empfängerlisten, ggf. individuelle Checkout-Rückkehrlinks und das ICC-Profil der Druckerei sind noch nötig. Die aktuellen Warenkorbabbrecher-QRs öffnen Produkt- bzw. Suchseiten, keine garantierte gespeicherte Auswahl. Ansichts-PDFs sind RGB und ohne Beschnitt; die druckfertige CMYK-Datei wird über den separaten Druckexport mit 3 mm Beschnitt und Druckerei-Profil erzeugt. Keine Druck- oder Versandbuchung erfolgt.
