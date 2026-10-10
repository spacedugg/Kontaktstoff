# Übergabedokument: Website für Direct Mail mit NFC-Karte

Stand: 10.10.2026. Aktuell maßgeblich ist **Abschnitt 13: Impulse V4**. Die älteren Abschnitte dokumentieren die Entwicklung; abweichende V3-Entscheidungen sind durch die letzte Nutzerkorrektur ersetzt.

---

## 1. Der Auftrag in drei Sätzen

Es soll eine **moderne, schöne, interaktive, hochwertige, cleane Website** entstehen, die ein einziges Produkt verkauft: **Direct Mail (B2B oder B2C) mit NFC-Karte**. Der Empfänger hält das Handy an die Karte und bekommt ein immersives Erlebnis. Die Seite darf **nicht nach "AI-Slop" aussehen**.

Es ist ein **eigener Prototyp**, unabhängig vom bestehenden Kontaktstoff-Projekt, zunächst im Unterordner `interactive-paper/`. Später kann daraus ein eigenes Repository werden.

Das Vorbild für das Produkt ist **"Tap 2.0" von interactivepaper.com**. V4 orientiert sich eng an der Produkt- und Bildführung der Referenz. Texte, Fotos, Code und Markengestaltung werden eigenständig umgesetzt.

---

## 2. Das Produkt in den Worten des Auftraggebers

> "Das Einzige, was ich anbieten möchte, heißt eigentlich Briefpost, also Direct Mail to B2B oder B2C mit NFC drin, sodass ich dann über das Handy quasi die Karte scanne und dann ein immersives Erlebnis habe: entweder ein Video, das mir dann auf der Karte angezeigt wird, oder auf der Karte steht dann ein 3D-Produkt, das man natürlich vorher vorbereitet haben muss."
>
> "Dementsprechend kann man direkt entweder das Produkt kaufen oder sieht die Dienstleistung, kann sich zur Dienstleistung vorklicken und einen Termin buchen oder irgendwie sowas."

Wichtig: Das Produkt ist **kein einfaches Papier**, sondern ein **hochwertig bedruckter Flyer oder eine kleine Karte** mit eingebautem NFC-Chip.

### Zwei Oberflächen

1. **Angebots-Website** für die, die Mailings bestellen (Unternehmen, Agenturen). Sie erklärt und zeigt das Angebot, bietet eine Demo zum Ausprobieren, den Ablauf, Formate und eine Anfrage oder Terminbuchung.
2. **Empfänger-Erlebnis**: die mobile Seite, die nach dem Antippen aufgeht. Sie zeigt ein Video auf der Karte oder ein 3D-Produkt auf der Karte. Danach drei Wege: **Produkt kaufen**, **Dienstleistung ansehen**, **Termin buchen**.

Ein Demo-Dashboard (Auswertung der Antippungen) ist nachrangig und nur mit klar gekennzeichneten Beispieldaten gedacht.

### Umfang laut Absprache

"Stufe 1 und 2": Website plus Demo-Dashboard und Empfänger-Seite mit Beispieldaten. **Kein** echtes Portal mit Login, Datenbank und Analytics (das wäre Stufe 3).

---

## 3. Was bei der Referenz bekannt ist (interactivepaper.com)

Das ist die Referenz, **nicht** die Vorlage zum Kopieren. Alle Zahlen und Aussagen sind **Behauptungen des Anbieters**, nicht unsere.

**Anbieter:** Interactive Paper GmbH, Wien. Seite in EN, DE, FR.

**Produktlinie**
- **Touch:** Handy auf das Papier legen, drei gedruckte Tasten (Video, Quiz/Umfrage, Handlungsaufforderung).
- **Tap (2.0 neu):** Handy an die Karte halten, Augmented-Reality-Erlebnis startet sofort: ein Video läuft direkt auf der Karte, danach ein 3D-Objekt, das in die Umgebung gestellt werden kann. Laut Anbieter dauert es etwa 3,2 Sekunden vom Öffnen bis zur Interaktion, halb so lang wie ein QR-Code. "Tap Lite" ist die günstigere Variante ohne AR.
- **Scan:** QR-Code plus AR und Tracking, günstigste Variante, niedrigere Antwortquote.
- Alles läuft im Browser, keine App nötig.

