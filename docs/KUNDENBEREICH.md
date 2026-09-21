# Kundenbereich und Editor

Entwicklungsbranch: `codex/kundenbereich`. Produktionsdeployment am 21.09.2026 auf ausdrücklichen Nutzerwunsch durchgeführt: https://www.kontaktstoff.com (auch kontaktstoff.com und kontaktstoff.vercel.app). Veröffentlicht: Commit `82131ce`, Vercel `dpl_4sZk5cQwVs4uTzvzsVYPqQ27nuzB`. Homepage, Editor, Demo und Kundenkonzept live geprüft. DATABASE_URL und PUBLIC_ORIGIN fehlen weiterhin; die Konto-API liefert deshalb bewusst 503.

Die Homepage entspricht dem öffentlich vorhandenen Design. Ergänzt sind Links in Navigation, Hauptaktion und Dashboard-Ansicht sowie die Übergabe aus dem Planungsrechner. Bestehende Geldbeträge im Rechner sind Planungswerte; der Kundenbereich löst keine Zahlung aus.

## Lokal öffnen

`npm ci`, `npm run build`, `npm run dev` (Node 22.19 oder neuer).

- `/konto/`: echter Arbeitsplatz, anfangs mit lokalen Entwürfen
- `/konto/?demo=1`: schreibgeschützte, fiktive Dashboard-Demo
- `/studio/?start=1&workspace=1`: ohne Konto gestalten; Vorlagen, Bilder/PDF und CSV
- `/fuer/money-making-sprint/`: persönliche Kundenseite; „Kampagne anfragen“ übernimmt den ausgewählten Entwurf

Selbst gestalten oder Gestaltung anfragen → eigene Kontakte oder Lead-Recherche → Zielgruppe und Kampagnenwunsch → beim Anfragen Konto anlegen/anmelden. Die Anfrage speichert einen unveränderlichen Stand des Designs, der Empfänger, des Briefings und der Unternehmensdaten. Änderungen danach verändern diese Anfrage nicht. Es werden keine E-Mails versendet und keine Aufträge oder Zahlungen ausgelöst.

## Daten aus den Homepage-Konzepten

| Bereich | Daten |
| --- | --- |
| Unternehmen | Firma, Ansprechpartner, Login-E-Mail, Website, Rechnungsadresse, Rechnungs-E-Mail, USt-IdNr. |
| Kampagne | Name, Wunschformat, Auflage, Ziel, Ziel-Link, Wunschtermin, Notiz, Gestaltungsservice, eigene Leads oder Recherche |
| Recherche | Zielunternehmen/Branche, Region, Größe, Ansprechpartner-Funktion, Ausschlüsse |
| Kontakt | Firma, Vor-/Nachname, Funktion, Website, E-Mail, Telefon, Branche, Größe, Quelle, vollständige Postanschrift, individuelle Nachricht und Ziel-Link |
| Vertrieb | Versandstatus, Gespräch/Termin/gewonnen/verloren, Abschlussdatum, tatsächlicher Deckungsbeitrag, nächste Aufgabe und interne Notiz |
| Auswertung | Tatsächliche Kampagnenkosten, Aufrufe der aktivierten QR-Links, Kontakte mit Aufruf, kumulative Gesprächs-/Termin-/Kundenzahlen, ROI |
| Rechner-Übergabe | Wunschformat, Creditpaket, Credits, Planungsbudget, angenommener Deckungsbeitrag; getrennt von tatsächlichen Ergebnissen |

ROI = (gewonnener Deckungsbeitrag − Kampagnenkosten) / Kampagnenkosten. Ohne Kosten kein ROI. QR-Aufrufe sind Requests, keine bestätigten Personen. HEAD und bekannte Vorschau-/Bot-User-Agents zählen nicht. Mehrere Aufrufe desselben Kontakts zählen als mehrere Requests und ein Kontakt mit Scan. Andere Bots sind nicht zuverlässig erkennbar. Versand und Vertriebsstatus werden manuell gepflegt; keine Zustellnachweise oder Kalenderereignisse werden erfunden.

## Backend

