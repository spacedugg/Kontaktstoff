# Persönliche Kundenseiten

`/fuer/` listet die Konzepte; `/fuer/money-making-sprint/` ist der erste Kampagnenvorschlag.

- `catalog.js`: Texte, Zielgruppe, Markenfarben, Pilotauflage, Quell- und Zielseite.
- `studio/src/client-campaigns.js`: native, editierbare A5-Designs und ausschließlich fiktive Beispielkontakte.
- `scripts/client-pages.mjs`: erzeugt die statischen Unterseiten aus dem Katalog. Änderungen am HTML hier vornehmen.
- `main.js` und `style.css`: gemeinsame Vorschau, Personalisierung, PDF-Export und Kampagnenbrief.

Nach Änderungen `npm run build` ausführen. Das erzeugt die lokalen Seiten und übernimmt sie inklusive Assets in `dist/`. Neue Kunden erhalten einen eindeutigen Slug im Katalog und einen passenden Entwurf im Campaign-Factory. Die Startseite behält ihre drei allgemeinen Beispiele; Kundenkonzepte sind im Footer verlinkt.

## Verkaufskontakt

`contactUrl` ist noch leer. Dort kann der tatsächliche Kontaktstoff-Buchungslink oder eine `mailto:`-Adresse hinterlegt werden. Ohne Ziel erstellt das Formular ausschließlich einen lokalen Kampagnenbrief; es sendet keine Anfrage. Mit Ziel zeigt es zusätzlich den Kontaktlink an. Preise und Versand werden nicht automatisch angeboten oder bestellt.

## Money Making Sprint

Konzept auf Grundlage von https://www.money-making-sprint.de/ (angesehen am 17.09.2026): Zielgruppe Agenturen, Freelancer und B2B-Dienstleister; schwarzer Auftritt mit Violett/Neongelb; Termin-CTA unter `/termin`. Eigene Mailing-Texte; keine Übernahme von Kundenbildern, Erfolgszahlen oder Umsatzgarantien. Der QR-Code enthält sichtbare Demo-Kampagnenparameter und führt auf die echte Terminseite. Der Vorschlag ist kein bereits beauftragtes Projekt.

Die Seiten tragen `noindex,nofollow`, sind aber nicht zugriffsgeschützt. Die Entwicklungsbranch-Vorschau ist für die Prüfung gedacht; eine öffentliche Veröffentlichung und ein funktionierender Anfragekanal sind gesonderte Schritte.

## BewertungsPush

`/fuer/bewertungspush/` zeigt einen DIN-A5-Konzeptentwurf im Namen von BewertungsPush für lokale Betriebe. Helles Design in Weiß und sanftem Blau mit goldenen Sternen, editierbare Texte und personenbezogene Felder; keine echte Profilanalyse, keine erfundenen Bewertungen oder Erfolgsquoten. Drei ausdrücklich fiktive Beispielkontakte (Hotel, Restaurant, Werkstatt). Die formelle Anrede ist direkt bearbeitbar. Die Überschrift „Unberechtigte Bewertungen raus. Ihr guter Ruf nach vorn.“ mit einer illustrativen Sterne-Entwicklung führt zum Angebot ohne Vorkasse mit Zahlung nur bei erfolgreicher Löschung; der persönliche Text richtet sich nach der Branche. Markensignet, DM-Sans-Wortmarke und Blau (#4285F4) sind vom Originalauftritt übernommen; helle und dunkle PNG-Varianten liegen neben der Illustration. Grundlage: https://bewertungspush.de/, angesehen am 21.09.2026. QR-Ziel: die verlinkte Unternehmenssuche `/suche`, ergänzt um Demo-UTM-Parameter. Zahlungen, Prüfaufträge und Nachrichten werden durch die Vorschau nicht ausgelöst.

Ansichts-PDF: `output/pdf/bewertungspush-dina5-mailing.pdf`, zwei Seiten im Endformat 210 × 148 mm, 300-dpi-RGB-Rendering ohne Beschnitt. Native Gestaltung unter `studio/src/bewertungspush.js`, Illustration unter `assets/clients/bewertungspush/`. Für einen echten Druckauftrag werden Beschnitt, Papier und Druckvorgaben separat abgestimmt.

### Vergrößern und Angebotsvariante

Über „Vergrößern“ oder einen Klick auf eine flache Kartenseite öffnet sich eine hochauflösende Leseansicht (100–300 %, Mausrad, +/−, Verschieben, Seitenwechsel, Einpassen und Escape). Die Ansicht berücksichtigt den ausgewählten Kontakt, die Platzhalter und das Angebot. Die 3D-Interaktion bleibt separat erhalten.

BewertungsPush hat einen standardmäßig ausgeschalteten Angebotsentwurf „Erste erfolgreiche Löschung gratis“. Die Variante ist auf beiden Kartenseiten als noch abzustimmender Entwurf gekennzeichnet und wird bei PDF-Export, Studio-Übergabe und Kampagnenanfrage übernommen. Sie ist kein bestätigtes Angebot des Anbieters; Einlöseweg und Konditionen sind noch offen. Browserprüfung: `node tests/client-zoom.mjs` bei laufendem lokalen Server.

### Sterne als Empfängerdaten

`rating_current` und `rating_example` sind editierbare CSV-/Empfängerfelder (0–5, Komma oder Dezimalpunkt). Die Zahlentexte und die goldenen Sterneskalen greifen auf dieselben Werte zu, auch im Studio und PDF. Die Vorschau startet mit 4,2 → 4,7 und kennzeichnet beide Werte als illustrativ, nicht als echte Profilanalyse oder Ergebniszusage. Über „Sterne-Beispiel anpassen“ lassen sie sich direkt ändern. Fehlende oder ungültige Werte werden in der Studio-Prüfung gemeldet.
