# Recon und Neuausrichtung · 10.10.2026

## Auftrag und Quellen

Der Nutzer verlangt eine überzeugende, bildgeführte NFC-Direct-Mail-Produktseite im Kontaktstoff-Colorway. Der bestehende Seitenzweig bleibt isoliert in `interactive-paper/` und im Branch `claude/interactive-paper-rebuild-owvx7s`.

| Quelle | Verwendung |
|---|---|
| https://interactivepaper.com/ | Produkt zuerst zeigen, Anwendungsfälle, Nutzen und digitaler Anschluss |
| https://interactivepaper.com/tap | Visuelle Technologie-Erklärung, Empfängerablauf, Trennung von Erlebnis und Zielaktion |
| Zehn vom Nutzer gelieferte Referenzbilder | Bildsprache: echtes Papier, Hände, Handy, Kuvert, seitliches Dünnheitsmotiv und Annäherung |
| https://nfc-forum.org/learn/nfc-technology/ | Passive NFC-Tags, kurze Funkverbindung |
| https://developer.apple.com/design/human-interface-guidelines/nfc | Gerätevoraussetzungen und NFC-Hinweis auf dem Display |
| https://developer.apple.com/videos/play/tech-talks/702/ | Öffnen eines Weblinks über eine NFC-Benachrichtigung |

Die Referenz inszeniert Technik an konkreten Produktbildern. Der neue Aufbau übernimmt diese Erklärungsmethode, schreibt aber Inhalte und Code neu und verwendet ausschließlich eigene Motive. Kein fremdes Logo, Foto, HTML oder CSS wird ausgeliefert.

Die Zahlen 78 / 65 / 24 Prozent stehen in der Dashboard-Darstellung der TAP-Seite. Die gelesene Seite belegt damit keine allgemeine Erfolgsquote für Kontaktstoff. Sie werden nur als kenntlich gemachte, veränderbare Startannahmen in einer Beispielrechnung verwendet. Ihre Bezugsgröße wird hier explizit als Versandmenge definiert. Keine Aussage zu garantierter Öffnung, Conversion, Reichweite, Papierdicke oder Preisersparnis wird abgeleitet.

## Eigenständiges Namenskonzept

- Kontaktstoff **Impuls**: Arbeitsname für das NFC-Mailing.
- **Feinstoff**: in Papier integrierte Technik und frei gestaltbare Oberfläche.
- **Nahkontakt**: Annähern des Smartphones und Öffnen des NFC-Links.
- **Erlebnisraum**: Produkt, Dienstleistung oder Bundle als digitaler Inhalt.
- **Direktweg**: vom Erlebnis zur gewünschten Shop-, Angebots- oder Terminseite.

Bezeichnungen sind Konzeptvorschläge, keine Aussage zu Markenregistrierung oder final verfügbarer Hardware.

## Seiten und Flows

| ID | Route | Kernfunktion |
|---|---|---|
| S01 | `/` | Bildgeführte Produktstory, vierstufiger Ablauf, drei Anwendungen, Technologie, Vergleich, Rechner, Anfrage |
| S02 | `/demo/?modus=video` | Erhaltene eigenständige Video-/3D-Demo, Video-Vorauswahl per Link |
| S03 | `/beispiel/produkt/` | Produkt-Zielseite und ausdrücklich simulierter Warenkorb |
| S04 | `/beispiel/beratung/` | Dienstleistungs-Zielseite mit auswählbaren Beispielterminen |
| S05 | `/beispiel/bundle/` | Bundle-Zielseite mit simulierter Auswahl |
| S06 | `/auswertung/` | Bestehende Auswertung mit Beispieldaten |

F01: Karte erhalten → Smartphone annähern → NFC-Hinweis öffnen → Produkt erleben → Produktseite → Demo-Warenkorb.

F02: Dienstleistungs-Beispiel wählen → Ergebnis sehen → Terminseite → Beispieltermin auswählen → explizite Demo-Bestätigung.

F03: Bundle wählen → Angebot visualisieren → Angebotsseite → Beispielauswahl.

F04: Versandmenge und Annahmen verändern → konsistente absolute Zahlen. Nachgelagerte Quoten werden auf die vorangehende Stufe begrenzt.

F05: Kampagne planen → Ziel, Menge, Design und Zielseite eintragen → lokalen Entwurf vorbereiten, bearbeiten oder herunterladen. Es wird nichts versendet.

## Rahmen

Ein gemeinsames digitales Erlebnis pro Kampagne, keine Empfängerpersonalisierung. Echte Hardwareproduktion, NFC-Lesemessung, Kamera-AR, Analytics, Bezahlung, Kalenderanbindung und Versand sind nicht implementiert. Die Website erklärt das Konzept; sie stellt keine tatsächlichen Lieferantenleistungen oder Ergebnisse als bereits geprüft dar.
