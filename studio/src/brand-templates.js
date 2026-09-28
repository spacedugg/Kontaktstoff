import {createCampaign,uid} from './core.js';
import {examplePhoto,interiorPhoto,coffeePhoto} from './example-photo.js';

// Editable native layouts, not flattened artwork. Role names power the simple editor.
export const BRAND_TEMPLATES=[
 {id:'personal-letter',name:'Ein Wort an dich',tag:'Persönliche Einladung',color:'#24483e',paper:'#faf8f1',headline:'Eine Idee.\nExtra für dich.',body:'Manche Ideen verdienen mehr als eine E-Mail. Lass uns gemeinsam herausfinden, was für dich passt.',cta:'Lass uns sprechen',layout:'letter'},
 {id:'bold-type',name:'Großer Auftritt',tag:'Angebot & Aktion',color:'#693fee',paper:'#f5f0ff',headline:'Das könnte\ndein nächster\nSchritt sein.',body:'Ein neuer Blick. Ein konkretes Angebot. Und ein einfacher Weg, mehr zu erfahren.',cta:'Jetzt entdecken',layout:'bold'},
 {id:'return-ticket',name:'Dein Ticket zurück',tag:'Warenkorberinnerung',color:'#ce5037',paper:'#fff5e7',headline:'Noch im Kopf?\nWieder im Korb.',body:'Vielleicht war nur der Moment nicht der richtige. Hier geht es zurück zu deiner Auswahl.',cta:'Zurück zur Auswahl',layout:'ticket'},
 {id:'photo-story',name:'Ein neuer Blick',tag:'Räume & Beratung',color:'#405847',paper:'#f6f3ed',headline:'Mehr Raum\nfür deine Ideen.',body:'Eine persönliche Einladung, Möglichkeiten zu entdecken. Gemeinsam finden wir heraus, was zu dir passt.',cta:'Beratung kennenlernen',layout:'photo',photo:interiorPhoto},
 {id:'product-moment',name:'Dein guter Moment',tag:'Produkt & Genuss',color:'#8b4637',paper:'#fbf2e9',headline:'Etwas Gutes.\nNur für dich.',body:'Kleine Momente machen den Unterschied. Entdecke deine nächste Lieblingsidee.',cta:'Deinen Moment entdecken',layout:'product',photo:coffeePhoto},
 {id:'stacked-note',name:'Bleibt auf dem Tisch',tag:'Karte mit Tiefenwirkung',color:'#165eda',paper:'#edf3ff',headline:'Eine gute Idee\nbleibt hängen.',body:'Kein langes Suchen. Ein persönlicher Vorschlag und der direkte Weg zu mehr Informationen.',cta:'Deinen Vorschlag ansehen',layout:'stack'},
 {id:'editorial',name:'Neue Perspektive',tag:'Hochwertig & reduziert',color:'#282b34',paper:'#f5f1e8',headline:'Zeit für\neine neue\nPerspektive.',body:'Für Entscheidungen, die sich richtig anfühlen. Wir nehmen uns Zeit für deine Fragen.',cta:'Im Gespräch herausfinden',layout:'editorial'},
 {id:'hello-team',name:'Hallo, Team!',tag:'B2B & Kennenlernen',color:'#0d6b71',paper:'#ecf7f5',headline:'Gute Ideen\nbeginnen im\nGespräch.',body:'Was würde euren Alltag leichter machen? Wir haben einen Ansatz, den wir euch gern zeigen.',cta:'Gemeinsam weiterdenken',layout:'team',photo:examplePhoto},
 {id:'invitation',name:'Du bist eingeladen',tag:'Event & Termin',color:'#ac3658',paper:'#fff2f4',headline:'Ein Platz\nfür neue\nMöglichkeiten.',body:'Eine Einladung zum Kennenlernen. Den passenden Zeitpunkt wählst du ganz einfach selbst.',cta:'Deinen Termin auswählen',layout:'invite'},
 {id:'fresh-start',name:'Ein frischer Anfang',tag:'Service & Erstkontakt',color:'#386847',paper:'#f0f5e8',headline:'Weniger Aufwand.\nMehr möglich.',body:'Entdecke, wie unser Angebot deinen nächsten Schritt leichter machen kann.',cta:'Mehr erfahren',layout:'split'}
];
export const PREVIEW_PERSON={company:'Nordlicht Studio',first_name:'Anna',last_name:'Beispiel',salutation:'Hallo Anna,',chatbot_url:'https://example.org/dein-angebot'};
export function createBrandTemplate(id){
 const t=BRAND_TEMPLATES.find(t=>t.id===id);if(!t)throw Error('Diese Vorlage gibt es nicht.');
 const c=createCampaign(true);c.name=t.name;c.templateId=t.id;c.onboarding.active=false;c.brief.sender='DEINE MARKE';
 const ink='#202d2a',white='#ffffff';
 const text=(value,x,y,w,h,size=14,color=ink,role='',weight='700')=>({id:uid(),type:'text',text:value,x,y,w,h,fontSize:size,color,weight,align:'left',background:'transparent',autoFit:true,...(role?{brandRole:role}:{})});
 const box=(x,y,w,h,color)=>({...text('',x,y,w,h),type:'shape',background:color});
 const pic=(data,x,y,w,h)=>({...text('',x,y,w,h),type:'image',data,fit:'cover',brandRole:'photo'});
 const brand=(x=13,y=12,w=120,color=ink)=>text('DEINE MARKE',x,y,w,12,18,color,'brand');
 const title=(x,y,w,h,size=38,color=ink)=>text(t.headline,x,y,w,h,size,color,'headline');
 const note=(x,y,w,color=ink)=>text('Für {{first_name}}',x,y,w,12,13,color);
 const cta=(x,y,w,color=ink)=>text(t.cta+' →',x,y,w,12,13,color,'cta');
 let f=[];
 switch(t.layout){
 case 'letter': f=[box(8,8,194,132,'#ffffff'),box(8,8,3,132,t.color),brand(19,17),note(19,41,160),title(19,59,162,49,40,t.color),cta(19,120,165,t.color),text('↗',167,22,27,27,50,t.color)];break;
 case 'bold': f=[box(0,0,210,148,t.color),brand(12,12,150,white),note(12,33,180,white),title(12,53,188,74,43,white),box(12,128,186,8,'#e2ff54'),text('→',162,105,35,21,44,white)];break;
 case 'ticket': f=[brand(),note(13,35,135),title(13,56,126,55,33,t.color),cta(13,122,130,t.color),box(152,0,58,148,t.color),text('DEIN\nCOME\nBACK.',161,25,40,72,32,white),text('EINLADUNG',160,119,41,10,9,white),...Array.from({length:14},(_,i)=>box(149,5+i*10,2,5,'#dabdaf'))];break;
 case 'photo': f=[pic(t.photo,95,0,115,148),box(0,0,103,148,t.paper),brand(12,12,82),title(12,47,85,60,32,t.color),cta(12,118,83,t.color),box(122,111,77,25,white),note(128,118,65)];break;
 case 'product': f=[pic(t.photo,106,0,104,148),brand(12,12,88),note(12,39,90),title(12,58,92,51,31,t.color),cta(12,121,91,t.color),box(116,114,84,22,t.paper),text('FÜR DEINEN ALLTAG',122,122,70,8,10,t.color)];break;
 case 'stack': f=[box(27,27,172,111,'#c7d6ef'),box(20,19,172,111,t.color),box(13,11,172,111,white),brand(24,21),note(24,45,150,t.color),title(24,62,147,42,35,t.color),cta(24,109,150,t.color)];break;
 case 'editorial': f=[brand(),box(13,33,184,2,t.color),text('01',145,40,52,36,70,t.color),title(13,45,134,72,37),box(13,121,184,2,t.color),note(13,130,92),cta(106,131,91)];break;
 case 'team': f=[pic(t.photo,111,0,99,148),box(0,0,119,148,t.color),brand(12,12,94,white),title(12,46,97,73,33,white),cta(12,127,95,white),box(135,113,65,25,white),note(140,120,56)];break;
 case 'invite': f=[box(8,8,194,132,t.color),box(12,12,186,124,t.paper),brand(24,22,162,t.color),text('PERSÖNLICHE EINLADUNG',24,44,162,8,10,t.color),title(24,60,162,57,37,t.color),note(24,121,92,t.color),text('↗',158,115,27,18,30,t.color)];break;
 default: f=[box(128,0,82,148,t.color),brand(13,12,106),note(13,38,106),title(13,61,109,51,31,t.color),cta(13,126,105,t.color),text('→',140,37,60,61,80,white),text('FÜR\nDICH.',143,108,56,26,25,white)];
 }
 c.sides.front={background:{kind:'blank',color:t.paper},fields:f};
 const ticket=t.layout==='ticket',band=['bold','invite','stack'].includes(t.layout);
 c.sides.back={background:{kind:'blank',color:t.paper},fields:[
  ...(band?[box(0,0,210,29,t.color)]:[]),brand(13,11,175,band?white:ink),
  text('{{salutation}}',13,40,116,12,18,t.color),text(t.body,13,61,112,42,16,ink,'body','400'),
  text('Dein Team von DEINE MARKE',13,114,113,13,13,t.color,'signature'),
  box(143,38,54,91,white),{...text('{{chatbot_url}}',151,46,38,38),type:'qr',background:white},
  text(t.cta+' →',149,91,42,26,13,t.color,'cta'),
  ...(ticket?[box(13,134,184,2,t.color)]:[]),
  text('{{chatbot_url}}',13,135,182,7,8,ink,'','400')
 ]};for(const side of Object.values(c.sides))for(const f of side.fields)if(f.color===white)f.brandOnAccent=true;return c;
}
export function brandValue(project,role){return Object.values(project.sides).flatMap(s=>s.fields).find(f=>f.brandRole===role)?.text||'';}
export function applyBrandText(project,role,value){for(const side of Object.values(project.sides))for(const f of side.fields)if(f.brandRole===role){if(f.text!==value)f.text=value;}if(role==='brand'){project.brief.sender=value;for(const side of Object.values(project.sides))for(const f of side.fields)if(f.brandRole==='signature')f.text='Dein Team von '+value;}}
export function recolorBrand(project,color){const t=BRAND_TEMPLATES.find(t=>t.id===project.templateId);if(!t||!/^#[0-9a-f]{6}$/i.test(color))return;const old=project.brandColor||t.color;for(const s of Object.values(project.sides)){if(s.background.color===old)s.background.color=color;for(const f of s.fields){if(f.color===old)f.color=color;if(f.brandOnAccent){const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));f.color=(rgb[0]*299+rgb[1]*587+rgb[2]*114)/1000>150?'#202d2a':'#ffffff';}if(f.background===old)f.background=color;}}project.brandColor=color;}