**Tap 2.0 laut Anbieter:** doppelte NFC-Leistung, fast unsichtbare Technik (keine Wölbung durch den Chip), edleres Papier, haptisches Feedback, dünnerer Aufbau, bis zu 50 % günstiger bei großer Menge.

**Konditionen laut FAQ:** Mindestbestellung 500 Stück, Produktion etwa 4 bis 5 Wochen. Plattform-Pläne: Starter, Professional, Enterprise, Executive (vom Kampagnen-Builder bis zu eigenem Entwickler und Datenspezialist). Inhaltstypen: Video, Quiz/Umfrage, Bildergalerie, Produktmenü, Lead-Formular, AR mit 3D-Objekten, Weiterleitung, PDF. CRM-Anbindungen (Salesforce, HubSpot, SAP, Veeva, Pipedrive, Zoho). Optional personalisiertes Tracking einzelner Empfänger.

**Ablauf der Zusammenarbeit (5 Schritte):** Ziel definieren, Papier gestalten, Web-Tools erstellen, an Kunden bringen, Nutzungsdaten auswerten.

**Aufbau der Referenzseite:** Navigation (Product, New, Success stories, Collaboration, Q&A, About us, Sprache, "Get started"). Startseite: großer Hero mit Video-Hintergrund ("Marketing made interactive", Button "Book a meeting"), Teaser zu Tap 2.0, Produkt-Trio Touch/Tap/Scan mit Vergleich, Referenzen, Anwendungsfälle, Nachhaltigkeit, Datenauswertung, Kontakt. Unterseiten `/tap`, `/collaboration`, `/success-stories` (17 Fallstudien), `/faq` (69 Fragen), `/blog`.

**Optik der Referenz (zur Abgrenzung, nicht zum Kopieren):** dunkles Hero-Video, geometrische Grotesk, Schwarz mit Korall-Rosa-Verlauf auf den Buttons, eine grüne Tap-Karte, große helle "Tap 2.0"-Schrift mit Händen und Handys.

**Lücken der Recherche (ehrlich):**
- **Produktfotos und Bilder wurden nie gesehen.** Der Bild-Server der Seite war in der Arbeitsumgebung gesperrt. Bekannt sind nur Texte und Layout.
- Das Kundenportal ("Creation Portal") und der "Data Report" sind nur aus Texten und einem Mockup bekannt.
- Fallstudien-Detailseiten, `/de`, `/fr`, `/blog`-Artikel wurden nicht gelesen.

---

## 4. Namensfindung

**Anforderung:** Eigenname, auf Englisch, soll andeuten, worum es geht (Post, die lebendig wird). Er soll auch dann noch passen, wenn sich das Produkt später verändert. Nicht verwechselbar mit "Interactive Paper", "Touch/Tap/Scan" oder "Let's interact".

**Verworfen**
- *Faser, Hapt, Ply, Greifbar, Tangent:* zu schwach, nicht aus dem Produkt gedacht.
- *Popcard:* gefällt dem Auftraggeber, ist aber **im selben Feld belegt**. Popcards LLC betreibt AR-Grußkarten per App und hält ein US-Patent darauf (US 9171404). Spire verkauft unter "POPcard" Kunststoff-Postkarten für Direct Mail seit 2005.

**Aktuelle Kandidaten (alle ungeprüft)**
- **Mailstage** (Arbeitstitel im Prototyp): die Karte ist die Bühne. Web-Suche ohne Treffer.
- **Hovermail:** das 3D-Produkt schwebt über der Karte. Risiko: "Hover" ist ein Domain-Anbieter mit E-Mail-Produkt und eingetragener Marke.
- **Wakecard:** der NFC-Chip weckt die Karte. Web-Suche ohne Treffer.
- **Overprint, Layermail, Inkcast, Mailglow:** produktunabhängig. Die Suche war zu breit, um aussagekräftig zu sein. "Overprint" ist ein echter Druckbegriff (digitale Ebene über dem Druck), aber als Wort schwer zu schützen.
- *Livepost, Cardcast:* noch nicht geprüft.

**Noch zu tun:** Marken-Check (DE/EU/US/WIPO), .com-Domain, Social-Handles, App-Stores. Das war in der Arbeitsumgebung nicht möglich (Domain-Abfragedienste gesperrt). Ein Markenanwalt sollte vor einem echten Start prüfen.

