# Kontaktstoff Kampagnenstudio

Eigenständige Anwendung unter `/studio/`, direkt mit der Homepage verbunden. Der Einstieg zeigt eine Kampagnenübersicht mit lokal gespeicherten Projekten. Ein neuer Browser beginnt leer.

## Bedienung

**Neue Kampagne starten** öffnet eine kurze Auswahl: Kampagnenname, Vorlage / eigener Upload / leere Karte. Erst beim Absenden wird eine eigene Kampagne angelegt, ohne Beispielkontakte. Danach geht es direkt in den Editor. Ein kurzer Hinweis führt durch Gestaltung → Empfänger → Vorschau. Alte Tutorial-Links führen ebenfalls zu diesem Einstieg; bestehende Tutorial-Projekte bleiben als bearbeitbare Entwürfe erhalten.

**Meine Kreationen** zeigt eigene Projekte unter den drei Beispieldesigns, mit Suche, Duplizieren und Löschen. Auch im geöffneten Entwurf ist „Kreation löschen“ verfügbar. Nach Bestätigung landet der Entwurf im Papierkorb der Übersicht und kann dort wiederhergestellt werden. Die Speicherung prüft innerhalb einer IndexedDB-Transaktion, dass verzögerte Speichervorgänge gelöschte Entwürfe nicht erneut aktivieren. Der Papierkorb bleibt ebenfalls nur in diesem Browser gespeichert.

**Beispieldesigns** stehen direkt oben in der Übersicht. Weitere Vorlagen sind darunter eingeklappt. Vorlagen sind native, vollständig bearbeitbare Elemente ohne Beispielkontakte. Die drei fertigen Fotokampagnen öffnen sich als unabhängige Beispiele mit fiktiven Empfängern in 3D. Über „Nächster Beispielkontakt“ wechseln die personalisierten Inhalte sichtbar mit. Das frühere Muster bleibt unter `?demo=1` verfügbar.

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
npm run test:onboarding
```

Browserprüfungen erwarten einen laufenden Server auf Port 4177 und Google Chrome. Die ursprünglichen Editor-/Anleitungstests unterstützen `STUDIO_URL` und `BROWSER_CHANNEL`. `build` erzeugt `studio/app.js` samt lokalen Bibliotheksressourcen und `dist/` für Vercel.

## Quellen

| Datei | Verantwortung |
| --- | --- |
| `src/app.js` | Navigation, Editor, Uploads, UI-Zustand und Aktionen |
| `src/core.js` | v1-Projektschema, Validierung, CSV, Personalisierung |
| `src/templates.js` | Drei native, bearbeitbare Vorlagen |
| `src/dashboard.js` | Kampagnenübersicht und Vorlagenkatalog |
| `src/start.js` | Auswahl des Startpunkts für die eigene Kampagne |
| `src/guide.js` | Frühere Anleitung, für bestehende Projektdaten beibehalten |
| `src/render.js` | Canvas, Textlayout, lokale QR-Codes, begrenzte Bildcaches |
| `src/three-d.js` | Maus, Touch und Tastatur für die 3D-Darstellung |
| `src/handoff.js` | Gesamtaudit, personalisierte PDF-Serie, ZIP-Paket |
| `src/storage.js` | IndexedDB-Kampagnen, Papierkorb und Wiederherstellen |
| `src/icons.js` | Lokale SVG-Icons |

Die Testdaten sind fiktiv. Empfängerdaten und exportierte Pakete gehören nicht ins Repository.

## Beispielbilder

Die Fotokampagne verwendet ein echtes Stockfoto von Vitaly Gariev (Unsplash), siehe `assets/photos/CREDITS.md`. Die Datei wird lokal ausgeliefert und als Daten-URL in Beispielprojekten gesichert. Die abgebildeten Personen werden nicht als Kunden oder Mitarbeiter von chattastic bezeichnet. `node scripts/embed-example-photo.mjs` aktualisiert die eingebettete Fassung nach einem Bildwechsel.

## Mitmach-Tutorial

„Tutorial starten“ erstellt eine eigene Fotobeispielkampagne mit Anna, Jonas und Sarah. Acht Schritte erklären den kompletten Ablauf. Eine Zuordnungstabelle stellt `{{company}}`, `{{first_name}}`, `{{salutation}}` und `{{chatbot_url}}` den tatsächlichen Werten gegenüber. Der Textspielplatz bearbeitet das reale Ansprachefeld; Namens- und URL-Änderungen wirken direkt auf Vorschau und QR-Code. CSV-Download, 3D-Rückkehr, Gesamtaudit und PDF-Export verwenden die normalen Studiofunktionen.

Fortschritt liegt unter `campaign.tutorial` (Schritt 0–7, Aktivstatus, Übungsfeld-ID), wird validiert und mit Projektdateien gesichert. Bei aktivem Tutorial setzt ein Reload den aktuellen Schritt fort. „Eigene Kampagne“ startet anschließend einen leeren Entwurf. Wenn Übungsdaten im freien Editor gelöscht wurden, kann eine neue unabhängige Tutorialkampagne gestartet werden. Einstieg: `/studio/?tutorial=1`, Homepage, Übersicht, Anleitung oder obere Studioleiste.

Die Anleitung zeigt am Ende die echte gerenderte Vorderseite statt einer symbolischen Karte. Erklärungstexte sind standardmäßig 18 px, zentrale Bedienelemente 16 px; die Schriftgröße der gedruckten Designs bleibt davon unabhängig.
