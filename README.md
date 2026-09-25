# KONTAKTSTOFF | B2B-Outreach per Post

Statische, interaktive Landingpage für personalisierte B2B-Postkampagnen: vom Wunschkunden über Gestaltung, Produktion und Versand bis zum Gespräch und gepflegten Kampagnenergebnis.

## Gestaltung

- Weiß, Graphit und Neongelb; Manrope in 400 und 700, lokal unter SIL Open Font License.
- Direkter Hero ohne Eyebrow, klare Größenhierarchie, großzügige Software-UI und reduzierte Scroll-Reveals mit Reduced-Motion-Unterstützung.
- Die H1 steht in drei Zeilen: „B2B-Mailing für / Neukundengewinnung. / Echte Post. Persönlich.“ Auf kleinen Bildschirmen wird die Schrift so skaliert, dass „Neukundengewinnung.“ ungetrennt in eine Zeile passt. Der Hero belegt den ersten Viewport und zeigt als Studienwerte nur 935 % ROAS und 2,8 % Conversion Rate. Danach erklärt ein Briefsymbol Kontaktstoff als physischen B2B-Erstkontakt.
- Der Nutzen und der offen sichtbare Vergleich mit Kaltakquise per E-Mail, Anruf und LinkedIn stehen vor dem detaillierten Dashboard. Große vertikale Abstände trennen die Abschnitte.
- Die ausgewählte Logoidee 02, das Material-K, steht links neben der Wortmarke. Alle zehn Richtungen bleiben unter `dist/logo-ideen/` vergleichbar.

## Leistung und Inhalte

- Fünf manuell auswählbare Prozessschritte: Wunschkunden, Gestaltung, Druck und Versand, Reaktion, Ergebnis und ROI. Auf großen Viewports läuft der Prozess als Sticky-Scroll und wechselt seine animierten Ansichten beim Scrollen.
- Vergrößerbares Beispiel-Dashboard mit lokaler Status- und ROI-Interaktion.
- Ein tatsächlich geliefertes Selfmailer-Format wird gezeigt. Seine Außen- und Perforationskonturen sind aus `2402-00575 DH Selfmailer Ostern_Stanze.pdf` übernommen; die sichtbare Kontaktstoff-Gestaltung wurde neu erstellt. Eine interaktive Perspektive stellt das flache Format räumlich dar, ohne seine Kontur zu verändern.
- Eine eigene Zielsektion zeigt WhatsApp, Kalender, Potenzialanalyse, Video und Kontaktformular als mögliche Rückwege.
- Das Angebot geht von 20 Gestaltungsvorlagen aus. Im Formatdialog wird nur der vorliegende Selfmailer konkret gezeigt.
- Fünf Case Studies aus unterschiedlichen Branchen mit Porträts, eigenen Botschaften, vollständigen Abläufen und nachvollziehbarer ROI-Rechnung.
- Drei Creditpakete, Kosten- und Kostendeckungsrechner sowie ein lokales Kampagnenbriefing mit TXT-Download und Druckansicht.

## Zahlen und Grenzen

Die CMC Print-Mailing-Studie 2025 betrifft B2B-Bestandskundenaktivierung. Gezeigt werden 2,8 % Conversion Rate und 935 % ROAS. ROAS ist Umsatz im Verhältnis zu Mailingkosten, kein Gewinn. Es werden keine Öffnungs-, Antwort- oder Neukundenquoten für Kontaktstoff erfunden.

Das Dashboard ist ein Beispiel. Der QR-Code führt zur lokalen Gesprächsdemo; ein echter WhatsApp-Unternehmenslink ist noch nicht hinterlegt. Es werden keine Nachrichten versendet, Termine gebucht oder Aufträge ausgelöst. Betreiber- und Live-Kontaktangaben müssen vor dem öffentlichen Marktstart ergänzt werden.

## Prüfung

Geprüft wurden JS-Syntax und Initialisierung, Personalisierung, beide Chatpfade, QR-Direkteinstieg, Statuswechsel und Rücknahme, fünf Case-Details, Credit-Aufrundung, ungültige Werte, Briefing, Dialogsteuerung und Auswahl des realen Selfmailers. Alle lokalen Seiten- und Asset-Referenzen werden vor dem Deployment validiert.

## SEO und Auslieferung

- Live-Domain: `https://www.kontaktstoff.com/` (Canonical, Open Graph, Sitemap und strukturierte Daten verweisen darauf).
- `sitemap.xml` und `robots.txt` liegen im Wurzelverzeichnis. In der Google Search Console wird `https://www.kontaktstoff.com/sitemap.xml` eingetragen. Neue Seiten müssen dort ergänzt werden.
- Strukturierte Daten (JSON-LD) im `<head>`: Organization, WebSite, WebPage, Service mit den drei Paketen und FAQPage. Die FAQ-Texte müssen mit den sichtbaren FAQ übereinstimmen.
- Favicons (`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`), `site.webmanifest` und ein Social-Vorschaubild `assets/og-image.jpg` (1200 × 630).
- Für die Anzeige werden verkleinerte Dateien genutzt: `assets/logo-k-96.webp`, `assets/dashboard-konzept.webp` und WOFF2-Schriften. Die Originale bleiben erhalten.
- `vercel.json` setzt Sicherheits- und Cache-Header und markiert `logo-ideen/` zusätzlich als `noindex`.

## Ratgeber, Branchen und Rechtliches

- Texte liegen in `inhalte/ratgeber/*.html` und `inhalte/branchen/*.html`. Jede Datei beginnt mit einer Zeile `<!--META {...}-->` (Titel, Description, H1, Lead, FAQ, verwandte Artikel), danach folgt der HTML-Text.
- `inhalte/FAKTEN.md` ist das verbindliche Faktenblatt: Studienzahlen, Preise, Case-Study-Werte und Stilregeln. Neue Texte müssen dazu passen.
- `python3 tools/seiten_bauen.py` erzeugt daraus `ratgeber/`, `branchen/`, die Rechtsseiten (`impressum.html` usw.), `404.html`, den Footer der Startseite und die `sitemap.xml`. Neue Artikel werden in den Listen `RATGEBER` bzw. `BRANCHEN` im Skript eingetragen.
- Die Rechtsseiten sind Platzhalter mit `noindex` und stehen nicht in der Sitemap, bis die echten Angaben ergänzt sind.
- Das Hauptmenü bleibt unverändert. Ratgeber, Branchen und Rechtliches sind über den Footer verlinkt.