---

## 5. Design: Anforderungen und bisheriger Stand

### Was der Auftraggeber will
Modern, schön, interaktiv, hochwertig, clean, **ohne AI-Slop-Look**.

### Was als AI-Slop gilt (soll vermieden werden)
Lila-blaue Verläufe und Leuchtflecken, Glas-Karten in Dreierreihen mit Icon im Kreis, Inter-Schrift überall, zentrierter Hero mit Verlaufs-Überschrift, überall dasselbe Einblenden, Stock-Bilder, erfundene Zahlen, Logos und Kundenstimmen. Der Auftraggeber nennt außerdem ausdrücklich **Papier, Creme und Serifen** als Slop (so wurde ein erster Vorschlag "Atelier" verworfen).

### Bisheriger Versuch (vom Auftraggeber als "visuell völlig fail" bewertet)
Ein Hero mit Karte und Handy, gebaut in Astro mit CSS. Screenshots liegen in `uebergabe/`:
- `hero-entwurf-desktop-video.png`
- `hero-entwurf-desktop-3d.png`
- `hero-entwurf-mobil.png`

Beschreibung: hellgraue Fläche, links Überschrift "Direct Mail, die auf dem Handy weiterspielt." mit Text und zwei Buttons, rechts eine schwarze Karte neben einem Handy. Nach einem automatischen "Tippen" zeigt das Handy eine Kamera-Ansicht mit Video oder 3D-Würfel auf der Karte, dann drei Buttons (Kaufen, Leistung, Termin). Druckermarken (Schnittmarken, Passerkreuze, Farbkeil) als Zierde, ein Kobaltblau als einzige Signalfarbe, Bricolage Grotesque und IBM Plex Mono als Schriften.

### Warum es vermutlich scheiterte (Annahmen, vom Auftraggeber nicht bestätigt)
1. **Alles ist mit CSS gezeichnet.** Karte, Handy, "Video" und 3D-Box sind Illustrationen aus Rechtecken. Das reicht nie an hochwertige Produktbilder oder echte 3D-Renderings heran. Premium wirkt durch **Materialität und Licht**, nicht durch Flächen mit Schatten.
2. **Standard-Aufbau:** Text links, Geräte-Mockup rechts, graue Fläche. Das ist die häufigste Schablone überhaupt.
3. **Kein Bezug zu echten Referenzen.** Es gab keine Vorbilder, die der Auftraggeber schön findet. Entscheidungen beruhten auf Adjektiven, nicht auf Beispielen.
4. **Die Produktbilder des Originals wurden nie gesehen.** Es gab keine Vorstellung davon, wie Karte, Handy und AR in der Realität aussehen.
5. **Zu kleine Details, zu wenig Mut:** nichts am Entwurf ist wirklich überraschend oder wiedererkennbar.

### Empfehlung für das weitere Vorgehen
- **Zuerst Referenzen sammeln, dann gestalten:** 5 bis 8 Websites, die der Auftraggeber wirklich schön findet (Produkt-Landingpages mit starker 3D- oder Bildsprache, Award-Seiten). Dazu 3 Beispiele, die er **hasst**. Erst daraus Designrichtungen ableiten.
- **Statische Entwürfe vor Code:** 2 bis 3 deutlich verschiedene Richtungen als Bild (Figma, Bildgenerator oder Skizze), der Auftraggeber wählt. Erst dann bauen.
- **Echte Produktdarstellung:** fotorealistische Renderings oder ein 3D-Modell von Karte und Handy (z. B. Three.js mit GLB-Modellen, Blender-Renderings oder generierte Produktbilder), statt CSS-Illustrationen.
- **Interaktion, die das Produkt erklärt:** Antippen, Video auf der Karte, 3D-Produkt, danach Kaufen/Leistung/Termin. Das war die richtige Grundidee. Die Umsetzung braucht höhere Qualität.

---

## 6. Rechtliche Leitplanken (Clean-Room)

