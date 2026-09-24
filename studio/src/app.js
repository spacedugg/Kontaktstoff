import {preparePrintImport,detectBleed,validateICC,printWarnings,renderPrintCanvas,createPrintPDF} from './print.js';
import {toSelfmailer} from './selfmailer.js';
import {isSelfmailer,sideLabel,formatCaption,POSTAL_ZONES} from './formats.js';
import {api as workspaceAPI} from '../../konto/src/api.js';
import {openCSVImport} from './csv-dialog.js';
import {startHTML} from './start.js';
import {CLIENT_CAMPAIGNS,createClientCampaign} from './client-campaigns.js';
import {FORMATS,sideNames,KEYS,uid,clone,clamp,validURL,resolveText,missingKeys,createCampaign,csvString,validateCampaign,checks} from './core.js';
import {listCampaigns,listDeletedCampaigns,saveCampaign,trashCampaign,restoreCampaign} from './storage.js';
import {renderCanvas,imageFrom} from './render.js';
import {icon,hydrateIcons} from './icons.js';
import {Mailing3D} from './three-d.js';
import {guideHTML,GUIDE_STEPS} from './guide.js';
import {tutorialHTML,TUTORIAL_STEPS} from './tutorial.js';
import {createTemplate,createExampleCampaign} from './templates.js';
import {PROMOTIONS} from './promotions.js';
import {dashboardHTML} from './dashboard.js';
import {auditCampaign,createHandoff} from './handoff.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let campaign=createCampaign(), side='front', selected=campaign.sides.front.fields[0]?.id, recipientIndex=0, view='design', guides=true;
let cloudRecord=null,cloudPath='/campaigns/';
let previewExtrasContext=null,editorMode='content';
const editableFields=()=>campaign.sides[side].fields.filter(f=>editorMode==='layout'||['text','qr'].includes(f.type));
const firstEditable=()=>editableFields().find(f=>f.type==='text'&&f.text.includes('{{'))||editableFields()[0];
const designRecipient=()=>campaign.recipients.length?recipient():{company:'Deine Wunschfirma',first_name:'Vorname',salutation:'Hallo Vorname,',personal_note:'Hier steht deine persönliche Nachricht: Warum passt dein Angebot genau zu diesem Unternehmen?'};
let previewMode='3d', hasActive=false, dashboardCampaigns=[], dashboardVersion=0, jobController=null, imageReplaceTarget=null;
function clearAudit(){const results=$('#audit-results');results.hidden=true;results.innerHTML='';}

