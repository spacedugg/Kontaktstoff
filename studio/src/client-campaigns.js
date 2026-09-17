import {createCampaign,uid} from './core.js';
export const CLIENT_CAMPAIGNS=[{id:'money-making-sprint',name:'Money Making Sprint',source:'https://www.money-making-sprint.de/',target:'https://www.money-making-sprint.de/termin',description:'Persönliche Einladung zum Strategiegespräch für Agenturinhaber.'}];
export function createClientCampaign(id){
 const client=CLIENT_CAMPAIGNS.find(c=>c.id===id);if(!client)throw new Error('Unbekanntes Kundenkonzept.');
 const c=createCampaign(true),black='#141216',white='#faf9f6',lime='#dbff00',purple='#7338ea',muted='#c8c3d0';
 const text=(value,x,y,w,h,size=12,color=white,weight='400')=>({id:uid(),type:'text',text:value,x,y,w,h,fontSize:size,color,weight,align:'left',background:'transparent',autoFit:true});
 const shape=(x,y,w,h,color)=>({...text('',x,y,w,h),type:'shape',background:color});
 c.name=client.name+' · Dein nächster Kunde';c.templateId=client.id;c.sample=true;c.onboarding={active:false,step:5,personalizationSkipped:false};
 c.brief={sender:client.name,audience:'Inhaber von Agenturen und B2B-Dienstleistungsunternehmen',goal:'appointment',offer:'Persönliche Einladung zum Strategiegespräch'};
 c.recipients=[['Anna','Studio Nordlicht'],['Jonas','Westend Digital'],['Sarah','Fokus Kreativ']].map(([first_name,company],i)=>({id:uid(),first_name,company,salutation:`Hey ${first_name},`,website:'',street:`Beispielweg ${i+1}`,postal_code:'00000',city:'Beispielstadt',country:'Deutschland',chatbot_url:client.target+'?utm_source=kontaktstoff&utm_medium=direct_mail&utm_campaign=mms_pilot&utm_content=demo_'+(i+1)}));
 c.sides.front={background:{kind:'blank',color:black},fields:[
  text('MONEY MAKING\nSPRINT',12,10,92,20,20,white,'700'),shape(145,0,65,90,purple),
  text('↗',153,12,48,58,80,lime,'700'),text('DEIN NÄCHSTER SCHRITT',12,38,126,6,9,lime,'700'),
  text('Gute Arbeit.\nNeue Kunden?',12,50,179,46,43,white,'700'),
  text('Für Agenturen, die ihre Akquise\nselbst in die Hand nehmen wollen.',12,100,139,20,13,muted),
  shape(0,127,210,21,lime),text('FÜR {{first_name}} · {{company}}',12,134,172,8,12,black,'700'),text('→',193,130,12,12,24,black,'700')
 ]};
 c.sides.back={background:{kind:'blank',color:white},fields:[
  shape(137,0,73,148,purple),text('MONEY MAKING SPRINT',12,11,114,9,14,black,'700'),
  text('{{salutation}}',12,34,112,12,21,black,'700'),text('Dein Können verdient\nmehr Gespräche.',12,51,113,27,26,black,'700'),
  text('Du lieferst für deine Kunden. Wie gewinnst du die nächsten? Lass uns über dein Angebot und deine Akquise sprechen.',12,84,112,28,12,black),
  shape(12,123,112,2,'#ded8e5'),text('Ein ehrliches Gespräch über\nden nächsten Schritt für {{company}}.',12,130,112,13,10,black),
  text('DEINE EINLADUNG',145,14,57,8,9,white,'700'),
  {...text('{{chatbot_url}}',147,37,53,53),type:'qr',background:'#ffffff'},
  text('Lass uns\nsprechen.',145,98,58,24,23,white,'700'),text('Scannen & Termin auswählen',145,129,58,10,9,white)
 ]};return c;
}
