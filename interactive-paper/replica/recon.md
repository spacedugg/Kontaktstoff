# Recon-Karte: Interactive Paper (Web, B2B-Marketing-Produkt)

Scope: VORSCHLAG, noch nicht bestätigt. Siehe "Mögliche Ausschnitte" unten.
Für: eigenes Produkt von spacedugg (Zweck und Zielgruppe noch offen)
Datum: 2026-10-09
Methode: Clean-Room. Nur öffentlich sichtbare Texte und Seitenstruktur, gelesen im menschlichen Tempo.
Es wurden keine JS-Bundles, keine `/api/`-Pfade und keine Login-Bereiche gelesen (robots.txt schließt `/api/` aus).

## Wichtigste Erkenntnis

Interactive Paper ist **keine App**, sondern ein Hardware-plus-Plattform-Produkt:
bedrucktes Papier mit eingebautem NFC-Chip. Wer das Papier mit dem Smartphone antippt,
öffnet ohne App eine digitale Erfahrung (Web-Tools, Video, 3D/Augmented Reality).
Der Anbieter liefert Papier, Design, Web-Tools und eine Auswertung ("Data Report").

Nachbaubar ist daher vor allem die **Software-Seite**:
Marketing-Website, Kampagnen-Erstellungsportal, die Seiten, die nach dem Tippen aufgehen, und das Analytics-Dashboard.
Das physische NFC-Papier ist nicht nachbaubar (siehe "Nicht nachbaubar").

## Quellen

| # | Quelle | URL | Hinweise |
| --- | --- | --- | --- |
| 1 | Startseite | https://interactivepaper.com/ | Produktlinie, Referenzen, Nachhaltigkeit, Analytics-Teaser |
| 2 | Produktseite Tap 2.0 | https://interactivepaper.com/tap | "How it works" in 3 Schritten, Analytics-Mockup, Vergleich alt/neu |
| 3 | Collaboration | https://interactivepaper.com/collaboration | Ablauf in 5 Schritten, Creation Portal, Data Report |
| 4 | Success stories | https://interactivepaper.com/success-stories | 17 Referenzen (Inhalte gehören Dritten) |
| 5 | FAQ | https://interactivepaper.com/faq | 69 Fragen, alle Antworten im Browser aufgeklappt und gelesen (Update 2026-10-09). Quelle für Produkte, Pläne, Content-Typen. |
| 6 | Blog | https://interactivepaper.com/blog | Nur Übersicht gesehen (SEO-Artikel), keine Details nötig |
| 7 | Nicht gelesen | /de, /fr, /imprint, /terms, Fallstudien-Detailseiten | Bei Bedarf nachholen |

Sprachen der Seite: EN, DE, FR.

## Kernschleife

Ein Unternehmen bestellt NFC-Papier, gestaltet Inhalte im Portal, verschickt das Papier an Kunden,
diese tippen es mit dem Handy an und sehen interaktive Inhalte, und das Unternehmen wertet die Nutzung aus.

## Produktlinie (laut Startseite)

Alle drei laufen ohne App im Handy-Browser. Mindestbestellung 500 Stück, Produktion ca. 4 bis 5 Wochen (laut FAQ).

| Produkt | Claim auf der Seite | Funktionsweise laut FAQ |
| --- | --- | --- |
| Touch | "The unbeatable storyteller" | Handy auf das Papier legen, drei gedruckte Tasten: Video, Quiz/Umfrage, Handlungsaufforderung (Termin, Download) |
| Tap | "Record-breaking response" | Handy an die Karte halten, Augmented-Reality-Erlebnis startet (Video auf der Karte, dann 3D-Objekt). Tap Lite: gleiche NFC-Funktion ohne AR, günstiger |
| Scan | "The affordable allrounder" | QR-Code plus AR und Tracking, geringste Antwortquote, günstigste Variante |