const threeD=new Mailing3D(document.querySelector('#three-d-stage'));
let history=[], future=[], saveTimer, toastTimer, renderVersion=0, drawingIssues=[], saveFailed=false, pendingSaves=Promise.resolve(), activeDrag=null;
const format=()=>FORMATS.find(f=>f.id===campaign.format);
const recipient=()=>campaign.recipients[recipientIndex]||{};
const selectedField=()=>campaign.sides[side].fields.find(f=>f.id===selected);
const fieldName=f=>f.display==='stars'?'Sterneskala · '+(KEYS[f.text.match(/^\{\{(\w+)\}\}$/)?.[1]]||f.text):f.type==='image'?'Logo / Bild':f.type==='shape'?'Farbfläche':f.type==='qr'?'Persönlicher QR-Code':KEYS[f.text.match(/^\{\{(\w+)\}\}$/)?.[1]]|| (f.text.includes('{{first_name}}')?'Persönliche Ansprache':f.text.replace(/\n/g,' ').slice(0,55)||'Eigener Text');
const keys=()=>[...new Set([...Object.keys(KEYS),...Object.values(campaign.sides).flatMap(s=>s.fields.flatMap(f=>[...f.text.matchAll(/\{\{\s*([\w-]+)\s*\}\}/g)].map(m=>m[1]))),...campaign.recipients.flatMap(r=>Object.keys(r)).filter(k=>!['id','__proto__','constructor','prototype'].includes(k))])].filter(k=>!['id','__proto__','constructor','prototype'].includes(k));
function toast(message,error=false){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.toggle('error',error);$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),error?6500:3500);}
function saveState(text,failed=false){$('#save-state').innerHTML=`<span class="status-dot" style="background:${failed?'#bf7352':'#779767'}"></span>${escape(text)}`;}
function persist(){try{sessionStorage.setItem('kontaktstoff-active',campaign.id);}catch{}clearTimeout(saveTimer);saveState('Wird gespeichert …');saveTimer=setTimeout(flushSave,350);}
async function flushSave(){clearTimeout(saveTimer);if(!hasActive)return;const snapshot=clone(campaign);const cloud=cloudRecord?.id===snapshot.id?cloudRecord:null;pendingSaves=pendingSaves.catch(()=>{}).then(async()=>{if(cloud){if(cloud.conflict)throw Error(cloud.conflict);try{const next=await workspaceAPI(cloudPath+cloud.id,{method:'PUT',body:{project:snapshot,meta:cloud.meta,revision:cloud.revision}});Object.assign(cloud,next);}catch(e){if(e.status===409)cloud.conflict=e.message;throw e;}}else await saveCampaign(snapshot);});try{await pendingSaves;saveState(cloud?'Im Konto gespeichert':'Lokal gespeichert');saveFailed=false;}catch(e){saveState('Nicht gespeichert',true);if(!saveFailed)toast(e.message||'Speichern nicht möglich. Bitte sichere dein Projekt als Datei.',true);saveFailed=true;}}
function checkpoint(){history.push(clone(campaign));if(history.length>40)history.shift();future=[];}
function changed({inspector=true,table=true,guide=true}={}){hasActive=true;clearAudit();campaign.updatedAt=Date.now();persist();renderUI(inspector,table,guide);}
function commit(fn,options){checkpoint();fn();changed(options);}
function undo(){if(!history.length)return;future.push(clone(campaign));campaign=history.pop();recipientIndex=clamp(recipientIndex,0,Math.max(0,campaign.recipients.length-1));selected=campaign.sides[side].fields.find(f=>f.id===selected)?.id;changed();}
function redo(){if(!future.length)return;history.push(clone(campaign));campaign=future.pop();recipientIndex=clamp(recipientIndex,0,Math.max(0,campaign.recipients.length-1));changed();}
function setSide(value){side=value;selected=firstEditable()?.id;renderUI();}
function setView(value){if(value==='setup'&&campaign.tutorial)value='tutorial';if(value==='tutorial'&&campaign.tutorial&&!campaign.tutorial.active){campaign.tutorial.active=true;campaign.updatedAt=Date.now();persist();}if(value==='dashboard'){showDashboard();return;}view=value;renderUI();if(value==='preview')requestAnimationFrame(()=>threeD.paint());}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),30000);}
const filename=()=>campaign.name.replace(/[^\p{L}\p{N}]+/gu,'-').slice(0,80).replace(/^-|-$/g,'').toLowerCase()||'kampagne';
async function busy(label,fn){$('#busy-label').textContent=label;$('#busy').hidden=false;try{return await fn();}catch(e){console.error(e);toast(e.message||'Das hat nicht funktioniert. Bitte erneut versuchen.',true);}finally{$('#busy').hidden=true;}}
function modal(title,body,buttons=[{id:'cancel',label:'Schließen'}]){
 const dlg=$('#modal');if(dlg.open)dlg.close('cancel');
 $('#modal-content').innerHTML=`<div class="modal-heading"><h2 id="modal-title">${escape(title)}</h2><button class="icon-button" data-result="cancel" aria-label="Schließen">${icon('close')}</button></div><div class="modal-body">${body}</div><div class="modal-footer">${buttons.map(b=>`<button class="button ${b.primary?'primary':''} ${b.danger?'danger':''}" data-result="${b.id}">${escape(b.label)}</button>`).join('')}</div>`;
 return new Promise(resolve=>{const handler=e=>{const b=e.target.closest('[data-result]');if(b)dlg.close(b.dataset.result);};dlg.addEventListener('click',handler);dlg.addEventListener('close',()=>{dlg.removeEventListener('click',handler);resolve(dlg.returnValue);},{once:true});dlg.showModal();});
}
async function confirm(title,message,action='Bestätigen'){return await modal(title,`<p>${escape(message)}</p>`,[{id:'cancel',label:'Abbrechen'},{id:'ok',label:action,primary:true}])==='ok';}
function renderUI(inspector=true,table=true,guide=true){
 $('#share-review').hidden=!(view==='preview'&&cloudRecord&&!cloudPath.includes('library')&&!reviewReturn());$('#request-campaign').hidden=view!=='preview';$('#request-campaign').textContent=reviewReturn()?'Speichern & zur Abstimmung →':builderReturn()?'Speichern & zurück zur Kampagne →':cloudPath.includes('library')?'Freigabe & Feedback →':'Kampagne anfragen →';
 if(!sideNames(campaign).includes(side))side='front';
 document.body.classList.toggle('single-sided',sideNames(campaign).length===1);
 document.documentElement.style.setProperty('--mailing-ratio',format().width+'/'+format().height);
 $$('.proof-label').forEach((el,i)=>{el.firstElementChild.textContent=(i+1)+' / '+sideLabel(campaign,i===0?'front':'back').toUpperCase();});$$('.proof-format').forEach(el=>el.textContent=format().name);$('.export-card>p').textContent=`${sideNames(campaign).length} ${sideNames(campaign).length===1?'Seite':'Seiten'} im Originalformat, mit den Daten des ausgewählten Empfängers.`;
 threeD.setSelfmailer(isSelfmailer(campaign));threeD.setVisible(view==='preview'&&previewMode==='3d');if(!isSelfmailer(campaign))$('.mailing-3d-card').style.aspectRatio=format().width+'/'+format().height;if(!isSelfmailer(campaign))$('.mailing-3d-card').style.width=`min(${Math.min(72,70*format().width/format().height)}%, 580px)`;
 $('.steps-note').textContent=cloudRecord?.id===campaign.id?'In deinem Unternehmenskonto gespeichert':'Ohne Anmeldung gestalten';
 document.body.classList.toggle('library-editor',cloudPath.includes('library'));
 document.body.classList.toggle('content-editing',editorMode==='content'&&view==='design');
 $('#editor-mode-bar').hidden=view!=='design';
 $$('[data-editor-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.editorMode===editorMode);b.setAttribute('aria-pressed',String(b.dataset.editorMode===editorMode));});
 $('#editor-mode-help').textContent=editorMode==='content'?'Klicke auf einen Text. Im Textfeld passt du ihn an.':'Verschiebe Elemente, ändere Farben oder ergänze eigene Bilder.';
 if(view==='design'&&editorMode==='content'&&!editableFields().some(f=>f.id===selected))selected=firstEditable()?.id;
 if(view==='setup'&&campaign.tutorial)view='tutorial';
 document.body.classList.toggle('focused-entry',view==='tutorial'||view==='setup'||view==='start');
 document.body.classList.toggle('starting-campaign',view==='start');
 $('#start-view').hidden=view!=='start';
 $('#workflow-hint').hidden=cloudPath.includes('library')||!['design','recipients','preview'].includes(view);
 if(!$('#workflow-hint').hidden){const hints={design:['1. Gestalte deine Karte','Wähle einen Text in der Karte und bearbeite ihn im Textfeld. Passe danach die Rückseite an. Dein Design wird automatisch gespeichert.','recipients','Weiter zu den Empfängern →'],recipients:['2. Für wen ist dein Mailing?','Füge deine Kontakte hinzu oder importiere eine CSV. Die Spalten verbinden Namen, Firmen und Links mit deinen Karten.','preview','Mailing ansehen →'],preview:['3. Dein Mailing ist bereit zur Ansicht','Prüfe beide Seiten. Danach kannst du deine Kampagne anfragen oder den Entwurf exportieren.','design','Design weiter bearbeiten']},hint=hints[view];$('#workflow-hint').innerHTML=`<div><strong>${hint[0]}</strong><p>${hint[1]}</p></div><button class="button" data-workflow-next="${hint[2]}">${hint[3]}</button>`;}
 document.body.classList.toggle('tutorial-excursion',!!campaign.tutorial?.active&&view!=='tutorial'&&view!=='dashboard');
 document.body.classList.toggle('dashboard-active',view==='dashboard');
 document.body.classList.toggle('example-focus',view==='preview'&&!cloudRecord&&campaign.sample&&!!campaign.templateId&&!campaign.tutorial?.active);
 const extrasContext=campaign.id+':'+campaign.sample;if(previewExtrasContext!==extrasContext){$('#preview-extras').open=!(campaign.sample&&campaign.templateId);previewExtrasContext=extrasContext;}
 $('.breadcrumb strong').textContent=view==='start'?'Neue Kampagne':view==='dashboard'?'Dein Arbeitsplatz':view==='tutorial'?'Beispiel ausprobieren':view==='setup'?'Deine Kampagne':'Designstudio';
 $('#dashboard-view').hidden=view!=='dashboard';
 if(view==='dashboard'||view==='start'){for(const name of ['tutorial','setup','design','recipients','preview'])$('#'+name+'-view').hidden=true;return;}
 $('#example-preview-note').hidden=!!cloudRecord||!campaign.sample||!!campaign.tutorial?.active;
 const client=CLIENT_CAMPAIGNS.find(p=>p.id===campaign.templateId);
 const promotion=PROMOTIONS.find(p=>p.id===campaign.templateId)||PROMOTIONS[0];
 const credit=$('.example-photo-credit');credit.href=promotion.source;credit.textContent='Stockfoto: '+promotion.credit+' / Unsplash ↗';
 credit.hidden=!!client;
 const sampleCopy=client?'Kontaktstoff Designvorschlag für '+client.name+'. Fiktive Empfänger und Anschriften. Die QR-Codes öffnen die echte Terminseite mit Beispiel-Kampagnenparametern.':promotion.id==='chattastic'?'Alle Empfänger und Anschriften sind fiktiv. Die Beispiellinks öffnen chattastic.de; ersetze sie für den Versand durch echte Chatbot-Links.':'Fiktive Beispielmarke, Empfänger und Anschriften. Die QR-Codes führen zu example.org als Demo-Ziel. Ersetze diese Links vor einer echten Kampagne.';
 $('#sample-notice span').textContent=sampleCopy;
 $('#example-preview-note h2').textContent=client?client.name+' · Dein Designvorschlag':promotion.name+' · So könnte dein Mailing aussehen.';
 $('#example-preview-note p').textContent='Wechsle den Kontakt: Firmenname, Ansprache und QR-Code ändern sich mit. '+sampleCopy;
 $('.draft-pill').textContent=campaign.sample?'Beispiel':'Entwurf';
 $('#rename-campaign').textContent=campaign.name;$('#recipient-count').textContent=campaign.recipients.length;
 $$('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===view);b.setAttribute('aria-current',b.dataset.tab===view?'step':'false');});
 for(const name of ['tutorial','setup','design','recipients','preview'])$('#'+name+'-view').hidden=name!==view;
 $$('[data-side]').forEach(b=>{(b.querySelector(':scope > span')||b).textContent=sideLabel(campaign,b.dataset.side);b.classList.toggle('active',b.dataset.side===side);b.setAttribute('aria-pressed',String(b.dataset.side===side));});
 $('#start-tutorial').textContent='So geht’s';
 $('#tutorial-tab').hidden=true;
 $('#tutorial-return').hidden=!campaign.tutorial?.active||view==='tutorial';
 if(view==='tutorial'&&guide)$('#tutorial-view').innerHTML=tutorialHTML(campaign,recipientIndex);
 if(view==='tutorial')updateTutorialLive();
 $('#setup-tab').hidden=!campaign.onboarding?.active||!!campaign.tutorial||campaign.sample;
 $('#guide-return').hidden=!campaign.onboarding?.active||!!campaign.tutorial||view==='setup';
 if(view==='setup'&&guide)$('#setup-view').innerHTML=guideHTML(campaign);
 $('#three-d-front-button').textContent=isSelfmailer(campaign)?'Titelseite':'Vorderseite';$('#three-d-back-button').textContent=isSelfmailer(campaign)?'Postanschrift':'Rückseite';$('#preview-mode-2d').textContent=isSelfmailer(campaign)?'▤ Druckbogen · 2D':'▤ Beide Seiten';$('#three-d-view').hidden=previewMode!=='3d';$('#proof-spread').hidden=previewMode!=='2d';
 for(const mode of ['2d','3d']){const b=$('#preview-mode-'+mode);b.classList.toggle('active',previewMode===mode);b.setAttribute('aria-pressed',String(previewMode===mode));}
 $('#format-short').textContent=format().name;$('#format-select').innerHTML=FORMATS.map(f=>`<option value="${f.id}">${escape(f.name)}</option>`).join('');
 $('#side-title').textContent=sideLabel(campaign,side);$('#format-select').value=campaign.format;
 $('#dimensions').textContent=formatCaption(campaign);$('#width-label').textContent=`${format().width} mm`;$('#design-scale').textContent=format().name;
 $('#artboard').style.aspectRatio=`${format().width}/${format().height}`;
 $('#safe-guide').style.inset=`${5/format().height*100}% ${5/format().width*100}%`;
 let fold=$('#selfmailer-guides');if(!fold){fold=document.createElement('div');fold.id='selfmailer-guides';$('#artboard').append(fold);}fold.hidden=!guides||!isSelfmailer(campaign);fold.innerHTML=isSelfmailer(campaign)?`<div class="fold-guide"><span>Falz · 99 mm</span></div>${side==='front'?POSTAL_ZONES.map(z=>`<div class="postal-guide" style="left:${z.x/210*100}%;top:${z.y/198*100}%;width:${z.w/210*100}%;height:${z.h/198*100}%"><span>${z.name}</span></div>`).join(''):''}`:'';$('#safe-guide').hidden=!guides;$('#guides-toggle').classList.toggle('active',guides);$('#guides-toggle').setAttribute('aria-pressed',String(guides));
 $('#undo').disabled=!history.length;$('#redo').disabled=!future.length;
 const bg=campaign.sides[side].background;
 $('#background-info').textContent=bg.kind==='template'?'chattastic-Muster · Hintergrund fest, Felder bearbeitbar':bg.kind==='blank'?(campaign.sides[side].fields.length?'Dein Design · alle Inhalte bearbeitbar':'Leere Seite · bereit für dein Design'):bg.name;
 $('#background-remove').hidden=bg.kind==='blank';
 $('#empty-artboard').hidden=bg.kind!=='blank'||campaign.sides[side].fields.length>0;
 $('#page-color-control').hidden=bg.kind!=='blank';$('#page-color').value=bg.color||'#ffffff';
 $('#field-count').textContent=editableFields().length;
 $('#layer-list').innerHTML=editableFields().map(f=>`<button class="layer ${f.id===selected?'active':''}" data-layer="${f.id}" aria-pressed="${f.id===selected}">${icon(f.type==='qr'?'qr':'type')}<span class="layer-name">${escape(fieldName(f))}</span><span class="layer-kind">${f.type==='qr'?'QR':f.type==='image'?'Bild':f.type==='shape'?'Fläche':'Aa'}</span></button>`).join('')||'<p class="panel-copy">Dein erstes Feld wartet links oben.</p>';
 for(const select of [$('#active-recipient'),$('#preview-recipient')]){
   select.innerHTML=campaign.recipients.length?campaign.recipients.map((r,i)=>`<option value="${i}">${escape(r.company||'Unbenannter Empfänger')}</option>`).join(''):'<option value="0">Platzhalter · noch keine Empfänger</option>';
   select.value=String(recipientIndex);
 }
 $('#recipient-index').textContent=`${campaign.recipients.length?recipientIndex+1:0} / ${campaign.recipients.length}`;
 $('#prev-recipient').disabled=recipientIndex<=0;$('#next-recipient').disabled=recipientIndex>=campaign.recipients.length-1;
 if(inspector)renderInspector();else updateResolved();
 renderOverlays();if(view==='recipients'&&table)renderRecipients();requestRender();requestAnimationFrame(fitArtboard);
}
function updateResolved(){const f=selectedField();if(f&&$('#resolved'))$('#resolved').textContent=resolveText(f.text,view==='design'?designRecipient():recipient())||'Für diesen Empfänger fehlt ein Wert.';}
function renderInspector(){
 const f=selectedField();
 if(!f){$('#inspector').innerHTML=`<div class="inspector-empty">${icon('move')}<h3>Platz für Persönlichkeit.</h3><p>Wähle ein Feld im Design aus oder füge links ein neues hinzu. Hier bestimmst du Inhalt, Position und Aussehen.</p></div>`;return;}
 const decorative=['image','shape'].includes(f.type);
 const bound=f.text.match(/^\{\{(\w+)\}\}$/)?.[1]||'custom';
 const directValue=editorMode==='content'&&!decorative&&bound!=='custom'&&campaign.recipients.length>0;
 $('#inspector').innerHTML=`<div class="inspector-heading"><div class="eyebrow">FELD BEARBEITEN</div><h3>${icon(f.type==='qr'?'qr':'type')}${escape(fieldName(f))}</h3><p>${f.type==='image'?'Passe den Bildausschnitt an oder ersetze das Foto durch dein eigenes Bild.':f.type==='shape'?'Setze eine farbige Fläche und ordne sie hinter deinen Texten an.':f.type==='qr'?'Jeder Empfänger bekommt seinen eigenen, scannbaren QR-Code.':'Schreibe deinen Text oder verbinde ihn mit Empfängerdaten.'}</p></div>
 <section class="inspector-group" ${decorative?'hidden':''}><label for="field-binding">Mit Daten verbinden</label><select id="field-binding"><option value="custom">Eigener Text / Kombination</option>${keys().map(k=>`<option value="${escape(k)}" ${bound===k?'selected':''}>${escape(KEYS[k]||k)}</option>`).join('')}</select><label for="field-text" ${directValue?'hidden':''}>Dein Text</label><textarea id="field-text" spellcheck="true" ${directValue?'hidden':''}>${escape(f.text)}</textarea>${directValue?`<label for="recipient-field-value">${escape(KEYS[bound]||bound)} für ${escape(recipient().first_name||recipient().company||'diesen Kontakt')}</label><textarea id="recipient-field-value">${escape(recipient()[bound]||'')}</textarea><p class="direct-value-hint">Ändert nur diesen Kontakt. Wähle unter der Karte einen anderen Empfänger, um dessen Inhalt zu bearbeiten.</p>`:''}<p class="binding-explainer" ${directValue?'hidden':''}>Wörter in {{Klammern}} werden aus deiner Empfängerliste gefüllt. Alles andere bleibt für alle gleich.</p><div class="field-label">${campaign.recipients.length?'SO LIEST ES DEIN KONTAKT':'VORSCHAU MIT PLATZHALTERN'}</div><div class="resolved-value" id="resolved">${escape(resolveText(f.text,view==='design'?designRecipient():recipient())||'Für diesen Empfänger fehlt ein Wert.')}</div></section>
 <section class="inspector-group layout-tools"><div class="section-label">POSITION & GRÖSSE</div><div class="coordinate-grid">${[['x','Abstand links'],['y','Abstand oben'],['w','Breite'],['h','Höhe']].map(([key,label])=>`<div><label for="field-${key}">${label}</label><div class="unit-input"><input id="field-${key}" data-coordinate="${key}" type="number" min="${['w','h'].includes(key)?2:0}" step="0.5" value="${f[key].toFixed(1)}"><span>mm</span></div></div>`).join('')}</div></section>
 ${f.type==='text'?`<section class="inspector-group layout-tools"><div class="section-label">TYPOGRAFIE</div><div class="style-row"><label for="field-size">Schriftgröße</label><div class="unit-input"><input id="field-size" class="font-size" type="number" min="6" max="80" value="${f.fontSize}"><span>pt</span></div></div><div class="style-row"><label for="field-weight">Schriftschnitt</label><select id="field-weight"><option value="400" ${f.weight==='400'?'selected':''}>Normal</option><option value="700" ${f.weight==='700'?'selected':''}>Fett</option></select></div><div class="style-row"><label for="field-align">Ausrichtung</label><select id="field-align">${[['left','Links'],['center','Mittig'],['right','Rechts']].map(([v,l])=>`<option value="${v}" ${f.align===v?'selected':''}>${l}</option>`).join('')}</select></div><div class="style-row"><label for="field-color">Textfarbe</label><div class="color-field"><span>${escape(f.color)}</span><input type="color" id="field-color" value="${f.color}"></div></div><label class="checkbox-label"><input type="checkbox" id="field-fit" ${f.autoFit?'checked':''}> Lange Texte automatisch einpassen</label></section>`:''}
 <section class="inspector-group layout-tools"><div class="style-row"><label for="field-background">Hintergrund</label><input id="field-background" type="color" value="${f.background==='transparent'?'#ffffff':f.background}"></div><label class="checkbox-label"><input id="field-transparent" type="checkbox" ${f.background==='transparent'?'checked':''}> Transparent</label></section>
 ${f.type==='image'?`<section class="inspector-group"><label for="image-fit">Bild im Rahmen</label><select id="image-fit"><option value="contain" ${f.fit!=='cover'?'selected':''}>Ganzes Bild einpassen</option><option value="cover" ${f.fit==='cover'?'selected':''}>Rahmen füllen (Zuschnitt)</option></select><button class="button" id="replace-image" style="margin-top:14px;width:100%">Eigenes Bild einsetzen</button></section>`:''}
 <div class="layer-order layout-tools"><button class="button" id="layer-back">↓ Nach hinten</button><button class="button" id="layer-front">↑ Nach vorn</button></div><div class="inspector-actions"><button class="button" id="duplicate-field">${icon('copy')}Duplizieren</button><button class="button" id="delete-field" aria-label="Feld löschen">${icon('trash')}Löschen</button></div><div class="inspector-help layout-tools">${decorative?'Mit den Pfeiltasten verschieben. Über „Nach hinten“ und „Nach vorn“ legst du die Reihenfolge fest.':f.type==='qr'?'Der QR-Code enthält den vollständigen Link des Empfängers. Seine weiße Ruhezone wird automatisch mit angelegt.':'Nutze {{company}}, {{first_name}} oder eigene CSV-Spalten. Pfeiltasten verschieben um 0,5 mm; mit Umschalt um 5 mm.'}</div>`;
 if(f.type==='image'){$('#image-fit').onchange=e=>commit(()=>f.fit=e.target.value);$('#replace-image').onclick=()=>{imageReplaceTarget=f.id;$('#image-file').click();};}
 for(const [id,delta] of [['layer-back',-1],['layer-front',1]]){const fields=campaign.sides[side].fields,index=fields.indexOf(f);$('#'+id).disabled=index+delta<0||index+delta>=fields.length;$('#'+id).onclick=()=>commit(()=>{fields.splice(index,1);fields.splice(index+delta,0,f);});}
 $('#field-binding').onchange=e=>{if(e.target.value!=='custom')commit(()=>f.text=`{{${e.target.value}}}`);};
 if($('#recipient-field-value'))$('#recipient-field-value').oninput=e=>commit(()=>recipient()[bound]=e.target.value.slice(0,5000),{inspector:false,table:false});
 $('#field-text').oninput=e=>commit(()=>f.text=e.target.value.slice(0,5000),{inspector:false,table:false});
 $$('[data-coordinate]').forEach(input=>input.onchange=e=>{const key=e.target.dataset.coordinate,n=Number(e.target.value);if(!Number.isFinite(n)){renderInspector();return;}commit(()=>{
   if(key==='x')f.x=clamp(n,0,format().width-f.w);if(key==='y')f.y=clamp(n,0,format().height-f.h);
   if(key==='w')f.w=clamp(n,2,format().width-f.x);if(key==='h')f.h=clamp(n,2,format().height-f.y);
   if(f.type==='qr'&&['w','h'].includes(key))f.w=f.h=Math.min(f[key],format().width-f.x,format().height-f.y);
 });});
 if(f.type==='text'){
   $('#field-size').onchange=e=>commit(()=>f.fontSize=clamp(Number(e.target.value)||12,6,80));
   $('#field-weight').onchange=e=>commit(()=>f.weight=e.target.value);
   $('#field-align').onchange=e=>commit(()=>f.align=e.target.value);
   $('#field-color').oninput=e=>commit(()=>f.color=e.target.value,{inspector:false});
   $('#field-fit').onchange=e=>commit(()=>f.autoFit=e.target.checked);
 }
 $('#field-background').oninput=e=>{commit(()=>f.background=e.target.value,{inspector:false});$('#field-transparent').checked=false;};
 $('#field-transparent').onchange=e=>commit(()=>f.background=e.target.checked?'transparent':'#ffffff');
 $('#duplicate-field').onclick=()=>{if(campaign.sides[side].fields.length>=(isSelfmailer(campaign)?80:40))return toast(`Maximal ${isSelfmailer(campaign)?80:40} Felder pro Druckseite.`,true);commit(()=>{const copy={...f,id:uid(),x:Math.min(f.x+4,format().width-f.w),y:Math.min(f.y+4,format().height-f.h)};campaign.sides[side].fields.push(copy);selected=copy.id;});};
 $('#delete-field').onclick=deleteField;
}
function deleteField(){if(!selectedField())return;commit(()=>{campaign.sides[side].fields=campaign.sides[side].fields.filter(f=>f.id!==selected);selected=null;});}
function renderOverlays(){
 $('#field-overlays').innerHTML=editableFields().map(f=>`<div role="button" tabindex="0" aria-label="${escape(fieldName(f))} ${editorMode==='content'?'bearbeiten':'verschieben'}" aria-pressed="${f.id===selected}" data-field="${f.id}" class="field-overlay ${f.id===selected?'selected':''}" style="left:${f.x/format().width*100}%;top:${f.y/format().height*100}%;width:${f.w/format().width*100}%;height:${f.h/format().height*100}%"><span class="field-tag">${escape(fieldName(f))}</span><span class="handle"></span></div>`).join('');
}
async function requestRender(){
 if(view==='dashboard')return;
 const version=++renderVersion;const snapshot=clone(campaign),person=clone(view==='design'?designRecipient():recipient());
 const targets=view==='tutorial'?['front','back'].filter(s=>$('#tutorial-'+s)).map(s=>[s,'#tutorial-'+s]):view==='setup'?(campaign.onboarding?.step===2?[['front','#guide-front'],['back','#guide-back']]:campaign.onboarding?.step===5?[['front','#guide-finish-front']]:[]):view==='preview'?[['front','#proof-front'],['back','#proof-back'],['front','#three-d-front'],['back','#three-d-back']]:[[side,'#design-canvas'],['front','#thumb-front'],['back','#thumb-back']];
 try{
   const results=await Promise.all(targets.map(async([s,target])=>{const cvs=document.createElement('canvas');const overflow=await renderCanvas(cvs,snapshot,s,person,{scale:target.includes('thumb')?1.2:5});return{cvs,target,overflow,side:s};}));
   if(version!==renderVersion)return;
   drawingIssues=[];
   for(const{cvs,target,overflow,side:s}of results){const dest=$(target);dest.width=cvs.width;dest.height=cvs.height;dest.getContext('2d').drawImage(cvs,0,0);if(!target.includes('thumb')&&!target.includes('three-d')&&overflow.length)drawingIssues.push({level:'error',text:`${s==='front'?'Vorderseite':'Rückseite'}: ${overflow.length} Textfeld(er) zu klein für diesen Empfänger. Bitte größer ziehen.`});}
   if(view==='tutorial'&&$('#tutorial-qr')){const qr=snapshot.sides.back.fields.find(f=>f.type==='qr'),back=results.find(r=>r.side==='back');if(qr&&back){const q=$('#tutorial-qr');q.width=q.height=440;q.getContext('2d').drawImage(back.cvs,qr.x*5,qr.y*5,Math.min(qr.w,qr.h)*5,Math.min(qr.w,qr.h)*5,0,0,440,440);}}
   if(view==='preview'){if(isSelfmailer(snapshot))threeD.setSpreads($('#three-d-front'),$('#three-d-back'));renderChecks();}
 }catch(e){if(version===renderVersion)toast(e.message,true);}
}
function renderChecks(){const issues=[...checks(campaign),...drawingIssues];const errors=issues.filter(i=>i.level==='error');$('#check-count').textContent=errors.length?`${errors.length} offene Punkte`:'Keine blockierenden Fehler';$('#check-list').innerHTML=[{level:'success',text:`${formatCaption(campaign)} · ${sideLabel(campaign,'front')} und ${sideLabel(campaign,'back')}`},{level:'success',text:`${campaign.recipients.length} Empfänger · ${campaign.sides.front.fields.length+campaign.sides.back.fields.length} Designelemente`},...issues].map(i=>`<div class="check-item ${i.level}">${icon(i.level==='success'?'check':i.level==='info'?'info':'warning')}<span>${escape(i.text)}</span></div>`).join('');$('#pdf-export').disabled=!!errors.length;$('#png-export').disabled=!!errors.length;$('#print-export').hidden=!isSelfmailer(campaign);$('#print-export').disabled=!!errors.length;$('#print-template-download').hidden=!isSelfmailer(campaign);}
function defaultTextColor(){const bg=campaign.sides[side].background;if(bg.kind==='template'&&side==='front')return '#ffffff';if(bg.kind==='blank'&&bg.color){const rgb=bg.color.slice(1).match(/../g).map(v=>parseInt(v,16));return rgb[0]*.299+rgb[1]*.587+rgb[2]*.114<145?'#ffffff':'#202321';}return '#202321';}
function addField(type){if(campaign.sides[side].fields.length>=(isSelfmailer(campaign)?80:40))return toast(`Maximal ${isSelfmailer(campaign)?80:40} Felder pro Druckseite.`,true);commit(()=>{const f={id:uid(),type:type==='qr'?'qr':'text',text:type==='qr'?'{{chatbot_url}}':type==='company'?'{{company}}':type==='salutation'?'{{salutation}}':'Ihr persönlicher Text',x:type==='qr'?160:15,y:type==='qr'?100:20+Math.min(campaign.sides[side].fields.filter(f=>f.type==='text').length,5)*20,w:type==='qr'?28:75,h:type==='qr'?28:15,fontSize:16,weight:'700',align:'left',color:defaultTextColor(),background:type==='qr'?'#ffffff':'transparent',autoFit:true};campaign.sides[side].fields.push(f);selected=f.id;});toast(type==='qr'?'QR-Code hinzugefügt. Ziehe ihn an die passende Stelle.':'Feld hinzugefügt. Du kannst es direkt im Design verschieben.');}
function renderRecipients(){
 $('#contact-import-start').hidden=campaign.recipients.length>0;$('#contact-columns-row').hidden=!campaign.recipients.length;
 const cols=keys();$('#data-count').textContent=`${campaign.recipients.length} Empfänger`;$('#sample-label').hidden=!campaign.sample;$('#sample-notice').hidden=!campaign.sample;
 $('#recipients-head').innerHTML='<tr>'+cols.map(k=>`<th scope="col" ${['company','first_name','personal_note','chatbot_url'].includes(k)?'':'class="extra-contact-column"'}>${escape(KEYS[k]||k)}</th>`).join('')+'<th scope="col"><span class="sr-only">Aktionen</span></th></tr>';
 $('#recipients-body').innerHTML=campaign.recipients.map((r,i)=>`<tr data-recipient-index="${i}">${cols.map(k=>`<td ${['company','first_name','personal_note','chatbot_url'].includes(k)?'':'class="extra-contact-column"'}>${k==='personal_note'?`<textarea data-row="${i}" data-key="${k}" aria-label="Persönliche Nachricht für Empfänger ${i+1}" rows="2" placeholder="Warum passt dein Angebot zu dieser Firma?">${escape(r[k]||'')}</textarea>`:`<input data-row="${i}" data-key="${escape(k)}" aria-label="${escape(KEYS[k]||k)} für Empfänger ${i+1}" value="${escape(r[k]||'')}" ${k==='chatbot_url'?`type="url" aria-invalid="${!validURL(r[k])}"`:''}>`}</td>`).join('')}<td><button class="icon-button" data-delete-recipient="${i}" aria-label="Empfänger ${i+1} löschen">${icon('trash')}</button></td></tr>`).join('')||`<tr><td colspan="${cols.length+1}" style="padding:32px">Füge deinen ersten Empfänger hinzu oder importiere eine CSV-Datei.</td></tr>`;filterRecipients();
}
$('#recipients-body').addEventListener('input',e=>{const input=e.target.closest('[data-row]');if(!input)return;commit(()=>{const r=campaign.recipients[Number(input.dataset.row)],previous=r.first_name;r[input.dataset.key]=input.value.slice(0,5000);if(input.dataset.key==='first_name'){const prefix=r.salutation===`Hey ${previous},`?'Hey':'Hallo';if(!r.salutation||r.salutation===`${prefix} ${previous},`||r.salutation===`${prefix},`)r.salutation=r.first_name?`${prefix} ${r.first_name},`:`${prefix},`;}},{inspector:false,table:false});if(input.dataset.key==='chatbot_url')input.setAttribute('aria-invalid',String(!validURL(input.value)));});
$('#recipients-body').addEventListener('click',async e=>{const btn=e.target.closest('[data-delete-recipient]');if(!btn)return;const index=Number(btn.dataset.deleteRecipient);if(await confirm('Empfänger entfernen?',`${campaign.recipients[index].company||'Dieser Empfänger'} wird aus dieser Kampagne entfernt.`,'Entfernen'))commit(()=>{campaign.recipients.splice(index,1);recipientIndex=clamp(recipientIndex,0,Math.max(0,campaign.recipients.length-1));});});
$('#field-overlays').addEventListener('pointerdown',e=>{
 const overlay=e.target.closest('[data-field]');if(!overlay||e.button!==0)return;e.preventDefault();selected=overlay.dataset.field;const f=selectedField();renderInspector();$$('.layer').forEach(el=>el.classList.toggle('active',el.dataset.layer===selected));$$('.field-overlay').forEach(el=>{el.classList.toggle('selected',el.dataset.field===selected);el.setAttribute('aria-pressed',String(el.dataset.field===selected));});overlay.focus();if(editorMode==='content')return;
 const start={x:e.clientX,y:e.clientY,field:{...f}},rect=$('#artboard').getBoundingClientRect(),resize=e.target.classList.contains('handle');let moved=false;
 overlay.setPointerCapture(e.pointerId);activeDrag=overlay;
 const move=ev=>{const dx=(ev.clientX-start.x)/rect.width*format().width,dy=(ev.clientY-start.y)/rect.height*format().height;if(!moved&&Math.abs(dx)+Math.abs(dy)>.3){checkpoint();moved=true;}if(!moved)return;
   const snap=v=>Math.round(v*2)/2;
   if(resize){f.w=clamp(snap(start.field.w+dx),2,format().width-f.x);f.h=clamp(snap(start.field.h+dy),2,format().height-f.y);if(f.type==='qr')f.w=f.h=Math.min(Math.max(f.w,f.h),format().width-f.x,format().height-f.y);}
   else{f.x=clamp(snap(start.field.x+dx),0,format().width-f.w);f.y=clamp(snap(start.field.y+dy),0,format().height-f.h);}
   overlay.style.left=f.x/format().width*100+'%';overlay.style.top=f.y/format().height*100+'%';overlay.style.width=f.w/format().width*100+'%';overlay.style.height=f.h/format().height*100+'%';
   for(const key of ['x','y','w','h'])if($('#field-'+key))$('#field-'+key).value=f[key].toFixed(1);requestRender();
 };
 const end=()=>{overlay.removeEventListener('pointermove',move);overlay.removeEventListener('pointerup',end);overlay.removeEventListener('pointercancel',end);activeDrag=null;if(moved)changed();};
 overlay.addEventListener('pointermove',move);overlay.addEventListener('pointerup',end);overlay.addEventListener('pointercancel',end);
});
$('#field-overlays').addEventListener('keydown',e=>{const overlay=e.target.closest('[data-field]');if(!overlay)return;selected=overlay.dataset.field;const f=selectedField();if(e.key==='Enter'||e.key===' '){e.preventDefault();renderUI();return;}if(editorMode==='layout'&&e.key.startsWith('Arrow')){e.preventDefault();const delta=e.shiftKey?5:.5;commit(()=>{f.x=clamp(f.x+(e.key==='ArrowRight'?delta:e.key==='ArrowLeft'?-delta:0),0,format().width-f.w);f.y=clamp(f.y+(e.key==='ArrowDown'?delta:e.key==='ArrowUp'?-delta:0),0,format().height-f.h);});$(`[data-field="${selected}"]`)?.focus();}});
$('#artboard').addEventListener('click',e=>{if(e.target.id==='design-canvas'||e.target.id==='artboard'){selected=null;renderInspector();renderOverlays();}});
$('#layer-list').onclick=e=>{const b=e.target.closest('[data-layer]');if(b){selected=b.dataset.layer;renderUI();}};
async function loadDesign(file){
 if(!file)return;if(file.size>20*1024*1024)return toast('Die Datei ist zu groß. Bitte maximal 20 MB hochladen.',true);
 const target=side;let backgrounds=[];
 await busy('Dein Design wird vorbereitet …',async()=>{
  if(file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')){
   const pdfjs=await import('pdfjs-dist/build/pdf.mjs');
   // Keep the worker local, including when the studio is hosted below a path prefix.
   pdfjs.GlobalWorkerOptions.workerSrc=new URL('vendor/pdf.worker.min.mjs',document.baseURI).href;
   const task=pdfjs.getDocument({data:await preparePrintImport(await file.arrayBuffer(),format()),isEvalSupported:false,useSystemFonts:true,cMapUrl:new URL('vendor/cmaps/',document.baseURI).href,cMapPacked:true,standardFontDataUrl:new URL('vendor/standard_fonts/',document.baseURI).href,wasmUrl:new URL('vendor/wasm/',document.baseURI).href});
   let pdf;try{pdf=await task.promise;}catch{await task.destroy();throw new Error('Die PDF konnte nicht geöffnet werden. Bitte eine gültige, unverschlüsselte PDF verwenden.');}
   try{
    let mode='single',pageNumber=1;
    if(pdf.numPages>1){$('#busy').hidden=true;const answer=await modal('Seiten aus der PDF übernehmen',`<p>${escape(file.name)} enthält ${pdf.numPages} Seiten. Welche möchtest du verwenden?</p><label class="modal-choice"><input type="radio" name="pdf-mode" value="both" checked> Seite 1 als ${sideLabel(campaign,'front')}, Seite 2 als ${sideLabel(campaign,'back')}</label><label class="modal-choice"><input type="radio" name="pdf-mode" value="single"> Eine Seite auf die aktuelle Mailing-Seite</label><label for="pdf-page">PDF-Seite</label><input id="pdf-page" type="number" min="1" max="${pdf.numPages}" value="1"><p style="margin-top:15px">Vorhandene Personalisierungsfelder bleiben erhalten und lassen sich danach anpassen.</p>`,[{id:'cancel',label:'Abbrechen'},{id:'ok',label:'Design übernehmen',primary:true}]);if(answer!=='ok')return;
      mode=$('input[name="pdf-mode"]:checked').value;pageNumber=clamp(Number($('#pdf-page').value)||1,1,pdf.numPages);$('#busy').hidden=false;
    }
    for(const[s,n]of mode==='both'?[['front',1],['back',2]]:[[target,pageNumber]]){
      const page=await pdf.getPage(n),base=page.getViewport({scale:1}),scale=Math.min(300/72,3500/Math.max(base.width,base.height));
      const bleed=isSelfmailer(campaign)?detectBleed(base.width*25.4/72,base.height*25.4/72,format()):0;
      if(bleed===null)throw new Error('Für diesen Selfmailer bitte PDF-Seiten mit 210 × 198 mm oder 216 × 204 mm inklusive Beschnitt hochladen. Einzelne gefaltete Flächen zuerst zu zwei Druckseiten zusammensetzen.');
      const viewport=page.getViewport({scale}),cvs=document.createElement('canvas');cvs.width=Math.round(viewport.width);cvs.height=Math.round(viewport.height);
      await page.render({canvasContext:cvs.getContext('2d'),viewport,background:'rgb(255,255,255)'}).promise;
      backgrounds.push([s,{kind:'image',data:cvs.toDataURL('image/png'),width:cvs.width,height:cvs.height,name:`${file.name} · Seite ${n}`,bleed}]);
    }
   }finally{await task.destroy();}
  }else if(['image/png','image/jpeg','image/webp'].includes(file.type)){
   const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('Die Datei konnte nicht gelesen werden.'));r.readAsDataURL(file);});
   const img=await imageFrom(src);if(img.width*img.height>80000000)throw new Error('Dieses Bild ist sehr groß. Bitte auf maximal 80 Megapixel verkleinern.');
   const scale=Math.min(1,3500/Math.max(img.width,img.height)),cvs=document.createElement('canvas');cvs.width=Math.round(img.width*scale);cvs.height=Math.round(img.height*scale);const ctx=cvs.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,cvs.width,cvs.height);ctx.drawImage(img,0,0,cvs.width,cvs.height);
   let bleed=0;
   if(isSelfmailer(campaign)){
    $('#busy').hidden=true;
    const answer=await modal('Ist Beschnitt in deiner Datei enthalten?',`<p>So bleibt dein Design in der richtigen Größe. Wähle das Format, in dem du die Bilddatei erstellt hast.</p><label class="modal-choice"><input type="radio" name="image-bleed" value="0" checked> Endformat · 210 × 198 mm</label><label class="modal-choice"><input type="radio" name="image-bleed" value="3"> Mit 3 mm Beschnitt · 216 × 204 mm</label><p>Du hast einzelne gefaltete Flächen? Setze sie zuerst mit unserer <a href="/assets/print/kontaktstoff-din-lang-vorlagen.zip" download>Vorlage</a> zu zwei Druckseiten zusammen.</p>`,[{id:'cancel',label:'Abbrechen'},{id:'ok',label:'Design übernehmen',primary:true}]);
    if(answer!=='ok')return;bleed=Number($('input[name="image-bleed"]:checked').value);$('#busy').hidden=false;
    if(Math.abs(cvs.width/cvs.height-(210+2*bleed)/(198+2*bleed))>.005)throw new Error(`Das Seitenverhältnis passt nicht zu ${210+2*bleed} × ${198+2*bleed} mm. Bitte die Datei im gewählten Format exportieren.`);
   }
   backgrounds.push([target,{kind:'image',data:cvs.toDataURL('image/png'),width:cvs.width,height:cvs.height,name:file.name,bleed}]);
  }else throw new Error('Bitte eine PDF-, PNG-, JPG- oder WebP-Datei auswählen.');
  if(backgrounds.some(([,bg])=>bg.data.length>16000000))throw new Error('Das gerasterte Design ist zu groß zum Speichern. Bitte eine kleinere Bilddatei oder eine vereinfachte PDF verwenden.');
  if(backgrounds.length){commit(()=>{backgrounds.forEach(([s,bg])=>campaign.sides[s].background=bg);});toast(`${backgrounds.length===2?'Beide Seiten':'Design'} übernommen. Personalisierungsfelder jetzt passend platzieren.`);}
 });
}
$('#upload-button').onclick=()=>$('#design-file').click();$('#design-file').onchange=e=>{loadDesign(e.target.files[0]);e.target.value='';};
for(const element of [$('#upload-button'),$('#canvas-scroll')]){
 element.addEventListener('dragover',e=>{e.preventDefault();element.classList.add('drop-target');});element.addEventListener('dragleave',()=>element.classList.remove('drop-target'));
 element.addEventListener('drop',e=>{e.preventDefault();element.classList.remove('drop-target');loadDesign(e.dataTransfer.files[0]);});
}
$('#background-remove').onclick=async()=>{if(await confirm('Hintergrund entfernen?','Deine persönlichen Felder bleiben erhalten. Den Hintergrund kannst du anschließend neu hochladen.','Entfernen'))commit(()=>campaign.sides[side].background={kind:'blank'});};
$('#format-select').onchange=async e=>{
 const next=FORMATS.find(f=>f.id===e.target.value),old=format();if(!next||next.id===old.id)return;
 if(next.id==='selfmailer-dl-4'){if(await confirm('Als Selfmailer gestalten?','Aus dem bisherigen Design werden vier Flächen: Titel und Anschrift außen, Nachricht und Angebot innen. Prüfe anschließend Texte und Postanschriften. Rückgängig ist möglich.','Selfmailer übernehmen'))commit(()=>{campaign=toSelfmailer(campaign);side='front';selected=null;});else e.target.value=campaign.format;return;}
 if(await confirm('Format ändern?',`Das Mailing wird auf ${next.width} × ${next.height} mm umgestellt. Positionen werden proportional angepasst. Prüfe danach beide Seiten und lade bei Bedarf passende Designs hoch.`,'Format übernehmen')){
  const backgrounds={};for(const [side,s] of Object.entries(campaign.sides))if(s.background.bleed===3){const image=await imageFrom(s.background.data),canvas=document.createElement('canvas');canvas.width=Math.round(image.width*old.width/(old.width+6));canvas.height=Math.round(image.height*old.height/(old.height+6));canvas.getContext('2d').drawImage(image,image.width*3/(old.width+6),image.height*3/(old.height+6),image.width*old.width/(old.width+6),image.height*old.height/(old.height+6),0,0,canvas.width,canvas.height);backgrounds[side]={...s.background,data:canvas.toDataURL(),width:canvas.width,height:canvas.height,bleed:0};}
  commit(()=>{for(const [side,s] of Object.entries(campaign.sides)){if(backgrounds[side])s.background=backgrounds[side];for(const f of s.fields){f.x=f.x/old.width*next.width;f.y=f.y/old.height*next.height;f.w=f.w/old.width*next.width;f.h=f.h/old.height*next.height;if(f.type==='qr')f.w=f.h=Math.min(f.w,f.h);}}campaign.format=next.id;});
 }else e.target.value=campaign.format;
};
$$('[data-side]').forEach(b=>b.onclick=()=>setSide(b.dataset.side));$$('[data-tab]').forEach(b=>b.onclick=()=>setView(b.dataset.tab));$$('[data-add]').forEach(b=>b.onclick=()=>addField(b.dataset.add));
$('#open-preview').onclick=()=>setView('preview');$('#undo').onclick=undo;$('#redo').onclick=redo;$('#guides-toggle').onclick=()=>{guides=!guides;renderUI(false,false);};
function fitArtboard(){if(view!=='design')return;const area=$('#canvas-scroll'),style=getComputedStyle(area);const availableW=area.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);const availableH=area.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom)-28;const base=Math.max(180,Math.min(840,availableW,Math.max(180,availableH)*format().width/format().height));const factor=$('#zoom').value==='fit'?1:Number($('#zoom').value);$('#artboard-wrap').style.width=`${base*factor}px`;$('#artboard-wrap').style.maxWidth='none';}
$('#zoom').onchange=fitArtboard;new ResizeObserver(fitArtboard).observe($('#canvas-scroll'));
for(const id of ['active-recipient','preview-recipient'])$('#'+id).onchange=e=>{recipientIndex=Number(e.target.value)||0;renderUI();};
$('#prev-recipient').onclick=()=>{recipientIndex=Math.max(0,recipientIndex-1);renderUI();};$('#next-recipient').onclick=()=>{recipientIndex=Math.min(campaign.recipients.length-1,recipientIndex+1);renderUI();};
$('#add-recipient').onclick=()=>{if(campaign.recipients.length>=1000)return toast('Maximal 1.000 Empfänger pro Kampagne.',true);commit(()=>{campaign.recipients.push({id:uid(),company:'',first_name:'',salutation:'',website:'',chatbot_url:''});recipientIndex=campaign.recipients.length-1;});$(`[data-row="${recipientIndex}"][data-key="company"]`)?.focus();};
$('#csv-template').onclick=()=>download(new Blob([csvString([{company:'Muster GmbH',first_name:'Anna',salutation:'Hallo Anna,',personal_note:'Eine persönliche Idee für euer nächstes Projekt.',website:'https://example.org',chatbot_url:'https://example.org/dein-angebot'}],keys())],{type:'text/csv;charset=utf-8'}),'kontaktstoff-empfaenger-vorlage.csv');
$('#csv-export').onclick=()=>download(new Blob([csvString(campaign.recipients,keys())],{type:'text/csv;charset=utf-8'}),filename()+'-empfaenger.csv');
$('#csv-upload').onclick=()=>$('#csv-file').click();
function importContacts(file){if(!file)return;openCSVImport(file,{keys:keys(),existingCount:campaign.recipients.length,onImport:(rows,mode)=>{commit(()=>{campaign.recipients=mode==='replace'?rows:[...campaign.recipients,...rows];if(mode==='replace')campaign.sample=false;recipientIndex=0;});toast(`${rows.length} Kontakte übernommen. Schau dir jetzt deine personalisierten Karten an.`);}});}
$('#csv-file').onchange=e=>{const file=e.target.files[0];e.target.value='';importContacts(file);};
$('#csv-drop-zone').onclick=()=>$('#csv-file').click();
$('#csv-drop-zone').ondragover=e=>{e.preventDefault();e.currentTarget.classList.add('drag-over');};
$('#csv-drop-zone').ondragleave=e=>e.currentTarget.classList.remove('drag-over');
$('#csv-drop-zone').ondrop=e=>{e.preventDefault();e.currentTarget.classList.remove('drag-over');importContacts(e.dataTransfer.files[0]);};
$('#csv-template-empty').onclick=()=>$('#csv-template').click();
$('#contact-add-empty').onclick=()=>$('#add-recipient').click();
$('#contact-columns').onchange=e=>$('#recipients-view').classList.toggle('show-all-columns',e.target.checked);