- Nachgebaut werden nur **Funktionen und Abläufe**, nicht Code, Texte, Bilder, Logos, Schriften, Videos, Fallstudien, Kundennamen oder Markennamen von Interactive Paper.
- Nicht übernehmen: Produktnamen "Touch/Tap/Scan", die Plattform "Let's interact", Claims wie "Marketing made interactive", Zahlen wie "93 % weniger Papier".
- Alle Demo-Inhalte klar als **Beispiel** kennzeichnen. Keine erfundenen Kunden, Logos, Bewertungen oder Statistiken.
- Das physische NFC-Papier, die Produktion und die Logistik gehören nicht zum Nachbau (Lieferanten oder Partner nötig).
- Die Referenzseite verbietet in `robots.txt` den Zugriff auf `/api/`. Daran wurde sich gehalten.

---

## 7. Technischer Stand im Repository

- **Repository:** `spacedugg/Kontaktstoff`, Branch `claude/interactive-paper-rebuild-owvx7s`, Draft-Pull-Request Nr. 23.
- **Der bestehende Teil des Repos** (Kontaktstoff-Website, statisch, Weiß/Graphit/Neongelb) ist **nicht** Teil dieses Projekts und bleibt unberührt.
- **Neue Dateien**
  - `.claude/skills/replica-*`: elf Claude-Skills (Replica-Paket, MIT), nur für Claude Code relevant.
  - `interactive-paper/replica/recon.md`, `features.csv`, `brief.md`: Recherche, Feature-Liste, Auftragsbeschreibung.
  - `interactive-paper/web/`: Astro-Prototyp (siehe unten).
  - `interactive-paper/uebergabe/`: Screenshots des bisherigen Entwurfs.
  - `interactive-paper/UEBERGABE.md`: dieses Dokument.
- **Astro-Prototyp:** Astro mit eigenem CSS und wenig TypeScript. Der Name steht nur in `web/src/brand.ts`. Video und 3D-Produkt sind Platzhalter, keine echte AR. Echte Karten-Erkennung im Browser wäre später z. B. mit MindAR oder Zappar möglich (auf dem iPhone-Browser gibt es kein eingebautes Bild-Tracking).

### Starten (für Einsteiger)
```bash
cd interactive-paper/web
npm install
npm run dev        # öffnet http://localhost:4321
```
Voraussetzung: Node.js ab Version 20.

### Bekannte Einschränkungen der Arbeitsumgebung
Ein Teil der Recherche war gesperrt (Bild-Server der Referenz, Domain-Abfragen, Firecrawl). Wer außerhalb dieser Umgebung arbeitet, kann das nachholen.

---

## 8. Offene Entscheidungen

1. Designrichtung (neu, auf Basis von Referenzen).
2. Name (Marken- und Domain-Prüfung steht aus).
3. Wie die Produktdarstellung entsteht: 3D im Browser, Renderings, oder generierte Bilder.
4. Wie der echte Karten-Scan später technisch gelöst wird.
5. Sprache: Deutsch zuerst, Englisch später (so vereinbart).
6. Ob später ein eigenes Repository und ein eigenes Vercel-Projekt angelegt werden.

---

## 9. Zusammenarbeit mit dem Auftraggeber

- Spricht Deutsch, ist **Programmieranfänger**. Er möchte **Erklärungen** und **aktive Vorschläge**, kein bloßes Nachfragen.
- Direkt und kritisch. Er wertet generische Ergebnisse sofort ab. Deshalb früh **konkrete visuelle Entwürfe** zeigen, nicht nur beschreiben.
- Er mag Namen, die kurz, englisch und aussagekräftig sind.
- Ehrlich berichten, was nicht geprüft ist (Marke, Domain, echte Geräte).

---

## 10. Fertiger Prompt für ChatGPT (zum Einfügen)

Dokument und die drei Screenshots aus `uebergabe/` anhängen, dann diesen Text senden:

