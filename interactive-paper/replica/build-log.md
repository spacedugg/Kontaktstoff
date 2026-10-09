# Build-Log · Kontaktstoff Impulse V4 · 10.10.2026

Die letzte Nutzerkorrektur ersetzt V3: fotografische Produktinszenierung, weicher eigener Stil, früher sichtbare Zahlen, eindeutige Abfolge, größere Schrift, offene Erklärungen. Alle relevanten Änderungen liegen im isolierten Verzeichnis `interactive-paper/`.

| Seite | Stand | Verhalten |
|---|---|---|
| `/` | implementiert / Browserprüfung offen | Fünf neue Rastermotive; Zahlen → System → Anwendungen; Rechner und Anfrage |
| `/demo/` | implementiert / Browserprüfung offen | Sichtbare Galerie statt WebGL-/Video-Simulation |
| `/beispiel/produkt/` | implementiert / DOM geprüft | Demo-Warenkorb, keine Bestellung |
| `/beispiel/beratung/` | implementiert / DOM geprüft | Drei Beispieltermine; keine Buchung |
| `/beispiel/bundle/` | implementiert / DOM geprüft | Generiertes Motiv, ausdrückliche Demo-Auswahl |
| `/auswertung/` | erhalten / Struktur geprüft | Vorhandene Beispielauswertung; größere Schrift |

Prüfungen: Astro-Build mit sechs Seiten erfolgreich; 21 DOM-/Strukturprüfungen bestanden; alle lokalen Links und Assets, ARIA-Referenzen, eindeutigen IDs sowie genau eine H1 pro Seite geprüft. 16/16 WCAG-AA-Kontrastpaare. Fünf neue Motive visuell geprüft; keine Fremdassets. Der ausgegebene JavaScript-Build enthält keinen WebGLRenderer.

Grenzen: Keine gerenderte Browser-, Mobil-, physische NFC- oder tatsächliche AR-Prüfung. Sites schreibt bei fehlendem `$control-browser` das Überspringen der Browser-QA vor; deshalb kein improvisierter Browser oder eigener Preview-Server. Alle Bilder sind Konzeptvisualisierungen. Statistik und Fallbeispiel sind ausdrücklich illustrativ. Keine echten Transaktionen oder Nachrichtenübermittlung.

Preview wird auf demselben owner-private Site-Projekt aktualisiert. Git-Ziel bleibt `claude/interactive-paper-rebuild-owvx7s`. Keine Änderungen an der Live-Website, ihrem Branch oder Root-Deployment.
