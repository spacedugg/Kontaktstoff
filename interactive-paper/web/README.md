# Kontaktstoff · NFC Direct Mail – Prototyp

Der eigenständige Astro-Prototyp befindet sich vollständig in `interactive-paper/web/`.
Der vorhandene Kontaktstoff-Auftritt und seine Deployment-Konfiguration werden nicht verändert.
Branch: `claude/interactive-paper-rebuild-owvx7s`. Kein Merge in den Live-Branch.

## Gestaltungsrichtung

Signal + Electric, im Kontaktstoff-Colorway: Weiß, Graphit `#1A1C22`, Neongelb `#E2FF54`.
Selbst gehostete Manrope-Schrift und vorhandenes Kontaktstoff-Logo. Der endgültige eigene Produktname bleibt offen.
Große Typografie über einer eigenständigen Produktvisualisierung; eine helle Bühne statt eines dunklen Tech-Auftritts.

## Lokal starten

Node.js 22 oder neuer:

```bash
cd interactive-paper/web
npm ci
npm run dev
```

Die lokale URL zeigt Astro im Terminal an. `npm run build` erstellt die statische Seite in `dist/`.
`npm run preview` zeigt den fertigen Build lokal an.

## Enthaltene Seiten

- `/`: Angebotsseite mit Produktmotiv, Demo, Ablauf, Inhaltsformaten und FAQ.
- `/demo/`: Eigenständige Empfänger-Demo. Antippen wird per Button simuliert. 3D-Modell drehen (Ziehen, Pfeiltasten, Ansichtstasten), Video ansehen und drei nächste Schritte ausprobieren.
- `/auswertung/`: Beispieldaten mit Zeitraumwahl; Diagrammwerte, Summen und Prozentsätze hängen zusammen.

Das Anfrageformular bereitet einen lokalen Textentwurf vor, der heruntergeladen werden kann. Es versendet keine Daten.
Alle Kauf-, Leistungs- und Terminansichten sind Beispiele. Keine echten Bestellungen, Buchungen oder Verfügbarkeiten.

## Produktbilder und Video

Eigene generierte Produktmotive in `public/images/`, ein daraus gestalteter achtsekündiger stummer Beispielclip in `public/media/`.
Prompts und Herkunft: `../replica/asset-prompts.md`. Keine Inhalte oder Assets der Referenzwebsite werden verwendet.
Das 3D-Beispiel ist ein selbst gebautes Modell, kein digitaler Zwilling eines realen Produkts.

## Bewusste Grenzen

Keine echte NFC-Erfassung, Kamera- oder Karten-Erkennung, kein AR-Tracking, Login, CRM, Tracking oder Backend.
Bei fehlendem WebGL wird das eigene Produktbild gezeigt; Video und nächste Schritte bleiben zugänglich.
Three.js wird erst beim Start des 3D-Erlebnisses nachgeladen. Der Build meldet deshalb einen großen separaten 3D-Chunk, nicht einen großen Initial-Download.

## Prüfung

Der Astro-Build und die Prüfung lokaler Asset-URLs und Links wurden erfolgreich ausgeführt.
Der Video-Clip ist H.264, 1280 × 720, acht Sekunden, circa 439 KB.
Die interne Browser-Vorschau war in dieser Sitzung wegen fehlender Infrastruktur nicht verfügbar; Desktop-/Mobil-Browser-QA und echte Geräte sind noch nicht geprüft.

Die [private separate Vorschau](https://kontaktstoff-nfc-colorway.temoa-3702.chatgpt.site) enthält den statischen Build dieses Unterprojekts. Sie ist unabhängig von der Live-Domain.
