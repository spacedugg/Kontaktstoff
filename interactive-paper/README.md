# Kontaktstoff Impulse – V6

Eigenständiger Prototyp im Branch `claude/interactive-paper-rebuild-owvx7s`. Live-Website unverändert.

## Aufbau

Ruhiger Hero: einfarbige Überschrift, ein Absatz, ein CTA. Drei individuell gestaltete Kampagnenkarten mit kleinen NFC-Feldern. Neun neue Originalbilder; NFC-Nahkontakt, Link-Einladung, emotionale 3D-Erlebnisse und dünne Papierkante.

Frühe Zahlenleiste: 77/64/23 % als klar bezeichnete Beispielquoten, keine Erfolgsdaten. Der Vergleich 4,5 % QR / 35 % NFC ist ein vom Nutzer vorgegebenes Vergleichsszenario, keine bestätigte Studie. Kurze Einordnung über Info-Dialoge statt langer Referenz-Fußzeilen.

Das Portal ist eine lokale Demo mit sechs funktionierenden Tabs: Kampagne, Kontakte, Kartendesign, Versand, Erlebnis und Tracking. Designrichtungen lassen sich wechseln; Tastaturnavigation ist möglich. Keine Backend-Datenerfassung oder echte Sendungen.

Kampagnenideen auf weißem Grund: HOLY, NordVPN, PrepMyMeal, Revolut und temoa. Eine gemeinsame Kennzeichnung stellt klar, dass dies keine Kundenreferenzen sind.

## Entwicklung

In `web`: `npm install`, `npm run dev`, `npm run build`.

## Quellen und Prüfung

- Referenz: https://interactivepaper.com/tap
- Anbieterangaben 2–3 % QR / 35–65 % NFC: https://interactivepaper.com/touch-for-print-advertising
- Agentur-Referenz: https://www.temoa.de/design-beispiele
- Instagram-Beitragsseite erreichbar, Video nicht inhaltlich verifiziert.
- Browser-QA entfällt, da das für Sites vorgeschriebene control-browser-Werkzeug fehlt.
- Exakte Generierungsprompts und Assetpfade: `replica/asset-prompts-v6.md`.
