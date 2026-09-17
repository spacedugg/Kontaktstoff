import {createCampaign,uid} from './core.js';
import {examplePhoto,interiorPhoto,coffeePhoto} from './example-photo.js';
export const PROMOTIONS=[
 {id:'chattastic',name:'chattastic',category:'KI & KUNDENDIALOG',title:'Eine Karte. Ein erstes Gespräch.',description:'Ein persönlicher Einstieg zum Website-Assistenten. Mit Teamfoto, konkretem Nutzen und eigenem QR-Link.',color:'#2563eb',photo:'team-work.jpg',credit:'Vitaly Gariev',source:'https://unsplash.com/photos/two-colleagues-collaborating-on-a-project-at-a-desk-UUcgVSq2m3g'},
 {id:'raumwerk',name:'raumwerk',category:'EINRICHTUNG & BERATUNG',title:'Raum für neue Ideen.',description:'Eine ruhige Einladung zur Einrichtungsberatung. Mit großem Interior-Foto und persönlicher Ansprache.',color:'#435345',photo:'interior.jpg',credit:'NEW DATA SERVICES',source:'https://unsplash.com/photos/two-chairs-near-the-window-nZ50HrjAFNc'},
 {id:'morgen',name:'morgen.',category:'KAFFEE & TEAMEVENT',title:'Guter Kaffee. Gute Gespräche.',description:'Eine warme Einladung zum Team-Tasting. Mit Café-Fotografie, kräftiger Typografie und persönlichem Zugang.',color:'#9b422b',photo:'coffee.jpg',credit:'Long Chung',source:'https://unsplash.com/photos/modern-cafe-interior-with-wooden-counter-and-baristas-kgiyCobwS-Y'}
];
const text=(value,x,y,w,h,size=12,color='#18263b',weight='400')=>({id:uid(),type:'text',text:value,x,y,w,h,fontSize:size,color,weight,align:'left',background:'transparent',autoFit:true});
const shape=(x,y,w,h,color)=>({...text('',x,y,w,h),type:'shape',background:color});
const photo=(data,x,y,w,h)=>({...text('',x,y,w,h),type:'image',data,fit:'cover'});
const qr=(x,y,size)=>({...text('{{chatbot_url}}',x,y,size,size),type:'qr',background:'#ffffff'});
const page=(color,fields)=>({background:{kind:'blank',color},fields});
// Shared native designs: homepage, editor, 3D, tutorial and exports all render these fields.
export function createPromotion(id='chattastic',{sample=true}={}){
 const theme=PROMOTIONS.find(p=>p.id===id)||PROMOTIONS[0],c=createCampaign(true);
 c.templateId=theme.id;c.sample=sample;c.name=theme.name+' · '+(sample?'Beispielkampagne':'Meine Kampagne');
 c.brief={sender:theme.name,audience:sample?'Drei fiktive Unternehmen zum Ausprobieren':'',goal:theme.id==='chattastic'?'chatbot':'appointment',offer:theme.title};
 c.onboarding={active:!sample,step:sample?5:0,personalizationSkipped:false};
 if(sample)c.recipients=createCampaign().recipients.map((r,i)=>({...r,street:`Beispielweg ${i+1}`,postal_code:'00000',city:'Beispielstadt',country:'Deutschland',chatbot_url:theme.id==='chattastic'?`https://chattastic.de/?beispiel=${['nordlicht','hafenblick','bergmann'][i]}`:`https://example.org/?demo=${theme.id}-${i+1}`}));
 if(theme.id==='chattastic'){
  const ink='#0f172a',blue='#2563eb',muted='#475569';
  c.sides.front=page('#f7f9fc',[
   shape(117,0,93,148,'#e7edf6'),photo(examplePhoto,117,0,93,148),
   text('chattastic.',12,11,88,12,23,ink,'700'),text('DEINE WEBSITE KANN MEHR.',12,33,101,6,9,blue,'700'),
   text('Gute Fragen.\nSofort eine\nAntwort.',12,45,100,46,33,ink,'700'),
   text('Dein KI-Assistent beantwortet Kundenfragen.\nAuch wenn dein Team gerade anderes vorhat.',12,98,97,19,11,muted),
   shape(12,124,93,13,blue),text('Deinen Assistenten kennenlernen  →',17,128,84,7,10,'#ffffff','700'),
   shape(123,102,81,36,'#ffffff'),shape(123,102,2,36,blue),
   text('EIN PERSÖNLICHER EINBLICK FÜR',129,109,69,5,7.5,muted,'700'),
   text('{{company}}',129,119,69,12,15,ink,'700')
  ]);
  c.sides.back=page('#ffffff',[
   shape(133,0,77,148,'#eef3ff'),text('chattastic.',12,11,107,11,20,ink,'700'),
   text('{{salutation}}',12,33,109,12,17,ink,'700'),
   text('Deine nächste Anfrage\nbeginnt mit einer Antwort.',12,50,109,26,23,ink,'700'),
   text('Auf deiner Website steckt viel Wissen. Mach es im Gespräch zugänglich – mit einem Assistenten, der dein Angebot kennt.',12,82,108,23,11,muted),
   shape(12,114,109,2,'#eef1f6'),text('Website-Wissen nutzen\nFragen rund um die Uhr beantworten\nBesucher zum nächsten Schritt begleiten',12,121,110,19,10,muted),
   text('FÜR {{company}}',142,13,58,15,9,ink,'700'),
   qr(147,36,49),text('Scannen. Fragen.\nKennenlernen.',142,93,59,19,17,ink,'700'),
   text('Dein persönlicher Zugang',142,117,58,6,9,muted),text('{{chatbot_url}}',142,127,58,14,7.5,blue)
  ]);
 }else if(theme.id==='raumwerk'){
  const ink='#354636',muted='#5c6759';
  c.sides.front=page('#f4f1e8',[
   photo(interiorPhoto,103,0,107,148),text('raumwerk',12,11,84,12,24,ink,'700'),
   text('RÄUME FÜR DEIN TEAM',12,37,82,6,8,muted,'700'),text('Mehr Raum.\nFür gute\nArbeit.',12,51,87,45,31,ink,'700'),
   text('Ein neuer Blick auf die Orte,\nan denen deine Ideen entstehen.',12,104,84,14,11,muted),
   shape(12,127,79,2,ink),text('Deine Einladung zur Raumberatung  →',12,133,85,6,9,ink,'700'),
   shape(111,113,91,27,'#f4f1e8'),text('PERSÖNLICH FÜR',117,119,78,5,8,muted),text('{{company}}',117,127,78,8,13,ink,'700')
  ]);
  c.sides.back=page('#f4f1e8',[
   shape(133,0,77,148,ink),text('raumwerk',12,11,106,11,22,ink,'700'),text('{{salutation}}',12,35,107,12,17,ink,'700'),
   text('Wie könnte sich\ndein Büro anfühlen?',12,52,107,25,25,ink,'700'),
   text('Konzentriert arbeiten. Gemeinsam denken. Gern zusammenkommen. Wir entdecken mit dir, was in deinen Räumen steckt.',12,84,107,24,12,muted),
   text('Ein erstes Gespräch.\nEin frischer Blick auf deine Arbeitswelt.',12,122,107,16,11,ink),
   text('DEINE PERSÖNLICHE EINLADUNG',142,17,58,12,9,'#f4f1e8','700'),qr(147,39,49),
   text('Lass uns\nRaum schaffen.',142,99,59,21,17,'#ffffff','700'),text('{{chatbot_url}}',142,128,58,13,7.5,'#f4f1e8')
  ]);
 }else{
  const ink='#532b20',cream='#fff2dc';
  c.sides.front=page(cream,[
   photo(coffeePhoto,0,0,210,93),shape(0,0,72,26,cream),text('morgen.',10,7,57,14,27,ink,'700'),
   shape(126,64,77,22,cream),text('EINE EINLADUNG FÜR',132,69,64,5,7.5,ink),text('{{company}}',132,77,64,7,12,ink,'700'),
   text('Guter Kaffee.\nGute Gespräche.',12,100,135,34,30,ink,'700'),shape(160,104,37,32,'#9b422b'),
   text('TEAM\nTASTING',165,111,28,18,13,cream,'700'),text('Zusammen probieren. Neues entdecken.  →',12,137,142,6,9,ink)
  ]);
  c.sides.back=page(cream,[
   shape(132,0,78,148,'#9b422b'),text('morgen.',12,11,107,13,27,ink,'700'),text('{{salutation}}',12,36,108,12,17,ink,'700'),
   text('Die beste Pause?\nDie gemeinsame.',12,53,108,27,25,ink,'700'),
   text('Bring dein Team an einen Tisch. Entdeckt gemeinsam neue Kaffees, tauscht Ideen aus und genießt den Moment.',12,88,107,25,12,ink),
   text('Deine Einladung zum Team-Tasting.\nKleine Auszeit. Viel Gesprächsstoff.',12,124,107,15,11,ink),
   text('FÜR {{company}}',142,16,58,13,9,cream,'700'),qr(146,39,49),text('Lust auf eine\ngute Pause?',142,99,58,20,17,cream,'700'),
   text('{{chatbot_url}}',142,129,58,12,7.5,cream)
  ]);
 }
 return c;
}
