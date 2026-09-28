import {uid} from './core.js';
import {createBewertungspush} from './bewertungspush.js';
import {toSelfmailer} from './selfmailer.js';

// Separate recovery campaign; never changes the acquisition campaign.
export function createBewertungspushCart(){
 const c=toSelfmailer(createBewertungspush());
 c.id=uid();c.name='BewertungsPush · Warenkorbabbrecher';c.templateId='bewertungspush-cart';
 c.brief={sender:'BewertungsPush',audience:'Unternehmen mit ausgewählten Bewertungen und abgebrochenem Auftrag, die noch nicht abgeschlossen haben.',goal:'website',offer:'Begonnenen Auftrag fortsetzen. Keine Vorkasse, Zahlung nur bei erfolgreicher Löschung.'};
 const replacement=new Map([
  ['Weil Ihr guter Ruf zählt.','Ihr nächster Schritt für einen guten Ruf.'],
  ['GUTE ARBEIT VERDIENT EINEN GUTEN RUF.','BEGONNEN. NOCH NICHT ABGESCHLOSSEN.'],
  ['Unberechtigte\nBewertungen raus.','Ihr guter Ruf.\nIhr nächster Schritt.'],
  ['Ihr guter Ruf\nnach vorn.','Schließen Sie Ihren\nAuftrag ab.'],
  ['Wir prüfen unberechtigte Bewertungen und kümmern uns um den Löschantrag bei Google. Damit echte Erfahrungen im Vordergrund stehen.','Vielleicht kam etwas dazwischen. Prüfen Sie Ihre Auswahl in Ruhe und schließen Sie den Auftrag ab, wenn alles passt.'],
  ['Ihr guter Ruf.\nUnsere Aufgabe.','Guter Ruf.\nNächster Schritt.'],
  ['Der erste Schritt zu\neinem besseren Eindruck.','Ihre Auswahl wartet.\nMachen Sie weiter.'],
  ['Profil finden','Auswahl aufrufen'],['Bewertungen auswählen','Angaben prüfen'],['Prüfung starten','Auftrag abschließen'],
  ['Jetzt Bewertungen\nprüfen lassen.','Jetzt Auftrag\nfortsetzen.'],['bewertungspush.de/suche','Ihr persönlicher Rückkehrlink']
 ]);
 for(const side of Object.values(c.sides))for(const field of side.fields){field.id=uid();if(replacement.has(field.text))field.text=replacement.get(field.text);if(field.type==='qr')field.text='{{cart_url}}';}
 c.sides.front.fields.find(f=>f.text==='Schließen Sie Ihren\nAuftrag ab.').fontSize=22;
 c.recipients=c.recipients.slice(0,1).map(r=>({...r,personal_note:'Sie haben bei BewertungsPush bereits Bewertungen ausgewählt, Ihren Auftrag aber noch nicht abgeschlossen. Wenn Sie weitermachen möchten, führt Sie der QR-Code zurück zu Ihrer Auswahl.',cart_url:'https://bewertungspush.de/suche'}));
 return c;
}
