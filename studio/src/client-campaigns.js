import {createCampaign,uid} from './core.js';
export const CLIENT_CAMPAIGNS=[{id:'money-making-sprint',name:'Money Making Sprint',source:'https://www.money-making-sprint.de/',target:'https://www.money-making-sprint.de/termin',description:'Persönliche Einladung zum Strategiegespräch für Agenturinhaber.'}];
export function createClientCampaign(id){
 const client=CLIENT_CAMPAIGNS.find(c=>c.id===id);if(!client)throw new Error('Unbekanntes Kundenkonzept.');
 const c=createCampaign(true),black='#141216',white='#faf9f6',lime='#dbff00',purple='#7338ea',muted='#665f6d';
 const text=(value,x,y,w,h,size=12,color=white,weight='400')=>({id:uid(),type:'text',text:value,x,y,w,h,fontSize:size,color,weight,align:'left',background:'transparent',autoFit:true});
 const shape=(x,y,w,h,color)=>({...text('',x,y,w,h),type:'shape',background:color});
 c.name=client.name+' · Dein nächster Kunde';c.templateId=client.id;c.sample=true;c.onboarding={active:false,step:5,personalizationSkipped:false};
 c.brief={sender:client.name,audience:'Inhaber von Agenturen und B2B-Dienstleistungsunternehmen',goal:'appointment',offer:'Persönliche Einladung zum Strategiegespräch'};
 c.recipients=[['Anna','Studio Nordlicht'],['Jonas','Westend Digital'],['Sarah','Fokus Kreativ']].map(([first_name,company],i)=>({id:uid(),first_name,company,salutation:`Hey ${first_name},`,personal_note:'Wenn neue Projekte vor allem über Empfehlungen kommen, bleibt oft offen, wie voll der nächste Monat wird.',website:'',street:`Beispielweg ${i+1}`,postal_code:'00000',city:'Beispielstadt',country:'Deutschland',chatbot_url:client.target+'?utm_source=kontaktstoff&utm_medium=direct_mail&utm_campaign=mms_pilot&utm_content=demo_'+(i+1)}));
 c.sides.front={background:{kind:'blank',color:'#faf8f2'},fields:[
  shape(146,0,64,148,'#eee8f4'),shape(146,0,2,148,purple),
  text('MONEY MAKING SPRINT',14,11,122,7,10,black,'700'),
  text('Hey {{first_name}},',14,29,122,14,26,black,'700'),
  text('du lieferst für deine Kunden. Aber woher\nkommt der nächste Auftrag?',14,49,121,16,13.5,black),
  text('{{personal_note}}',14,70,121,23,12.5,muted),
  text('Lass uns anschauen, wie ihr bei {{company}} passende Kunden gezielter ansprechen könnt.',14,99,121,21,12.5,black),
  text('Viele Grüße',14,127,92,6,11,muted),text('Jakob',14,134,80,9,18,purple,'700'),
  text('PERSÖNLICH FÜR',155,12,46,5,7.5,muted,'700'),text('{{company}}',155,22,46,23,13,black,'700'),
  text('DEIN NÄCHSTER SCHRITT',155,54,46,6,7,muted,'700'),
  text('Ein Gespräch.\nÜber eure\nAkquise.',155,65,46,28,18,black,'700'),
  {...text('{{chatbot_url}}',155,100,36,36),type:'qr',background:'#ffffff'},
  text('Scannen & Termin auswählen',155,139,46,5,7.5,black)
 ]};
 c.sides.back={background:{kind:'blank',color:'#faf8f2'},fields:[
  shape(143,0,67,148,black),shape(153,13,43,2,lime),
  text('FÜR AGENTUREN & B2B-DIENSTLEISTER',14,12,120,6,8,purple,'700'),
  text('Damit sich das Gespräch\nfür dich lohnt.',14,28,119,27,25,black,'700'),
  text('01  Wo steht ihr gerade?',14,64,118,8,13,black,'700'),
  text('Wie gewinnt ihr heute Kunden – und was soll sich ändern?',14,76,117,12,11.5,muted),
  text('02  Wen wollt ihr erreichen?',14,94,118,8,13,black,'700'),
  text('Welche Unternehmen passen zu eurem Angebot?',14,106,117,12,11.5,muted),
  text('03  Was wäre ein sinnvoller nächster Schritt?',14,124,118,8,12,black,'700'),
  text('Gemeinsam prüfen, ob und wie wir euch helfen können.',14,135,117,8,10.5,muted),
  text('MONEY MAKING\nSPRINT',153,25,47,20,16,white,'700'),
  text('Eure Akquise.\nPersönlich\nbesprochen.',153,56,47,30,20,white,'700'),
  {...text('{{chatbot_url}}',153,98,37,37),type:'qr',background:'#ffffff'},
  text('Für {{first_name}} · Termin auswählen',153,138,47,6,7.5,white)
 ]};return c;
}
