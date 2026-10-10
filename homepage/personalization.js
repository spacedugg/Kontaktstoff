import {createPromotion} from '../studio/src/promotions.js';
import {renderCanvas} from '../studio/src/render.js';
export const PERSONAL_EXAMPLES=[
 {id:'chattastic',title:'Neukunden gewinnen',brand:'chattastic',purpose:'Eine konkrete Idee für die Website des Wunschkunden.',destination:'Eine Demo, die das Angebot erlebbar macht.',outcome:'Anna scannt die Karte und kann einen Website-Assistenten kennenlernen. Aus einem abstrakten Angebot wird ein erster eigener Eindruck.',target:'Website-Assistent kennenlernen',url:'https://chattastic.de/?beispiel=nordlicht'},
 {id:'raumwerk',title:'Ein Gespräch starten',brand:'raumwerk',purpose:'Ein persönlicher Anlass, über die eigenen Räume nachzudenken.',destination:'Ein einfacher Weg zum Beratungsgespräch.',outcome:'Jonas bekommt eine Einladung für sein Studio. Der QR-Code kann zu einer Terminseite führen, auf der er sein Raumprojekt kurz beschreibt.',target:'Raumberatung anfragen',url:'https://example.org/raumgespraech'},
 {id:'morgen',title:'Ein Team einladen',brand:'morgen.',purpose:'Eine gemeinsame Auszeit als persönliches Team-Ticket.',destination:'Alle Details zur Einladung an einem Ort.',outcome:'Sarah lädt ihr Team zum Kaffee-Tasting ein. Hinter dem QR-Code können die verfügbaren Termine und eine Anmeldung für das ganze Team stehen.',target:'Tasting-Termin auswählen',url:'https://example.org/team-tasting'}
];
export async function mountPersonalDemo(){
 const proof=document.querySelector('#personal-proof');if(!proof)return;
 let revision=0,index=0,side='front';
 async function render(){
  const version=++revision,item=PERSONAL_EXAMPLES[index],campaign=createPromotion(item.id),recipient={...campaign.recipients[index],chatbot_url:item.url};
  proof.setAttribute('aria-busy','true');
  document.querySelectorAll('[data-personal-recipient]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.personalRecipient)===index)));
  try{
   const buffer=document.createElement('canvas');await renderCanvas(buffer,campaign,side,recipient,{scale:6});if(version!==revision)return;
   const canvas=document.querySelector('#personal-card');canvas.width=buffer.width;canvas.height=buffer.height;canvas.getContext('2d').drawImage(buffer,0,0);canvas.setAttribute('aria-label',`${item.brand} · ${side==='front'?'Vorderseite':'Rückseite'} für ${recipient.first_name} von ${recipient.company}`);canvas.dataset.example=item.id;canvas.dataset.side=side;
   document.querySelector('#personal-url').textContent=item.url.replace('https://','');document.querySelector('#personal-destination-title').textContent=item.destination;document.querySelector('#personal-destination-copy').textContent=item.outcome;document.querySelector('#personal-purpose').textContent=item.purpose;document.querySelector('#personal-target').textContent=item.target;
   document.querySelector('#personal-side').textContent=side==='front'?'Vorderseite':'Persönliche Rückseite';document.querySelector('#personal-flip').textContent=side==='front'?'Persönliche Rückseite ansehen ↻':'Vorderseite ansehen ↻';
   const gallery=document.querySelector('#personal-gallery');gallery.dataset.previewExample=item.id;gallery.href='studio/?example='+item.id;
   proof.dataset.theme=item.id;document.querySelector('#personal-error').hidden=true;
  }catch{if(version===revision)document.querySelector('#personal-error').hidden=false;}
  finally{if(version===revision)proof.setAttribute('aria-busy','false');}
 }
 document.querySelectorAll('[data-personal-recipient]').forEach(b=>b.addEventListener('click',()=>{index=Number(b.dataset.personalRecipient);side='front';render();}));
 document.querySelector('#personal-flip').onclick=()=>{side=side==='front'?'back':'front';render();};
 const hero=document.querySelector('#personal-hero'),first=createPromotion('chattastic');await renderCanvas(hero,first,'front',first.recipients[0],{scale:5});hero.dataset.ready='true';
 await render();
}
