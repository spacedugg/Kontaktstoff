import {mountCardPreview} from './card-preview.js';
import {mountImpactCalculator} from './impact.js';
mountImpactCalculator();
const info={imprint:{title:'Impressum · Entwicklungsvorschau',text:['Diese Vorschau dient der Entwicklung von Kontaktstoff und dem Test erster Kampagnen. Vollständige Betreiberangaben sind noch nicht hinterlegt.','Vor einem öffentlichen Marktstart müssen Unternehmensname, Rechtsform, Vertretung, ladungsfähige Anschrift und Kontaktangaben ergänzt werden. Über dieses Studio werden keine Bestellungen aufgegeben.']},privacy:{title:'Deine Daten in dieser Vorschau',text:['Designs, Kontakte und Kampagnen werden im Browser verarbeitet und lokal in IndexedDB gespeichert. Es gibt keine Cloud-Synchronisierung. Die Felder der Homepage werden nur für die Vorschau verwendet. Eigene Analyse- oder Marketingdienste sind nicht eingebunden.','Projekt- und Kampagnenexporte enthalten die eingegebenen Empfängerdaten. Du entscheidest, wo du diese Dateien speicherst und mit wem du sie teilst.','Schriften und Bibliotheken werden mit dieser Website ausgeliefert. Der Hosting-Anbieter verarbeitet technische Verbindungsdaten beim Seitenaufruf. Für den öffentlichen Betrieb sind die verantwortliche Stelle, der konkrete Hosting-Anbieter und alle tatsächlichen Verarbeitungen in einer vollständigen Datenschutzerklärung zu ergänzen.']}};
const dialog=document.querySelector('#info-dialog');document.querySelectorAll('[data-info]').forEach(b=>b.onclick=()=>{const item=info[b.dataset.info];document.querySelector('#info-title').textContent=item.title;document.querySelector('#info-body').replaceChildren(...item.text.map(t=>{const p=document.createElement('p');p.textContent=t;return p;}));dialog.showModal();});document.querySelector('#info-close').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}};

import {PROMOTIONS,createPromotion} from '../studio/src/promotions.js';
import {renderCanvas} from '../studio/src/render.js';
const stage=document.querySelector('#hero-stage'),card=document.querySelector('#hero-card');
let active='chattastic',revision=0;
const campaigns=new Map(PROMOTIONS.map(p=>[p.id,createPromotion(p.id)]));
const preview=mountCardPreview({stage,card,flip:document.querySelector('#hero-flip'),reset:document.querySelector('#hero-reset')});
const reset=()=>preview.reset();
async function render(){
 const version=++revision,c=campaigns.get(active),r={...c.recipients[0],company:document.querySelector('#demo-company').value.trim()||c.recipients[0].company};
 stage.setAttribute('aria-busy','true');
 try{
  // Render offscreen, then swap together so quick typing or tab switches cannot show stale cards.
  const canvases=await Promise.all(['front','back'].map(async side=>{const canvas=document.createElement('canvas');await renderCanvas(canvas,c,side,r,{scale:6});return {side,canvas};}));
  if(version!==revision)return;
  for(const {side,canvas} of canvases){const visible=document.querySelector('#hero-'+side);visible.width=canvas.width;visible.height=canvas.height;visible.getContext('2d').drawImage(canvas,0,0);visible.setAttribute('aria-label',`${side==='front'?'Vorderseite':'Rückseite'} für ${r.company}`);}
  document.querySelector('#gallery-error').hidden=true;
 }catch{if(version===revision)document.querySelector('#gallery-error').hidden=false;}
 finally{if(version===revision)stage.setAttribute('aria-busy','false');}
}
function select(id){
 active=id;const p=PROMOTIONS.find(p=>p.id===id);
 document.querySelector('.hero-demo').dataset.promotion=id;
 document.querySelectorAll('.promotion-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.promotion===id)));
 document.querySelector('#gallery-count').textContent='0'+(PROMOTIONS.indexOf(p)+1)+' / 03';
 for(const [key,value] of [['category',p.category],['title',p.title],['description',p.description]])document.querySelector('#gallery-'+key).textContent=value;
 document.querySelector('#gallery-open').href='studio/?example='+id;
 const credit=document.querySelector('#gallery-credit');credit.href=p.source;credit.textContent='Foto: '+p.credit+' / Unsplash ↗';reset();render();
}
document.querySelectorAll('.promotion-tabs button').forEach(b=>b.onclick=()=>select(b.dataset.promotion));
document.querySelector('#demo-company').oninput=render;

const exampleDialog=document.querySelector('#example-dialog');
let exampleOpener=null;
document.querySelectorAll('[data-preview-example]').forEach(link=>link.addEventListener('click',event=>{
 if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();exampleOpener=link;select(link.dataset.previewExample);exampleDialog.showModal();document.body.classList.add('example-dialog-open');
}));
document.querySelector('#example-close').onclick=()=>exampleDialog.close();
exampleDialog.addEventListener('close',()=>{document.body.classList.remove('example-dialog-open');exampleOpener?.focus({preventScroll:true});});
exampleDialog.addEventListener('click',event=>{if(event.target===exampleDialog){const box=exampleDialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)exampleDialog.close();}});
// Anchor links to optional information should reveal the requested section, including deep links.
function revealSection(){const target=document.getElementById(location.hash.slice(1));if(target?.matches('details.learn-more'))target.open=true;}
window.addEventListener('hashchange',revealSection);revealSection();
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{const target=document.getElementById(link.hash.slice(1));if(target?.matches('details.learn-more'))target.open=true;}));

await document.fonts.ready;select(active);
await Promise.all([...document.querySelectorAll('[data-example-canvas]')].map(async canvas=>{const c=campaigns.get(canvas.dataset.exampleCanvas);try{await renderCanvas(canvas,c,'front',c.recipients[0],{scale:4});}catch{canvas.setAttribute('aria-label','Vorschau nicht verfügbar. Beispiel im Studio öffnen.');}}));