Die Plattform heißt laut FAQ "Let's interact" (Marke des Anbieters, nicht übernehmen).
Plan-Stufen: Starter (Kampagnen-Builder, 6 Monate Hosting), Professional (unbegrenztes Hosting, Data Dashboard, Content Creator),
Enterprise (tiefe Analyse, Berater, API), Executive (CRM-Einrichtung, eigener Entwickler und Datenspezialist).
Inhaltstypen: Video, Quiz/Umfrage, Bildergalerie, Produktmenü, Lead-Formular, AR mit 3D-Objekten, Weiterleitung, PDF-Download.
Integrationen laut FAQ: Salesforce, HubSpot, SAP, Veeva, Pipedrive, Zoho. Optional personalisiertes Tracking einzelner Empfänger.

## Screens

Nur Seiten, die öffentlich sichtbar sind. S10 bis S13 sind aus Texten abgeleitet, nicht gesehen.

| ID | Screen | Route / Zugang | Zweck | Wichtige Komponenten | Zustände |
| --- | --- | --- | --- | --- | --- |
| S01 | Startseite | `/` | Produkt erklären, Termin anfragen | Hero, Firmenzähler, Produktkarten (Touch/Tap/Scan) mit "Compare", Referenz-Karussell, Anwendungsfälle, Nachhaltigkeit (93 % weniger Papier), Analytics-Teaser, CTA | Desktop, mobil |
| S02 | Produktseite Tap 2.0 | `/tap` | Neue Produktversion verkaufen | Feature-Kacheln, 3-Schritte-Ablauf, animiertes Analytics-Dashboard-Mockup, Vorher/Nachher-Vergleich, "Get a free sample" | Zählanimationen |
| S03 | Collaboration | `/collaboration` | Zusammenarbeit in 5 Schritten zeigen | Stepper (Ziel, Design, Web-Tools, Auslieferung, Daten), Verweis auf Webtool-Katalog | |
| S04 | Success stories | `/success-stories` | Referenzen sammeln | Kartenraster, Filter nach Branche (Vermutung) | |
| S05 | Success-Story-Detail | Vermutung: `/success-stories/<slug>` | Einzelne Fallstudie | Text, Bild, Video | nicht gesehen |
| S06 | FAQ | `/faq` | Fragen beantworten | Gruppierte Akkordeons (9 Gruppen, ca. 70 Fragen) | auf/zu |
| S07 | Blog | `/blog` | Inhalte | Liste | nicht gelesen |
| S08 | Termin buchen | "Book a meeting" / "Schedule a meeting" | Lead erzeugen | Vermutung: eingebetteter Kalender oder Formular | nicht gesehen |
| S09 | Rechtliches | `/imprint`, `/privacy-policy`, `/terms` | Pflichtseiten | Text | |
| S10 | Webtool-Katalog | "See the Webtool Catalog" | Vorlagen für die Tap-Zielseite | Vermutung: Kartenraster | nicht gesehen |
| S11 | Creation Portal | nach Kampagnen-Abschluss | Web-Tools bauen und Kampagne verwalten | Vermutung: Login, Kampagnenliste, Editor | nicht gesehen, nur Text |
| S12 | Data Report | im Portal | Nutzungsdaten auswerten | Vermutung nach Dashboard-Mockup auf S02 | nicht gesehen, nur Mockup |
| S13 | Tap-Zielseite (Endkunde) | Aufruf per NFC-Tippen | Inhalt zeigen (Video, Formular, Button, AR) | Vermutung: mobile Seite je Kampagne | nicht gesehen |

## Flows

```
F01 Interessent erkundet das Produkt und fragt einen Termin an
    S01 -> S02 oder S04 -> S08
    Klicks auf dem Idealweg: 2 bis 3 (Vermutung)
    edge: mobil, Sprache DE/FR

F02 Unternehmen baut eine Kampagne
    S03 -> S10 -> S11 (Web-Tool wählen, Inhalte füllen, Papier verknüpfen)
    nicht gesehen, nur aus Text abgeleitet

F03 Endkunde tippt das Papier an
    S13 (Video, Formular, Link, Augmented Reality)
    edge: Handy ohne NFC, Inhalt nach Druck geändert (laut Seite möglich)

F04 Unternehmen wertet Kampagne aus
    S11 -> S12 (Interaktionen, Seitenaufrufe, Conversions, Verlauf über 12 Monate)
```