```
Du bist Senior-Webdesigner und Creative Developer. Ich gebe dir ein Übergabedokument und drei Screenshots eines gescheiterten Entwurfs. Lies alles genau.

Ziel: Eine hochwertige, interaktive, cleane Website für ein einziges Produkt: Direct Mail mit NFC-Karte, die beim Antippen ein immersives Erlebnis auf dem Handy startet (Video auf der Karte oder 3D-Produkt auf der Karte, danach Kaufen / Leistung ansehen / Termin buchen). Sie darf nicht nach AI-Slop aussehen.

Gehe so vor:
1. Stelle mir höchstens fünf kurze Fragen, vor allem nach Referenz-Websites, die ich schön finde, und solchen, die ich hasse.
2. Erkläre in wenigen Sätzen, warum der Entwurf in den Screenshots nicht überzeugt, und was du anders machen würdest.
3. Schlage mir drei deutlich verschiedene Designrichtungen vor. Je Richtung: Grundidee, Farben (mit Hex-Werten), Schriften (frei lizenziert), Layout des Hero, ein besonderes interaktives Element und eine Beschreibung, wie die Karte und das Handy dargestellt werden (Renderings, 3D im Browser oder Fotos, keine reinen CSS-Zeichnungen).
4. Empfiehl eine Richtung und begründe sie.
5. Erst nach meiner Wahl: liefere den Code (Astro, eigenes CSS, kein Framework-Overkill) in kleinen, lauffähigen Schritten und erkläre jeden Schritt für einen Programmieranfänger.

Regeln: Kein Kopieren von Texten, Bildern, Logos oder Namen der Referenzseite interactivepaper.com. Keine erfundenen Kunden, Zahlen oder Bewertungen. Alle Demo-Inhalte als Beispiel kennzeichnen. Schreibe auf Deutsch.
```


## 11. Fortsetzung im neuen Chat · 2026-10-09

Der Auftraggeber bevorzugt die Richtungen Signal und Electric und verlangt zunächst den Kontaktstoff-Colorway.
Ein schwarzer Tech-/Banking-Auftritt wurde ausdrücklich verworfen: Die Karten sollen auffallen und Freude/Farbe vermitteln.

Die erste neue Umsetzung bleibt vollständig in `web/`: Weiß, Graphit und Neongelb; Kontaktstoff-Logo und Manrope; große Typografie über eigenem Produktmotiv; Angebotsseite, mobile Empfänger-Demo und Beispiel-Auswertung.
Header verwendet vorerst Kontaktstoff. Der eigene Produktname ist weiterhin offen.

Neue Details und ehrliche Prüfgrenzen stehen in `web/README.md` und `replica/build-log.md`.
NFC und AR/Kamera-Tracking sind weiterhin nicht implementiert. Es erfolgen keine echten Buchungen, Käufe, Datenübermittlungen oder Analysen.
Die vorhandene Live-Seite, ihr Root-Build und `vercel.json` werden nicht geändert. Kein Merge in PR #23.


## 12. Grundlegende Überarbeitung nach Nutzerfeedback · 10.10.2026

Dieser Abschnitt beschreibt den aktuellen Stand und ergänzt die früheren Entwürfe. Der Nutzer hat den ersten hellen Entwurf als visuell und inhaltlich nicht überzeugend bewertet. Die Homepage und TAP-Seite von Interactive Paper sowie zehn vom Nutzer angehängte Bilder wurden erneut ausgewertet.

Aktuelles Namenskonzept: **Kontaktstoff Impuls** mit **Feinstoff**, **Nahkontakt**, **Erlebnisraum** und **Direktweg**. Kontaktstoff-Colorway bleibt erhalten.

Die Landingpage wurde ersetzt: großes eigenes Produktfoto; geführter Ablauf Ankommen → Antippen → Erleben → Weitergehen; drei konkrete Anwendungen für Produkt, Dienstleistung und Bundle; echte Navigation auf Beispiel-Zielseiten; Materialfoto und NFC-Schema; eigenes Mailing-/Kuvertmotiv; Funktionsvergleich mit klassischer Post; interaktiver Beispielrechner; klare Erklärung eines gemeinsamen Kampagnen-Erlebnisses für z. B. 500 Karten.

Die Werte 78/65/24 % stammen aus der Dashboard-Darstellung der Referenz. Sie sind als veränderbare Beispielannahmen mit Quellenhinweis eingebaut, keine Kontaktstoff-Messwerte und keine Zusage. Keine Behauptung zu 2× NFC-Leistung, garantierter Reichweite oder billigerer Produktion. Hardwareeigenschaften müssen später belegt werden.

Vier neue Originalmotive in `web/public/images/v3/`; die fremden Referenzbilder werden nicht ausgeliefert. Details: `replica/recon-v3.md`, `replica/design/components-v3.md`, `replica/asset-prompts-v3.md`, `replica/build-log.md`.

