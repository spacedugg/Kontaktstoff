# Kontaktstoff Impulse – V7

Eigenständiger Prototyp im Branch `claude/interactive-paper-rebuild-owvx7s`. Die Live-Website und ihre Deployment-Konfiguration bleiben unverändert.

## Aktueller Umfang

30 statische Seiten: Landingpage, Produkt, Technologie, Preise, acht bebilderte Journalartikel mit Suche und Kategorien, drei Vergleichsseiten, Alternativen, FAQ, Über uns, Karriere (keine offenen Stellen), Kontakt und rechtliche Entwürfe. Bestehende Demo-Zielseiten und das Portal bleiben erreichbar.

14 neue generierte Produktmotive mit einheitlich hohem Kartenformat, gedrucktem räumlichen Tap-Feld und Handy-in-der-Hand-Symbol. Das Format folgt der gelben HOLY-Karte; es ist keine bestätigte Produktionsspezifikation. Hero: HOLY, NordVPN, PrepMyMeal. Acht freie Kampagnenideen ergänzen Revolut, temoa, True Nature, Aoste und 116 Media. Originales temoa-Logo und SKOTTI-Designbeispiel wurden auf Nutzerwunsch eingebunden; alle Markenkonzepte sind ausdrücklich keine Kundenreferenzen.

Drei Schritte mit einer Karte, sichtbare NFC-Signale, flache Papierintegration, Druckoberfläche und geräteabhängige Rückmeldung. Der Vergleich verwendet einen grünen NFC-Balken und ein überlappendes Erlebnisbild. Das Portal zeigt eine Kampagne mit einem Design und sechs funktionierenden Ansichten.

77/64/23 % sind klar bezeichnete Beispielquoten. 4,5 % QR / 35 % NFC ist ein vom Nutzer vorgegebenes Vergleichsszenario. Es liegen keine eigenen Messdaten oder belastbaren Preisvergleiche vor. Keine garantierten Reichweiten, Haptik- oder Erfolgsversprechen.

## Verhalten und Grenzen

Anfragen werden lokal vorbereitet und als Text angeboten, nicht versendet. Keine echten Buchungen, Bestellungen, Kampagnen, NFC-Scans, Kamera-AR oder Backend-Analysen. Die Abbildungen illustrieren die Experience; Smartphone-Einladungen sind keine verifizierte Betriebssystemdarstellung.

Cookie-Einstellungen funktionieren mit `impulse-privacy-v1` im lokalen Browserspeicher. Keine Analyse- oder Marketingdienste sind eingebunden. Rechtliche Seiten sind ausdrücklich Entwürfe: Betreiber-, Kontakt- und Vertragsangaben fehlen und müssen vor einer öffentlichen Nutzung ergänzt und geprüft werden.

## Entwicklung und Prüfung

In `web`: `npm install`, `npm run dev`, `npm run build`.

Astro-Build und DOM-Prüfung aller 30 Seiten: interne Links/Assets, Überschriften, IDs/ARIA-Verweise, Dashboard-Tabs und Tastaturwechsel, Blogsuche/Kategorien, Cookie-Einstellungen und Speicherung, FAQ und Hero. Neue Bilddateien vollständig dekodiert und visuell geprüft. Keine gerenderte Desktop-/Mobilprüfung: Das für Sites vorgeschriebene control-browser-Werkzeug ist nicht verfügbar.

## Quellen und Vorschau

- https://interactivepaper.com/tap
- https://interactivepaper.com/touch-for-print-advertising
- https://www.temoa.de/design-beispiele
- https://www.116media.de/
- https://www.chatbyte.ai/de/blog (Informationsarchitektur als Referenz)
- Weitere Primärquellen stehen bei den Journal- und Vergleichsartikeln.
- Generierungsprompts und Assetquellen: `replica/asset-prompts-v7.md`.

Private Vorschau: https://kontaktstoff-nfc-colorway.temoa-3702.chatgpt.site

Kein Merge in `main` oder den Live-Branch. PR #23 bleibt Entwurf.
