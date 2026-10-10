> Standhinweis: Der neue Konto-/Backend-Ablauf ist in [KUNDENBEREICH.md](KUNDENBEREICH.md) dokumentiert. Die folgenden Abschnitte beschreiben den bisherigen lokalen Pilot und gelten für reine lokale Entwürfe.

# Vom Pilotwerkzeug zum öffentlichen Produkt

## Der heute nutzbare Ablauf

1. Homepage öffnen, „Meine erste Kampagne“ wählen und das Briefing ausfüllen.
2. A5-Vorder- und Rückseite gestalten oder eigene Dateien hochladen. Alternativ eine vollständig bearbeitbare Vorlage wählen.
3. Empfänger eintragen oder CSV importieren. Pro Kontakt einen bereits vorhandenen Chatbot-/Ziel-Link hinterlegen.
4. Firmenname, Ansprache und QR-Code an die passenden Stellen setzen. Originalansicht und mehrere unterschiedliche Kontakte prüfen.
5. „Alle Empfänger prüfen“ ausführen. Fehler beheben; Hinweise bewusst prüfen.
6. Kampagnenpaket erstellen. Bei mehr als 50 Empfängern Bereiche 1–50, 51–100 usw. exportieren.
7. Mit der Druckerei finale Druckdaten, Beschnitt, Farbprofil, Material und Versand abstimmen. Ein Originalgrößen-Muster prüfen und die QR-Codes auf Papier scannen.

Es wird bei keinem dieser Schritte automatisch ein kostenpflichtiger Auftrag ausgelöst.

## Für die erste chattastic-Kampagne benötigt

- Verbindliche Botschaft und ein bestätigtes Angebot. Die neue Vorlage enthält bewusst keinen erfundenen Preis.
- Die echten Unternehmens- und Ansprechpartnerdaten sowie die Postanschriften.
- Bereits funktionierende, für den jeweiligen Empfänger bestimmte Chatbot-Links.
- Finale Absender-/Kontaktinformationen im Design.
- Eine Druckerei und abgestimmte Druck-/Versandbedingungen.

## Nächste technische Ausbaustufen

**Gemeinsam arbeiten:** Authentifizierung, Arbeitsbereiche, Rollen, serverseitige Kampagnenpersistenz und privater Dateispeicher. Das bestehende v1-Projektformat bildet dafür die Austauschschicht. Änderungen sollten serverseitig validiert, versioniert und mit Konfliktbehandlung gespeichert werden. IndexedDB kann dann als lokaler Zwischenspeicher dienen.

**Druckproduktion:** Druckereispezifikation zuerst festlegen. Danach Beschnittzugabe, CMYK-/ICC-Konvertierung und PDF/X-Preflight in einen serverseitigen Exportjob einbauen. Das derzeitige Raster-PDF ist ein Korrekturabzug. Sein weißer Rand oder eine vergrößerte Seitengröße wären kein Ersatz für echte Beschnittdaten.

**Auftrag und Bezahlung:** Produktvarianten, Papier, Kuvertierung, Menge, Porto, konkrete Preise und Freigabeprozess mit dem Produktionspartner definieren. Erst danach Zahlung und verbindliche Bestellung integrieren. Vorschau und Auftrag müssen getrennte Zustände bleiben.

**Rückkanal:** Chatbots werden aktuell extern bereitgestellt. Falls zentral angelegt werden soll: bestehende chattastic-Schnittstelle, Zugriffsmodell, Ziel-URL-Schema und Fehlerbehandlung abstimmen. Scan-Tracking ist ebenfalls eine eigene, bislang nicht vorhandene Funktion.

**Weitere Formate:** Die Größen sind in `studio/src/core.js` vorbereitet. Neue Formate brauchen passende Vorlagen, 3D-Proportionen, Schrift-/Elementanpassung und Exporttests. Im Pilot ist nur DIN A5 quer aktiviert.

**Öffentlicher Betrieb:** Betreiberangaben, tatsächliche Datenverarbeitungen, Hosting und Bedingungen für die angebotene Leistung vervollständigen. Preview-Schutz erst nach bewusster Freigabe aufheben. Keine Empfängerdaten ins Git-Repository aufnehmen.

## Deployment

Die Änderungen gehören zu `codex/kampagnenstudio`. GitHub/Vercel erzeugt einen separaten geschützten Preview-Build. Kein Merge in den Produktionsbranch und kein `vercel --prod` sind für den Pilot vorgesehen.