Sechs Seiten bauen, 22 DOM-Interaktionsprüfungen und 14 Kontrastpaare bestehen. Browserlayout und echtes WebGL sind wegen fehlendem vorgeschriebenem Browser-Workflow weiterhin ungeprüft. Keine echte NFC-Erfassung, Kamera-AR, Bestellungen oder Buchungen.

Separate private Vorschau weiterhin: https://kontaktstoff-nfc-colorway.temoa-3702.chatgpt.site
Branch weiterhin `claude/interactive-paper-rebuild-owvx7s`; kein Merge und keine Änderung der Live-Dateien oder Root-Deployment-Konfiguration.


## 13. Maßgeblicher Stand: Kontaktstoff Impulse V4 · 10.10.2026

Der Nutzer wünscht ausdrücklich einen moderneren, weicheren, fotografischen Stil. Der Produktname lautet **Kontaktstoff Impulse** (Plural). Die selbst gebauten Smartphone-/3D-Animationen wurden aus den Seiten entfernt. Auch `/demo/` ist jetzt eine Bildgalerie mit drei passenden Zielseiten.

Neue Leserichtung: Hero → frühe, klar illustrative Zahlen → drei bebilderte Empfängerschritte → Produkt/Dienstleistung/Bundle → Technik → Design und Vergleich → vertiefte Beispielrechnung → hypothetische Launch-Kampagne → offene Antworten → Anfrage. Keine aufklappbaren Erklärungen auf der Startseite.

Fünf neue eigene Motive in `web/public/images/v4/`: Hero, Produkt, Dienstleistung, Bundle und NFC-Tap mit Link-Hinweis. Vollständige Prompts und Dateipfade: `replica/asset-prompts-v4.md`. Bestehende eigene V3-Motive ergänzen Material und Kuvert.

Alle Texte sind lesbarer, meist 18–20 px; Hinweise mindestens 16 px. Weiße/helle Flächen, Graphit, Kontaktstoff-Neongelb, rundere Ecken und Buttons. Keine erfundenen Kundenlogos, Kampagnenergebnisse, Reichweiten- oder Preisversprechen. Die Zahlen 78/65/24 werden sichtbar als illustrative Annahmen eingeordnet.

Build: sechs Seiten erfolgreich. 21 DOM-/Strukturprüfungen und 16 Kontrastpaare bestanden. Keine gerenderte Browserprüfung möglich, da der Sites-Workflow ohne `$control-browser` diese ausdrücklich überspringt. Keine Hardware-/AR-Prüfung.

Privates Vorschauprojekt und URL bleiben identisch: https://kontaktstoff-nfc-colorway.temoa-3702.chatgpt.site

GitHub-Ziel unverändert: `claude/interactive-paper-rebuild-owvx7s`. Live-Website und Root-Deployment nicht ändern, nicht nach `main` oder in den Live-Branch mergen.


## V5 – 10.10.2026: Produkt und Marketing im Fokus

V5 ersetzt die V4-Richtung: zentrale Briefkarte mit Handy-Feld, kurze Marketing-Copy, fünf neue Originalmotive, mehr Lime/Kobalt/Koralle, sichtbares Dashboard. Rechner und Quotenregler entfernt. Referenzzahlen bleiben ausdrücklich illustrative Fremdwerte. Keine Live-Änderungen. Details siehe README und replica/asset-prompts-v5.md.


## V6 – Hero beruhigen, freie Kampagnen, Portal

Aktuelle Richtung ersetzt V5: drei Hero-Elemente, neun neue Bilder mit kleinen NFC-Feldern, weiße Markengalerie, NFC-Papiersektion, QR/NFC-Vergleich und interaktives Portal mit sechs Ansichten. Keine mehrfachen Beispiel-Fußzeilen; einmalige Demo-/Konzeptkennzeichnung bleibt. 77/64/23 sind frei gewählte Beispielquoten, 4,5/35 ein vorgegebenes Vergleichsszenario. Keine eigenen Erfolgsbehauptungen. Details in README.


## V7 – Maßgeblicher Stand · 10.10.2026

