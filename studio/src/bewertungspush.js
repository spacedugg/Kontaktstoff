import {createCampaign,uid} from './core.js';
import {brandLogoLight,brandLogoDark} from './bewertungspush-art.js';
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
 ].map((r,i)=>({...r,id:uid(),industry:r.segment,website:'',street:'',postal_code:'',city:'',country:'Deutschland',chatbot_url:'https://bewertungspush.de/suche?utm_source=kontaktstoff&utm_medium=direct_mail&utm_campaign=profilcheck_pilot&utm_content=beispiel_'+(i+1)}));
 c.sides.front={background:{kind:'blank',color:'#0b1020'},fields:[
  s(132,0,78,148,blue),
  image(brandLogoLight,12,11,72,11.8),
  t('PERSÖNLICH FÜR',12,33,112,6,8,'#a7bdd9','700'),
  t('{{company}}',12,41,112,9,12,'#ffffff','700'),
  t('Unberechtigte\nBewertungen\nloswerden.',12,59,114,39,28,'#ffffff','700'),
  t('Damit Kunden sehen,\nwas Sie wirklich leisten.',12,104,112,16,13,'#b7d6ff'),
  s(12,127,108,2,'#273952'),
  t('Für {{first_name}} {{last_name}}',12,134,112,8,10,'#ffffff','700'),
  t('OHNE VORKASSE STARTEN',142,25,58,7,8,'#ffffff','700'),
  t('0 €',142,39,59,32,62,'#ffffff','700'),
  t('Sie zahlen nur,\nwenn Google löscht.',142,80,58,21,14,'#ffffff','700'),
  s(142,115,58,16,'#ffffff'),
  t('Jetzt prüfen lassen →',146,120,51,9,10,'#17457e','700'),
  t('QR-Code auf der Rückseite',142,137,59,6,8,'#ffffff')
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
  s(143,30,55,109,'#0f2443'),
  t('Jetzt Bewertungen\nprüfen lassen.',149,37,44,16,14,'#ffffff','700'),
  {...t('{{chatbot_url}}',152,60,37,37),type:'qr',background:'#ffffff'},
  t('01  Profil finden\n02  Bewertungen auswählen\n03  Prüfung starten',149,104,44,19,8.5,'#ffffff'),
  t('bewertungspush.de/suche',147,130,48,6,8,'#a8ceff','700'),
  t('Über die Löschung entscheidet Google.',12,140,121,5,7,muted)
 ]};return c;
}

// Optional sales concept, not an existing offer from the provider.
export function applyBewertungspushOffer(campaign){
 const c=structuredClone(campaign);
 c.name+=' · Angebotsidee';
 const front=c.sides.front.fields;
 const eyebrow=front.find(f=>f.text==='OHNE VORKASSE STARTEN');
 if(eyebrow)eyebrow.text='ZUM KENNENLERNEN';
 const price=front.find(f=>f.text==='0 €');
 if(price){price.text='GRATIS';price.fontSize=28;price.y=48;price.h=18;}
 const benefit=front.find(f=>f.text==='Sie zahlen nur,\nwenn Google löscht.');
 if(benefit){benefit.text='Ihre erste erfolgreiche\nLöschung.';benefit.fontSize=13;}
 const note=front.find(f=>f.text==='QR-Code auf der Rückseite');
 if(note){note.text='Angebotsidee · Konditionen offen';note.fontSize=7;}
 const back=c.sides.back.fields;
 const promise=back.find(f=>f.text==='Keine Vorkasse. Zahlung nur bei Erfolg.');
 if(promise){promise.text='Erste erfolgreiche Löschung gratis.';promise.fontSize=11.5;}
 const disclaimer=back.find(f=>f.text==='Über die Löschung entscheidet Google.');
 if(disclaimer){disclaimer.text='Angebotsentwurf · Konditionen offen. Über die Löschung entscheidet Google.';disclaimer.w=186;disclaimer.fontSize=7;}
 return c;
}