- Lokal: SQLite in `.data/kontaktstoff.sqlite`, samt WAL-Dateien nur lokal, nicht im Git und nicht statisch auslieferbar.
- Hosting: PostgreSQL über `DATABASE_URL` und fester Ursprung über `PUBLIC_ORIGIN`. Vercel-Funktion `api/index.js` verarbeitet `/api/*` und `/r/*`. Ohne Konfiguration liefert das Backend ausdrücklich 503; kein flüchtiger Datenspeicher als Ersatz.
- Passwörter: scrypt mit individuellem Salt, Session-Token nur gehasht in der Datenbank, HttpOnly/SameSite-Cookie, Secure auf HTTPS. Änderungen benötigen denselben Ursprung und sitzungsgebundenen CSRF-Token.
- Kontentrennung: jede Kampagnenabfrage ist an die angemeldete User-ID gebunden. Ein Konto besitzt einen Unternehmensarbeitsplatz. Keine Rollen/Einladungen für mehrere Mitarbeiter implementiert.
- Versionsnummern verhindern unbemerktes Überschreiben in mehreren Browserfenstern. Bei Konflikt bleibt der Editorentwurf exportierbar.
- Bilder sind wie bisher im Projekt enthalten; maximal 4 MB JSON pro Server-Speicherung. Größere lokale Projekte müssen Bilder verkleinern oder als lokale Datei gesichert werden. Separater privater Dateispeicher ist noch nicht eingerichtet.
- `npm run requests` liest als lokaler Betreiberbefehl eingegangene Anfragen aus der konfigurierten Datenbank. Kein öffentliches Admin-Endpoint. Der Kunde sieht Datum/Status seiner Anfrage im Konto.

Tracking wird ausdrücklich im Bereich Auswertung aktiviert und ändert die QR-Ziele. Danach erneut exportieren. Die tatsächlichen Ziel-URLs bleiben in der Linktabelle. Lokale Links sind nur für Tests geeignet; vor echtem Versand die endgültige Live-Domain verwenden. Im QR-Tracking werden keine IP-Adressen, Cookies oder Browserkennungen gespeichert.

## Für einen späteren öffentlichen Kontobetrieb noch konfigurieren

1. Separate PostgreSQL-Datenbank für Preview und Produktion bereitstellen, `DATABASE_URL` und passende `PUBLIC_ORIGIN` eintragen. TLS gemäß Datenbankanbieter aktivieren. Keine Datenbank wurde in diesem Auftrag provisioniert.
2. Absender/Betreiber, Datenschutzhinweise und tatsächlichen Betriebsprozess vervollständigen. Kontowiederherstellung und E-Mail-Verifikation sind noch nicht angebunden; derzeit keine Passwort-Reset-Mails. Verantwortlichen Zugriff auf Anfragen und Datenbank-Backups festlegen.
3. Gestaltung/Lead-Recherche und Versandpreise festlegen. Die 100-€-Notiz war eine Preisidee, kein bestätigtes Produkt. Es gibt keine bezahlbare Buchung, kein Credit-Wallet und keine Bezahl-/Versandschnittstelle.
4. DIN A5 ist direkt editierbar. Selfmailer und Sonderformate werden als Angebotswunsch gespeichert; keine editierbare Stanzkontur oder druckfertige CMYK/PDF-X-Ausgabe.
5. PostgreSQL-Verbindung und Vercel-Deployment in der tatsächlichen Hosting-Umgebung prüfen. Automatisiert geprüft wurde die vollständige lokale SQLite-Variante; die PostgreSQL-Variante ist vorbereitet, aber noch nicht gegen eine bereitgestellte Datenbank getestet.

## Prüfungen

`npm test` prüft Schema, Kontentrennung, Passwortspeicherung, CSRF/Ursprung, Versionskonflikte, Anfrage-Snapshots, Redirects, Auswertung und Persistenz nach Datenbank-Neustart.

Browserprüfung mit separater Datenbank:

```sh
PORT=4181 SQLITE_PATH=test-results/workspace-test.sqlite npm run dev
npm run test:workspace
npm run test:homepage
```

Die Browsertests prüfen Gast → Anfrage → Registrierung → Konto, zweites Gerät, CSV in den Server-Editor, Status/ROI, echte Redirects, responsive Ansichten und Money-Making-Sprint-Übernahme. Testkonten und Testkontakte liegen ausschließlich in der separaten ignorierten Testdatenbank.
