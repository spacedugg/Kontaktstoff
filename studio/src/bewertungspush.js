import {createCampaign,uid} from './core.js';
import {brandLogoDark} from './bewertungspush-art.js';
import {editorialFront,editorialBack} from './bewertungspush-layout-art.js';
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
 c.sides.front={background:{kind:'blank',color:'#fcfcfa'},fields:[
  image(editorialFront,0,0,210,148),
  image(brandLogoDark,12,11,66,10.82),
  {...t('{{company}}',111,12,87,7,10,ink,'700'),align:'right'},
  {...t('Für {{first_name}} {{last_name}}',111,21,87,6,8,muted),align:'right'},
  t('GUTE ARBEIT. GUTER RUF.',12,37,96,6,7.5,muted,'700'),
  t('Unberechtigte\nBewertungen\nraus.',12,49,96,40,29,ink,'700'),
  t('Ihr guter Ruf\nnach vorn.',12,94,92,23,24,blue,'700'),
  t('Wir kümmern uns um die Löschung.',12,123,94,7,9.5,muted),
  t('BEISPIEL · AUSGANGSWERT',115,99,48,5,6.3,muted,'700'),
  t('{{rating_current}}',115,106,29,18,30,ink,'700'),
  stars('rating_current',146,110,18,4.5),
  t('von 5 Sternen',145,118,20,5,6.5,muted),
  t('BEISPIEL · NACH LÖSCHUNGEN',143,47,50,5,6.4,muted,'700'),
  t('{{rating_example}}',143,54,50,25,50,'#286ce3','700'),
  stars('rating_example',143,79,46,6),
  t('Illustrative Werte, keine Ergebniszusage.',109,130,90,5,6.5,muted),
  t('Keine Vorkasse. Sie zahlen nur bei erfolgreicher Löschung.',12,138,139,5,8.5,'#225ebf','700'),
  {...t('Zur Rückseite →',160,138,38,5,9,ink,'700'),align:'right'}
 ]};
 c.sides.back={background:{kind:'blank',color:'#fcfcfa'},fields:[
  image(editorialBack,0,0,210,148),
  t('PERSÖNLICH FÜR {{company}}',12,12,120,8,8,muted,'700'),
  image(brandLogoDark,145,10,53,8.7),
  t('{{salutation}}',12,36,121,12,19,ink,'700'),
  t('{{personal_note}}',12,55,121,25,12,ink),
  t('Sie wählen die verdächtigen Bewertungen aus. Wir prüfen mögliche Richtlinienverstöße und kümmern uns um den Löschantrag bei Google.',12,84,121,24,11.5,ink),
  t('Keine Vorkasse. Zahlung nur bei Erfolg.',18,112,115,9,11,'#225ebf','700'),
  t('Freundliche Grüße\nIhr Team von BewertungsPush',12,128,121,12,9.5,muted),
  t('Jetzt Bewertungen\nprüfen lassen.',149,39,44,17,14,ink,'700'),
  {...t('{{chatbot_url}}',153,61,35,35),type:'qr',background:'#ffffff'},
  t('Profil finden.\nBewertungen auswählen.\nPrüfung starten.',149,104,44,17,9,muted),
  t('bewertungspush.de/suche',147,124,48,6,8,'#225ebf','700'),
  t('Über die Löschung entscheidet Google.',12,138,186,5,7,muted)
 ]};return c;
}

// Optional sales concept, not an existing offer from the provider.
export function applyBewertungspushOffer(campaign){
 const c=structuredClone(campaign);
 c.name+=' · Angebotsidee';
 const front=c.sides.front.fields;
 const offer=front.find(f=>f.text==='Keine Vorkasse. Sie zahlen nur bei erfolgreicher Löschung.');
 if(offer){offer.text='Erste erfolgreiche Löschung gratis.';offer.fontSize=10;offer.weight='700';offer.color='#225ebf';}
 const note=front.find(f=>f.text==='Illustrative Werte, keine Ergebniszusage.');
 if(note){note.text='Beispielwerte · Angebotsidee, Konditionen offen';note.fontSize=6.5;}
 const back=c.sides.back.fields;
 const promise=back.find(f=>f.text==='Keine Vorkasse. Zahlung nur bei Erfolg.');
 if(promise){promise.text='Erste erfolgreiche Löschung gratis.';promise.fontSize=11;}
 const disclaimer=back.find(f=>f.text==='Über die Löschung entscheidet Google.');
 if(disclaimer){disclaimer.text='Angebotsentwurf · Konditionen offen. Über die Löschung entscheidet Google.';disclaimer.w=186;disclaimer.fontSize=7;}
 return c;
}
