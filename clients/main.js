import {applyBewertungspushOffer} from '../studio/src/bewertungspush.js';
import {mountZoom} from './zoom.js';
import {saveCampaign} from '../studio/src/storage.js';
import {defaults as workspaceDefaults} from '../konto/src/model.js';
import {CLIENT_PAGES} from './catalog.js';
import {createClientCampaign} from '../studio/src/client-campaigns.js';
import {renderCanvas} from '../studio/src/render.js';
import {mountCardPreview} from '../homepage/card-preview.js';
const $=s=>document.querySelector(s),client=CLIENT_PAGES.find(c=>c.id===document.body.dataset.client);
document.body.style.setProperty('--client-purple',client.color);document.body.style.setProperty('--client-accent',client.accent);
const campaign=createClientCampaign(client.id),stage=$('#client-stage');
mountCardPreview({stage,card:$('#client-card'),flip:$('#client-flip'),reset:$('#client-reset')});
const zoom=mountZoom({dialog:$('#client-zoom-dialog'),source:async side=>{const c=snapshot(),canvas=document.createElement('canvas');await renderCanvas(canvas,c,side,previewPerson(c),{scale:16});return canvas;},face:()=>stage.dataset.face||'front'});
$('#client-zoom').onclick=()=>zoom.open();
stage.addEventListener('dblclick',()=>zoom.open());
document.querySelectorAll('[data-open-zoom]').forEach(b=>b.onclick=()=>zoom.open(b.dataset.openZoom,b));
let revision=0,selectedPerson=0;
$('#client-note').value=campaign.recipients[0].personal_note;
const person=()=>({...campaign.recipients[selectedPerson],first_name:$('#client-name').value.trim()||campaign.recipients[selectedPerson].first_name,company:$('#client-company').value.trim()||campaign.recipients[selectedPerson].company,personal_note:$('#client-note').value.trim()||campaign.recipients[selectedPerson].personal_note,salutation:$('#client-salutation').value.trim()||campaign.recipients[selectedPerson].salutation});
const offerActive=()=>$('#client-offer')?.checked===true;
const snapshot=()=>{const c=structuredClone(campaign);c.recipients=[person()];return offerActive()?applyBewertungspushOffer(c):c;};
$('#client-offer')?.addEventListener('change',()=>{render();$('#offer-status').textContent=offerActive()?'Angebotsidee aktiv · noch kein freigegebenes Angebot':'Standardangebot aktiv · Zahlung nur bei erfolgreicher Löschung';});
const previewPerson=c=>$('#client-placeholders').checked?{...c.recipients[0],first_name:'{{first_name}}',last_name:'{{last_name}}',company:'{{company}}',personal_note:'{{personal_note}}',personal_headline:'{{personal_headline}}',salutation:'{{salutation}}'}:c.recipients[0];
async function render(){
 const version=++revision,c=snapshot(),showPlaceholders=$('#client-placeholders').checked,r=previewPerson(c);
 stage.setAttribute('aria-busy','true');$('#client-status').textContent='Vorschau wird aktualisiert …';
 try{
  const canvases=await Promise.all(['front','back'].map(async side=>{const canvas=document.createElement('canvas');await renderCanvas(canvas,c,side,r,{scale:6});return {side,canvas};}));
  if(version!==revision)return;
  for(const {side,canvas} of canvases)for(const prefix of ['client','flat']){const output=$('#'+prefix+'-'+side);output.width=canvas.width;output.height=canvas.height;output.getContext('2d').drawImage(canvas,0,0);}
  zoom.refresh();
  $('#client-status').textContent=showPlaceholders?'Platzhalteransicht · QR-Code zur Beispiel-Zielseite':'Vorschau für '+r.first_name+' · '+r.company;$('#client-error').hidden=true;
 }catch(error){if(version===revision){$('#client-error').textContent='Die Vorschau konnte nicht geladen werden. Bitte lade die Seite erneut.';$('#client-error').hidden=false;$('#client-status').textContent='Vorschau nicht verfügbar';}}
 finally{if(version===revision)stage.setAttribute('aria-busy','false');}
}
document.querySelectorAll('[data-client-person]').forEach(button=>button.onclick=()=>{selectedPerson=Number(button.dataset.clientPerson);const r=campaign.recipients[selectedPerson];$('#client-request [name=audience]').selectedIndex=selectedPerson;$('#client-name').value=r.first_name;previousName=r.first_name;$('#client-company').value=r.company;$('#client-note').value=r.personal_note;$('#client-salutation').value=r.salutation;document.querySelectorAll('[data-client-person]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();});
let previousName=$('#client-name').value;
$('#client-name').addEventListener('input',()=>{const value=$('#client-name').value;if(previousName&&$('#client-salutation').value.includes(previousName))$('#client-salutation').value=$('#client-salutation').value.replace(previousName,value);previousName=value;});
for(const id of ['client-name','client-company','client-note','client-salutation'])$('#'+id).addEventListener('input',render);
$('#client-placeholders').addEventListener('change',render);
document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{const flat=button.dataset.view==='flat';stage.hidden=flat;$('#client-flat').hidden=!flat;$('.client-preview-controls').hidden=flat;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
$('#client-pdf').onclick=async()=>{
 const button=$('#client-pdf');button.disabled=true;button.textContent='PDF wird erstellt …';
 try{
  const c=snapshot(),{PDFDocument}=await import('pdf-lib'),doc=await PDFDocument.create();doc.setTitle(client.name+' · Kontaktstoff Designvorschlag');doc.setSubject('Ansichts-PDF · RGB · ohne Beschnitt · Fiktiver Beispielkontakt'+(offerActive()?' · Angebotsidee, Konditionen nicht freigegeben':''));
  for(const side of ['front','back']){const canvas=document.createElement('canvas');await renderCanvas(canvas,c,side,c.recipients[0],{scale:300/25.4});const image=await doc.embedPng(canvas.toDataURL('image/png'));const page=doc.addPage([210*72/25.4,148*72/25.4]);page.drawImage(image,{x:0,y:0,width:page.getWidth(),height:page.getHeight()});}
  download(new Blob([await doc.save()],{type:'application/pdf'}),client.id+'-mailing-entwurf.pdf');$('#client-status').textContent='PDF erstellt · beide Seiten · Ansichtsdatei ohne Beschnitt';
 }catch{$('#client-error').hidden=false;$('#client-error').textContent='Der PDF-Export hat nicht geklappt. Bitte versuche es erneut.';}finally{button.disabled=false;button.textContent='Entwurf als PDF ↓';}
};
if(client.contactUrl){$('#client-request button').textContent='Kampagne anfragen ↗';$('#request-hint').textContent='Wir bereiten euren Kampagnenbrief vor und öffnen den Kontaktweg zu Kontaktstoff. Es wird noch kein Auftrag ausgelöst.';}
$('#client-request').addEventListener('submit',async event=>{
 event.preventDefault();const button=event.currentTarget.querySelector('button[type=submit]');button.disabled=true;
 try{const d=new FormData(event.currentTarget),c=snapshot();c.service={...workspaceDefaults(),audience:String(d.get('audience')||client.audience),quantity:Number(d.get('quantity')||250),notes:String(d.get('notes')||'')+(offerActive()?'\nAngebotsidee: Erste erfolgreiche Löschung gratis. Konditionen und Umsetzung auf der Zielseite noch abzustimmen.':''),leadSource:'research',targetURL:client.target};await saveCampaign(c);location.href='/konto/?request='+encodeURIComponent(c.id);}catch{const result=$('#request-result');result.hidden=false;result.textContent='Der Entwurf konnte nicht gespeichert werden. Bitte erneut versuchen.';}finally{button.disabled=false;}
});
$('#client-studio').addEventListener('click',event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;try{sessionStorage.setItem('kontaktstoff-client-draft',JSON.stringify(snapshot()));}catch{event.preventDefault();$('#client-error').hidden=false;$('#client-error').textContent='Der Browser konnte den Entwurf nicht übergeben. Bitte sichere ihn als PDF oder öffne das Standardbeispiel im Studio.';}});
await document.fonts.ready;await render();
