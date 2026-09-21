# Kontaktstoff

Editor und Kundenbereich für persönliche B2B-Mailings. Der Branch **`codex/kundenbereich`** ergänzt das bestehende öffentliche Homepage-Design um Studio-/Kontolinks und eine Übergabe aus dem Planungsrechner. Kein Live-Deployment wurde durchgeführt.

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

Lokal läuft SQLite in `.data/`; die Datei und Testkonten werden nicht eingecheckt oder statisch ausgeliefert. Vercel benötigt PostgreSQL (`DATABASE_URL`) und die eigene URL (`PUBLIC_ORIGIN`). Ohne Konfiguration bleibt der lokale Editor nutzbar; Serverfunktionen melden, dass die Anbindung fehlt. Keine externe Datenbank wurde provisioniert und nichts auf Produktion veröffentlicht.

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

Die Tests prüfen unter anderem Kontentrennung, CSRF, revisionssicheres Speichern, Anfrage-Snapshots, QR-Redirects, CSV, Editor, Anmeldung auf einem zweiten Gerät, responsive Ansichten und Übergaben von Homepage/Kundenkonzept. PostgreSQL ist vorbereitet, aber mangels bereitgestellter Datenbank noch nicht in einer Hosting-Umgebung getestet.

`npm run requests` ist ein lokaler Betreiberbefehl zum Lesen eingegangener Anfragen. Es gibt dafür kein öffentliches Admin-Endpoint.
