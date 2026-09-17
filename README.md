# Kontaktstoff

Ein vollständiger lokaler Arbeitsablauf für personalisierte B2B-Mailings: von der Homepage über Kampagnen und beidseitiges Design bis zur PDF-Serie und Übergabe.

Entwicklung auf **`codex/kampagnenstudio`**. Die vorhandene GitHub/Vercel-Anbindung erstellt Branch-Previews. Der Produktionsbranch wird nicht geändert.

## Lokal starten

Node.js 22.19+ und npm:

```sh
npm ci
npm run build
npm run dev
```

- Homepage: http://127.0.0.1:4177/
- Kampagnen: http://127.0.0.1:4177/studio/
- Geführter Einstieg: http://127.0.0.1:4177/studio/?start=blank
- Bearbeitbare chattastic-Vorlage: http://127.0.0.1:4177/studio/?template=chattastic
- Fertige Fotobeispielkampagne: http://127.0.0.1:4177/studio/?example=chattastic

Ein frischer Browser öffnet eine leere Kampagnenübersicht. Es werden keine Beispielkontakte automatisch als echte Kampagne angelegt. „Beispielkampagne laden“ öffnet eine eigene, vollständig bearbeitbare Kampagne mit echtem Stockfoto und drei ausdrücklich fiktiven Kontakten direkt in 3D. Vorhandene Entwürfe bleiben erhalten. `?demo=1` bietet das ursprüngliche Muster für die bestehenden Regressionstests.

## Was funktioniert

- Homepage mit interaktiver, personalisierbarer 3D-Karte, Vorlagen und direktem Einstieg.
- Kampagnenübersicht mit Vorschauen, Suche, Duplizieren, Löschen und Projektimport.
- Anleitung in sechs Schritten: Briefing, Format, Design, persönliche Felder, Empfänger, Prüfung.
- DIN A5 quer, Vorder- und Rückseite. Drei vollständig bearbeitbare Vorlagen.
- PDF-/Bild-Uploads, eigene Logos mit Transparenz, Text, Farbflächen und echte QR-Codes.
- Positionierung in Millimetern, Maus/Touch/Tastatur, Größenänderung, Ebenenfolge, Undo/Redo.
- Empfänger als CSV oder per Eingabe; eigene Spalten, Postanschriften und Suche.
- Tatsächliche Designs in drehbarer, verschiebbarer 3D-Ansicht sowie flachem Korrekturabzug.
- Prüfung aller Empfänger auf fehlende Werte, ungültige QR-Ziele und Textüberläufe; Hinweise zu Bildauflösung, Postanschriften und möglichen Duplikaten.
- PDF/PNG für einen Empfänger sowie ZIP-Pakete mit personalisierter PDF-Serie, CSV, Seitenzuordnung, Prüfbericht und vollständigem Projekt.
- Lokale automatische Speicherung und portable Projektdateien.

## Bewusste Grenzen

Das ist ein funktionsfähiges **lokales Pilotwerkzeug**, kein gehostetes Mehrbenutzersystem. Keine Konten, Cloud-Synchronisierung, Chatbot-Erstellung, Scan-Analyse, Zahlung, Druck- oder Versandbestellung. Ziel-Links müssen bereits existieren. Die URL-Prüfung kontrolliert Format und Länge, nicht die Erreichbarkeit der fremden Website.

Alle Exporte sind **RGB-Ansichten mit 300 dpi, ohne Beschnitt**, kein PDF/X. Finale Druckdaten, Farbprofil, Papier und Produktion müssen mit der Druckerei abgestimmt werden. Je ZIP-Paket werden maximal 50 Empfänger verarbeitet; eine Kampagne kann bis zu 1.000 Kontakte enthalten.

Kampagnen liegen in IndexedDB unter dem jeweiligen Browser-Ursprung. Regelmäßig „Projekt sichern“ verwenden. Löschen der Browserdaten entfernt lokale Entwürfe. Uploads und Kontakte werden nicht an einen Server übertragen. Die Projektdatei im ZIP enthält die **gesamte** Kampagne, auch bei einem eingeschränkten PDF-Empfängerbereich.

Die Homepage nennt den aktuellen Funktionsumfang. Betreiberangaben und vollständige Datenschutzerklärung sind vor einem öffentlichen Marktstart noch zu ergänzen.

## Prüfung

Mit laufendem Entwicklungsserver und installiertem Google Chrome:

```sh
npm test
npm run test:browser
npm run test:guide
npm run test:product
npm run test:handoff
npm run test:example
```

Die Tests prüfen unter anderem echte QR-Pixel, PDF-Maße und Seitenzahl, Uploads, Rundlauf von Projektdateien, 3D-Eingaben, Anleitung, lokale Speicherung, alle neuen Produktabläufe und mobile Ansichten. Screenshots liegen unter `test-results/` und werden nicht eingecheckt.

`npm run build` bündelt das Studio, kopiert lokale PDF-Ressourcen und erstellt die vollständige Website unter `dist/`. `vercel.json` verwendet diesen Ordner. Die gebaute Studio-Datei ist außerdem im Repository enthalten; ein statischer HTTP-Server genügt zum Ausprobieren.

Details: [Studio-Dokumentation](studio/README.md) · [Weiterentwicklung zum öffentlichen Produkt](docs/PRODUKTSTART.md)
