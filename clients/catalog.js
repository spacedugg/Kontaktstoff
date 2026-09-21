// Add a prospect here and a matching native design in studio/src/client-campaigns.js.
// contactUrl stays empty until an actual Kontaktstoff sales destination is supplied.
export const CLIENT_PAGES=[{
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
 concept:'Schlechte Bewertung. Nie Gast gewesen?',
 rationale:'Lokale Betriebe leben von Vertrauen. Die Karte spricht den konkreten Moment vor einer Buchung, Reservierung oder Terminvereinbarung an. Sie stellt keine unbelegte Diagnose zum Empfängerprofil, sondern lädt zur Prüfung verdächtiger Beiträge ein.',
 audience:'Inhaber und Geschäftsführungen lokaler Hotels, Restaurants und Werkstätten',
 source:'https://bewertungspush.de/',target:'https://bewertungspush.de/suche',contactUrl:'',
 color:'#4285f4',accent:'#eaf2ff',pilot:250,
 audienceLabel:'Betriebe',audienceOptions:['Hotels','Restaurants','Werkstätten','Gemischte lokale Betriebe'],
 designDescription:'Vorne eine Frage, die zum Betrieb passt. Hinten eine persönliche Nachricht, das Erfolgsmodell und ein Scan zur Bewertungsprüfung.',
 goalLabel:'ein geprüftes Unternehmensprofil',nextLabel:'Profilprüfung starten',
 digitalStep:'Der QR-Code öffnet eure bestehende Unternehmenssuche. Der Empfänger wählt dort sein Profil und die betreffenden Bewertungen aus.',
 note:'Fiktive Beispielkontakte, keine Analyse echter Google-Profile. Der QR-Code öffnet die bestehende Unternehmenssuche mit Beispiel-Kampagnenparametern.',
 pilotDescription:'Branche, Ansprechpartner und Anlass prüfen. Dann Nachricht und beide Kartenseiten freigeben.',
 resultsDescription:'QR-Aufrufe, gestartete Profilprüfungen und beauftragte Prüfungen getrennt erfassen. Das Tracking auf eurer Zielseite stimmen wir vor dem Versand ab.'
}];
