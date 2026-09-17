import {CLIENT_PAGES} from './catalog.js';
import {createClientCampaign} from '../studio/src/client-campaigns.js';
import {renderCanvas} from '../studio/src/render.js';
import {mountCardPreview} from '../homepage/card-preview.js';
const $=s=>document.querySelector(s),client=CLIENT_PAGES.find(c=>c.id===document.body.dataset.client);
document.body.style.setProperty('--client-purple',client.color);document.body.style.setProperty('--client-accent',client.accent);
const campaign=createClientCampaign(client.id),stage=$('#client-stage');
mountCardPreview({stage,card:$('#client-card'),flip:$('#client-flip'),reset:$('#client-reset')});
let revision=0,briefUrl=null;
const person=()=>({...campaign.recipients[0],first_name:$('#client-name').value.trim()||'Anna',company:$('#client-company').value.trim()||'Studio Nordlicht',salutation:'Hey '+($('#client-name').value.trim()||'Anna')+','});
const snapshot=()=>{const c=structuredClone(campaign);c.recipients=[person()];return c;};
async function render(){
 const version=++revision,c=snapshot(),showPlaceholders=$('#client-placeholders').checked,r=showPlaceholders?{...c.recipients[0],first_name:'{{first_name}}',company:'{{company}}',salutation:'Hey {{first_name}},'}:c.recipients[0];
 stage.setAttribute('aria-busy','true');$('#client-status').textContent='Vorschau wird aktualisiert …';
 try{
  const canvases=await Promise.all(['front','back'].map(async side=>{const canvas=document.createElement('canvas');await renderCanvas(canvas,c,side,r,{scale:6});return {side,canvas};}));
  if(version!==revision)return;
  for(const {side,canvas} of canvases)for(const prefix of ['client','flat']){const output=$('#'+prefix+'-'+side);output.width=canvas.width;output.height=canvas.height;output.getContext('2d').drawImage(canvas,0,0);}
  $('#client-status').textContent=showPlaceholders?'Platzhalteransicht · QR-Code zur Beispiel-Zielseite':'Vorschau für '+r.first_name+' · '+r.company;$('#client-error').hidden=true;
 }catch(error){if(version===revision){$('#client-error').textContent='Die Vorschau konnte nicht geladen werden. Bitte lade die Seite erneut.';$('#client-error').hidden=false;$('#client-status').textContent='Vorschau nicht verfügbar';}}
 finally{if(version===revision)stage.setAttribute('aria-busy','false');}
}
for(const id of ['client-name','client-company'])$('#'+id).addEventListener('input',render);
$('#client-placeholders').addEventListener('change',render);
document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{const flat=button.dataset.view==='flat';stage.hidden=flat;$('#client-flat').hidden=!flat;$('.client-preview-controls').hidden=flat;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
$('#client-pdf').onclick=async()=>{
 const button=$('#client-pdf');button.disabled=true;button.textContent='PDF wird erstellt …';
 try{
  const c=snapshot(),{PDFDocument}=await import('pdf-lib'),doc=await PDFDocument.create();doc.setTitle(client.name+' · Kontaktstoff Designvorschlag');doc.setSubject('Ansichts-PDF · RGB · ohne Beschnitt · Fiktiver Beispielkontakt');
  for(const side of ['front','back']){const canvas=document.createElement('canvas');await renderCanvas(canvas,c,side,c.recipients[0],{scale:300/25.4});const image=await doc.embedPng(canvas.toDataURL('image/png'));const page=doc.addPage([210*72/25.4,148*72/25.4]);page.drawImage(image,{x:0,y:0,width:page.getWidth(),height:page.getHeight()});}
  download(new Blob([await doc.save()],{type:'application/pdf'}),client.id+'-mailing-entwurf.pdf');$('#client-status').textContent='PDF erstellt · beide Seiten · Ansichtsdatei ohne Beschnitt';
 }catch{$('#client-error').hidden=false;$('#client-error').textContent='Der PDF-Export hat nicht geklappt. Bitte versuche es erneut.';}finally{button.disabled=false;button.textContent='Entwurf als PDF ↓';}
};
if(client.contactUrl){$('#client-request button').textContent='Kampagne anfragen ↗';$('#request-hint').textContent='Wir bereiten euren Kampagnenbrief vor und öffnen den Kontaktweg zu Kontaktstoff. Es wird noch kein Auftrag ausgelöst.';}
$('#client-request').addEventListener('submit',event=>{
 event.preventDefault();const data=new FormData(event.currentTarget),quantity=data.get('quantity');
 const content=['KAMPAGNENBRIEF · KONTAKTSTOFF',client.name,'',`Ansprechpartner: ${data.get('name')||'Noch offen'}`,`Gewünschte Auflage: ${quantity} Karten`,'Format: DIN A5, zwei Seiten',`Konzept: ${client.concept}`,`Zielgruppe: ${client.audience}`,`Zielseite: ${client.target}`,'',`Wünsche: ${data.get('notes')||'Keine ergänzenden Wünsche'}`,'','Gewünschter Leistungsumfang: Konzept, Texte, Design, Personalisierung, QR-Verknüpfung und Vorschau. Druck und Versand separat im Angebot abstimmen.','Preis, Zeitplan und genaue Leistungen sind vor einer Beauftragung gemeinsam abzustimmen.','Dieser Brief ist keine Bestellung.'].join('\n');
 if(briefUrl)URL.revokeObjectURL(briefUrl);briefUrl=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));
 const result=$('#request-result'),p=document.createElement('p'),link=document.createElement('a');p.textContent='Euer Kampagnenbrief ist vorbereitet. Ladet ihn herunter und gebt ihn eurem Ansprechpartner bei Kontaktstoff.';link.href=briefUrl;link.download=client.id+'-kampagnenbrief.txt';link.textContent='Kampagnenbrief herunterladen ↓';result.replaceChildren(p,link);
 if(client.contactUrl){const contact=document.createElement('a');contact.href=client.contactUrl;contact.target='_blank';contact.rel='noopener noreferrer';contact.textContent='Kontaktstoff kontaktieren ↗';contact.style.display='block';result.append(contact);}
 result.hidden=false;result.scrollIntoView({behavior:'smooth',block:'nearest'});
});
await document.fonts.ready;await render();