30 statische Seiten: Landingpage, Produkt, Technologie, Preise, acht bebilderte Journalartikel mit Suche und Kategorien, drei Vergleichsseiten, Alternativen, FAQ, Über uns, Karriere (keine offenen Stellen), Kontakt und rechtliche Entwürfe. Bestehende Demo-Zielseiten und das Portal bleiben erreichbar.

14 neue generierte Produktmotive mit einheitlich hohem Kartenformat, gedrucktem räumlichen Tap-Feld und Handy-in-der-Hand-Symbol. Das Format folgt der gelben HOLY-Karte; es ist keine bestätigte Produktionsspezifikation. Hero: HOLY, NordVPN, PrepMyMeal. Acht freie Kampagnenideen ergänzen Revolut, temoa, True Nature, Aoste und 116 Media. Originales temoa-Logo und SKOTTI-Designbeispiel wurden auf Nutzerwunsch eingebunden; alle Markenkonzepte sind ausdrücklich keine Kundenreferenzen.

Drei Schritte mit einer Karte, sichtbare NFC-Signale, flache Papierintegration, Druckoberfläche und geräteabhängige Rückmeldung. Der Vergleich verwendet einen grünen NFC-Balken und ein überlappendes Erlebnisbild. Das Portal zeigt eine Kampagne mit einem Design und sechs funktionierenden Ansichten.

77/64/23 % sind klar bezeichnete Beispielquoten. 4,5 % QR / 35 % NFC ist ein vom Nutzer vorgegebenes Vergleichsszenario. Es liegen keine eigenen Messdaten oder belastbaren Preisvergleiche vor. Keine garantierten Reichweiten, Haptik- oder Erfolgsversprechen.

## Verhalten und Grenzen

Anfragen werden lokal vorbereitet und als Text angeboten, nicht versendet. Keine echten Buchungen, Bestellungen, Kampagnen, NFC-Scans, Kamera-AR oder Backend-Analysen. Die Abbildungen illustrieren die Experience; Smartphone-Einladungen sind keine verifizierte Betriebssystemdarstellung.

Cookie-Einstellungen funktionieren mit `impulse-privacy-v1` im lokalen Browserspeicher. Keine Analyse- oder Marketingdienste sind eingebunden. Rechtliche Seiten sind ausdrücklich Entwürfe: Betreiber-, Kontakt- und Vertragsangaben fehlen und müssen vor einer öffentlichen Nutzung ergänzt und geprüft werden.

## Entwicklung und Prüfung

In `web`: `npm install`, `npm run dev`, `npm run build`.

Astro-Build und DOM-Prüfung aller 30 Seiten: interne Links/Assets, Überschriften, IDs/ARIA-Verweise, Dashboard-Tabs und Tastaturwechsel, Blogsuche/Kategorien, Cookie-Einstellungen und Speicherung, FAQ und Hero. Neue Bilddateien vollständig dekodiert und visuell geprüft. Keine gerenderte Desktop-/Mobilprüfung: Das für Sites vorgeschriebene control-browser-Werkzeug ist nicht verfügbar.

## Quellen und Vorschau

- https://interactivepaper.com/tap
- https://interactivepaper.com/touch-for-print-advertising
- https://www.temoa.de/design-beispiele
- https://www.116media.de/
- https://www.chatbyte.ai/de/blog (Informationsarchitektur als Referenz)
- Weitere Primärquellen stehen bei den Journal- und Vergleichsartikeln.
- Generierungsprompts und Assetquellen: `replica/asset-prompts-v7.md`.

Private Vorschau: https://kontaktstoff-nfc-colorway.temoa-3702.chatgpt.site

Kein Merge in `main` oder den Live-Branch. PR #23 bleibt Entwurf.


## V8 – Präzisierung nach Screenshots · 10.10.2026

Vier neue Bildassets: NordVPN-Karte nahezu kantenparallel in der Hand, PrepMyMeal-Druckdetail, transparenter HOLY-Freisteller mit Alphakanal und grünes True-Nature-Produkt. Die drei HOLY-Schritte bleiben zusammenhängend; Wow-Moment zeigt Revolut, Material/NFC verwenden NordVPN, PrepMyMeal und 116 Media.

