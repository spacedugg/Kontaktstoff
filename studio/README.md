# Kontaktstoff Kampagnenstudio

Eigenständige Anwendung unter `/studio/`, direkt mit der Homepage verbunden. Der Einstieg zeigt eine Kampagnenübersicht mit lokal gespeicherten Projekten. Ein neuer Browser beginnt leer.

## Bedienung

**Von null starten** erstellt zwei leere DIN-A5-Seiten ohne Beispielkontakte. Die Anleitung erklärt Briefing, Format, Gestaltung, persönliche Felder, Empfänger und Prüfung. Sie speichert den Fortschritt und bleibt später erreichbar.

**Vorlagen** sind native, vollständig bearbeitbare Elemente: chattastic, Ein guter Anfang und Ein neuer Impuls. Name, Text, Farbe, Flächen und QR-Code lassen sich bearbeiten. Empfänger ergänzt der Nutzer. „Beispielkampagne laden“ ist von der Übersicht, jeder Anleitung und dem Dialog „Neue Kampagne“ erreichbar. Sie erstellt eine unabhängige, vollständig bearbeitbare Fotokampagne mit drei fiktiven Empfängern und öffnet sie in 3D. Über „Nächster Beispielkontakt“ wechseln die personalisierten Inhalte sichtbar mit. Das frühere Muster bleibt nur unter `?demo=1` verfügbar.

**Gestaltung:** PDF, PNG, JPG oder WebP als Hintergrund hochladen, maximal 20 MB. Eine PDF kann beide Seiten beliefern. Pro Seite sind bis zu 40 Elemente möglich: Text, QR-Code, Bild oder Farbfläche. Logos als PNG behalten ihre Transparenz. Bildelemente können vollständig eingepasst oder rahmenfüllend zugeschnitten werden. „Eigenes Bild einsetzen“ ersetzt das ausgewählte Bild und behält Rahmen und Position bei. Elemente lassen sich ziehen, skalieren, duplizieren, löschen und nach vorn/hinten ordnen. Text unterstützt Schriftgröße, Farbe, Ausrichtung und automatisches Einpassen. Positionen und Größen sind in Millimetern. Pfeiltasten verschieben um 0,5 mm, mit Umschalt um 5 mm. Rückgängig/Wiederholen: Strg/⌘ Z bzw. Strg/⌘ Umschalt Z.

**Empfänger:** CSV mit Komma/Semikolon, BOM, mehrzeiligen und in Anführungszeichen gesetzten Werten. Deutsche Spaltennamen werden zugeordnet. Bis zu 1.000 Kontakte; Werte bis 5.000 Zeichen. Standardspalten: `company`, `first_name`, `salutation`, `website`, `chatbot_url`, `street`, `postal_code`, `city`, `country`. Eigene CSV-Spalten sind mit `{{spaltenname}}` im Design verwendbar. Die Tabelle erlaubt direkte Bearbeitung und Suche. Postleitzahlen bleiben Text, führende Nullen erhalten.

**QR-Codes:** Lokal aus dem vollständigen HTTP(S)-Ziel erzeugt, weiße Ruhezone inklusive. Es gibt keine Weiterleitung oder Scan-Analyse. Die App erzeugt keine Chatbots. Der Nutzer trägt bestehende persönliche URLs ein. Das Ziel wird nicht auf Erreichbarkeit getestet. Unter 20 mm Größe erscheint ein Hinweis.

**3D:** Tatsächliche Canvas-Texturen beider Seiten. Ziehen dreht; Verschieben-Modus oder Umschalt+Ziehen verschiebt. Wenden, Vorder-/Rückseite, Zoom, Zurücksetzen und Tastaturbedienung sind verfügbar. Auf Touch sind Zwei-Finger-Zoom und Verschieben möglich. Die Darstellung verändert keine Druckdaten und simuliert keine verbindlichen Materialeigenschaften. „Beide Seiten“ öffnet die flache Ansicht.

