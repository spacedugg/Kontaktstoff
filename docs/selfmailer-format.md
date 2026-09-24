# DIN-lang-Selfmailer (vierseitig)

Format-ID `selfmailer-dl-4`. Grundlage ist die vom Nutzer bereitgestellte
`DIN-Lang-4-Seiter-Selfmailer.indd` / `.eps` und das dazugehörige
[MAILINGSTORE-Datenblatt](https://mailingstore.de/wp-content/uploads/2021/02/Selfmailer_Datenblatt_DIN_lang_4_Seiter-1.pdf).
Die EPS enthält Postzonen, kein übernehmbares Werbedesign.

- Geschlossen: 210 × 99 mm; offen: 210 × 198 mm.
- Rundum 3 mm Beschnitt → Datenformat 216 × 204 mm.
- Zwei Druckseiten mit je zwei Flächen. Horizontaler Falz bei y = 99 mm.
- `front` = Außenseite: Postanschrift oben, Titel unten.
- `back` = Innenseite: persönliche Nachricht oben, Angebot / QR unten.
- Außen rechts: Frankierung x136/y0/74×40; Anschrift x130/y40/80×44;
  Codierzone x60/y84/150×15 (alle Maße in mm ab links oben).

Editorhilfen markieren Falz und Postzonen und werden nicht exportiert.
Die Anschrift ist ein bearbeitbares Datenfeld. Frankier- und Codierzone bleiben
leer; es wird kein freigegebener Frankiervermerk vorgetäuscht.
Der Kampagnencheck blockiert Elemente in den reservierten Bereichen.

`toSelfmailer()` erzeugt eine unabhängige Projektkopie, übernimmt Empfänger,
Produktbildvarianten und QR-Ziele. Die vorhandenen Kundenkonzepte erhalten neue,
native Layouts. Unbekannte Gestaltung wird ohne Beschnitt eingepasst und muss
nach dem Formatwechsel geprüft werden. Die ursprüngliche Datei bleibt im
Backend erhalten; eine bestehende Freigabe wird nicht übertragen.

2D und Freigabe zeigen vollständige Druckseiten. Die interaktive 3D-Vorschau verbindet zwei beidseitig bedruckte Papierhälften
an der horizontalen Falzkante. Öffnungsregler, freies Drehen, Touch-Zoom und
eine pausierbare 12-Sekunden-Schleife veranschaulichen den Aufbau. Die Ansicht
ist eine geometrische Veranschaulichung; Druck-/Falzfreigabe erfolgt weiterhin
mit der Druckerei.

## Vorlagen, eigene Dateien und Druck-PDF

`/assets/print/kontaktstoff-din-lang-vorlagen.zip` enthält die unveränderten
Originaldateien INDD/EPS, das Original-Datenblatt, eine zweiseitige Maß-PDF,
zwei bearbeitbare SVG-Flächen und eine Anleitung. Hilfslinien vor Produktion
entfernen. Die EPS ist eine Postzonen-Zeichnung, kein maßhaltiger Druckbogen.
Download im Studio am Upload und im Backend unter „Formate & Druckvorlagen“.

PDF-Uploads unterscheiden 210 × 198 mm und 216 × 204 mm anhand der physischen
Seitengröße. Vorhandener Beschnitt wird im Editor abgeschnitten angezeigt,
im Druck-PDF erhalten. Wenn die CropBox nur das Endformat zeigt, wird die
216 × 204 mm große MediaBox verwendet. Bild-Uploads fragen ausdrücklich nach
Endformat oder Beschnitt. Andere Seitenverhältnisse werden zurückgewiesen.
`background.bleed` wird validiert und in Projekt/Backend gespeichert.

„Vorschau als PDF“ und das bisherige Kampagnenpaket bleiben RGB ohne Beschnitt.
„Druck-PDF · CMYK & Beschnitt“ exportiert 1–10 Empfänger, jeweils außen/innen,
216 × 204 mm MediaBox/BleedBox und 210 × 198 mm TrimBox mit 3 mm Versatz.
Die Seiten werden mit 300 dpi gerastert. LittleCMS konvertiert sRGB in das vom
Nutzer gewählte CMYK-Ausgabeprofil, das als ICCBased-Farbraum und OutputIntent
eingebettet ist. Der Export ist **kein zertifiziertes PDF/X**. ICC-Dateien werden
nur lokal für diesen Export verwendet, nicht hochgeladen oder gespeichert.
Es wird bewusst kein fremdes Druckprofil weiterverteilt oder ein bestimmtes
Papier/Druckverfahren vorausgesetzt. Testprofil: PSO Coated v3 von ECI,
nur lokal geladen und zulässigerweise in die Test-PDF eingebettet.

Bei Motiven ohne eigenen Beschnitt werden die äußersten Pixel nach außen
fortgesetzt; die Gestaltung wird nicht auf das Datenformat gestreckt. Der Dialog
zeigt Schnittkante und Seiten, benennt diese Randfortsetzung und weist auf
Quellbilder unter 300 dpi hin. Druckauflösung erhöht keine Quellbildqualität.
PDF-Uploads werden ebenfalls gerastert; vektorbasierte Original-Druckdaten bei
Bedarf direkt in der Grafiksoftware fertigstellen. Druckprofil, Randfortsetzung,
Papier, Verschluss, Falzorientierung und Postzonen vor Produktion mit der
Druckerei prüfen. Die Designfreigabe ist kein Druck- oder Versandauftrag.

Validierung: Node-Tests für Maße, ICC-Struktur, CropBox und Projekt-Beschnitt.
Browser-Test: `PRINT_TEST_PROFILE=/pfad/druckerei.icc node tests/print-browser.mjs`
(gegen lokalen Testserver auf 4183; TEST_ORIGIN überschreibbar).
Geprüft wurden CMYK-Kanäle, ICC-Identität, PDF-Boxen und 300-dpi-Bildgröße,
Poppler-Rendering beider Seiten, lesbarer QR-Code und mobile Dialogbedienung.

## Freigabe und BewertungsPush

Gespeicherte Designs zeigen im Vorschau-Header „Freigabe & Feedback“.
Die Freigabe zeigt sofort den aufklappbaren Selfmailer. Ein kurzer Klick auf
Titel, Anschrift oder eine Innenfläche öffnet den Kommentar-Dialog; Ziehen
und Zwei-Finger-Zoom dienen der Navigation. Markierungen werden perspektivisch
auf die Papierfläche zurückgerechnet und in den bestehenden Außen-/Innenbogen-
Koordinaten gespeichert. Dadurch bleiben frühere Kommentare kompatibel.
Nach dem Speichern bleibt die aktuelle Falt- und Drehposition erhalten.
Neue Designstände werden ausdrücklich bereitgestellt, behalten den Kundenlink
und benötigen eine neue Freigabe. Alte Kommentare und Bestätigungen bleiben erhalten.

BewertungsPush hat ein eigenes DIN-lang-Layout mit Stern-Motiven auf Titel und
Innenseite. Zahlen, Sternefüllung, Name, Ansprache und QR-Ziel bleiben native,
personalisierbare Felder. Die Sternwerte sind als Beispiele gekennzeichnet.
`styleBewertungspushSelfmailer` ist eine explizite Überarbeitung; gespeicherte
Designs werden beim Öffnen nicht automatisch ersetzt.

## Qualität der Kundenfreigabe

Die Freigabe zeigt dauerhaft beide Druckseiten unterhalb der Falzansicht.
Markierungen in 3D und in den flachen Ansichten nutzen dieselben relativen
Seitenkoordinaten. Beide Detailseiten haben einen unabhängigen Zoom bis 300 %.
Die Ausgangsbilder werden mit mindestens 12 Pixeln/mm erzeugt; bei größerer
Darstellung werden Texte/Felder für Bildschirmdichte und Zoom neu gerendert
(bis 24 Pixel/mm für Detailseiten, begrenzt für den Browser-Speicher).
Bildvorlagen gewinnen dadurch keine zusätzlichen Quelldetails.

Die sichtbaren Flächen sind PNG-Bildelemente statt transformierter Canvas-
Oberflächen, damit die Browser-Bildglättung auch stark verkleinerte Schrift
sauberer wiedergibt. Die Titelansicht nutzt den verfügbaren Platz und startet
frontal. Aufklappen passt die Größe an die beiden sichtbaren Flächen an.
Der PDF-Download bleibt der unveränderte, versionierte 300-dpi-Ansichtsexport.