## Komponenten

| Komponente | Varianten | Zustände | Genutzt auf |
| --- | --- | --- | --- |
| Button | primär, sekundär | default, hover, fokus | alle |
| Kopfzeile | Menü mit "Product", "Success stories", "Collaboration", "Q&A", "About us", Sprachwahl, "Get started" | mobil/Desktop | alle |
| Produktkarte | Touch, Tap, Scan | normal, "New"-Badge | S01 |
| Zahlenkacheln mit Zählanimation | 4 Kennzahlen | animiert beim Sichtbarwerden | S02 |
| Liniendiagramm 12 Monate | aktuell/Vorjahr | Tooltip | S02, S12 |
| Trichter-Balken | 3 Stufen | | S02, S12 |
| Referenz-Karte | mit/ohne Video | | S01, S04 |
| Akkordeon | | auf/zu | S06 |
| Vorher/Nachher-Vergleich | 5 Zeilen | | S02 |
| Stepper | 5 Schritte | aktiv/inaktiv | S03 |

## Abgeleitetes Datenmodell (alles Vermutung)

```
Account        id, firma, mitglieder        Evidenz: Creation Portal       Konfidenz: guess
Campaign       id, account_id, ziel, status Evidenz: S03 "Define your goal" Konfidenz: medium
Paper          id, campaign_id, typ (touch|tap|scan), chip_uid  Evidenz: Produktlinie  Konfidenz: guess
WebTool        id, campaign_id, vorlage, inhalt, version  Evidenz: S03 Webtools, FAQ-Frage "Inhalt nach Druck ändern"  Konfidenz: medium
Interaction    id, paper_id, zeit, art (tap|seitenaufruf|conversion)  Evidenz: Dashboard-Mockup S02  Konfidenz: medium
Lead           id, campaign_id, kontaktdaten  Evidenz: FAQ-Frage "Leads erfassen"  Konfidenz: guess
```

Beziehungen: Account 1-n Campaign, Campaign 1-n Paper, Campaign 1-n WebTool, Paper 1-n Interaction.

## Featurematrix

Siehe `features.csv`.

## Nicht nachbaubar oder nicht nachzubauen

- Die physische NFC-Technik, Antenne, Papierproduktion und Logistik.
- Marken, Logos und Texte von Interactive Paper (Name, "Touch/Tap/Scan", Claims wie "Marketing made interactive").
- Kundenlogos, Fallstudien und Videos (Novartis, Samsung, Pfizer usw.): gehören Dritten.
- Zahlen wie "93 % weniger Papier" oder "82 % recycelt": eigene Belege nötig, nicht übernehmen.
- Fotos, Illustrationen, AR-Inhalte, Schriften und Icons der Seite.

## Größe

Screens 13 (davon 6 gesehen), Flows 4, Entitäten 6.
Schwierige Teile: Kampagnen-Editor mit Web-Tool-Vorlagen, Analytics mit echten Ereignissen, Zuordnung Papier zu Kampagne, mehrsprachige Seite.

- Marketing-Seite (S01 bis S09): **S** (ein Wochenende)
- plus Demo-Dashboard und Tap-Zielseite (S02, S12, S13 mit Beispieldaten): **M**
- plus echtes Portal mit Login, Datenbank und Analytics: **L**

## Offen (braucht deine Entscheidung)

1. Ausschnitt: nur Marketing-Seite, oder auch Portal und Analytics?
2. Zweck: Baustein für Kontaktstoff, eigenes Produkt oder Prototyp?
3. Technik: statisch wie Kontaktstoff, oder Web-App mit Backend?
4. Eigener Name und eigene Marke (Interactive Paper darf nicht übernommen werden).
