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

`/fuer/bewertungspush/` zeigt einen DIN-A5-Konzeptentwurf im Namen von BewertungsPush für lokale Betriebe. Eigene Illustration, editierbare Texte und personenbezogene Felder; keine echte Profilanalyse, keine erfundenen Bewertungen oder Erfolgsquoten. Drei ausdrücklich fiktive Beispielkontakte (Hotel, Restaurant, Werkstatt). Die formelle Anrede ist direkt bearbeitbar. Die Überschrift „Ihr guter Ruf verdient echte Bewertungen.“ führt direkt zur Prüfung verdächtiger Beiträge; der persönliche Text richtet sich nach der Branche. Markensignet, DM-Sans-Wortmarke und Blau (#4285F4) sind vom Originalauftritt übernommen; helle und dunkle PNG-Varianten liegen neben der Illustration. Grundlage: https://bewertungspush.de/, angesehen am 21.09.2026. QR-Ziel: die verlinkte Unternehmenssuche `/suche`, ergänzt um Demo-UTM-Parameter. Zahlungen, Prüfaufträge und Nachrichten werden durch die Vorschau nicht ausgelöst.

Ansichts-PDF: `output/pdf/bewertungspush-dina5-mailing.pdf`, zwei Seiten im Endformat 210 × 148 mm, 300-dpi-RGB-Rendering ohne Beschnitt. Native Gestaltung unter `studio/src/bewertungspush.js`, Illustration unter `assets/clients/bewertungspush/`. Für einen echten Druckauftrag werden Beschnitt, Papier und Druckvorgaben separat abgestimmt.
