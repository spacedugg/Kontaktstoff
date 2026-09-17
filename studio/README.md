# Kontaktstoff Kampagnenstudio

Eigenständige Unterseite unter `/studio/`. Die bestehende Landingpage bleibt unverändert. Entwicklung auf `codex/kampagnenstudio`; kein Produktionsdeployment und kein Merge in den bisherigen Standardbranch.

## Ausprobieren

Voraussetzung: Node.js 22.19+ und npm.

```sh
npm ci
npm run dev
```

Dann http://127.0.0.1:4177/studio/ öffnen. Für die bereits mitgelieferte Browserfassung genügt auch ein statischer Webserver für das Repository. Nicht per `file://` öffnen: PDF-Worker, Schriften und lokaler Speicher brauchen einen HTTP-Ursprung.

## Enthalten

- Bearbeitbare chattastic-Beispielkampagne und neue, leere Kampagnen.
- DIN A5 quer, 210 × 148 mm, mit Vorder- und Rückseite. Weitere Formate sind im Interface als kommende Optionen erkennbar. Größen stehen zentral in `src/core.js`.
- Hintergrunddesigns als PDF, PNG, JPG oder WebP; Upload per Dateiauswahl oder Drag-and-drop. Bei PDFs Auswahl einer Seite oder der ersten beiden Seiten für Vorder-/Rückseite. Maximal 20 MB pro Upload. Bilder werden proportional vollständig eingepasst, nicht beschnitten.
- Personalisierte Text- und QR-Felder, eigene Texte mit `{{spaltenname}}`, Position und Größe in Millimetern, Schriftgröße, Farbe, Hintergrund, Ausrichtung und automatisches Einpassen längerer Texte. Maximal 40 Felder pro Seite.
- Verschieben und Skalieren mit Maus oder Touch; Pfeiltasten verschieben fokussierte Felder um 0,5 mm, mit Umschalt um 5 mm. Duplizieren, Löschen, Rückgängig und Wiederholen.
- CSV mit Komma oder Semikolon, UTF-8-BOM, Anführungszeichen und mehrzeiligen Werten. Deutsche Spaltennamen werden zugeordnet. Maximal 1.000 Empfänger. Empfänger können direkt in der Tabelle bearbeitet werden.
- Echte, lokal erzeugte QR-Codes je Empfänger. Der kodierte Link entspricht dem vollständigen `chatbot_url`-Wert; kein Tracking- oder Weiterleitungsdienst.
- Live-Vorschau je Empfänger sowie nebeneinander angezeigte Vorder- und Rückseite.
- Kampagnen-Check für fehlende Felder, ungültige Links, Textüberläufe beim ausgewählten Empfänger, niedrige Bildauflösung und Sicherheitsabstände.
- Zweiseitiger PDF-Export und einseitiger PNG-Export in 300 dpi für den ausgewählten Empfänger.
- Mehrere lokale Kampagnen in IndexedDB. Vollständige Projektdateien mit Designs, Feldern und Empfängern exportieren und als Kopie importieren.
- Desktop-, Tablet- und Mobilansicht; keine externen CDN-Aufrufe oder Upload-Dienste.

## Grenzen der ersten Version

Die Kampagnen liegen nur im verwendeten Browser und Ursprung. Browserdaten löschen entfernt diese Entwürfe. `Projekt sichern` erstellt ein portables Backup. Noch keine Benutzerkonten, Team-Synchronisierung, Empfängerrecherche, Serien-PDFs, Versandaufträge oder echte Produktionsanbindung.

PDF-Uploads werden lokal gerastert (bis 300 dpi, längste Seite maximal 3.500 px). Bestehende Inhalte im hochgeladenen Design werden nicht automatisch erkannt oder verändert; Personalisierungsfelder werden darübergelegt. Bereits aufgedruckte Platzhalter müssen vorher entfernt oder mit der passenden Hintergrundfarbe abgedeckt werden.

Der Export ist ausdrücklich ein **RGB-Ansichts-PDF ohne Beschnitt**, kein PDF/X und keine Druckfreigabe. Vor tatsächlicher Produktion sind Beschnitt, Farbprofil, Schriften, Papier und Druckerei-Vorgaben abzustimmen. Die QR-Codes haben eine weiße Ruhezone. Unter 20 mm Größe wird gewarnt. Physisch ausgedruckte Codes sollten vor Versand zusätzlich mit Mobiltelefonen getestet werden.

Die Beispielunternehmen sind fiktiv. Die Musterlinks führen auf die öffentliche chattastic-Startseite. Die App erstellt keine Chatbots und prüft keine fremden Zielseiten auf Erreichbarkeit. Echte individuelle Chatbot-Links werden vom Nutzer pro Empfänger eingetragen.

