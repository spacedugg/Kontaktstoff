import {createCampaign,uid} from './core.js';
import {examplePhoto,interiorPhoto,coffeePhoto} from './example-photo.js';
export const PROMOTIONS=[
 {id:'chattastic',name:'chattastic',category:'KI & KUNDENDIALOG',title:'Eine Karte. Ein erstes Gespräch.',description:'Ein Brief mit einer konkreten Idee für die Website. Außen ein Gespräch, innen eine persönliche Nachricht.',color:'#2563eb',photo:'team-work.jpg',credit:'Vitaly Gariev',source:'https://unsplash.com/photos/two-colleagues-collaborating-on-a-project-at-a-desk-UUcgVSq2m3g'},
 {id:'raumwerk',name:'raumwerk',category:'EINRICHTUNG & BERATUNG',title:'Raum für neue Ideen.',description:'Architektur-Fotografie trifft auf eine persönliche Einladung: gemeinsam auf die eigenen Räume schauen.',color:'#435345',photo:'interior.jpg',credit:'NEW DATA SERVICES',source:'https://unsplash.com/photos/two-chairs-near-the-window-nZ50HrjAFNc'},
 {id:'morgen',name:'morgen.',category:'KAFFEE & TEAMEVENT',title:'Guter Kaffee. Gute Gespräche.',description:'Ein Kaffee-Ticket fürs Team. Kräftige Typografie, warme Farben und eine Einladung auf Augenhöhe.',color:'#9b422b',photo:'coffee.jpg',credit:'Long Chung',source:'https://unsplash.com/photos/modern-cafe-interior-with-wooden-counter-and-baristas-kgiyCobwS-Y'}
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
 const notes={
  chattastic:[
   'Zwischen Exposé und Besichtigung kommen oft ähnliche Fragen auf. Wie wäre es mit einem Assistenten, der euren Interessenten schon auf der Website weiterhilft?',
   'Neue Projekte beginnen oft mit denselben Fragen: Was bietet ihr an? Wie läuft die Zusammenarbeit? Ein Website-Assistent könnte den ersten Einstieg leichter machen.',
   'Heizungstausch, Wartung oder eine erste Beratung: Ein Website-Assistent könnte das Anliegen vorab klären, bevor euer Team übernimmt.'
  ],
  raumwerk:[
   'Ihr helft anderen, den passenden Ort zu finden. Vielleicht lohnt sich auch ein frischer Blick auf den Ort, an dem euer eigenes Team zusammenkommt.',
   'Gute Ideen brauchen Platz. Zum konzentrierten Arbeiten genauso wie zum gemeinsamen Weiterdenken. Wie gut unterstützen eure Räume diesen Wechsel?',
   'Zwischen Baustelle, Planung und Kundentermin ist euer Büro der gemeinsame Anlaufpunkt. Was würde diesen Ort für euer Team noch besser machen?'
  ],
  morgen:[
   'Ihr findet jeden Tag Räume für andere. Wir hätten einen Tisch für euch – und einen guten Anlass, mal über etwas anderes als Immobilien zu sprechen.',
   'Zwischen Projekten und neuen Ideen darf auch mal Platz für eine Pause sein. Wie wäre es mit einer, bei der ihr gemeinsam etwas Neues probiert?',
   'Nach Terminen, Baustellen und vollen Tagen hat euer Team eine gemeinsame Pause verdient. Wir hätten da frisch gerösteten Gesprächsstoff.'
  ]
 };
 if(sample)c.recipients.forEach((r,i)=>r.personal_note=notes[theme.id][i]);
 c.designRevision=2;
 if(theme.id==='chattastic'){
  const ink='#152642',blue='#2458ee',pale='#e9f0ff';
  c.sides.front=page(blue,[
   text('chattastic.',12,10,96,12,23,'#ffffff','700'),
   text('EINE IDEE FÜR',131,12,67,5,8,'#cdddff','700'),text('{{company}}',131,20,67,13,13,'#ffffff','700'),
   text('{{first_name}},',12,36,106,18,31,'#dfff87','700'),
   text('wer antwortet,\nwenn ihr gerade\nkeine Zeit habt?',12,55,108,54,31,'#ffffff','700'),
   text('Lass deine Website das Gespräch beginnen.',12,121,105,15,12,'#ffffff'),
   shape(129,45,69,64,'#ffffff'),text('EINE FRAGE NACH FEIERABEND',135,52,57,6,7,blue,'700'),
   shape(140,65,52,13,blue),text('Passt euer Angebot zu mir?',144,69,44,6,9,'#ffffff'),
   shape(135,82,57,19,pale),text('Lass uns gemeinsam schauen.\nWas möchtest du wissen?',139,87,49,12,10,ink),
   photo(examplePhoto,129,114,23,23),text('Mehr Raum für\nechte Gespräche.',157,117,41,17,11,'#ffffff','700')
  ]);
  c.sides.back=page('#fffdf8',[
   text('chattastic.',14,10,107,11,19,ink,'700'),text('EINE PERSÖNLICHE IDEE FÜR',137,11,59,5,7,blue,'700'),text('{{company}}',137,18,59,11,11,ink,'700'),
   shape(14,32,182,2,'#d8dfeb'),text('{{salutation}}',14,41,174,11,20,ink,'700'),
   text('{{personal_note}}',14,59,174,29,14,ink),
   text('Wenn das für euch interessant klingt: Schau dir an, wie ein Gespräch mit einem Website-Assistenten aussehen kann.',14,94,119,21,12,ink),
   text('Was meinst du?\nDein Team von chattastic',14,123,111,15,12,ink,'700'),
   qr(155,96,36),text('DEMO ANSEHEN ↗',151,136,46,6,8,blue,'700')
  ]);
 }else if(theme.id==='raumwerk'){
  const ink='#2d4038',cream='#f2eee4',muted='#59675f';
  c.sides.front=page(cream,[
   photo(interiorPhoto,0,0,210,148),shape(10,10,66,20,cream),text('raumwerk',15,14,56,12,23,ink,'700'),
   shape(112,10,88,20,cream),text('EIN NEUER BLICK AUF DIE RÄUME VON',117,14,78,5,7,muted,'700'),text('{{company}}',117,21,78,7,12,ink,'700'),
   shape(10,82,190,56,ink),text('{{first_name}},',17,89,69,13,22,'#dce4bc','700'),
   text('wie wollt ihr\nmorgen arbeiten?',17,105,133,28,28,cream,'700'),text('LASS UNS\nDARÜBER\nSPRECHEN. ↗',162,107,29,23,9,cream,'700')
  ]);
  c.sides.back=page(cream,[
   text('raumwerk',13,10,101,11,21,ink,'700'),text('KEIN KATALOG. EIN GESPRÄCH.',121,13,75,7,8,muted,'700'),shape(13,29,183,2,'#b6beb0'),
   text('{{salutation}}',13,39,77,12,19,ink,'700'),text('{{personal_note}}',13,58,110,39,13,ink),
   text('Bring eine Frage zu euren Räumen mit.\nWir bringen einen frischen Blick.\nDein Team von raumwerk',13,110,111,25,12,ink),
   shape(136,39,2,97,'#b6beb0'),text('01 / ANKOMMEN',145,39,52,6,8,muted,'700'),text('{{company}}',145,49,52,14,14,ink,'700'),
   text('02 / WEITERDENKEN',145,72,52,6,8,muted,'700'),text('Dein Raumgespräch\nbeginnt hier.',145,82,52,16,13,ink,'700'),
   qr(145,104,31),text('SCAN &\nKONTAKT ↗',179,114,19,14,8,muted,'700')
  ]);
 }else{
  const ink='#612d20',cream='#fff2dc',orange='#b84929';
  c.sides.front=page(cream,[
   photo(coffeePhoto,144,0,66,148),shape(144,115,66,33,orange),text('morgen.',12,9,89,14,25,ink,'700'),
   text('FÜR {{first_name}} UND DAS TEAM VON',12,30,122,6,8,ink,'700'),text('{{company}}',12,39,122,12,17,ink,'700'),
   text('KAFFEE.\nKEIN\nMEETING.',10,58,127,67,46,ink,'700'),
   text('Eure Einladung zum gemeinsamen Tasting. ↗',12,134,125,7,9,ink,'700'),
   text('MAL RAUS.\nZUSAMMEN REIN.',152,122,51,20,16,cream,'700')
  ]);
  c.sides.back=page(orange,[
   shape(145,0,65,148,cream),text('morgen.',13,10,115,14,26,cream,'700'),text('{{salutation}}',13,34,119,11,18,cream,'700'),
   text('{{personal_note}}',13,52,116,42,14,cream),
   text('Kaffee probieren. Ins Gespräch kommen.\nEinfach mal zusammen Pause machen.',13,101,116,18,12,cream),text('Wir freuen uns auf euch.\nDein Team von morgen.',13,127,117,15,12,cream,'700'),
   ...Array.from({length:14},(_,i)=>shape(143,4+i*10,2,4,'#d99974')),
   text('EURE KLEINE AUSZEIT',153,13,48,6,8,ink,'700'),text('{{company}}',153,27,48,20,15,ink,'700'),
   qr(154,58,43),text('Seid ihr dabei?',153,109,48,9,15,ink,'700'),text('Termin & Details\nfindet ihr hier. ↗',153,124,48,15,10,ink)
  ]);
 }
 return c;
}
