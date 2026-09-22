# Kontaktstoff

Editor und Kundenbereich für persönliche B2B-Mailings. Der Branch **`codex/kundenbereich`** ergänzt das bestehende öffentliche Homepage-Design um Studio-/Kontolinks und eine Übergabe aus dem Planungsrechner. Der Stand ist seit 21.09.2026 unter https://www.kontaktstoff.com veröffentlicht. Anmeldung und Server-Speicherung nutzen Neon PostgreSQL in Frankfurt. E-Mail-Versand bleibt vorerst deaktiviert.

## Lokal starten

Node.js 22.19+:

```sh
npm ci
npm run build
npm run dev
```

- Homepage: http://127.0.0.1:4177/
- Kundenbereich: http://127.0.0.1:4177/konto/
- Fiktive Dashboard-Demo: http://127.0.0.1:4177/konto/?demo=1
- Editor: http://127.0.0.1:4177/studio/?start=1&workspace=1
- Kundenkonzept: http://127.0.0.1:4177/fuer/money-making-sprint/

## Ablauf

Ohne Konto beginnen: Beispiel in 2D/3D ansehen, selbst gestalten oder Gestaltung anfragen. CSV importieren und Spalten zuordnen oder Lead-Recherche wählen. Kampagnenwunsch prüfen. Beim Anfragen ein Unternehmenskonto anlegen oder anmelden; der Entwurf wird ins Konto übernommen und als Anfrage-Snapshot gespeichert.

Der Kundenbereich zeigt Kampagnen, Designs, Kontakte, Unternehmensdaten und Auswertung. Versand-/Vertriebsstatus, tatsächliche Kosten und Deckungsbeiträge werden manuell gepflegt. Aktivierte Kampagnen-Links erfassen tatsächliche QR-Aufrufe. Eine separate Demo zeigt ausdrücklich fiktive Daten; echte Konten starten ohne erfundene Ergebnisse.

Im Editor bleiben PDF/Bild-Uploads, Gestaltung in Millimetern, Personalisierung, reale QR-Codes, CSV-Import, 3D, Undo/Redo, Prüfungen und PDF-/ZIP-Export erhalten. Lokale Entwürfe bleiben im jeweiligen Browser. Kontoentwürfe werden serverseitig gespeichert und sind nach Anmeldung auf anderen Geräten verfügbar.

## Backend und Grenzen

Lokal läuft SQLite in `.data/`; die Datei und Testkonten werden nicht eingecheckt oder statisch ausgeliefert. Vercel benötigt PostgreSQL (`DATABASE_URL`) und die eigene URL (`PUBLIC_ORIGIN`). Ohne Konfiguration bleibt der lokale Editor nutzbar; Serverfunktionen melden, dass die Anbindung fehlt. Neon PostgreSQL ist seit 21.09.2026 im kostenlosen Tarif in Frankfurt ausschließlich mit der Produktion verbunden. E-Mail-Versand bleibt auf Nutzerwunsch offen.

Keine Zahlung, Versandbuchung, automatische Lead-Recherche oder E-Mail-Versendung. Leistungen werden angefragt. Kontowiederherstellung/E-Mail-Verifikation, Mehrbenutzerrollen und privater separater Dateispeicher sind noch nicht angebunden. Die öffentliche Homepage ist das bestehende Marketingkonzept, kein Nachweis bereits automatisierter Produktionsleistungen.

DIN A5 ist editierbar. Selfmailer/Sonderformate werden als Angebotswunsch erfasst. Exporte sind RGB-Ansichtsdateien ohne Beschnitt, keine PDF/X-Druckfreigabe. Vorlagen und Beispieldaten sind fiktiv. Fotos: [Quellen](assets/photos/CREDITS.md).

Details zu Daten, Infrastruktur und den vor öffentlichem Kontobetrieb offenen Punkten: **[Kundenbereich](docs/KUNDENBEREICH.md)**.

## Prüfen

```sh
npm test
npm run test:content
npm run test:csv-client
```

Für vollständige Kontentests eine getrennte Testdatenbank starten:

```sh
PORT=4181 SQLITE_PATH=test-results/workspace-test.sqlite npm run dev
npm run test:workspace
npm run test:homepage
```

Die Tests prüfen unter anderem Kontentrennung, CSRF, revisionssicheres Speichern, Anfrage-Snapshots, QR-Redirects, CSV, Editor, Anmeldung auf einem zweiten Gerät, responsive Ansichten und Übergaben von Homepage/Kundenkonzept. Die Produktion nutzt Neon PostgreSQL; lokale Tests verwenden eine getrennte SQLite-Datenbank.

