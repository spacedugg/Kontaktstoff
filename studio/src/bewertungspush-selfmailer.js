import {uid} from './core.js';
import {brandLogoDark} from './bewertungspush-art.js';
import {coverArt,insideArt} from './bewertungspush-selfmailer-art.js';
// An explicit redesign, never applied implicitly to an existing saved design.
export function styleBewertungspushSelfmailer(source){
 const c=structuredClone(source),ink='#14233e',blue='#286ce3',muted='#52647c';
 const t=(text,x,y,w,h,fontSize=12,color=ink,weight='400',role='')=>({id:uid(),type:'text',text,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true,...(role?{brandRole:role}:{})});
 const img=(data,x,y,w,h,role='artwork')=>({...t('',x,y,w,h),type:'image',data,fit:'contain',brandRole:role});
 const stars=(key,x,y,w,h)=>({...t('{{'+key+'}}',x,y,w,h),display:'stars',color:'#efad27'});
 const logo=(x,y,w=57)=>img(brandLogoDark,x,y,w,w/6.1,'brand');
 const postal=source.sides.front.fields.find(f=>f.postalAddress);
 const qr=source.sides.back.fields.find(f=>f.type==='qr');
 const legacyNotes={"Schon vor der Buchung zählt Ihr erster Eindruck auf Google. Eine Bewertung ohne echten Aufenthalt sollte ihn nicht bestimmen.": "Bevor Gäste bei Ihnen buchen, schauen sie auf Google. Unberechtigte Bewertungen können dabei den Eindruck von Ihrem Hotel verzerren. Lassen Sie uns prüfen, was sich ändern lässt.", "Bevor Gäste einen Tisch reservieren, lesen sie Bewertungen. Beiträge ohne echten Restaurantbesuch sollten ihnen nicht den Appetit verderben.": "Ihr nächster Gast schaut vielleicht gerade auf Google. Unberechtigte Bewertungen sollten den Eindruck von Ihrem Restaurant nicht bestimmen. Wir prüfen, was sich ändern lässt.", "Wer eine Werkstatt sucht, sucht Vertrauen. Eine Bewertung ohne echten Kundenkontakt sollte nicht über den nächsten Auftrag entscheiden.": "Wer eine Werkstatt sucht, sucht Vertrauen. Unberechtigte Bewertungen können den ersten Eindruck verzerren. Wir prüfen, welche Beiträge sich anfechten lassen."};
 for(const recipient of c.recipients)if(legacyNotes[recipient.personal_note])recipient.personal_note=legacyNotes[recipient.personal_note];
 c.format='selfmailer-dl-4';c.selfmailer={...c.selfmailer,version:2,design:'bewertungspush-editorial'};
 c.sides.front={background:{kind:'blank',color:'#ffffff'},fields:[
  logo(11,10,58),t('EINE PERSÖNLICHE NACHRICHT FÜR',11,33,111,6,7.5,muted,'700'),t('{{company}}',11,44,110,14,19,ink,'700'),
  t('Weil Ihr guter Ruf zählt.',11,62,106,10,13,blue,'700'),t('bewertungspush.de',11,76,45,6,8,muted),
  {...t(postal?.text||'{{company}}\n{{first_name}} {{last_name}}\n{{street}}\n{{postal_code}} {{city}}',134,45,70,33,10,'#111111'),postalAddress:true},
  img(coverArt,0,99,210,99),logo(11,107,57),
  {...t('FÜR {{company}}',112,107,87,6,8,ink,'700'),align:'right'},
  {...t('{{first_name}} {{last_name}}',112,114,87,5,7,muted),align:'right'},
  t('GUTE ARBEIT VERDIENT EINEN GUTEN RUF.',11,127,97,5,7,muted,'700'),
  t('Unberechtigte\nBewertungen raus.',11,137,101,25,26,ink,'700','headline'),
  t('Ihr guter Ruf\nnach vorn.',11,164,97,22,23,blue,'700'),
  t('HEUTE · BEISPIEL',118,164,34,4,6.3,muted,'700'),t('{{rating_current}}',118,170,20,13,25,ink,'700'),stars('rating_current',138,175,15,4),
  t('DAS POTENZIAL · BEISPIEL',153,135,41,4,6.2,muted,'700'),t('{{rating_example}}',153,141,40,19,37,blue,'700'),stars('rating_example',153,160,35,5),
  t('Beispielwerte · keine Ergebniszusage',115,184,84,4,6,muted),
  t('Keine Vorkasse. Zahlung nur bei erfolgreicher Löschung.',11,191,158,5,8,blue,'700'),
  {...t('Aufklappen →',169,191,30,5,8,ink,'700'),align:'right'}
 ]};
 c.sides.back={background:{kind:'blank',color:'#fcfcfa'},fields:[
  img(insideArt,0,0,210,198),logo(11,9,54),t('{{salutation}}',11,29,130,10,19,ink,'700'),
  t('{{personal_note}}',11,43,126,24,12,ink,'400','body'),
  t('Wir prüfen unberechtigte Bewertungen und kümmern uns um den Löschantrag bei Google. Damit echte Erfahrungen im Vordergrund stehen.',11,70,126,18,10,muted),
  t('Ihr Team von BewertungsPush',11,90,126,6,10,blue,'700','signature'),
  {...t('Ihr guter Ruf.\nUnsere Aufgabe.',147,71,52,15,15,blue,'700'),align:'center'},
  t('Der erste Schritt zu\neinem besseren Eindruck.',11,110,124,24,24,ink,'700','cta'),
  t('01',11,140,9,6,9,blue,'700'),t('Profil finden',24,139,104,6,11,ink,'700'),
  t('02',11,150,9,6,9,blue,'700'),t('Bewertungen auswählen',24,149,104,6,11,ink,'700'),
  t('03',11,160,9,6,9,blue,'700'),t('Prüfung starten',24,159,104,6,11,ink,'700'),
  t('Keine Vorkasse.\nSie zahlen nur bei Erfolg.',11,177,120,13,13,blue,'700'),
  {...t(qr?.text||'{{chatbot_url}}',152,120,35,35),type:'qr',background:'#ffffff'},
  {...t('Jetzt Bewertungen\nprüfen lassen.',146,164,47,13,12,ink,'700'),align:'center'},
  {...t('bewertungspush.de/suche',144,181,51,5,7.5,blue,'700'),align:'center'},
  t('Über die Löschung entscheidet Google. Eine höhere Sternebewertung ist nicht garantiert.',11,192,188,4,6.5,muted)
 ]};return c;
}
