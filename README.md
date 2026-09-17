# KONTAKTSTOFF | B2B-Outreach per Post

Statische, interaktive Landingpage für personalisierte B2B-Postkampagnen: vom Wunschkunden über Gestaltung, Produktion und Versand bis zum Gespräch und gepflegten Kampagnenergebnis.

## Gestaltung

- Weiß, Graphit und Neongelb; Manrope in 400 und 700, lokal unter SIL Open Font License.
- Direkter Hero ohne Eyebrow, klare Größenhierarchie, großzügige Software-UI und reduzierte Scroll-Reveals mit Reduced-Motion-Unterstützung.
- Der Hero belegt den ersten Viewport und zeigt als Studienwerte nur 935 % ROAS und 2,8 % Conversion Rate. Danach erklärt ein Briefsymbol Kontaktstoff als physischen B2B-Erstkontakt.
- Der Nutzen und der offen sichtbare Vergleich mit Kaltakquise per E-Mail, Anruf und LinkedIn stehen vor dem detaillierten Dashboard. Große vertikale Abstände trennen die Abschnitte.
- Die ausgewählte Logoidee 02, das Material-K, steht links neben der Wortmarke. Alle zehn Richtungen bleiben unter `dist/logo-ideen/` vergleichbar.

## Leistung und Inhalte

- Fünf manuell auswählbare Prozessschritte: Wunschkunden, Gestaltung, Druck und Versand, Reaktion, Ergebnis und ROI. Auf großen Viewports läuft der Prozess als Sticky-Scroll und wechselt seine animierten Ansichten beim Scrollen.
- Vergrößerbares Beispiel-Dashboard mit lokaler Status- und ROI-Interaktion.
- Ein tatsächlich geliefertes Selfmailer-Format wird gezeigt. Seine Außen- und Perforationskonturen sind aus `2402-00575 DH Selfmailer Ostern_Stanze.pdf` übernommen; die sichtbare Kontaktstoff-Gestaltung wurde neu erstellt. Eine interaktive Perspektive stellt das flache Format räumlich dar, ohne seine Kontur zu verändern.
- Eine eigene Zielsektion zeigt WhatsApp, Kalender, Potenzialanalyse, Video und Kontaktformular als mögliche Rückwege.
- Das Angebot geht von 20 Gestaltungsvorlagen aus. Im Formatdialog wird nur der vorliegende Selfmailer konkret gezeigt.
- Fünf ausdrücklich fiktive Case-Study-Vorlagen mit synthetischen Porträts, eigenen Botschaften, vollständigen Abläufen und nachvollziehbaren ROI-Beispielen. Keine echten Kundenreferenzen.
- Drei Creditpakete, Kosten- und Kostendeckungsrechner sowie ein lokales Kampagnenbriefing mit TXT-Download und Druckansicht.

## Zahlen und Grenzen

Die CMC Print-Mailing-Studie 2025 betrifft B2B-Bestandskundenaktivierung. Gezeigt werden 2,8 % Conversion Rate und 935 % ROAS. ROAS ist Umsatz im Verhältnis zu Mailingkosten, kein Gewinn. Es werden keine Öffnungs-, Antwort- oder Neukundenquoten für Kontaktstoff erfunden.

Das Dashboard und die Case-Ergebnisse sind Beispiele. Der QR-Code führt zur lokalen Gesprächsdemo; ein echter WhatsApp-Unternehmenslink ist noch nicht hinterlegt. Es werden keine Nachrichten versendet, Termine gebucht oder Aufträge ausgelöst. Betreiber- und Live-Kontaktangaben müssen vor dem öffentlichen Marktstart ergänzt werden.

## Prüfung

Geprüft wurden JS-Syntax und Initialisierung, Personalisierung, beide Chatpfade, QR-Direkteinstieg, Statuswechsel und Rücknahme, fünf Case-Details, Credit-Aufrundung, ungültige Werte, Briefing, Dialogsteuerung und Auswahl des realen Selfmailers. Alle lokalen Seiten- und Asset-Referenzen werden vor dem Deployment validiert.

## Kampagnenstudio (Entwicklungsbranch)

Unter [`studio/`](studio/README.md) liegt ein eigenständiger Editor für personalisierte A5-Mailings: beidseitige Design-Uploads, Text-/QR-Personalisierung, CSV-Empfänger, Live-Vorschau, lokales Speichern und Ansichts-PDFs. Lokal mit `npm run dev` unter `/studio/` öffnen. Der Editor ist nicht in die bestehende Landingpage verlinkt und dieser Branch wird nicht durch einen neu angelegten Workflow veröffentlicht.
