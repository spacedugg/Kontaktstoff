// Add a prospect here and a matching native design in studio/src/client-campaigns.js.
// contactUrl stays empty until an actual Kontaktstoff sales destination is supplied.
const recovery={kind:'cart-recovery',contactUrl:'',pilot:250,audienceLabel:'Warenkorbabbrecher',audience:'Checkout-Abbrecher mit vorhandener Postanschrift',goalLabel:'ein zurückgewonnener Kauf',nextLabel:'Zurück zur Auswahl',
 designDescription:'Das ausgewählte Produkt, eine persönliche Erinnerung und ein direkter Rückkehr-Link. Vorder- und Rückseite lassen sich bearbeiten.',
 digitalStep:'Für echte Empfänger öffnet der QR-Code den individuellen Wiederherstellungslink aus eurem Shop. In der Demo öffnet er die jeweilige Produktseite.',
 note:'Fiktive Beispielkontakte und Varianten. Produktfotos vom jeweiligen Shop. Die QR-Codes öffnen aktuell Produktseiten; echte Warenkörbe, Rabatte und Reservierungen werden nicht angelegt.',
 pilotDescription:'Checkout-Abbrecher aus dem Shop exportieren. Bereits abgeschlossene Käufe und Werbewidersprüche vor dem Versand ausschließen. Postanschrift und Wiederherstellungslink prüfen.',
 resultsDescription:'Rückkehr und anschließende Käufe anhand der Checkout-ID zuordnen. Mit einer zufällig ausgewählten Kontrollgruppe ohne Mailing vergleichen.',
 firstReason:'An ein bestehendes Interesse anknüpfen.',firstReasonBody:'Die Empfänger haben bereits Produkte ausgewählt. Vor dem Versand werden inzwischen abgeschlossene Bestellungen und gesperrte Kontakte aus der Liste entfernt.',
 secondReasonBody:'Anrede, Produkt, gewählte Variante und persönlicher Wiederherstellungslink stammen aus dem Checkout. Ein Gutschein kann nach Freigabe ergänzt werden.'};