$('#rename-campaign').onclick=async()=>{const promise=modal('Kampagne umbenennen',`<label for="campaign-name">Name deiner Kampagne</label><input id="campaign-name" maxlength="120" value="${escape(campaign.name)}">`,[{id:'cancel',label:'Abbrechen'},{id:'ok',label:'Speichern',primary:true}]);$('#campaign-name').focus();$('#campaign-name').select();if(await promise==='ok'){const name=$('#campaign-name').value.trim();if(name)commit(()=>campaign.name=name);}};
$('#project-export').onclick=()=>{download(new Blob([JSON.stringify(campaign,null,2)],{type:'application/json'}),filename()+'.kontaktstoff.json');toast('Projekt inklusive Designs und Empfängern gesichert.');};
$('#project-file').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;if(file.size>40*1024*1024)return toast('Projektdateien dürfen maximal 40 MB groß sein.',true);await busy('Projekt wird geöffnet …',async()=>{let imported;try{imported=validateCampaign(JSON.parse(await file.text()));}catch(e){throw new Error('Projekt konnte nicht importiert werden: '+e.message);}await flushSave();imported.id=uid();imported.name=(imported.name+' · Import').slice(0,120);campaign=imported;if(campaign.tutorial)campaign.tutorial.active=false;if(campaign.onboarding)campaign.onboarding.active=false;hasActive=true;history=[];future=[];side='front';selected=campaign.sides.front.fields[0]?.id;recipientIndex=0;view='design';changed();toast('Projekt als eigenständige Kampagne geöffnet.');});};
async function activateCampaign(next,initialView){
 await flushSave();try{campaign=validateCampaign(next);}catch(e){toast('Die Kampagne konnte nicht geöffnet werden: '+e.message,true);return;}hasActive=true;history=[];future=[];side='front';recipientIndex=0;editorMode=campaign.sides.front.fields.length?'content':'layout';selected=firstEditable()?.id;if(campaign.tutorial)campaign.tutorial.active=false;if(campaign.onboarding)campaign.onboarding.active=false;view=initialView||'design';clearAudit();campaign.updatedAt=Date.now();await flushSave();changed();
}
async function showDashboard(){
 await flushSave();try{sessionStorage.removeItem('kontaktstoff-active');}catch{}view='dashboard';renderVersion++;renderUI();const version=++dashboardVersion;
 let deleted=[];try{dashboardCampaigns=(await listCampaigns()).sort((a,b)=>b.updatedAt-a.updatedAt);deleted=await listDeletedCampaigns();}catch{dashboardCampaigns=[];toast('Lokaler Speicher ist nicht verfügbar. Du kannst trotzdem mit einer Projektdatei arbeiten.',true);}
 if(view!=='dashboard'||version!==dashboardVersion)return;
 $('#dashboard-view').innerHTML=dashboardHTML(dashboardCampaigns,deleted);
 $('#campaign-search').oninput=e=>{const query=e.target.value.toLowerCase().trim();let visible=0;$$('[data-campaign-card]').forEach(card=>{card.hidden=!card.dataset.name.includes(query);if(!card.hidden)visible++;});const savedExamples=$('#saved-examples');if(savedExamples)savedExamples.open=!!query&&!!savedExamples.querySelector('[data-campaign-card]:not([hidden])');$('#search-empty').hidden=!query||visible>0||!dashboardCampaigns.length;};
 for(const p of PROMOTIONS){
  if(view!=='dashboard'||version!==dashboardVersion)return;
  const canvas=$(`[data-promotion-thumb="${p.id}"]`),example=createExampleCampaign(p.id);
  if(canvas)try{await renderCanvas(canvas,example,'front',example.recipients[0],{scale:3});}catch{canvas.replaceWith(document.createTextNode('Beispiel im Studio öffnen'));}
 }
 // Render sequentially to keep large local libraries responsive.
 for(const c of dashboardCampaigns){if(view!=='dashboard'||version!==dashboardVersion)break;const canvas=$(`[data-dashboard-thumb="${c.id}"]`);if(canvas)try{await renderCanvas(canvas,c,'front',c.recipients[0]||{company:'Ihr Unternehmen',salutation:'Guten Tag,',chatbot_url:'https://chattastic.de/'},{scale:2});}catch{canvas.replaceWith(document.createTextNode('Vorschau nicht verfügbar'));}}
}
const builderReturn=()=>{const p=new URLSearchParams(location.search),id=p.get('build');return id&&/^[\w-]+$/.test(id)?'/konto/?tab=build&id='+encodeURIComponent(id)+'&step='+(p.get('view')==='recipients'?'2':'1'):null;};
const reviewReturn=()=>{const id=new URLSearchParams(location.search).get('review');return id&&/^[\w-]+$/.test(id)?'/konto/?tab=reviews&review='+encodeURIComponent(id):null;};
const campaignList=async()=>{if(cloudRecord?.id===campaign.id||new URLSearchParams(location.search).has('workspace')){await flushSave();if(!saveFailed)location.href=reviewReturn()||builderReturn()||'/konto/';}else await showDashboard();};
$('#dashboard-view').onclick=async e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-dashboard-tutorial'))return startTutorial(true);
 if(b.hasAttribute('data-dashboard-example'))return loadExample(b.dataset.dashboardExample||'chattastic');
 if(b.hasAttribute('data-dashboard-new'))return newCampaign();
 if(b.dataset.dashboardRestore){try{await restoreCampaign(b.dataset.dashboardRestore);await showDashboard();toast('Kreation wiederhergestellt.');}catch{toast('Wiederherstellen war nicht möglich.',true);}return;}
 if(b.hasAttribute('data-dashboard-import'))return $('#project-file').click();
 if(b.dataset.dashboardTemplate){const next=toSelfmailer(createTemplate(b.dataset.dashboardTemplate));next.onboarding.active=false;return activateCampaign(next,'design');}
 const id=b.dataset.dashboardOpen||b.dataset.dashboardCopy||b.dataset.dashboardDelete,c=dashboardCampaigns.find(c=>c.id===id);if(!c)return;
 if(b.dataset.dashboardOpen)return activateCampaign(c);
 if(b.dataset.dashboardCopy){const copy=clone(c);copy.id=uid();copy.name=(c.name+' · Kopie').slice(0,120);copy.updatedAt=Date.now();try{await saveCampaign(copy);toast('Eine unabhängige Kopie wurde erstellt.');return showDashboard();}catch{toast('Die Kopie konnte nicht gespeichert werden. Bitte sichere dein Projekt als Datei.',true);return;}}
 if(b.dataset.dashboardDelete)return deleteCreation(c);
};
async function loadExample(id='chattastic'){previewMode='3d';threeD.reset();await activateCampaign(createExampleCampaign(id),'preview');window.scrollTo({top:0,behavior:'instant'});toast('Fertiges Beispiel geladen. Dein vorheriger Entwurf bleibt in deinen Kampagnen.');}
async function deleteCreation(item){
 if(cloudRecord?.id===item.id){if(!await confirm('Kampagne löschen?',`„${item.name}“ wird aus deinem Unternehmenskonto entfernt.`,'Löschen'))return;try{await flushSave();await pendingSaves;await workspaceAPI(cloudPath+item.id,{method:'DELETE',...(cloudPath.includes('library')?{body:{revision:cloudRecord.revision}}:{})});hasActive=false;clearTimeout(saveTimer);location.href='/konto/?tab=campaigns';}catch(e){toast(e.message,true);}return;}
 if(!await confirm('Kreation löschen?',`„${item.name}“ wird in den Papierkorb verschoben. Du kannst sie dort jederzeit wiederherstellen.`,'In den Papierkorb'))return;
 try{await flushSave();await pendingSaves;await trashCampaign(item.id);if(campaign.id===item.id){clearTimeout(saveTimer);hasActive=false;history=[];future=[];try{sessionStorage.removeItem('kontaktstoff-active');}catch{}}await showDashboard();toast('Kreation im Papierkorb. Du kannst sie wiederherstellen.');}catch{toast('Löschen war nicht möglich. Deine Kreation bleibt erhalten.',true);}
}
async function newCampaign(){await flushSave();view='start';renderVersion++;$('#start-view').innerHTML=startHTML();renderUI();window.scrollTo({top:0,behavior:'instant'});await Promise.all(PROMOTIONS.map(async p=>{const canvas=$(`[data-start-thumb="${p.id}"]`),c=toSelfmailer(createExampleCampaign(p.id));if(canvas)await renderCanvas(canvas,c,'front',c.recipients[0],{scale:3,panel:isSelfmailer(c)?'cover':null});}));}
$('#start-view').addEventListener('click',e=>{if(e.target.closest('[data-start-back]'))showDashboard();});
$('#start-view').addEventListener('change',()=>{$('.start-template').hidden=$('#campaign-start-form input[name="mode"]:checked').value!=='template';});
$('#start-view').addEventListener('submit',async e=>{
 if(e.target.id!=='campaign-start-form')return;e.preventDefault();const data=new FormData(e.target),name=String(data.get('name')||'').trim();if(!name){$('#start-name').focus();return;}
 const button=e.target.querySelector('[type="submit"]');button.disabled=true;
 try{const next=toSelfmailer(data.get('mode')==='template'?createTemplate(data.get('template')):createCampaign(true));next.name=name.slice(0,120);next.onboarding.active=false;next.startMode=data.get('mode');await activateCampaign(next,'design');if(data.get('mode')==='upload'){$('#upload-button').focus();toast('Lade jetzt dein Design über „Eigenes Design hochladen“ hoch.');}}
 finally{button.disabled=false;}
});
$('#editor-mode-bar').onclick=e=>{const button=e.target.closest('[data-editor-mode]');if(!button)return;editorMode=button.dataset.editorMode;selected=firstEditable()?.id;renderUI();};
$('#workflow-hint').onclick=e=>{const button=e.target.closest('[data-workflow-next]');if(button)setView(button.dataset.workflowNext);};
$('#delete-campaign').onclick=()=>deleteCreation(campaign);
$('#campaigns-button').onclick=campaignList;$('#breadcrumb-campaigns').onclick=campaignList;$('#new-campaign').onclick=newCampaign;$('#new-campaign-top').onclick=newCampaign;
$('#help-button').onclick=()=>modal('Vom Design zum persönlichen Mailing',`<div class="help-step"><b>1</b><div><h3>Dein Design, auf beiden Seiten.</h3><p>Nutze die Vorlage oder lade deine Designs hoch. Bei einer zweiseitigen PDF kannst du beide Seiten gleichzeitig übernehmen. Bilder werden vollständig eingepasst.</p></div></div><div class="help-step"><b>2</b><div><h3>Platz für Persönlichkeit.</h3><p>Lege Text- und QR-Felder über das Design. Ziehe sie an ihren Platz und verbinde sie mit Spalten aus deiner Empfängerliste. Ein Hintergrund in der passenden Farbe kann alte Platzhalter abdecken.</p></div></div><div class="help-step"><b>3</b><div><h3>Für jeden Kontakt einmal prüfen.</h3><p>Importiere eine CSV oder bearbeite Empfänger direkt. Wechsle in der Vorschau zwischen ihnen und exportiere ein Ansichts-PDF. Ein Scan öffnet den vollständigen Link aus der jeweiligen Zeile.</p></div></div><p><strong>Deine Daten bleiben hier.</strong> Designs, Empfänger und Kampagnen werden nur in diesem Browser gespeichert. Mit „Projekt sichern“ erhältst du eine Datei für Backups und zum Weiterarbeiten auf anderen Geräten. Es gibt noch keine Cloud-Synchronisierung oder Versandfunktion.</p><p style="margin-top:12px">Tastatur: ⌘/Strg Z rückgängig · ⌘/Strg Umschalt Z wiederholen · Pfeiltasten zum Verschieben eines ausgewählten Felds. Der Export ist eine RGB-Ansicht ohne Druckbeschnitt.</p>`);
async function exportProof(type){
 await busy(type==='pdf'?'Dein PDF wird erstellt …':'Dein Bild wird erstellt …',async()=>{
   const snapshot=clone(campaign),person=clone(view==='design'?designRecipient():recipient());if(checks(snapshot).some(i=>i.level==='error'))throw new Error('Bitte zuerst die offenen Punkte im Kampagnen-Check beheben.');
   const canvases=[];for(const s of type==='pdf'?sideNames(snapshot):[side]){const cvs=document.createElement('canvas');const overflow=await renderCanvas(cvs,snapshot,s,person,{scale:300/25.4});if(overflow.length)throw new Error('Ein Textfeld ist zu klein. Bitte vor dem Export vergrößern.');canvases.push(cvs);}
   const company=String(person.company||'vorschau').replace(/[^\p{L}\p{N}]+/gu,'-').slice(0,60);
   if(type==='png'){const blob=await new Promise(r=>canvases[0].toBlob(r,'image/png'));download(blob,`${filename()}-${company}-${side==='front'?'vorderseite':'rueckseite'}.png`);}
   else{const{PDFDocument}=await import('pdf-lib');const doc=await PDFDocument.create();doc.setTitle(snapshot.name+' · '+(person.company||'Vorschau'));doc.setSubject('Kontaktstoff Ansichts-PDF · RGB · ohne Beschnitt');const f=FORMATS.find(f=>f.id===snapshot.format);for(const cvs of canvases){const img=await doc.embedPng(cvs.toDataURL('image/png'));const page=doc.addPage([f.width*72/25.4,f.height*72/25.4]);page.drawImage(img,{x:0,y:0,width:page.getWidth(),height:page.getHeight()});}download(new Blob([await doc.save()],{type:'application/pdf'}),`${filename()}-${company}-ansicht.pdf`);}
   toast(type==='pdf'?'Ansichts-PDF exportiert.':'Mailing-Seite als PNG exportiert.');
 });
}
async function openPrintExport(){
 const snapshot=clone(campaign),person=clone(recipient());
 if(!isSelfmailer(snapshot))return;
 if(checks(snapshot).some(i=>i.level==='error'))return toast('Bitte zuerst die offenen Punkte im Kampagnen-Check korrigieren.',true);
 let warnings,previews;
 await busy('Druckdaten werden geprüft …',async()=>{warnings=await printWarnings(snapshot);previews=await Promise.all(sideNames(snapshot).map(s=>renderPrintCanvas(snapshot,s,person,{dpi:90})));});
 if(!previews)return;
 const extended=sideNames(snapshot).filter(s=>snapshot.sides[s].background.bleed!==3).map(s=>sideLabel(snapshot,s));
 const pending=modal('Druck-PDF herunterladen',`<p>216 × 204 mm · 3 mm Beschnitt · CMYK · 300 dpi</p><div class="print-previews">${previews.map((c,i)=>`<figure><div><img src="${c.toDataURL()}" alt="${sideLabel(snapshot,sideNames(snapshot)[i])} mit Beschnitt"><span></span></div><figcaption>${sideLabel(snapshot,sideNames(snapshot)[i])} · gestrichelt = Schnittkante</figcaption></figure>`).join('')}</div><label for="print-people">Welche Empfänger?</label><select id="print-people"><option value="current">Ausgewählter Empfänger: ${escape(person.company||person.first_name||'Kontakt')}</option><option value="range">Empfängerbereich exportieren (max. 10)</option></select><div id="print-range" hidden><label>Von <input id="print-from" type="number" min="1" max="${snapshot.recipients.length}" value="1"></label><label>Bis <input id="print-to" type="number" min="1" max="${snapshot.recipients.length}" value="${Math.min(10,snapshot.recipients.length)}"></label></div><label for="print-profile">Farbprofil deiner Druckerei (.icc / .icm)</label><input id="print-profile" type="file" accept=".icc,.icm"><p class="field-help">Das Profil bestimmt die CMYK-Farben passend zu Papier und Druckverfahren. Du bekommst es von deiner Druckerei. Es wird nur für diesen Export verwendet.</p><p id="print-profile-error" role="status"></p><details><summary>Beschnitt & Druckprüfung</summary><p>${extended.length?'Bei '+escape(extended.join(' und '))+' wird der äußerste Bildrand 3 mm nach außen fortgesetzt. Die Gestaltung im Endformat bleibt gleich. Bitte den Rand kontrollieren.':'Der Beschnitt stammt aus deinen hochgeladenen Dateien.'}</p><p>PDF-Uploads und der Druckexport werden gerastert. Vorhandene Bilder werden dadurch nicht schärfer. Kein zertifiziertes PDF/X.</p>${warnings.length?'<ul>'+warnings.map(w=>'<li>'+escape(w)+'</li>').join('')+'</ul>':'<p>Keine Bilder unter 300 dpi erkannt.</p>'}</details>${warnings.length?'<p class="print-warning">'+warnings.length+' Hinweis(e) zur Bildauflösung – siehe Druckprüfung.</p>':''}<label class="modal-choice"><input id="print-confirm" type="checkbox"> Ich habe Beschnitt, Bildqualität, Anschrift und freie Postzonen geprüft. Das Profil passt zur Druckerei.</label>`,[{id:'cancel',label:'Abbrechen'},{id:'export',label:'Druck-PDF herunterladen',primary:true}]);
 let profile=null,profileLoad=0;
 const button=$('#modal [data-result="export"]');button.disabled=true;
 const enable=()=>button.disabled=!(profile&&$('#print-confirm').checked);
 $('#print-people').onchange=e=>$('#print-range').hidden=e.target.value!=='range';
 $('#print-confirm').onchange=enable;
 $('#print-profile').onchange=async e=>{const load=++profileLoad;profile=null;enable();const file=e.target.files[0];try{if(!file)return;if(file.size>10*1024*1024)throw new Error('Das Profil darf maximal 10 MB groß sein.');const bytes=validateICC(new Uint8Array(await file.arrayBuffer()));if(load!==profileLoad)return;profile=bytes;$('#print-profile-error').textContent='CMYK-Ausgabeprofil gewählt: '+file.name;}catch(error){if(load===profileLoad)$('#print-profile-error').textContent=error.message;}if(load===profileLoad)enable();};
 if(await pending!=='export')return;
 let people=[person];
 if($('#print-people').value==='range'){const from=Number($('#print-from').value),to=Number($('#print-to').value);if(!Number.isInteger(from)||!Number.isInteger(to)||from<1||to<from||to>snapshot.recipients.length||to-from>=10)return toast('Bitte einen gültigen Bereich mit höchstens 10 Empfängern wählen.',true);people=snapshot.recipients.slice(from-1,to);}
 await busy('Druck-PDF wird erstellt …',async()=>{
  const controller=new AbortController(),cancel=document.createElement('button');cancel.className='button';cancel.textContent='Export abbrechen';cancel.onclick=()=>controller.abort();$('#busy-label').after(cancel);
  try{const bytes=await createPrintPDF(snapshot,{profile,people,signal:controller.signal,onProgress:text=>$('#busy-label').textContent=text});download(new Blob([bytes],{type:'application/pdf'}),`${filename()}-druck-cmyk.pdf`);toast('CMYK-PDF mit 3 mm Beschnitt heruntergeladen.');}finally{cancel.remove();}
 });
}
$('#print-export').onclick=openPrintExport;
$('#pdf-export').onclick=()=>exportProof('pdf');$('#png-export').onclick=()=>exportProof('png');
window.addEventListener('keydown',e=>{if($('#modal').open)return;const editing=e.target.matches('input,textarea,select,[contenteditable=true]');if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'&&!editing){e.preventDefault();e.shiftKey?redo():undo();}if((e.key==='Delete'||e.key==='Backspace')&&!editing&&e.target.closest('[data-field]')){e.preventDefault();deleteField();}});
// 3D controls only change the viewing angle, never the actual mailing geometry.
for(const mode of ['2d','3d'])$('#preview-mode-'+mode).onclick=()=>{previewMode=mode;renderUI();requestAnimationFrame(()=>threeD.paint());};
for(const mode of ['rotate','pan'])$('#three-d-'+mode).onclick=()=>{threeD.setMode(mode);for(const m of ['rotate','pan']){const b=$('#three-d-'+m);b.classList.toggle('active',mode===m);b.setAttribute('aria-pressed',String(mode===m));}};
$('#three-d-plus').onclick=()=>threeD.zoom(1.15);$('#three-d-minus').onclick=()=>threeD.zoom(1/1.15);
$('#three-d-reset').onclick=()=>threeD.reset();$('#three-d-front-button').onclick=()=>threeD.front();$('#three-d-back-button').onclick=()=>threeD.back();$('#three-d-flip').onclick=()=>threeD.flip();
$('#empty-add-text').onclick=()=>addField('text');$('#empty-upload').onclick=()=>$('#design-file').click();
$('#page-color').oninput=e=>commit(()=>campaign.sides[side].background={kind:'blank',color:e.target.value},{inspector:false,guide:false});
$('#back-to-guide').onclick=()=>setView('setup');
function guideStep(step){commit(()=>{campaign.onboarding.step=clamp(step,0,5);});$('#setup-view').scrollIntoView({block:'start',behavior:'smooth'});}
$('#setup-view').addEventListener('input',e=>{
 const key=e.target.dataset.brief;if(!key)return;
 if(key==='name'){if(e.target.value.trim())commit(()=>campaign.name=e.target.value.trim().slice(0,120),{inspector:false,table:false,guide:false});}
 else commit(()=>campaign.brief[key]=e.target.value.slice(0,1000),{inspector:false,table:false,guide:false});
});
$('#setup-view').addEventListener('change',e=>{if(e.target.id==='skip-personalization')commit(()=>campaign.onboarding.personalizationSkipped=e.target.checked);});
$('#setup-view').addEventListener('submit',e=>{
 if(e.target.id!=='guide-recipient-form')return;e.preventDefault();const data=new FormData(e.target),company=String(data.get('company')||'').trim(),first=String(data.get('first_name')||'').trim(),url=String(data.get('chatbot_url')||'').trim();
 if(!company)return toast('Bitte den Firmennamen ergänzen.',true);if(url&&!validURL(url))return toast('Bitte einen vollständigen Link mit https:// eintragen.',true);
 if(campaign.recipients.length>=1000)return toast('Maximal 1.000 Empfänger pro Kampagne.',true);
 commit(()=>{const data={company,first_name:first,salutation:first?'Hallo '+first+',':'Guten Tag,',chatbot_url:url,website:''};if(campaign.onboarding.designReady&&campaign.recipients.length){Object.assign(campaign.recipients[0],data);recipientIndex=0;}else{campaign.recipients.push({id:uid(),...data});recipientIndex=campaign.recipients.length-1;}if(campaign.onboarding.designReady)campaign.onboarding.step=5;});if(campaign.onboarding.designReady)window.scrollTo({top:0,behavior:'instant'});else toast('Empfänger hinzugefügt. Deine Felder verwenden jetzt diese Daten.');
});
$('#setup-view').addEventListener('click',e=>{
 const step=e.target.closest('[data-guide-step]');if(step){guideStep(Number(step.dataset.guideStep));return;}
 const control=e.target.closest('[data-guide-action]');if(!control)return;const action=control.dataset.guideAction;
 if(action==='tutorial'){startTutorial();return;}
 if(action==='example'){loadExample();return;}
 if(action==='next'){if(campaign.onboarding.step===0&&!$('#setup-name').value.trim()){$('#setup-name').focus();toast('Gib deiner Kampagne bitte einen Namen.',true);return;}guideStep(campaign.onboarding.step+1);}
 if(action==='previous')guideStep(campaign.onboarding.step-1);
 if(action==='finish'){commit(()=>campaign.onboarding.active=false);previewMode='3d';setView('preview');toast('Dein Entwurf ist bereit. Prüfe jetzt die Karte für deinen Empfänger.');}
 if(action.startsWith('upload-')){side=action.slice(7);$('#design-file').click();}
 if(action==='edit-front'||action==='edit-back'){side=action.slice(5);selected=campaign.sides[side].fields[0]?.id;setView('design');}
 if(action.startsWith('field-')){const target=$('#guide-field-side').value;side=target;addField(action.slice(6));const select=$('#guide-field-side');if(select)select.value=target;}
 if(action==='edit-fields'){side=$('#guide-field-side').value;selected=campaign.sides[side].fields.at(-1)?.id;setView('design');}
 if(action==='recipients')setView('recipients');
 if(action==='csv')$('#csv-file').click();
 if(action==='three-d'||action==='proof'){previewMode=action==='three-d'?'3d':'2d';setView('preview');}
});
function filterRecipients(){
 const query=$('#recipient-search').value.toLowerCase().trim();let visible=0;
 $$('[data-recipient-index]').forEach(row=>{const r=campaign.recipients[Number(row.dataset.recipientIndex)];row.hidden=query&&!Object.values(r).some(v=>String(v).toLowerCase().includes(query));if(!row.hidden)visible++;});
 $('#recipient-filter-count').textContent=query?`${visible} von ${campaign.recipients.length} Empfängern`:'';
}
$('#recipient-search').oninput=filterRecipients;
$('#image-upload').onclick=()=>{imageReplaceTarget=null;$('#image-file').click();};
$('#image-file').onchange=async e=>{
 const file=e.target.files[0];e.target.value='';if(!file)return;
 const replacement=campaign.sides[side].fields.find(f=>f.id===imageReplaceTarget&&f.type==='image');imageReplaceTarget=null;
 if(!replacement&&campaign.sides[side].fields.length>=(isSelfmailer(campaign)?80:40))return toast(`Maximal ${isSelfmailer(campaign)?80:40} Elemente pro Druckseite.`,true);
 if(file.size>20*1024*1024)return toast('Bitte ein Bild mit maximal 20 MB verwenden.',true);
 if(!['image/png','image/jpeg','image/webp'].includes(file.type))return toast('Bitte PNG, JPG oder WebP verwenden.',true);
 await busy('Dein Bildelement wird vorbereitet …',async()=>{
  const source=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Bild konnte nicht gelesen werden.'));reader.readAsDataURL(file);});
  const image=await imageFrom(source);if(image.width*image.height>80000000)throw new Error('Bitte das Bild auf maximal 80 Megapixel verkleinern.');
  const scale=Math.min(1,2000/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  const w=Math.min(70,65*image.width/image.height),h=w*image.height/image.width;
  if(replacement){commit(()=>replacement.data=canvas.toDataURL('image/png'));toast('Bild ersetzt. Position und Rahmen bleiben erhalten.');return;}
  commit(()=>{const f={id:uid(),type:'image',text:'',data:canvas.toDataURL('image/png'),x:15,y:15,w:Math.max(2,w),h:Math.max(2,h),fontSize:12,weight:'400',align:'left',color:'#202321',background:'transparent',autoFit:true};campaign.sides[side].fields.push(f);selected=f.id;});toast('Bild eingefügt. Ziehen und Größe rechts anpassen.');
 });
};
$('#add-shape').onclick=()=>{if(campaign.sides[side].fields.length>=(isSelfmailer(campaign)?80:40))return toast(`Maximal ${isSelfmailer(campaign)?80:40} Elemente pro Druckseite.`,true);commit(()=>{const f={id:uid(),type:'shape',text:'',x:15,y:15,w:70,h:30,fontSize:12,weight:'400',align:'left',color:'#202321',background:'#e2ff54',autoFit:true};campaign.sides[side].fields.push(f);selected=f.id;});};
async function runJob(label,fn){
 jobController=new AbortController();$('#cancel-job').hidden=false;
 try{await busy(label,()=>fn(jobController.signal));}finally{$('#cancel-job').hidden=true;jobController=null;}
}
$('#cancel-job').onclick=()=>{jobController?.abort();$('#busy-label').textContent='Wird abgebrochen …';};
$('#audit-all').onclick=()=>runJob('Alle Empfänger werden geprüft …',async signal=>{
 const snapshot=clone(campaign);const issues=await auditCampaign(snapshot,(done,total)=>$('#busy-label').textContent=`Empfänger ${done} / ${total} wird geprüft …`,signal);
 const errors=issues.filter(i=>i.level==='error'),warnings=issues.filter(i=>i.level==='warning');
 $('#audit-results').hidden=false;
 $('#audit-results').innerHTML=`<div class="audit-summary ${errors.length?'has-errors':''}"><strong>${errors.length?`${errors.length} Fehler gefunden`:'Alle Empfänger geprüft'}</strong><span>${snapshot.recipients.length} Empfänger · ${warnings.length} Hinweise</span></div><div class="audit-issues">${issues.length?issues.slice(0,100).map(i=>`<div class="check-item ${i.level}">${icon(i.level==='info'?'info':'warning')}<span>${escape(i.text)}</span>${i.recipientId?`<button class="text-button" data-audit-recipient="${i.recipientId}" data-audit-side="${i.side}">Ansehen ↗</button>`:''}</div>`).join(''):'<p>Texte passen, persönliche Felder sind gefüllt und die QR-Ziellinks sind gültig. Bitte die gedruckten Codes vor der Freigabe zusätzlich scannen.</p>'}${issues.length>100?`<p>${issues.length-100} weitere Hinweise. Behebe zuerst die angezeigten Punkte und prüfe erneut.</p>`:''}</div>`;
});
$('#audit-results').onclick=e=>{const b=e.target.closest('[data-audit-recipient]');if(b){recipientIndex=campaign.recipients.findIndex(r=>r.id===b.dataset.auditRecipient);side=b.dataset.auditSide;selected=campaign.sides[side].fields.find(f=>f.type==='text')?.id;setView('design');}};
$('#handoff-export').onclick=async()=>{
 if(!campaign.recipients.length)return toast('Füge zuerst deine Empfänger hinzu.',true);
 const promise=modal('Dein Kampagnenpaket',`<p>Enthält eine personalisierte PDF-Serie mit Vorder- und Rückseite für jeden ausgewählten Empfänger, CSV, Prüfbericht und das vollständige bearbeitbare Projekt.</p><div class="package-range"><label>Von Empfänger<input id="package-from" type="number" min="1" max="${campaign.recipients.length}" value="1"></label><label>Bis Empfänger<input id="package-to" type="number" min="1" max="${campaign.recipients.length}" value="${Math.min(50,campaign.recipients.length)}"></label></div><p>Bis 50 Empfänger pro Paket. Bei größeren Listen exportierst du weitere Bereiche. Das Projekt im Paket enthält immer alle Empfänger.</p><p class="package-disclaimer">RGB-Ansichten ohne Beschnitt. Papier, Druckdaten und Versand bitte anschließend mit deiner Druckerei abstimmen.</p>`,[{id:'cancel',label:'Abbrechen'},{id:'export',label:'ZIP-Paket erstellen',primary:true}]);
 if(await promise!=='export')return;
 const from=Number($('#package-from').value)-1,to=Number($('#package-to').value);
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to>campaign.recipients.length||to<=from||to-from>50)return toast('Bitte einen gültigen Bereich mit maximal 50 Empfängern auswählen.',true);
 await runJob('Deine Kampagne wird geprüft …',async signal=>{
  const snapshot=clone(campaign);const blob=await createHandoff(snapshot,{from,to,signal,onProgress:(done,total)=>$('#busy-label').textContent=`Mailing ${done} / ${total} wird erstellt …`});
  if(signal.aborted)return;download(blob,`${filename()}-${from+1}-${to}-kampagnenpaket.zip`);toast('Kampagnenpaket erstellt. Die Hinweise findest du im Paket.');
 });
};

function makeTutorialCampaign(){
 const c=createExampleCampaign();c.name='chattastic · Mein Mitmach-Tutorial';
 const field=c.sides.back.fields.find(f=>f.text==='{{salutation}}');field.text='Hallo {{first_name}},';
 delete c.onboarding;c.tutorial={version:2,active:true,step:0,fieldId:field.id};return c;
}
async function startTutorial(){return newCampaign();}
function tutorialStep(step){commit(()=>{campaign.tutorial.step=clamp(step,0,TUTORIAL_STEPS.length-1);campaign.tutorial.active=true;});$('#tutorial-title')?.focus({preventScroll:true});$('#tutorial-view').scrollIntoView({block:'start',behavior:'instant'});}
function updateTutorialLive(){
 const f=campaign.sides.back.fields.find(f=>f.id===campaign.tutorial?.fieldId),r=recipient();
 if($('#tutorial-pattern'))$('#tutorial-pattern').textContent=f?.text||'';
 if($('#tutorial-resolved'))$('#tutorial-resolved').textContent=resolveText(f?.text||'',r)||'Hier erscheint dein persönlicher Text.';
 if($('#tutorial-text-help')){const missing=missingKeys(f?.text||'',r);$('#tutorial-text-help').textContent=missing.length?'Für diese Platzhalter fehlt ein Wert: '+[...new Set(missing)].map(k=>'{{'+k+'}}').join(', '):'Dieser Text steht jetzt auch auf deiner Beispielkarte.';}
 if(view==='tutorial'&&campaign.tutorial?.step===2){const next=$('[data-tutorial-action="next"]');if(next)next.disabled=!validURL(r.chatbot_url)||r.chatbot_url.length>1000;}
 if($('#tutorial-qr-status'))$('#tutorial-qr-status').textContent=validURL(r.chatbot_url)&&r.chatbot_url.length<=1000?'Der Code enthält genau den Link aus dieser Empfängerzeile.':'Bitte einen vollständigen HTTP(S)-Link mit maximal 1.000 Zeichen eingeben.';
}
$('#start-tutorial').onclick=()=>$('#help-button').click();$('#example-tutorial').onclick=()=>startTutorial();$('#back-to-tutorial').onclick=()=>setView('tutorial');
$('#tutorial-view').addEventListener('input',e=>{
 if(e.target.dataset.tutorialData){const key=e.target.dataset.tutorialData,value=e.target.value;commit(()=>{recipient()[key]=value;if(key==='first_name')recipient().salutation=value?'Hallo '+value+',':'Guten Tag,';},{guide:false});return;}
 if(e.target.id==='tutorial-url'){commit(()=>recipient().chatbot_url=e.target.value.trim(),{guide:false});return;}
 if(e.target.id!=='tutorial-text')return;
 const f=campaign.sides.back.fields.find(f=>f.id===campaign.tutorial.fieldId);if(f)commit(()=>f.text=e.target.value.slice(0,180),{guide:false});
});
$('#tutorial-view').addEventListener('change',e=>{
 if(e.target.id==='tutorial-person'){recipientIndex=Number(e.target.value)||0;renderUI();return;}

});
$('#tutorial-view').addEventListener('click',async e=>{
 const step=e.target.closest('[data-tutorial-step]');if(step){tutorialStep(Number(step.dataset.tutorialStep));return;}
 const person=e.target.closest('[data-tutorial-person]');if(person){recipientIndex=Number(person.dataset.tutorialPerson);renderUI();return;}
 const token=e.target.closest('[data-tutorial-token]');if(token){const input=$('#tutorial-text'),f=campaign.sides.back.fields.find(f=>f.id===campaign.tutorial.fieldId);if(!f)return;const start=input.selectionStart,end=input.selectionEnd,value=input.value.slice(0,start)+'{{'+token.dataset.tutorialToken+'}}'+input.value.slice(end);commit(()=>f.text=value.slice(0,180));$('#tutorial-text').focus();$('#tutorial-text').setSelectionRange(start+token.dataset.tutorialToken.length+4,start+token.dataset.tutorialToken.length+4);return;}
 const action=e.target.closest('[data-tutorial-action]')?.dataset.tutorialAction;if(!action)return;
 if(action==='fresh'){await startTutorial(true);return;}
 if(action==='own'){
  const own=toSelfmailer(campaign);own.id=uid();own.name='Meine erste Kampagne';own.sample=false;own.recipients=[];const greeting=own.sides.back.fields.find(f=>f.id===own.tutorial.fieldId);if(greeting?.text==='Hallo {{first_name}},')greeting.text='{{salutation}}';delete own.tutorial;
  own.onboarding={active:true,step:4,personalizationSkipped:false,designReady:true};
  own.brief={...own.brief,audience:'',offer:''};
  commit(()=>campaign.tutorial.active=false);
  await activateCampaign(own,'setup');window.scrollTo({top:0,behavior:'instant'});return;
 }
 if(action==='skip'||action==='blank'){
  commit(()=>campaign.tutorial.active=false);
  const blank=toSelfmailer(createCampaign(true));blank.onboarding.active=false;
  await activateCampaign(blank,'design');window.scrollTo({top:0,behavior:'instant'});
  toast('Deine leere Kampagne ist bereit. Die Anleitung und das Tutorial bleiben erreichbar.');return;
 }
 if(action==='next')tutorialStep(campaign.tutorial.step+1);if(action==='previous')tutorialStep(campaign.tutorial.step-1);if(action==='restart')tutorialStep(0);
 if(action==='reset-text'){const f=campaign.sides.back.fields.find(f=>f.id===campaign.tutorial.fieldId);if(f)commit(()=>f.text='Hallo {{first_name}},');}
 if(action==='design'){side='front';selected=campaign.sides.front.fields.find(f=>f.text==='{{company}}')?.id;setView('design');}
 if(action==='upload'){side='front';setView('design');$('#design-file').click();}
 if(action==='recipients')setView('recipients');
 if(action==='csv')$('#csv-export').click();
 if(action==='three-d'){previewMode='3d';setView('preview');$('#three-d-stage').scrollIntoView({block:'center',behavior:'smooth'});}
 if(action==='audit'){setView('preview');$('#audit-all').click();$('#audit-results').scrollIntoView({block:'center'});}
 if(action==='package'){setView('preview');$('#handoff-export').scrollIntoView({block:'center',behavior:'smooth'});}
 if(action==='pdf')exportProof('pdf');
 if(action==='finish'){commit(()=>campaign.tutorial.active=false);setView('preview');toast('Tutorial abgeschlossen. Deine Beispielkampagne bleibt vollständig bearbeitbar.');}

});

$('#share-review').onclick=async()=>{await flushSave();if(!saveFailed&&cloudRecord)location.href='/konto/?tab=reviews&source=campaigns:'+encodeURIComponent(cloudRecord.id);};
$('#request-campaign').onclick=async()=>{await flushSave();if(saveFailed)return;location.href=reviewReturn()||builderReturn()||(cloudPath.includes('library')?'/konto/?tab=reviews&source=designs:'+encodeURIComponent(cloudRecord.id):cloudRecord?.id===campaign.id?'/konto/?tab=brief&id='+encodeURIComponent(campaign.id):'/konto/?request='+encodeURIComponent(campaign.id));};
$('#workspace-link').onclick=async e=>{e.preventDefault();await flushSave();if(saveFailed)return;location.href=reviewReturn()||builderReturn()||(cloudPath.includes('library')?'/konto/?tab=designs':cloudRecord?.id===campaign.id?'/konto/?id='+encodeURIComponent(campaign.id):'/konto/');};
window.addEventListener('beforeunload',()=>{clearTimeout(saveTimer);flushSave();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)flushSave();});
hydrateIcons();
$('#example-use').onclick=async()=>{const button=$('#example-use');button.disabled=true;try{const own=toSelfmailer(campaign);own.id=uid();own.name=('Meine Kampagne · '+(CLIENT_CAMPAIGNS.find(p=>p.id===own.templateId)?.name||PROMOTIONS.find(p=>p.id===own.templateId)?.name||'Mein Design')).slice(0,120);own.sample=false;own.recipients=[];own.updatedAt=Date.now();delete own.tutorial;own.onboarding={active:false,step:0,personalizationSkipped:false};await activateCampaign(own,'design');window.scrollTo({top:0,behavior:'instant'});toast('Deine eigene Kopie. Klicke auf einen Text in der Karte, um ihn zu ändern.');}finally{button.disabled=false;}};
$('#example-next').onclick=()=>{recipientIndex=(recipientIndex+1)%Math.max(1,campaign.recipients.length);renderUI();};
$('#example-edit').onclick=()=>{side='front';selected=campaign.sides.front.fields.find(f=>f.text==='{{company}}')?.id;setView('design');};
$('#example-data').onclick=()=>setView('recipients');
const params=new URLSearchParams(location.search);
if(reviewReturn()){$('#workspace-link').textContent='Zurück zur Abstimmung';$('#request-campaign').textContent='Speichern & zur Abstimmung →';}
try{
 const campaigns=await listCampaigns();const latest=campaigns.sort((a,b)=>b.updatedAt-a.updatedAt)[0];
 if(params.has('design')){cloudPath='/library/designs/';await workspaceAPI('/auth/me');cloudRecord=await workspaceAPI(cloudPath+encodeURIComponent(params.get('design')));campaign=validateCampaign(cloudRecord.project);hasActive=true;view=['design','recipients','preview'].includes(params.get('view'))?params.get('view'):'design';saveState('In der Designbibliothek gespeichert');}
 else if(params.has('cloud')){await workspaceAPI('/auth/me');cloudRecord=await workspaceAPI('/campaigns/'+encodeURIComponent(params.get('cloud')));campaign=validateCampaign(cloudRecord.project);hasActive=true;view=['design','recipients','preview'].includes(params.get('view'))?params.get('view'):'design';saveState('Im Konto gespeichert');}
 else if(params.has('local')){const local=campaigns.find(c=>c.id===params.get('local'));if(!local)throw Error('Dieser lokale Entwurf wurde nicht gefunden.');campaign=validateCampaign(local);hasActive=true;view=['design','recipients','preview'].includes(params.get('view'))?params.get('view'):'design';}
 else if(params.has('tutorial')||params.get('start')==='1'){view='start';}
 else if(CLIENT_CAMPAIGNS.some(c=>c.id===params.get('client'))){campaign=createClientCampaign(params.get('client'));try{const draft=sessionStorage.getItem('kontaktstoff-client-draft');if(draft){const candidate=validateCampaign(JSON.parse(draft));if(candidate.templateId===campaign.templateId){campaign=candidate;campaign.id=uid();}sessionStorage.removeItem('kontaktstoff-client-draft');}}catch{}hasActive=true;view='preview';await saveCampaign(campaign);}
 else if(params.has('example')){campaign=createExampleCampaign(params.get('example'));hasActive=true;view='preview';await saveCampaign(campaign);}
 else if(params.get('start')==='blank'){view='start';}
 else if(params.has('template')){campaign=toSelfmailer(createTemplate(params.get('template')));campaign.onboarding.active=false;hasActive=true;view='design';await saveCampaign(campaign);}
 else if(params.has('demo')){hasActive=true;if(latest)campaign=validateCampaign(latest);else await saveCampaign(campaign);view='design';}
 else if(latest&&sessionStorage.getItem('kontaktstoff-active')===latest.id){campaign=validateCampaign(latest);hasActive=true;view='design';}
 else view='dashboard';
 selected=campaign.sides.front.fields[0]?.id;
}catch(e){saveFailed=true;saveState('Speichern nicht verfügbar',true);toast(e.message||'Speicher nicht verfügbar. Sichere dein Projekt als Datei.',true);view='dashboard';}
if(params.has('client')||params.has('start')||params.has('template')||params.has('example')||params.has('tutorial'))window.history.replaceState({},'',location.pathname);
if(hasActive)try{sessionStorage.setItem('kontaktstoff-active',campaign.id);}catch{}
if(campaign.tutorial)campaign.tutorial.active=false;if(campaign.onboarding)campaign.onboarding.active=false;
await document.fonts.ready;if(view==='dashboard')await showDashboard();else if(view==='start')await newCampaign();else renderUI();

if(builderReturn()&&!reviewReturn()){$('#workspace-link').textContent='Zurück zur Kampagne';$('#request-campaign').textContent='Speichern & zurück zur Kampagne →';}