## Entwicklung und Prüfung

```sh
npm run build
npm test
npm run test:browser
```

`build` bündelt den modularen Quellcode nach `studio/app.js` und kopiert PDF-Worker sowie Ressourcen nach `studio/vendor`. Die gebaute Version ist bewusst eingecheckt, damit die Unterseite ohne Build-Server statisch auslieferbar ist. Zusätzlich entsteht unter `dist/` eine vollständige statische Website mit unveränderter Landingpage und neuer Studio-Unterseite. `vercel.json` legt diesen Ausgabeordner explizit fest. Die vorhandene Vercel-GitHub-Anbindung erzeugt eine separate Branch-Vorschau; der Produktionsbranch wird nicht geändert.

Die Browserprüfung erwartet den laufenden lokalen Server und installiertes Google Chrome. Alternativ `BROWSER_CHANNEL` und `STUDIO_URL` setzen. Testbilder bleiben unter dem ignorierten `test-results/`.

Die automatisierten Browserprüfungen decken den vollständigen Arbeitsablauf ab: Personalisierung, Drag/Keyboard, Undo/Redo, CSV-Import, Dekodieren der tatsächlichen QR-Pixel für zwei Empfänger, PDF-Seitenmaße, ungültige URLs, PDF- und PNG-Uploads, Speicherung nach Reload, Projekt-Roundtrip, fehlerhafte Projektdateien, Textüberläufe und responsive Ansichten.

### Dateistruktur

- `index.html` / `styles.css`: Oberfläche im Kontaktstoff-Erscheinungsbild.
- `src/app.js`: Editor, Uploads, Navigation, Import/Export.
- `src/core.js`: Kampagnenschema, Formate, CSV, Personalisierung und Validierung.
- `src/render.js`: Mailingvorlagen, Canvas-Rendering, Textlayout und QR-Codes.
- `src/storage.js`: lokaler Kampagnenspeicher.
- `src/icons.js`: lokale SVG-Icons.
- `vendor/`: lokal ausgelieferte PDF-Bibliotheksressourcen und Lizenzen.

Für eine spätere Veröffentlichung nur nach bewusster Freigabe die Unterseite samt lokalen Ressourcen und den bestehenden `assets/fonts/` ausliefern. Ein Git-Branch ist keine Zugangskontrolle; vertrauliche Empfängerdaten gehören nicht ins Repository.

## 3D-Vorschau und geführter Einstieg

Unter **Neue Kampagne → Von null starten** beginnt ein eigener Entwurf ohne Vorlage, Personalisierungsfelder oder Beispielkontakte. Die sechs erklärten Schritte sind: Idee und Ziel, DIN-A5-Format, beide Designseiten, persönliche Felder, Empfänger und abschließende Vorschau. Briefing und Anleitungsfortschritt werden mit der Kampagne gespeichert; beim Wiederöffnen wird eine noch aktive Anleitung fortgesetzt. Die bestehenden Kampagnen bleiben erhalten.

Im Editor können leere Seiten eine eigene Flächenfarbe bekommen. Eine leere Zeichenfläche bietet einen direkten Einstieg zum ersten Text oder zum Design-Upload. Neue Texte erhalten auf dunklen, einfarbigen Flächen automatisch eine helle Ausgangsfarbe. Die Einträge des Briefings werden nicht automatisch als Werbetext verwendet.

Die Vorschau startet in der **3D-Ansicht** mit tatsächlichen Canvas-Texturen beider Mailingseiten. Ziehen dreht die Karte; „Verschieben“ oder Umschalt + Ziehen bewegt sie. Die Schaltflächen wenden die Karte, zeigen gezielt Vorder-/Rückseite, zoomen und setzen den Blickwinkel zurück. Nach Fokussieren funktionieren Pfeiltasten und Plus/Minus; mit zwei Fingern sind Zoom und Verschieben möglich. „Beide Seiten“ wechselt zur flachen Prüfung. Das 3D-Modell ist eine visuelle Darstellung einer flachen Karte, keine verbindliche Simulation von Papierstärke, Material oder Druckfarben. Die Ansichtsbewegung verändert weder Feldpositionen noch Exportdateien.

Zusätzliche Browserprüfung: `npm run test:guide`. Sie prüft 3D-Texturen, Drehen/Wenden, Verschieben, Zoom, Tastaturbedienung sowie den kompletten Neuaufbau einer Kampagne, die Wiederaufnahme nach einem Reload und die Mobilansicht.
