# Kundenbereich und Editor

Entwicklungsbranch: `codex/kundenbereich`. Live: https://www.kontaktstoff.com. Am 21.09.2026 wurde auf ausdrückliche Zustimmung die Neon-Datenbank `kontaktstoff-production` im Tarif `free_v3` und Standort Frankfurt (`fra1`) angelegt, ausschließlich mit Production verbunden. `DATABASE_URL` wird von der Integration verwaltet, `PUBLIC_ORIGIN` ist https://www.kontaktstoff.com. Keine Produktionsschlüssel lokal heruntergeladen. E-Mail-Versand bleibt auf ausdrücklichen Nutzerwunsch offen.

Die Homepage entspricht dem öffentlich vorhandenen Design. Ergänzt sind Links in Navigation, Hauptaktion und Dashboard-Ansicht sowie die Übergabe aus dem Planungsrechner. Bestehende Geldbeträge im Rechner sind Planungswerte; der Kundenbereich löst keine Zahlung aus.

## Lokal öffnen

`npm ci`, `npm run build`, `npm run dev` (Node 22.19 oder neuer).

- `/konto/`: echter Arbeitsplatz, anfangs mit lokalen Entwürfen
- `/konto/?demo=1`: schreibgeschützte, fiktive Dashboard-Demo
- `/studio/?start=1&workspace=1`: ohne Konto gestalten; Vorlagen, Bilder/PDF und CSV
- `/fuer/money-making-sprint/`: persönliche Kundenseite; „Kampagne anfragen“ übernimmt den ausgewählten Entwurf

Selbst gestalten oder Gestaltung anfragen → eigene Kontakte oder Lead-Recherche → Zielgruppe und Kampagnenwunsch → beim Anfragen Konto anlegen/anmelden. Die Anfrage speichert einen unveränderlichen Stand des Designs, der Empfänger, des Briefings und der Unternehmensdaten. Änderungen danach verändern diese Anfrage nicht. Ohne E-Mail-Konfiguration werden keine E-Mails versendet. Es werden keine Aufträge oder Zahlungen ausgelöst.

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
- `/konto/?tab=inbox`: geschützter Anfrage-Eingang für verifizierte Konten aus `OPERATOR_EMAILS`. Liste, unveränderlicher Anfrage-Stand, Projektdownload, Status und interne Notiz. Statusänderungen sind versionsgeschützt; Kunden sehen den Status, niemals interne Notizen. Ohne konfigurierte Team-Adressen ist der Bereich für niemanden freigeschaltet. `npm run requests` bleibt als Betreiberbefehl verfügbar.

Tracking wird ausdrücklich im Bereich Auswertung aktiviert und ändert die QR-Ziele. Danach erneut exportieren. Die tatsächlichen Ziel-URLs bleiben in der Linktabelle. Lokale Links sind nur für Tests geeignet; vor echtem Versand die endgültige Live-Domain verwenden. Im QR-Tracking werden keine IP-Adressen, Cookies oder Browserkennungen gespeichert.

## Für einen späteren öffentlichen Kontobetrieb noch konfigurieren

1. Produktion ist mit Neon verbunden; Preview und Development besitzen bewusst keine Produktionsverbindung. Für eine Cloud-Preview eine separate Datenbank anlegen. Backups/Wiederherstellung und Kapazitätsgrenzen des Free-Tarifs vor wachsendem Betrieb prüfen.
2. E-Mail ist vorbereitet, aber bewusst nicht eingerichtet: `RESEND_API_KEY`, verifizierter `MAIL_FROM` und `REQUEST_NOTIFICATION_TO` ergänzen. Keine Schlüssel ins Repository. Solange E-Mail fehlt, bleiben die entsprechenden Schaltflächen ausgeblendet; Registrierung, Entwürfe und Anfragen funktionieren trotzdem.
3. Team-Adressen als `OPERATOR_EMAILS` hinterlegen. Adminrechte werden niemals aus dem Firmenprofil oder aus einer Registrierung übernommen. Ein Teamkonto muss zusätzlich seine E-Mail bestätigt haben. Noch kein Betreiberkonto wurde berechtigt.
4. Betreiberangaben/Datenschutzhinweise, tatsächliche Preise und Druck-/Versandprozess sind weiterhin auszufüllen. Kein Zahlungsdienst, Credit-Wallet oder automatischer Druckauftrag. A5 ist direkt editierbar; Sonderformate bleiben Angebotswünsche.

## E-Mail- und Kontoverbindungen

Resend-Adapter ist optional und sendet nur Transaktionsmails. Bestätigungslinks sind 24 Stunden, Passwortlinks 30 Minuten gültig, zufällig, nur gehasht gespeichert und einmal verwendbar. Der geheime Linkteil steht im URL-Fragment statt im Server-Log. Zurücksetzen beendet alle vorhandenen Sitzungen. Kontoabfragen geben bei unbekannten E-Mails dieselbe neutrale Antwort; Limits liegen in der Datenbank.

Kampagnenanfragen werden zuerst dauerhaft gespeichert. Eine optional aktivierte interne E-Mail enthält nur Anfragekennung und den geschützten Dashboard-Link, keine Empfängerlisten. Versandfehler verwerfen die Anfrage nicht. `POST /api/operator/requests/:id/notify` erlaubt dem berechtigten Team einen erneuten Versuch; erfolgreicher Versand wird vermerkt. Es gibt aktuell keinen automatischen Hintergrund-Retry. Keine E-Mails wurden bei der Einrichtung versendet.


## Prüfungen

`npm test` prüft Schema, Kontentrennung, Passwortspeicherung, CSRF/Ursprung, Versionskonflikte, Anfrage-Snapshots, Redirects, Auswertung und Persistenz nach Datenbank-Neustart.

Browserprüfung mit separater Datenbank:

```sh
PORT=4181 SQLITE_PATH=test-results/workspace-test.sqlite npm run dev
npm run test:workspace
npm run test:homepage
```

Die Browsertests prüfen Gast → Anfrage → Registrierung → Konto, zweites Gerät, CSV in den Server-Editor, Status/ROI, echte Redirects, responsive Ansichten und Money-Making-Sprint-Übernahme. Testkonten und Testkontakte liegen ausschließlich in der separaten ignorierten Testdatenbank.

## Veröffentlichungsprüfung 21.09.2026

Deployment `dpl_GQKj8Va5Une3CA6yZZ2x8SBCdhYJ`, Commit `0455462`, API-Region `fra1`. Live liefert `/api/health` HTTP 200 mit `storage: postgres` und `email: false`; `/api/auth/me` liefert als Gast HTTP 200. 33 automatisierte Tests, kompletter lokaler Workspace-Browsertest und gezielter UI-Test für Team-Eingang/Passwortlinks erfolgreich. Der zusätzliche produktive Schreibtest benötigt eigene Freigabe, da er dauerhafte synthetische Testdatensätze hinterlässt.
