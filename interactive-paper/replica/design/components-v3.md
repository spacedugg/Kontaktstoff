# Impuls: Komponenten und Zustände

Einheitlicher Rhythmus aus kurzem Abschnittstitel, Produktvisualisierung und knappem Erklärungstext. Weiße Flächen, Graphit, Neongelb; Manrope. Die alte Landingpage wurde ersetzt. Dialoge und eigenständige Demo bleiben als vorhandene Funktionen nutzbar.

- Hero: große Produktfotografie, klarer NFC-Nutzen, zwei Einstiege. Ein H1.
- Journey: vier nummerierte Schaltflächen mit `aria-pressed`, eine gemeinsame animierte Szene, Weiter-Button und pausierbarer Ablauf. Keine ungefragte automatische Wiedergabe. Aktive Nummer zusätzlich dunkel gefüllt. Nicht sichtbares Handy `inert`; verständliche Statusmeldungen.
- 3D: lazy import, Tastaturpfeile, Enter zur Zielseite, Pointer-Klick nur ohne Drag-Bewegung. Fallback auf Produktbild bei Initialisierungsfehler. Rendern nur in sichtbarer Produktstufe; Pause im Hintergrund, Erhalt bei Browser-Rücknavigation.
- Anwendungsauswahl: ein sichtbares Panel, drei echte Buttons; Test-Button synchronisiert die Empfänger-Demo und fokussiert die Erlebnisstufe.
- Technologie: Originalfoto für Material, eigene schematische NFC-Darstellung, Details für Voraussetzungen. Keine ungemessenen Signal-/Reichweitenversprechen.
- Vergleich: semantische Tabelle mit benannten Zeilen/Spalten und eigener horizontaler Scrollregion auf schmalen Displays.
- Rechner: deutliches Label „Beispielrechnung“, Annahmen über native Range-Inputs, Versandmenge über Select, live aktualisierte Outputs. Nullwerte und monoton fallende Quoten bleiben gültig.
- Zielseiten: illustrative Inhalte, klar markierte simulierte Aktionen; Terminauswahl hat Start-, Auswahl- und Bestätigungszustand.
- Anfrage: natives Dialogelement, Pflichtfeldvalidierung, optionales URL-Feld, keine Datenübermittlung; Textentwurf lässt sich korrigieren.
- FAQ: native Details-/Summary-Elemente mit sichtbarem Fokus.

Responsive Regeln decken 320, 540, 800 und 1050 Pixel ab. Layout wurde nicht in einem gerenderten Browser verifiziert. Reduzierte Bewegung deaktiviert CSS-Animationen und weiches Scrollen. Getestete Farbpaare stehen in `contrast.md`.
