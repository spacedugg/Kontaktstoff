import {createCampaign,uid} from './core.js';
import {createCartCampaign} from './cart-campaigns.js';
import {createBewertungspush} from './bewertungspush.js';
export const CLIENT_CAMPAIGNS=[{id:'reha-sleep',name:'RehaSleep',source:'https://reha-sleep.de/',target:'https://reha-sleep.de/products/lattenrost-elektrisch-verstellbar',description:'Persönliche Warenkorb-Erinnerung für mehr Komfort zu Hause.'},{id:'zyvo',name:'ZYVO',source:'https://zyvo.de/en',target:'https://zyvo.de/en/products/one',description:'Warenkorb-Rückgewinnung mit der persönlichen Produktauswahl.'},{id:'bewertungspush',name:'BewertungsPush',source:'https://bewertungspush.de/',target:'https://bewertungspush.de/suche',description:'Persönliche Profilprüfungs-Einladung für lokale Betriebe.'},{id:'money-making-sprint',name:'Money Making Sprint',source:'https://www.money-making-sprint.de/',target:'https://www.money-making-sprint.de/termin',description:'Persönliche Einladung zum Strategiegespräch für Agenturinhaber.'}];
export function createClientCampaign(id){
 if(['reha-sleep','zyvo'].includes(id))return createCartCampaign(id);
 if(id==='bewertungspush')return createBewertungspush();
 const client=CLIENT_CAMPAIGNS.find(c=>c.id===id);if(!client)throw new Error('Unbekanntes Kundenkonzept.');
 const c=createCampaign(true),black='#131216',white='#faf8f2',lime='#dbff00',purple='#7338ea';
 const text=(value,x,y,w,h,size=12,color=black,weight='400')=>({id:uid(),type:'text',text:value,x,y,w,h,fontSize:size,color,weight,align:'left',background:'transparent',autoFit:true});
 const shape=(x,y,w,h,color)=>({...text('',x,y,w,h),type:'shape',background:color});
 c.name=client.name+' · Dein nächster Kunde';c.templateId=client.id;c.sample=true;c.onboarding={active:false,step:5,personalizationSkipped:false};
 c.brief={sender:client.name,audience:'Inhaber von Agenturen und B2B-Dienstleistungsunternehmen',goal:'appointment',offer:'Eine persönliche Einladung von Jakob zum Gespräch über die eigene Kundengewinnung'};
 c.recipients=[
  {first_name:'Anna',company:'Studio Nordlicht',segment:'Webdesign',personal_note:'Ihr baut Websites, die für eure Kunden arbeiten. Wie sieht es mit eurer eigenen Kundengewinnung aus? Wenn Empfehlungen gerade ausbleiben: Woher kommt dann das nächste Projekt?'},
  {first_name:'Jonas',company:'Westend Digital',segment:'KI & Automation',personal_note:'Ihr macht Prozesse für eure Kunden einfacher. Wie wiederholbar ist eure eigene Akquise? Wenn jedes neue Projekt wieder bei null beginnt, lohnt sich ein Blick auf den Ablauf.'},
  {first_name:'Sarah',company:'Fokus Kreativ',segment:'Content & Kreation',personal_note:'Ihr macht Marken sichtbar. Aber wer sorgt dafür, dass die passenden Unternehmen euch finden? Wenn zwischen Kundenprojekten kaum Zeit für Akquise bleibt, lass uns darüber sprechen.'}
 ].map((r,i)=>({...r,id:uid(),salutation:`Hey ${r.first_name},`,website:'',street:`Beispielweg ${i+1}`,postal_code:'00000',city:'Beispielstadt',country:'Deutschland',chatbot_url:client.target+'?utm_source=kontaktstoff&utm_medium=direct_mail&utm_campaign=mms_pilot&utm_content=demo_'+(i+1)}));
 c.sides.front={background:{kind:'blank',color:black},fields:[
  shape(198,0,12,148,purple),text('MONEY MAKING SPRINT',13,11,154,9,13,white,'700'),text('↗',174,8,19,19,34,lime,'700'),
  shape(13,35,100,17,lime),text('Hey {{first_name}},',17,38,92,13,23,black,'700'),
  text('wer holt den\\nnächsten Kunden\\nfür euch rein?'.replaceAll('\\n','\n'),13,61,176,53,38,white,'700'),
  text('EINE PERSÖNLICHE FRAGE AN',13,125,117,6,8,'#b8b2c2','700'),text('{{company}}',13,134,154,9,15,white,'700'),text('VON JAKOB',163,132,29,7,8,lime,'700')
 ]};
 c.sides.back={background:{kind:'blank',color:white},fields:[
  text('MONEY MAKING SPRINT',14,10,132,8,11,black,'700'),shape(171,10,25,3,lime),
  text('{{salutation}}',14,29,182,13,23,black,'700'),text('{{personal_note}}',14,49,181,30,15,black),
  text('Im Money Making Sprint schauen wir auf euer Angebot, eure Wunschkunden und einen Akquise-Ablauf, den ihr wiederholen könnt.',14,88,122,24,12,black),
  text('Lass uns über {{company}} sprechen.',14,119,123,10,12,black,'700'),text('Jakob',14,132,74,11,21,purple,'700'),
  {...text('{{chatbot_url}}',153,87,40,40),type:'qr',background:'#ffffff'},text('Lass quatschen. ↗',148,131,50,8,12,black,'700'),text('money-making-sprint.de/termin',148,141,50,5,6.5,purple)
 ]};return c;
}
