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

Die PDF-Exporte bleiben ausdrücklich RGB-Ansichten im offenen Endformat ohne
Beschnitt. Für die Druckproduktion sind CMYK/PDF-X, echter Motivbeschnitt,
Papier, Verschluss, Falzorientierung, Adressierung und Frankiervermerk mit der
Druckerei abzustimmen. Die Dateivorlage fordert 300 dpi. Eine Designfreigabe
ist keine Druck- oder Versandbeauftragung.
