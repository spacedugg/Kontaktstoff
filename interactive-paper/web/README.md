# Kontaktstoff Impulse · NFC Direct Mail

Eigenständiger Astro-Prototyp unter `interactive-paper/`. Aktueller Stand: 10.10.2026, fotografischer Entwurf V4. Die Live-Website und ihre Build-/Deployment-Konfiguration werden nicht geändert.

## Starten

```sh
npm install
npm run dev
npm run build
```

## Aktueller Entwurf

Die Nutzerkorrektur vom 10.10.2026 ist maßgeblich: **Kontaktstoff Impulse** (Plural), modern und weich, Weiß/Graphit/Neongelb, große Texte, generierte Produktbilder und eine klare Seitenfolge. Selbst gebaute Handy-, Papier- und 3D-Simulationen sind aus den veröffentlichten Seiten entfernt. Die alten Quellmodule sind teilweise als ungenutzte Historie vorhanden; sie werden nicht importiert oder ausgeliefert.

Reihenfolge der Startseite:

1. Hero mit neuem Produktmotiv.
2. Frühe Zahlenleiste, klar als illustrative Beispielwerte gekennzeichnet.
3. Drei bebilderte Schritte: Post bekommen, Handy dranhalten, erleben und weitergehen.
4. Produkt, Dienstleistung und Bundle als gleichzeitig sichtbare Bildkarten.
5. Feinstoff und Nahkontakt mit Materialfoto und eigenem Tap-Closeup.
6. Designfreiheit und Vergleich zum klassischen Brief.
7. Veränderbare Beispielrechnung mit offen sichtbarer Einordnung.
8. Ausdrücklich hypothetische Launch-Kampagne und offene Antworten.
9. Kampagnenanfrage als lokaler Entwurf.

## Routen und Verhalten

| Route | Inhalt |
|---|---|
| `/` | Fotografische Landingpage, Rechner und Anfrage |
| `/demo/` | Drei Bildbeispiele mit Links zu Zielseiten |
| `/beispiel/produkt/` | Produktseite mit ausdrücklich simuliertem Warenkorb |
| `/beispiel/beratung/` | Drei erzeugte Beispieltermine und Demo-Bestätigung |
| `/beispiel/bundle/` | Visualisiertes Angebot und Demo-Auswahl |
| `/auswertung/` | Vorhandene Beispielauswertung mit Zeitraumwahl |

Anfragen werden nur im aktuellen Browserfenster vorbereitet und als Textdatei angeboten. Es gibt keine Übermittlung, keine echte Buchung, Bestellung, Zahlung, NFC-Hardware-Anbindung oder AR-Kameraansicht. Der Inhalt der Karte verweist konzeptionell auf ein gemeinsames Erlebnis je Kampagne.

## Bilder und Aussagen

Fünf neue Originalmotive liegen unter `public/images/v4/`. Methode und vollständige Prompts: [asset-prompts-v4.md](../replica/asset-prompts-v4.md). Material, Mailing und Dienstleistungsergebnis nutzen zusätzlich eigene V3-Motive. Es werden keine Bilder oder Texte von Interactive Paper ausgeliefert.

78 / 65 / 24 Prozent sind illustrative Startannahmen nach der Dashboard-Darstellung der Referenz, keine Kontaktstoff-Ergebnisse oder Erfolgsprognose. Die Simulation definiert die Versandmenge ausdrücklich als Nenner. Folgestufen können die vorherige Stufe nicht überschreiten. Keine erfundenen Kundenreferenzen, gemessenen NFC-Reichweiten, Preisvorteile oder Produktionsspezifikationen.

## Prüfung

- Astro-Build: sechs statische Seiten.
- 21 DOM-/Strukturprüfungen: Leserichtung, offene Inhalte, Zielseiten, Rechner, Navigation, Anfrage, Demo-Aktionen, lokale Links/Assets, ARIA-Verweise und Überschriften.
- 16 Kontrastpaare erfüllen WCAG AA.
- Fünf neue Rastermotive visuell geprüft.
- Keine gerenderte Desktop-/Mobil-Browserprüfung. Der Sites-Workflow verlangt bei fehlendem `$control-browser` das Überspringen dieser Prüfung; kein Ersatzbrowser oder eigener Preview-Server wurde gestartet.

## Isolation

GitHub: `spacedugg/Kontaktstoff`, Branch `claude/interactive-paper-rebuild-owvx7s`.

Separate private Vorschau: https://kontaktstoff-nfc-colorway.temoa-3702.chatgpt.site

Die Vorschau verwendet ausschließlich das statische Build-Ergebnis dieses Unterprojekts. Kein Merge in `main` oder den bestehenden Live-Branch.
