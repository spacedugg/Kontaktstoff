import {createCampaign,uid} from './core.js';
import {examplePhoto} from './example-photo.js';
export const TEMPLATES = [
 {id:'chattastic',name:'chattastic',tag:'CHATBOT & DEMO',description:'Eine persönliche Einladung, den eigenen Website-Assistenten kennenzulernen.',color:'#2563eb',accent:'#ff987d'},
 {id:'dialog',name:'Ein guter Anfang.',tag:'TERMIN & BERATUNG',description:'Starke Typografie und viel Ruhe für ein Angebot, das ein Gespräch verdient.',color:'#243d35',accent:'#e2ff54'},
 {id:'impuls',name:'Ein neuer Impuls.',tag:'ANGEBOT & WEBSITE',description:'Eine warme, klare Karte für deine nächste Produkt- oder Servicekampagne.',color:'#f3b898',accent:'#352b49'}
];
export function createTemplate(id){
 const theme=TEMPLATES.find(t=>t.id===id)||TEMPLATES[0],c=createCampaign(true);
 c.name=theme.id==='chattastic'?'chattastic · Persönlich für Sie':theme.name;c.onboarding.step=0;c.brief.sender=theme.id==='chattastic'?'chattastic':'Deine Marke';c.brief.goal=theme.id==='dialog'?'appointment':theme.id==='impuls'?'website':'chatbot';c.templateId=theme.id;
 const light=theme.id!=='impuls',ink=light?'#ffffff':'#352b49';
 const text=(value,x,y,w,h,size=14,color=ink,weight='700')=>({id:uid(),type:'text',text:value,x,y,w,h,fontSize:size,color,weight,align:'left',background:'transparent',autoFit:true});
 const shape=(x,y,w,h,color)=>({...text('',x,y,w,h),type:'shape',background:color});
 const qr=(x,y,size)=>({...text('{{chatbot_url}}',x,y,size,size),type:'qr',background:'#ffffff'});
 c.sides.front={background:{kind:'blank',color:theme.color},fields:[
  text(theme.id==='chattastic'?'chattastic.':'DEINE MARKE',13,12,95,12,22),text('PERSÖNLICH FÜR',132,14,65,5,8),text('{{company}}',132,21,65,13,14),
  text(theme.id==='chattastic'?'Ihre Website.\nJetzt mit Antworten.':theme.id==='dialog'?'Ein guter Kontakt\nbeginnt mit Ihnen.':'Zeit für einen\nneuen Impuls.',13,43,183,51,42),
  text(theme.id==='chattastic'?'Entdecken Sie, wie ein KI-Assistent Ihre Kundenfragen beantwortet.':theme.id==='dialog'?'Wir haben eine Idee für Ihr Unternehmen. Lassen Sie uns darüber sprechen.':'Ein Angebot, das zu Ihrem Unternehmen passt. Entdecken Sie die Möglichkeiten.',14,100,137,23,13,ink,'400'),
  shape(0,131,210,17,theme.accent),text('Eine Karte. Ihr nächster Schritt.  →',14,136,164,7,12,theme.id==='chattastic'?'#202321':'#243d35')
 ]};
 c.sides.back={background:{kind:'blank',color:'#faf9f5'},fields:[
  shape(125,0,85,148,theme.color),text(theme.id==='chattastic'?'chattastic.':'DEINE MARKE',13,12,102,10,20,'#202321'),
  text('{{salutation}}',13,36,102,12,17,'#202321'),text(theme.id==='chattastic'?'Mehr Antworten.\nMehr Möglichkeiten.':'Lassen Sie uns\nden Anfang machen.',13,54,102,28,25,'#202321'),
  text(theme.id==='chattastic'?'Kundenfragen klären.\nIhr Angebot verständlich machen.\nDen nächsten Kontakt ermöglichen.':'Eine Idee für Ihr Unternehmen.\nPersönlich und unkompliziert.\nDer nächste Schritt beginnt hier.',13,88,102,30,12,'#535b56','400'),
  text('Hier steht Ihr konkretes Angebot.',13,127,102,10,10,'#535b56','400'),
  text('IHR PERSÖNLICHER EINBLICK',135,17,65,10,9),qr(145,42,44),text('Scannen.\nSelbst ausprobieren.',136,95,63,21,17),text('{{chatbot_url}}',136,122,63,15,8)
 ]};
 return c;
}

// A separate, fully populated sandbox campaign. Never changes an existing draft.
export function createExampleCampaign(){
 const c=createTemplate('chattastic');
 c.name='chattastic · Beispielkampagne';c.sample=true;
 c.brief={sender:'chattastic',audience:'Drei fiktive Unternehmen zum Ausprobieren',goal:'chatbot',offer:'Ein persönlicher Website-Assistent, der Kundenfragen beantwortet.'};
 c.onboarding={active:false,step:5,personalizationSkipped:false};
 c.recipients=createCampaign().recipients.map((r,i)=>({...r,street:`Beispielweg ${i+1}`,postal_code:'00000',city:'Beispielstadt',country:'Deutschland',chatbot_url:`https://chattastic.de/?beispiel=${['nordlicht','hafenblick','bergmann'][i]}`}));
 const headline=c.sides.front.fields.find(f=>f.text==='Ihre Website.\nJetzt mit Antworten.');
 Object.assign(headline,{text:'Ihre Website.\nJetzt mit\nAntworten.',x:13,y:43,w:88,h:53,fontSize:32});
 const description=c.sides.front.fields.find(f=>f.text.startsWith('Entdecken Sie'));
 Object.assign(description,{x:13,y:103,w:88,h:20,fontSize:11,text:'Ein KI-Assistent für Ihre Kundenfragen. Lernen Sie ihn kennen.'});
 c.sides.front.fields.push({id:uid(),type:'image',text:'',data:examplePhoto,fit:'cover',x:108,y:43,w:89,h:79,fontSize:12,color:'#ffffff',weight:'400',align:'left',background:'transparent',autoFit:true});
 const offer=c.sides.back.fields.find(f=>f.text==='Hier steht Ihr konkretes Angebot.');
 offer.text='Lernen Sie Ihren Website-Assistenten kennen.';
 return c;
}