**Prüfung:** Der Kampagnen-Check zeigt fehlende Designs/Werte, ungültige QR-Ziele, Bildauflösung und Sicherheitsabstände. „Alle Empfänger prüfen“ prüft zusätzlich sämtliche personalisierten Textlayouts, Firmennamen, Postanschriften und mögliche Duplikate. Hinweise können von Fehlern unterschieden werden. Fehler mit Empfängerbezug öffnen den passenden Kontakt im Editor. Bearbeitungen verwerfen veraltete Gesamtergebnisse.

**Export:** PDF mit Vorder-/Rückseite oder PNG der aktuellen Seite für den ausgewählten Kontakt. Das ZIP-Kampagnenpaket enthält eine PDF-Serie für 1–50 Empfänger, CSV des Bereichs, `uebergabe.json` mit Seitenzuordnung und Prüfung, Anleitung und vollständige Projektdatei. Die Projektdatei enthält immer alle Kontakte. Größere Listen in mehreren Bereichen exportieren. Paketexport prüft die gesamte Kampagne erneut und ist abbrechbar.

## Technische Grenzen

- Ausschließlich DIN A5 quer, 210 × 148 mm. Weitere Formate bleiben deaktiviert.
- RGB-Rasteransichten, 300 dpi, ohne Beschnitt; kein PDF/X oder Druckauftrag.
- Hintergründe werden proportional vollständig eingepasst. PDF-Uploads: bis 300 dpi, maximal 3.500 px längste Seite. Logos/Bildelemente maximal 2.000 px. Keine automatische Texterkennung oder Bearbeitung eingebrannter PDF-Inhalte.
- Speicherung in IndexedDB, browser- und ursprungsgebunden. Exportierte JSON-Projekte sind portabel. Kein Account, Backend, Cloud-Sync oder Versand.
- Kamera-/Papierprüfung von QR-Codes und finale Druckfreigabe erfolgen außerhalb des Studios.

## Entwicklung

```sh
npm ci
npm run build
npm run dev
npm test
npm run test:browser
npm run test:guide
npm run test:product
npm run test:handoff
npm run test:example
```

Browserprüfungen erwarten einen laufenden Server auf Port 4177 und Google Chrome. Die ursprünglichen Editor-/Anleitungstests unterstützen `STUDIO_URL` und `BROWSER_CHANNEL`. `build` erzeugt `studio/app.js` samt lokalen Bibliotheksressourcen und `dist/` für Vercel.

## Quellen

| Datei | Verantwortung |
| --- | --- |
| `src/app.js` | Navigation, Editor, Uploads, UI-Zustand und Aktionen |
| `src/core.js` | v1-Projektschema, Validierung, CSV, Personalisierung |
| `src/templates.js` | Drei native, bearbeitbare Vorlagen |
| `src/dashboard.js` | Kampagnenübersicht und Vorlagenkatalog |
| `src/guide.js` | Sechs erklärende Einstiegsschritte |
| `src/render.js` | Canvas, Textlayout, lokale QR-Codes, begrenzte Bildcaches |
| `src/three-d.js` | Maus, Touch und Tastatur für die 3D-Darstellung |
| `src/handoff.js` | Gesamtaudit, personalisierte PDF-Serie, ZIP-Paket |
| `src/storage.js` | IndexedDB-Kampagnen |
| `src/icons.js` | Lokale SVG-Icons |

Die Testdaten sind fiktiv. Empfängerdaten und exportierte Pakete gehören nicht ins Repository.

## Beispielbilder

Die Fotokampagne verwendet ein echtes Stockfoto von Vitaly Gariev (Unsplash), siehe `assets/photos/CREDITS.md`. Die Datei wird lokal ausgeliefert und als Daten-URL in Beispielprojekten gesichert. Die abgebildeten Personen werden nicht als Kunden oder Mitarbeiter von chattastic bezeichnet. `node scripts/embed-example-photo.mjs` aktualisiert die eingebettete Fassung nach einem Bildwechsel.
