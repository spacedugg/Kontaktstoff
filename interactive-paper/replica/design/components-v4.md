# Komponenten · Impulse V4

- **Kopfzeile:** Kontaktstoff-Logo und Impulse-Familienname, drei Inhaltsanker, Anfragebutton. Unter 950 px Menü mit `aria-expanded`, Esc und Schließen nach Auswahl.
- **Hero:** geteiltes ruhiges Layout ab 950 px, darunter gestapelt. Große Überschrift, kurze Erklärung, zwei Aktionen, eigenes Rastermotiv. Keine Bewegung, keine simulierte Hardware.
- **Zahlenleiste:** statische 78 / 65 / 24, Kennzeichnung vor den Zahlen, Einordnung unmittelbar darunter. Kein Zähler und keine behaupteten eigenen Resultate.
- **Fotostrecke:** drei echte Listeneinträge mit jeweils Bild, Schrittzahl, Überschrift und Erklärung. Immer vollständig sichtbar.
- **Anwendungen:** drei Bildkarten, keine Tabs. Desktop drei Spalten; Tablet Bild/Text nebeneinander; Mobil gestapelt. Jeder Link führt zur passenden Beispiel-Zielseite.
- **Technologie:** zwei Fotokarten plus offen sichtbare Kurz-Erklärungen. Tap-Closeup zeigt zunächst den Link-Hinweis, nicht schon das AR-Ergebnis.
- **Vergleich:** klassische Post und Impulse als zwei ruhige Flächen. Keine unbelegten Preis-/Performance-Zahlen.
- **Rechner:** Menge, drei native Slider, berechnete Outputs, monotone Stufen, Nullzustand. `aria-valuetext` und `aria-live`. Quelle und Einordnung offen statt Akkordeon.
- **Kampagnenidee:** Foto und dreistufiger Anwendungsablauf. Ausdrücklich keine Kundenreferenz.
- **Fragen:** vier offene Antwortblöcke, keine `details` auf der Landingpage.
- **Anfrage:** natives Dialogelement, Pflichtfelder, Entwurf bearbeiten/herunterladen, kein Versand. Formulare in der lesbaren V4-Schriftgröße.
- **Zielseiten:** eigene Produktbilder, nativer Button, Statusmeldung. Terminauswahl als Simulation mit drei folgenden Werktagen.

Typografie: Landingpage-Fließtext mindestens 17 px, überwiegend 18–20 px; Hinweise und Bedienelemente mindestens 16 px. Manrope selbst gehostet. Runder Abstandsrhythmus mit 24/32 px Flächenradien und Pillenbuttons. Sichtbare Fokusumrandung, keine Autoplay-Animationen.

CSS-Breakpoints: 1100, 950, 650 und 360 px. Layouts für schmale Viewports im Code berücksichtigt; keine gerenderte 320/390/1440-Prüfung verfügbar. Kontrastbericht separat mit 16/16 rechnerischen AA-Paaren.