`npm run requests` ist ein lokaler Betreiberbefehl zum Lesen eingegangener Anfragen. Die Betreiber-API ist durch Anmeldung und serverseitige Rollenprüfung geschützt.

### Geführter Kampagnenablauf

`/konto/?tab=new-campaign` startet einen benannten Entwurf. Der Arbeitsplatz unter
`?tab=build&id=…` führt durch Layout, Design, Personalisierung und Übergabe. Zehn
native A5-Vorlagen liegen in `studio/src/brand-templates.js`; ihre Branding-Felder
bleiben auch im vollständigen Editor bearbeitbar. Andere Formate und PDF-Uploads
sind weiterhin im Detail-Editor verfügbar. Gastentwürfe werden lokal gespeichert,
Kontentwürfe revisionsgesichert im Backend. Beim Absenden wird der bestätigte
Entwurfsstand als unveränderlicher Anfrage-Snapshot gespeichert. Das Team sieht
Bestätigung und Bearbeitungsstatus im Anfragen-Eingang. Dies ist keine automatische
Druckbestellung und ersetzt nicht die Abstimmung druckfertiger Produktionsdaten.

Das Tracking zeigt tatsächliche QR-Aufrufe samt täglichem Verlauf (UTC).
Versandstatus, Vertriebsergebnisse und Kosten werden manuell gepflegt; es gibt
keine automatische Shop-Conversion- oder Versanddienst-Anbindung.

Prüfung: `npm test`, `npm run test:builder`, `npm run test:workflow` und
`node tests/template-render.mjs`. Browser-Tests nutzen den lokalen Server auf Port 4183.

### Verkaufsseite und persönliche Links

`/mailings/` zeigt Angebot, drei fiktive Kampagnenbeispiele, Ablauf und ein
Anfrageformular ohne Registrierung. Unter `/konto/?tab=sales-links` erstellen
Betreiber gespeicherte Kundenseiten aus einer Website oder einem manuellen Entwurf.
Der Import übernimmt öffentliche Metadaten und geeignete Rasterbilder und erzeugt
einen regelbasierten, bearbeitbaren Text-/Layoutvorschlag. Es ist kein angebundener
LLM-Dienst. Money Making Sprint besitzt einen eigens ausgearbeiteten Ausgangsentwurf.
Logo, Foto, Farbe, Texte, Zielgruppe, QR-Ziel und Loom lassen sich anpassen.

`/mailings/?vorschau=<id>` zeigt den gespeicherten Entwurf nur angemeldeten Betreibern.
`/mailings/?konzept=<slug>` zeigt den explizit veröffentlichten Stand. Der Link
bleibt bei Updates gleich und kann deaktiviert werden. Entwürfe und veröffentlichte
Snapshots sind getrennt und revisionsgesichert. Öffentliche Vorschläge enthalten
keine internen Herkunftsnotizen; Suchmaschinen sollen sie nicht indexieren.
Der optionale Loom-Freigabelink öffnet das Video extern. Die bisherigen einfachen
Links mit `fuer`, `ziel` und `video` funktionieren weiterhin.

Website-Abrufe sind auf öffentliche IPv4-Adressen und HTTP(S) begrenzt. DNS wird pro
Weiterleitung geprüft und an die Verbindung gebunden; Zeit-, Größen- und
Dekomprimierungslimits gelten auch für Bilder. HTML wird als Daten gelesen, nicht
ausgeführt. Bei gesperrten Websites kann man manuell beginnen. SVG-Logos werden
nicht importiert; PNG/JPG/WebP können hochgeladen werden.

Anfragen werden serverseitig gespeichert und unter
`/konto/?tab=sales-inquiries` mit Status und interner Notiz bearbeitet. Persönliche
Kundenseiten werden der Anfrage zugeordnet. Wiederholte Übermittlungen derselben
Anfrage sind idempotent. Herkunftsprüfung, Rate-Limits, Honeypot und
Betreiberberechtigungen schützen die Endpunkte. Es erfolgt keine automatische
E-Mail, Zahlung oder Bestellung.

Offen bleiben vollständige Betreiber-/Datenschutzhinweise, E-Mail-Anbindung,
Shop-Ereignisse und Druck-/Versanddienst-Anbindung. `npm test` prüft Validierung,
Berechtigungen und Veröffentlichung; `npm run test:sales` und
`npm run test:proposals` prüfen die Browserabläufe mit einem getrennten Testserver
auf Port 4183. `node tests/proposal-import.mjs` prüft zusätzlich den Import gegen
öffentliche Websites und benötigt Netzwerkzugriff.
