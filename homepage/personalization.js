import {createCampaign,uid} from '../studio/src/core.js';
import {renderCanvas} from '../studio/src/render.js';

export const PERSONAL_EXAMPLES=[
 {first_name:'Anna',company:'Nordlicht Immobilien',headline:'Mehr Zeit für\ndeine Interessenten.',note:'Fragen zum Exposé, zur Lage oder zum nächsten Besichtigungstermin: Ein Website-Assistent könnte dein Team bei den ersten Antworten unterstützen.',url:'https://example.org/demo/nordlicht',destination:'Ein Assistent für Nordlicht Immobilien.',outcome:'Interessenten fragen nach Immobilien und erfahren, wie sie einen Besichtigungstermin anfragen können.'},
 {first_name:'Max',company:'Hotel Hafenblick',headline:'Ein guter Aufenthalt\nbeginnt vor der Anreise.',note:'Parkplätze, Check-in oder Frühstück: Ein Website-Assistent könnte deinen Gästen die ersten Fragen beantworten und deine Rezeption entlasten.',url:'https://example.org/demo/hafenblick',destination:'Ein Assistent für Hotel Hafenblick.',outcome:'Gäste erhalten erste Informationen zur Anreise und finden den Weg zu eurer Buchung oder Rezeption.'},
 {first_name:'Lea',company:'Bergmann Haustechnik',headline:'Aus einer Frage\nwird eine Anfrage.',note:'Heizungstausch oder Wartung: Ein Website-Assistent könnte erste Fragen zum Vorhaben stellen und die Anfrage an dein Team weitergeben.',url:'https://example.org/demo/bergmann',destination:'Ein Assistent für Bergmann Haustechnik.',outcome:'Interessenten beschreiben ihr Vorhaben und erfahren, wie sie eine passende Beratung anfragen können.'}
];
export function createPersonalDemo(){
 const campaign=createCampaign(true),ink='#243b32',green='#526f40';
 const text=(value,x,y,w,h,fontSize=12,color=ink,weight='400')=>({id:uid(),type:'text',text:value,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true});
 const shape=(x,y,w,h,background)=>({...text('',x,y,w,h),type:'shape',background});
 campaign.sides.back={background:{kind:'blank',color:'#fffdf7'},fields:[
  shape(142,0,68,148,'#eaf0df'),text('chattastic.',14,11,108,12,22,ink,'700'),text('{{salutation}}',14,35,114,12,18,ink,'700'),
  text('{{headline}}',14,53,115,27,25,ink,'700'),text('{{personal_note}}',14,87,112,31,12,ink),
  text('Lass uns deine Website ins Gespräch bringen.',14,124,113,7,10,green),text('Dein Team von chattastic',14,134,113,7,11,ink,'700'),
  text('PERSÖNLICH FÜR',151,14,50,5,7.5,green,'700'),text('{{company}}',151,22,50,15,12,ink,'700'),
  {...text('{{chatbot_url}}',155,48,42,42),type:'qr',background:'#ffffff'},text('Deine Demo\nbeginnt hier.',151,99,51,20,17,ink,'700'),text('{{chatbot_url}}',151,128,51,12,7,green)
 ]};return campaign;
}
export async function mountPersonalDemo(){
 const proof=document.querySelector('#personal-proof');if(!proof)return;
 const campaign=createPersonalDemo();let revision=0;
 async function select(index){
  const version=++revision,item=PERSONAL_EXAMPLES[index];
  const recipient={first_name:item.first_name,company:item.company,salutation:`Hallo ${item.first_name},`,headline:item.headline,personal_note:item.note,chatbot_url:item.url};
  proof.setAttribute('aria-busy','true');document.querySelectorAll('[data-personal-recipient]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.personalRecipient)===index)));
  try{
   const buffer=document.createElement('canvas');await renderCanvas(buffer,campaign,'back',recipient,{scale:6});if(version!==revision)return;
   const canvas=document.querySelector('#personal-card');canvas.width=buffer.width;canvas.height=buffer.height;canvas.getContext('2d').drawImage(buffer,0,0);canvas.setAttribute('aria-label',`Persönliche Karte für ${item.first_name} von ${item.company}: ${item.note}`);
   document.querySelector('#personal-url').textContent=item.url.replace('https://','');document.querySelector('#personal-destination-title').textContent=item.destination;document.querySelector('#personal-destination-copy').textContent=item.outcome;
   const hero=document.querySelector('#personal-hero');if(!hero.dataset.ready){hero.width=buffer.width;hero.height=buffer.height;hero.getContext('2d').drawImage(buffer,0,0);hero.dataset.ready='true';}
   document.querySelector('#personal-error').hidden=true;
  }catch{if(version===revision)document.querySelector('#personal-error').hidden=false;}
  finally{if(version===revision)proof.setAttribute('aria-busy','false');}
 }
 document.querySelectorAll('[data-personal-recipient]').forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.personalRecipient))));
 await select(0);
}