export const CLIENT_PAGES=[{
 ...recovery,id:'reha-sleep',name:'RehaSleep',addressee:'das RehaSleep-Team',title:'Aus einer guten Auswahl wird eine gute Entscheidung.',intro:'Eine persönliche Erinnerung im Briefkasten bringt eure ausgewählten Schlafprodukte zurück ins Blickfeld. Mit vertrautem Produktbild, ruhiger Ansprache und einem einfachen Weg zurück zur Auswahl.',concept:'Mehr Komfort. Jetzt mit 30 € Rabatt.',rationale:'Die Karte knüpft an das Interesse an RehaSleep an. 30 € Rabatt mit Schlaf30 und ein direkter Scan zum Sortiment machen den nächsten Schritt leicht.',source:'https://reha-sleep.de/',target:'https://reha-sleep.de/collections/all',color:'#1878b9',accent:'#e5eff4',audienceOptions:['Abgebrochene Checkouts · letzte 90 Tage'],nextLabel:'Sortiment entdecken',designDescription:'Persönliche Erinnerung mit 30 € Rabatt. Gutscheincode Schlaf30 und QR-Code zur Produktübersicht.',digitalStep:'Der QR-Code öffnet die Produktübersicht. Der Code Schlaf30 wird im Checkout eingegeben.',note:'Fiktive Beispielkontakte. Produktbilder dienen der Veranschaulichung. Die Aktivierung des Rabattcodes erfolgt im RehaSleep-Shop.',pilotDescription:'Abgebrochene Checkouts der letzten 90 Tage verwenden. Bereits abgeschlossene Käufe und Werbewidersprüche ausschließen; Postanschriften prüfen.',secondReasonBody:'Anrede und Postanschrift stammen aus dem Checkout. Individuelle Produkt- und Warenkorblinks werden nicht benötigt.'
},{
 ...recovery,id:'zyvo',name:'ZYVO',addressee:'das ZYVO-Team',title:'Gute Wahl. Nur noch nicht bestellt.',intro:'Lieblingsteile bleiben im Kopf – und mit dieser Karte auch im Briefkasten. Wir erinnern persönlich an das ausgewählte ZYVO Produkt und machen die Rückkehr zum Shop leicht.',concept:'Gute Wahl. Jetzt wird’s deins.',rationale:'Die Karte verbindet die direkte Du-Ansprache von ZYVO mit dem Produkt aus dem abgebrochenen Checkout. Schuhe, Kissen und Socken bekommen jeweils das passende Bild und die gewählte Variante.',source:'https://zyvo.de/en',target:'https://zyvo.de/en/products/one',color:'#2f75f4',accent:'#eaf1ff',audienceOptions:['ZYVO One','Rest Pillow','Base Socks','Alle geeigneten Checkouts']
},{
 id:'money-making-sprint',name:'Money Making Sprint',addressee:'Jakob & das Money Making Sprint Team',
 title:'Eure nächste gute Anfrage? Könnte mit dieser Karte anfangen.',
 intro:'Jakob, ihr sprecht Klartext über Kundengewinnung. Wir bringen diesen Ton in den Briefkasten eurer Wunschkunden: eine persönliche Frage an Agenturinhaber, ein konkreter Anlass und ein Scan zu eurem Gespräch.',
 concept:'Hey Anna, wer holt den nächsten Kunden für euch rein?',
 rationale:'Euer Auftritt ist direkt, persönlich und auf Kundengewinnung fokussiert. Genau das greift die Karte auf: außen eine Frage, die bei Agenturinhabern ansetzt; innen eine kurze Nachricht von Jakob. Der Einstieg verändert sich für Webdesign, KI und Content – das Ziel bleibt euer Strategiegespräch.',
 audience:'Inhaber von Agenturen und B2B-Dienstleistungsunternehmen',
 source:'https://www.money-making-sprint.de/',target:'https://www.money-making-sprint.de/termin',contactUrl:'',
 color:'#7338ea',accent:'#dbff00',pilot:250
},{
 id:'bewertungspush',name:'BewertungsPush',addressee:'das BewertungsPush-Team',
 title:'Eine verdächtige Bewertung. Ein klarer nächster Schritt.',
 intro:'Euer Service beginnt dort, wo neue Kunden ihren ersten Eindruck gewinnen: beim Google-Profil. Wir bringen die Einladung zur Prüfung direkt zu passenden lokalen Unternehmen – persönlich formuliert und mit einem klaren nächsten Schritt.',
 concept:'Ihr guter Ruf. Auf den ersten Blick.',
 rationale:'Lokale Betriebe leben von Vertrauen. Die Karte spricht den konkreten Moment vor einer Buchung, Reservierung oder Terminvereinbarung an. Sie stellt keine unbelegte Diagnose zum Empfängerprofil, sondern lädt zur Prüfung verdächtiger Beiträge ein.',
 audience:'Inhaber und Geschäftsführungen lokaler Hotels, Restaurants und Werkstätten',
 source:'https://bewertungspush.de/',target:'https://bewertungspush.de/suche',contactUrl:'',
 color:'#4285f4',accent:'#eaf2ff',pilot:250,
 audienceLabel:'Betriebe',audienceOptions:['Hotels','Restaurants','Werkstätten','Gemischte lokale Betriebe'],
 designDescription:'Ein heller Entwurf mit persönlicher Ansprache und einer beispielhaften Sterne-Entwicklung. Hinten eine persönliche Nachricht, das Erfolgsmodell und ein Scan zur Bewertungsprüfung.',
 goalLabel:'ein geprüftes Unternehmensprofil',nextLabel:'Profilprüfung starten',
 digitalStep:'Der QR-Code öffnet eure bestehende Unternehmenssuche. Der Empfänger wählt dort sein Profil und die betreffenden Bewertungen aus.',
 note:'Fiktive Beispielkontakte, keine Analyse echter Google-Profile. Der QR-Code öffnet die bestehende Unternehmenssuche mit Beispiel-Kampagnenparametern.',
 pilotDescription:'Branche, Ansprechpartner und Anlass prüfen. Dann Nachricht und beide Kartenseiten freigeben.',
 resultsDescription:'QR-Aufrufe, gestartete Profilprüfungen und beauftragte Prüfungen getrennt erfassen. Das Tracking auf eurer Zielseite stimmen wir vor dem Versand ab.'
}];
