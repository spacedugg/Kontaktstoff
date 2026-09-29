import {uid} from './core.js';

export const REHA_COLLECTION_URL='https://reha-sleep.de/collections/all';
// Confirmed campaign offer. No per-recipient product/checkout data is required.
export function applyRehaSleepOffer(project){
 const c=structuredClone(project);if(c.templateId!=='reha-sleep')return c;
 const dl=c.format==='selfmailer-dl-4',blue='#1878b9';
 c.brief={...c.brief,offer:'30 € Rabatt mit Schlaf30. QR-Code zur Produktübersicht; kein individueller Warenkorb-Link.',audience:'Abgebrochene Checkouts der letzten 90 Tage mit vorhandener Postanschrift'};
 for(const r of c.recipients){r.coupon_code='Schlaf30';r.offer_text='30 € Rabatt';r.collection_url=REHA_COLLECTION_URL;r.cart_url=REHA_COLLECTION_URL;r.chatbot_url=REHA_COLLECTION_URL;r.personal_note='Sie haben sich bei RehaSleep umgesehen, aber noch nicht entschieden? Wir machen Ihnen den nächsten Schritt leichter: Mit dem Code Schlaf30 erhalten Sie 30 € Rabatt auf Ihre Bestellung. Entdecken Sie in Ruhe, was zu Ihnen passt.';}
 for(const [side,art] of Object.entries(c.sides))for(const f of art.fields){
  if(f.type==='image'&&f.variantKey){delete f.variantKey;delete f.variants;}
  if(f.type==='qr')f.text=REHA_COLLECTION_URL;
  if(f.type!=='text')continue;
  const replacements={
   'Ihr Komfort.\nNoch einen\nSchritt entfernt.':'Mehr Komfort.\nJetzt mit\n30 € Rabatt.',
   'Ihre Auswahl verdient\neinen zweiten Blick.':'30 € für Ihren nächsten Einkauf.\nIhr Code: Schlaf30',
   '100 Nächte Probeschlafen':'30 € Rabatt · Schlaf30',
   'Auswahl ansehen →':'30 € Rabatt sichern →',
   'Ihre Auswahl ansehen →':'Ihr Code: Schlaf30 →',
   'Ihre Auswahl ansehen':'30 € für Ihren\nnächsten Einkauf.',
   '{{product_name}}':'Komfort für Ihr Zuhause',
   '{{product_variant}}':'',
   'IHRE AUSWAHL':'UNSER SORTIMENT',
   'Hier geht es\nfür Sie weiter.':'Entdecken Sie\nunser Sortiment.',
   'Scannen. Auswahl ansehen.\nIn Ruhe entscheiden.':'Shop entdecken.\nMit Schlaf30 sparen.',
   'Scannen & ansehen':'Zum Sortiment',
   '{{chatbot_url}}':'reha-sleep.de/collections/all'
  };
  if(Object.hasOwn(replacements,f.text))f.text=replacements[f.text];
 }
 const y=dl?136:95;
 // Replace the old product-selection block with a clear coupon panel.
 c.sides.back.fields=c.sides.back.fields.filter(f=>f.brandRole!=='reha-offer'&&!(dl?(f.x<140&&f.y>=139&&f.y<192):(f.x<140&&f.y>=92&&f.y<132)));
 const text=(value,x,y,w,h,size=11,weight='400')=>({id:uid(),type:'text',text:value,x,y,w,h,fontSize:size,color:blue,weight,align:'left',background:'transparent',autoFit:true,brandRole:'reha-offer'});
 c.sides.back.fields.push({...text('',12,y,120,dl?44:37),type:'shape',background:'#e5eff4'},text('IHR RABATTCODE FÜR 30 €',17,y+4,110,6,9,'700'),text('Schlaf30',17,y+12,110,13,25,'700'),text('Code im Checkout eingeben\nund 30 € sparen.',17,y+26,110,11,10));
 return c;
}