Das Logo erhält einen abgerundeten gelben Quadratpunkt mit halbtransparenter äußerer Kontur. Die drei markierten Texte wurden entfernt. Abschnittseinstiege stehen zentriert, Bild-/Textstrecken bleiben auf großen Bildschirmen zweispaltig. Unternehmens- und Produktseiten verwenden eigene Marken-Heros und Inhaltskacheln ohne linke Navigation; auch Artikel haben eine mittige Lesespalte.

FAQ sind native, tastaturbedienbare Details/Summary-Elemente mit vollständig im ausgelieferten HTML enthaltenen Antworten. Gestaltung durch Kontaktstoff wird auf Produkt-, Preis- und Kontaktseiten sowie in FAQ und Design-Ratgeber ausdrücklich angeboten.

Der Kennzahlen-Dialog entfällt. Die kleine Fußnote bezeichnet die 77/64/23 weiterhin als Beispielwerte; es liegt kein Nachweis vor, dass diese zuvor frei gewählten Zahlen aus eigenen Kundentests stammen. Keine erfundene Kundenattribution. Rechtsseiten bleiben Entwürfe.

Prüfung: 30 statische Routen; Links, Assets, IDs/ARIA, native FAQ-Interaktion, entfernte Screenshot-Texte, Branding, Dashboard, Cookies und Journalfilter. Gerenderte Browserprüfung weiterhin nicht möglich: vorgeschriebenes control-browser-Werkzeug fehlt.


## V9 – Einheitliche Karten und Vergleich · 10.10.2026

Alle aktiv verwendeten Kartenmotive gegen die HOLY-Karte im Hero geprüft. Visuelle Vorlage: Hochformat 3:5, Tap-Mitte bei 50 % der Breite und 78 % der Höhe, äußere Tap-Fläche 44 % der Kartenbreite. Das ist eine gemeinsame Illustrationsvorgabe, keine bestätigte Fertigungszeichnung. Perspektive und KI-Darstellung können geringfügig abweichen. Bereits passende Motive bleiben erhalten; abweichende Bilder werden gezielt angepasst. `src/data/assets.ts` ordnet freigegebene Bilder zentral zu, auch in Journal, Unterseiten und Portal.

Schwarzer abgerundeter Logo-Punkt mit schwarzer Kontur (etwa 20 % größer, 32 % Deckkraft) in Header, Footer, Portal und Favicon. QR/NFC-Vergleich mit echtem QR-Code zur Produktseite und größerem transparentem True-Nature-Erlebnis. Schritte bleiben in kleinerer Typografie erhalten. Überschrift `Gestochen / scharf.` zweizeilig.

Interactive-Paper-Vergleich aus Daten, Seitenbuild, Übersicht und Footer entfernt. Die zwei methodischen Vergleiche bleiben erhalten. Der lange Kennzahlen-Fußnotentext entfällt; `Beispielwerte` bleibt als knappe Einordnung, da keine eigenen Kundenergebnisse für 77/64/23 belegt sind.

29 statische Seiten. Build-/DOM-Prüfungen umfassen Links, entfernte Route, zentrale Bildverweise, Logo, FAQ, Dashboard, Cookies und Journal. Keine gerenderte Browserprüfung: vorgeschriebenes control-browser fehlt. Private Vorschau und Side-Project-Branch unverändert; kein Merge, keine Live-Änderung.


## V10 – gemeinsame NFC-Vorlage und Logo-Referenz

Alle sichtbaren Tap-Felder stammen aus einer Vektorvorlage, perspektivisch an vier Kartenecken ausgerichtet: Mittelpunkt50/78%, Breite44%.12 neue Motive,15 Kartenflächen einschließlich Smartphone-Miniatur. Imagegen entfernte die alten Felder; die anschließende Projektion ist deterministisch. Quellen, Prompts, Eckpunkte und Skripte: replica/v10/. Zentral auf allen Seiten und im Portal eingebunden. Keine Produktionsmaß-Freigabe.

Logo: schwarzes Quadrat und zwei proportional abgestufte quadratische Flächen, mehr Abstand. Originales HOLY-Makro V7 für Gestochen scharf wiederhergestellt.29 Seiten geprüft, Browser-Layoutprüfung nicht verfügbar. Sites-Zugriffsregel war beim Öffnen bereits public; unverändert beibehalten. Kontaktstoff-Live und main bleiben unverändert.
