import {createCampaign,uid} from './core.js';
import {brandLogoDark} from './bewertungspush-art.js';
export function createBewertungspush(){
 const c=createCampaign(true),ink='#0f172a',blue='#4285f4',muted='#52647c';
 const t=(text,x,y,w,h,fontSize=12,color=ink,weight='400')=>({id:uid(),type:'text',text,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true});
 const s=(x,y,w,h,color)=>({...t('',x,y,w,h),type:'shape',background:color});
 const image=(data,x,y,w,h)=>({...t('',x,y,w,h),type:'image',data,fit:'contain'});
 c.name='BewertungsPush · Echte Erfahrungen zählen';c.templateId='bewertungspush';c.sample=true;c.onboarding={active:false,step:5,personalizationSkipped:false};
 c.brief={sender:'BewertungsPush',audience:'Inhaber und Geschäftsführungen von Hotels, Restaurants und Werkstätten',goal:'website',offer:'Verdächtige Google-Bewertungen prüfen lassen. Zahlung nur bei erfolgreicher Löschung.'};
 c.recipients=[
  {first_name:'Hannah',last_name:'Seidel',company:'Hotel Lindenhof',segment:'Hotels',salutation:'Guten Tag Frau Seidel,',personal_note:'Schon vor der Buchung zählt Ihr erster Eindruck auf Google. Eine Bewertung ohne echten Aufenthalt sollte ihn nicht bestimmen.'},
  {first_name:'Marco',last_name:'Berg',company:'Restaurant Abendrot',segment:'Restaurants',salutation:'Guten Tag Herr Berg,',personal_note:'Bevor Gäste einen Tisch reservieren, lesen sie Bewertungen. Beiträge ohne echten Restaurantbesuch sollten ihnen nicht den Appetit verderben.'},
  {first_name:'Julia',last_name:'Kern',company:'Werkstatt Kern',segment:'Werkstätten',salutation:'Guten Tag Frau Kern,',personal_note:'Wer eine Werkstatt sucht, sucht Vertrauen. Eine Bewertung ohne echten Kundenkontakt sollte nicht über den nächsten Auftrag entscheiden.'}
 ].map((r,i)=>({...r,id:uid(),industry:r.segment,rating_current:'4,2',rating_example:'4,7',website:'',street:'',postal_code:'',city:'',country:'Deutschland',chatbot_url:'https://bewertungspush.de/suche?utm_source=kontaktstoff&utm_medium=direct_mail&utm_campaign=profilcheck_pilot&utm_content=beispiel_'+(i+1)}));
 const stars=(key,x,y,w,h)=>({...t('{{'+key+'}}',x,y,w,h),display:'stars',color:'#efad27'});
 c.sides.front={background:{kind:'blank',color:'#f9fbff'},fields:[
  image(brandLogoDark,12,11,68,11.15),
  {...t('{{company}}',116,12,82,7,10,ink,'700'),align:'right'},
  {...t('Für {{first_name}} {{last_name}}',116,21,82,6,8.5,muted),align:'right'},
  t('Unberechtigte Bewertungen raus.',12,39,186,17,27,ink,'700'),
  t('Ihr guter Ruf nach vorn.',12,56,186,16,27,blue,'700'),
  t('Keine Vorkasse. Sie zahlen nur bei erfolgreicher Löschung.',12,76,186,8,11,muted),
  s(0,90,210,58,'#eaf2ff'),
  s(12,96,77,34,'#ffffff'),
  s(121,96,77,34,'#ffffff'),
  t('BEISPIEL · AUSGANGSWERT',18,100,66,6,7,muted,'700'),
  t('{{rating_current}}',18,109,34,17,32,ink,'700'),
  stars('rating_current',53,112,28,6),
  t('von 5 Sternen',53,121,30,5,7.5,muted),
  t('→',95,106,22,18,31,blue,'700'),
  t('BEISPIEL · NACH LÖSCHUNGEN',127,100,66,6,6.8,muted,'700'),
  t('{{rating_example}}',127,109,34,17,32,blue,'700'),
  stars('rating_example',162,112,28,6),
  t('von 5 Sternen',162,121,30,5,7.5,muted),
  t('Illustrative Werte, keine Ergebniszusage.',12,138,110,5,7,muted),
  {...t('Jetzt prüfen lassen →',126,136,72,8,10,'#225ebf','700'),align:'right'}
 ]};
 c.sides.back={background:{kind:'blank',color:'#fffefa'},fields:[
  t('EIN GUTER RUF IST KEIN ZUFALL.',12,12,120,8,8.5,muted,'700'),
  image(brandLogoDark,145,10,53,8.7),
  t('{{salutation}}',12,30,123,12,18,ink,'700'),
  t('{{personal_note}}',12,48,121,26,12,ink),
  t('Sie wählen die verdächtigen Bewertungen aus. Wir prüfen mögliche Richtlinienverstöße und kümmern uns um den Löschantrag bei Google.',12,78,121,24,11.5,ink),
  s(12,109,121,12,'#eaf2ff'),
  t('Keine Vorkasse. Zahlung nur bei Erfolg.',16,113,113,8,11.5,'#17457e','700'),
  t('Freundliche Grüße\nIhr Team von BewertungsPush',12,128,121,13,10,muted),
  s(143,30,55,109,'#eaf2ff'),
  t('Jetzt Bewertungen\nprüfen lassen.',149,37,44,16,14,ink,'700'),
  {...t('{{chatbot_url}}',152,60,37,37),type:'qr',background:'#ffffff'},
  t('01  Profil finden\n02  Bewertungen auswählen\n03  Prüfung starten',149,104,44,19,8.5,muted),
  t('bewertungspush.de/suche',147,130,48,6,8,'#225ebf','700'),
  t('Über die Löschung entscheidet Google.',12,140,121,5,7,muted)
 ]};return c;
}

// Optional sales concept, not an existing offer from the provider.
export function applyBewertungspushOffer(campaign){
 const c=structuredClone(campaign);
 c.name+=' · Angebotsidee';
 const front=c.sides.front.fields;
 const offer=front.find(f=>f.text==='Keine Vorkasse. Sie zahlen nur bei erfolgreicher Löschung.');
 if(offer){offer.text='Erste erfolgreiche Löschung gratis.';offer.fontSize=14;offer.weight='700';offer.color='#225ebf';}
 const note=front.find(f=>f.text==='Illustrative Werte, keine Ergebniszusage.');
 if(note){note.text='Beispielwerte · Angebotsidee, Konditionen offen';note.fontSize=6.5;}
 const back=c.sides.back.fields;
 const promise=back.find(f=>f.text==='Keine Vorkasse. Zahlung nur bei Erfolg.');
 if(promise){promise.text='Erste erfolgreiche Löschung gratis.';promise.fontSize=11.5;}
 const disclaimer=back.find(f=>f.text==='Über die Löschung entscheidet Google.');
 if(disclaimer){disclaimer.text='Angebotsentwurf · Konditionen offen. Über die Löschung entscheidet Google.';disclaimer.w=186;disclaimer.fontSize=7;}
 return c;
}
