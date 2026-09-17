import {FORMATS,KEYS,uid,clone,clamp,validURL,resolveText,missingKeys,createCampaign,parseCSV,csvString,validateCampaign,checks} from './core.js';
import {listCampaigns,saveCampaign,removeCampaign} from './storage.js';
import {renderCanvas,imageFrom} from './render.js';
import {icon,hydrateIcons} from './icons.js';
import {Mailing3D} from './three-d.js';
import {guideHTML,GUIDE_STEPS} from './guide.js';
import {createTemplate} from './templates.js';
import {dashboardHTML} from './dashboard.js';
import {auditCampaign,createHandoff} from './handoff.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let campaign=createCampaign(), side='front', selected=campaign.sides.front.fields[0]?.id, recipientIndex=0, view='design', guides=true;
let previewMode='3d', hasActive=false, dashboardCampaigns=[], dashboardVersion=0, jobController=null;
function clearAudit(){const results=$('#audit-results');results.hidden=true;results.innerHTML='';}

const threeD=new Mailing3D(document.querySelector('#three-d-stage'));
let history=[], future=[], saveTimer, toastTimer, renderVersion=0, drawingIssues=[], saveFailed=false, pendingSaves=Promise.resolve(), activeDrag=null;
const format=()=>FORMATS.find(f=>f.id===campaign.format);
const recipient=()=>campaign.recipients[recipientIndex]||{};
const selectedField=()=>campaign.sides[side].fields.find(f=>f.id===selected);
const fieldName=f=>f.type==='image'?'Logo / Bild':f.type==='shape'?'Farbfläche':f.type==='qr'?'Persönlicher QR-Code':KEYS[f.text.match(/^\{\{(\w+)\}\}$/)?.[1]]|| (f.text.startsWith('Für {{')?'Persönliche Ansprache':'Eigener Text');
const keys=()=>[...new Set([...Object.keys(KEYS),...campaign.recipients.flatMap(r=>Object.keys(r)).filter(k=>k!=='id')])];
function toast(message,error=false){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.toggle('error',error);$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),error?6500:3500);}
function saveState(text,failed=false){$('#save-state').innerHTML=`<span class="status-dot" style="background:${failed?'#bf7352':'#779767'}"></span>${escape(text)}`;}
function persist(){try{sessionStorage.setItem('kontaktstoff-active',campaign.id);}catch{}clearTimeout(saveTimer);saveState('Wird gespeichert …');saveTimer=setTimeout(flushSave,350);}
async function flushSave(){clearTimeout(saveTimer);if(!hasActive)return;const snapshot=clone(campaign);pendingSaves=pendingSaves.catch(()=>{}).then(()=>saveCampaign(snapshot));try{await pendingSaves;saveState('Lokal gespeichert');saveFailed=false;}catch{saveState('Nicht gespeichert',true);if(!saveFailed)toast('Lokales Speichern nicht möglich. Bitte sichere dein Projekt als Datei.',true);saveFailed=true;}}
function checkpoint(){history.push(clone(campaign));if(history.length>40)history.shift();future=[];}
function changed({inspector=true,table=true,guide=true}={}){hasActive=true;clearAudit();campaign.updatedAt=Date.now();persist();renderUI(inspector,table,guide);}
function commit(fn,options){checkpoint();fn();changed(options);}
function undo(){if(!history.length)return;future.push(clone(campaign));campaign=history.pop();recipientIndex=clamp(recipientIndex,0,Math.max(0,campaign.recipients.length-1));selected=campaign.sides[side].fields.find(f=>f.id===selected)?.id;changed();}
function redo(){if(!future.length)return;history.push(clone(campaign));campaign=future.pop();recipientIndex=clamp(recipientIndex,0,Math.max(0,campaign.recipients.length-1));changed();}
function setSide(value){side=value;selected=campaign.sides[side].fields[0]?.id;renderUI();}
function setView(value){if(value==='dashboard'){showDashboard();return;}view=value;renderUI();if(value==='preview')requestAnimationFrame(()=>threeD.paint());}
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
 document.body.classList.toggle('dashboard-active',view==='dashboard');
 $('.breadcrumb strong').textContent=view==='dashboard'?'Dein Arbeitsplatz':'Designstudio';
 $('#dashboard-view').hidden=view!=='dashboard';
 if(view==='dashboard')return;
 $('#rename-campaign').textContent=campaign.name;$('#recipient-count').textContent=campaign.recipients.length;
 $$('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===view);b.setAttribute('aria-current',b.dataset.tab===view?'step':'false');});
 for(const name of ['setup','design','recipients','preview'])$('#'+name+'-view').hidden=name!==view;
 $$('[data-side]').forEach(b=>{b.classList.toggle('active',b.dataset.side===side);b.setAttribute('aria-pressed',String(b.dataset.side===side));});
 $('#setup-tab').hidden=!campaign.onboarding;
 $('#guide-return').hidden=!campaign.onboarding?.active||view==='setup';
 if(view==='setup'&&guide)$('#setup-view').innerHTML=guideHTML(campaign);
 $('#three-d-view').hidden=previewMode!=='3d';$('#proof-spread').hidden=previewMode!=='2d';
 for(const mode of ['2d','3d']){const b=$('#preview-mode-'+mode);b.classList.toggle('active',previewMode===mode);b.setAttribute('aria-pressed',String(previewMode===mode));}
 $('#side-title').textContent=side==='front'?'Vorderseite':'Rückseite';$('#format-select').value=campaign.format;
 $('#dimensions').textContent=`${format().width} × ${format().height} mm`;$('#width-label').textContent=`${format().width} mm`;$('#design-scale').textContent=format().name;
 $('#artboard').style.aspectRatio=`${format().width}/${format().height}`;
 $('#safe-guide').style.inset=`${5/format().height*100}% ${5/format().width*100}%`;
 $('#safe-guide').hidden=!guides;$('#guides-toggle').classList.toggle('active',guides);$('#guides-toggle').setAttribute('aria-pressed',String(guides));
 $('#undo').disabled=!history.length;$('#redo').disabled=!future.length;
 const bg=campaign.sides[side].background;
 $('#background-info').textContent=bg.kind==='template'?'chattastic-Muster · Hintergrund fest, Felder bearbeitbar':bg.kind==='blank'?'Leere Seite · bereit für dein Design':bg.name;
 $('#background-remove').hidden=bg.kind==='blank';
 $('#empty-artboard').hidden=bg.kind!=='blank'||campaign.sides[side].fields.length>0;
 $('#page-color-control').hidden=bg.kind!=='blank';$('#page-color').value=bg.color||'#ffffff';
 $('#field-count').textContent=campaign.sides[side].fields.length;
 $('#layer-list').innerHTML=campaign.sides[side].fields.map(f=>`<button class="layer ${f.id===selected?'active':''}" data-layer="${f.id}" aria-pressed="${f.id===selected}">${icon(f.type==='qr'?'qr':'type')}<span class="layer-name">${escape(fieldName(f))}</span><span class="layer-kind">${f.type==='qr'?'QR':f.type==='image'?'Bild':f.type==='shape'?'Fläche':'Aa'}</span></button>`).join('')||'<p class="panel-copy">Dein erstes Feld wartet links oben.</p>';
 for(const select of [$('#active-recipient'),$('#preview-recipient')]){
   select.innerHTML=campaign.recipients.length?campaign.recipients.map((r,i)=>`<option value="${i}">${escape(r.company||'Unbenannter Empfänger')}</option>`).join(''):'<option value="0">Noch keine Empfänger</option>';
   select.value=String(recipientIndex);
 }
 $('#recipient-index').textContent=`${campaign.recipients.length?recipientIndex+1:0} / ${campaign.recipients.length}`;
 $('#prev-recipient').disabled=recipientIndex<=0;$('#next-recipient').disabled=recipientIndex>=campaign.recipients.length-1;
 if(inspector)renderInspector();else updateResolved();
 renderOverlays();if(view==='recipients'&&table)renderRecipients();requestRender();requestAnimationFrame(fitArtboard);
}
function updateResolved(){const f=selectedField();if(f&&$('#resolved'))$('#resolved').textContent=resolveText(f.text,recipient())||'Für diesen Empfänger fehlt ein Wert.';}
function renderInspector(){
 const f=selectedField();
 if(!f){$('#inspector').innerHTML=`<div class="inspector-empty">${icon('move')}<h3>Platz für Persönlichkeit.</h3><p>Wähle ein Feld im Design aus oder füge links ein neues hinzu. Hier bestimmst du Inhalt, Position und Aussehen.</p></div>`;return;}
 const decorative=['image','shape'].includes(f.type);
 const bound=f.text.match(/^\{\{(\w+)\}\}$/)?.[1]||'custom';
 $('#inspector').innerHTML=`<div class="inspector-heading"><div class="eyebrow">FELD BEARBEITEN</div><h3>${icon(f.type==='qr'?'qr':'type')}${escape(fieldName(f))}</h3><p>${f.type==='image'?'Dein Bild bleibt im Originalverhältnis innerhalb des Rahmens.':f.type==='shape'?'Setze eine farbige Fläche und ordne sie hinter deinen Texten an.':f.type==='qr'?'Jeder Empfänger bekommt seinen eigenen, scannbaren QR-Code.':'Schreibe deinen Text oder verbinde ihn mit Empfängerdaten.'}</p></div>
 <section class="inspector-group" ${decorative?'hidden':''}><label for="field-binding">Mit Daten verbinden</label><select id="field-binding"><option value="custom">Eigener Text / Kombination</option>${keys().map(k=>`<option value="${escape(k)}" ${bound===k?'selected':''}>${escape(KEYS[k]||k)}</option>`).join('')}</select><label class="sr-only" for="field-text">Feldinhalt</label><textarea id="field-text" spellcheck="false">${escape(f.text)}</textarea><div class="field-label">VORSCHAU FÜR DIESEN EMPFÄNGER</div><div class="resolved-value" id="resolved">${escape(resolveText(f.text,recipient())||'Für diesen Empfänger fehlt ein Wert.')}</div></section>
 <section class="inspector-group"><div class="section-label">POSITION & GRÖSSE</div><div class="coordinate-grid">${[['x','Abstand links'],['y','Abstand oben'],['w','Breite'],['h','Höhe']].map(([key,label])=>`<div><label for="field-${key}">${label}</label><div class="unit-input"><input id="field-${key}" data-coordinate="${key}" type="number" min="${['w','h'].includes(key)?2:0}" step="0.5" value="${f[key].toFixed(1)}"><span>mm</span></div></div>`).join('')}</div></section>
 ${f.type==='text'?`<section class="inspector-group"><div class="section-label">TYPOGRAFIE</div><div class="style-row"><label for="field-size">Schriftgröße</label><div class="unit-input"><input id="field-size" class="font-size" type="number" min="6" max="80" value="${f.fontSize}"><span>pt</span></div></div><div class="style-row"><label for="field-weight">Schriftschnitt</label><select id="field-weight"><option value="400" ${f.weight==='400'?'selected':''}>Normal</option><option value="700" ${f.weight==='700'?'selected':''}>Fett</option></select></div><div class="style-row"><label for="field-align">Ausrichtung</label><select id="field-align">${[['left','Links'],['center','Mittig'],['right','Rechts']].map(([v,l])=>`<option value="${v}" ${f.align===v?'selected':''}>${l}</option>`).join('')}</select></div><div class="style-row"><label for="field-color">Textfarbe</label><div class="color-field"><span>${escape(f.color)}</span><input type="color" id="field-color" value="${f.color}"></div></div><label class="checkbox-label"><input type="checkbox" id="field-fit" ${f.autoFit?'checked':''}> Lange Texte automatisch einpassen</label></section>`:''}
 <section class="inspector-group"><div class="style-row"><label for="field-background">Hintergrund</label><input id="field-background" type="color" value="${f.background==='transparent'?'#ffffff':f.background}"></div><label class="checkbox-label"><input id="field-transparent" type="checkbox" ${f.background==='transparent'?'checked':''}> Transparent</label></section>
 <div class="layer-order"><button class="button" id="layer-back">↓ Nach hinten</button><button class="button" id="layer-front">↑ Nach vorn</button></div><div class="inspector-actions"><button class="button" id="duplicate-field">${icon('copy')}Duplizieren</button><button class="button" id="delete-field" aria-label="Feld löschen">${icon('trash')}Löschen</button></div><div class="inspector-help">${decorative?'Mit den Pfeiltasten verschieben. Über „Nach hinten“ und „Nach vorn“ legst du die Reihenfolge fest.':f.type==='qr'?'Der QR-Code enthält den vollständigen Link des Empfängers. Seine weiße Ruhezone wird automatisch mit angelegt.':'Nutze {{company}}, {{first_name}} oder eigene CSV-Spalten. Pfeiltasten verschieben um 0,5 mm; mit Umschalt um 5 mm.'}</div>`;
 for(const [id,delta] of [['layer-back',-1],['layer-front',1]]){const fields=campaign.sides[side].fields,index=fields.indexOf(f);$('#'+id).disabled=index+delta<0||index+delta>=fields.length;$('#'+id).onclick=()=>commit(()=>{fields.splice(index,1);fields.splice(index+delta,0,f);});}
 $('#field-binding').onchange=e=>{if(e.target.value!=='custom')commit(()=>f.text=`{{${e.target.value}}}`);};
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
 $('#duplicate-field').onclick=()=>{if(campaign.sides[side].fields.length>=40)return toast('Maximal 40 Felder pro Seite.',true);commit(()=>{const copy={...f,id:uid(),x:Math.min(f.x+4,format().width-f.w),y:Math.min(f.y+4,format().height-f.h)};campaign.sides[side].fields.push(copy);selected=copy.id;});};
 $('#delete-field').onclick=deleteField;
}
function deleteField(){if(!selectedField())return;commit(()=>{campaign.sides[side].fields=campaign.sides[side].fields.filter(f=>f.id!==selected);selected=null;});}
function renderOverlays(){
 $('#field-overlays').innerHTML=campaign.sides[side].fields.map(f=>`<div role="button" tabindex="0" aria-label="${escape(fieldName(f))} verschieben" aria-pressed="${f.id===selected}" data-field="${f.id}" class="field-overlay ${f.id===selected?'selected':''}" style="left:${f.x/format().width*100}%;top:${f.y/format().height*100}%;width:${f.w/format().width*100}%;height:${f.h/format().height*100}%"><span class="field-tag">${escape(fieldName(f))}</span><span class="handle"></span></div>`).join('');
}
async function requestRender(){
 if(view==='dashboard')return;
 const version=++renderVersion;const snapshot=clone(campaign),person=clone(recipient());
 const targets=view==='setup'?(campaign.onboarding?.step===2?[['front','#guide-front'],['back','#guide-back']]:[]):view==='preview'?[['front','#proof-front'],['back','#proof-back'],['front','#three-d-front'],['back','#three-d-back']]:[[side,'#design-canvas'],['front','#thumb-front'],['back','#thumb-back']];
 try{
   const results=await Promise.all(targets.map(async([s,target])=>{const cvs=document.createElement('canvas');const overflow=await renderCanvas(cvs,snapshot,s,person,{scale:target.includes('thumb')?1.2:5});return{cvs,target,overflow,side:s};}));
   if(version!==renderVersion)return;
   drawingIssues=[];
   for(const{cvs,target,overflow,side:s}of results){const dest=$(target);dest.width=cvs.width;dest.height=cvs.height;dest.getContext('2d').drawImage(cvs,0,0);if(!target.includes('thumb')&&!target.includes('three-d')&&overflow.length)drawingIssues.push({level:'error',text:`${s==='front'?'Vorderseite':'Rückseite'}: ${overflow.length} Textfeld(er) zu klein für diesen Empfänger. Bitte größer ziehen.`});}
   if(view==='preview')renderChecks();
 }catch(e){if(version===renderVersion)toast(e.message,true);}
}
function renderChecks(){const issues=[...checks(campaign),...drawingIssues];const errors=issues.filter(i=>i.level==='error');$('#check-count').textContent=errors.length?`${errors.length} offene Punkte`:'Keine blockierenden Fehler';$('#check-list').innerHTML=[{level:'success',text:`${format().width} × ${format().height} mm · Vorder- und Rückseite`},{level:'success',text:`${campaign.recipients.length} Empfänger · ${campaign.sides.front.fields.length+campaign.sides.back.fields.length} Designelemente`},...issues].map(i=>`<div class="check-item ${i.level}">${icon(i.level==='success'?'check':i.level==='info'?'info':'warning')}<span>${escape(i.text)}</span></div>`).join('');$('#pdf-export').disabled=!!errors.length;$('#png-export').disabled=!!errors.length;}
function defaultTextColor(){const bg=campaign.sides[side].background;if(bg.kind==='template'&&side==='front')return '#ffffff';if(bg.kind==='blank'&&bg.color){const rgb=bg.color.slice(1).match(/../g).map(v=>parseInt(v,16));return rgb[0]*.299+rgb[1]*.587+rgb[2]*.114<145?'#ffffff':'#202321';}return '#202321';}
function addField(type){if(campaign.sides[side].fields.length>=40)return toast('Maximal 40 Felder pro Seite.',true);commit(()=>{const f={id:uid(),type:type==='qr'?'qr':'text',text:type==='qr'?'{{chatbot_url}}':type==='company'?'{{company}}':type==='salutation'?'{{salutation}}':'Ihr persönlicher Text',x:type==='qr'?160:15,y:type==='qr'?100:20+Math.min(campaign.sides[side].fields.filter(f=>f.type==='text').length,5)*20,w:type==='qr'?28:75,h:type==='qr'?28:15,fontSize:16,weight:'700',align:'left',color:defaultTextColor(),background:type==='qr'?'#ffffff':'transparent',autoFit:true};campaign.sides[side].fields.push(f);selected=f.id;});toast(type==='qr'?'QR-Code hinzugefügt. Ziehe ihn an die passende Stelle.':'Feld hinzugefügt. Du kannst es direkt im Design verschieben.');}
function renderRecipients(){
 const cols=keys();$('#data-count').textContent=`${campaign.recipients.length} Empfänger`;$('#sample-label').hidden=!campaign.sample;$('#sample-notice').hidden=!campaign.sample;
 $('#recipients-head').innerHTML='<tr>'+cols.map(k=>`<th scope="col">${escape(KEYS[k]||k)}</th>`).join('')+'<th scope="col"><span class="sr-only">Aktionen</span></th></tr>';
 $('#recipients-body').innerHTML=campaign.recipients.map((r,i)=>`<tr data-recipient-index="${i}">${cols.map(k=>`<td><input data-row="${i}" data-key="${escape(k)}" aria-label="${escape(KEYS[k]||k)} für Empfänger ${i+1}" value="${escape(r[k]||'')}" ${k==='chatbot_url'?`type="url" aria-invalid="${!validURL(r[k])}"`:''}></td>`).join('')}<td><button class="icon-button" data-delete-recipient="${i}" aria-label="Empfänger ${i+1} löschen">${icon('trash')}</button></td></tr>`).join('')||`<tr><td colspan="${cols.length+1}" style="padding:32px">Füge deinen ersten Empfänger hinzu oder importiere eine CSV-Datei.</td></tr>`;filterRecipients();
}
$('#recipients-body').addEventListener('input',e=>{const input=e.target.closest('[data-row]');if(!input)return;commit(()=>campaign.recipients[Number(input.dataset.row)][input.dataset.key]=input.value.slice(0,5000),{inspector:false,table:false});if(input.dataset.key==='chatbot_url')input.setAttribute('aria-invalid',String(!validURL(input.value)));});
$('#recipients-body').addEventListener('click',async e=>{const btn=e.target.closest('[data-delete-recipient]');if(!btn)return;const index=Number(btn.dataset.deleteRecipient);if(await confirm('Empfänger entfernen?',`${campaign.recipients[index].company||'Dieser Empfänger'} wird aus dieser Kampagne entfernt.`,'Entfernen'))commit(()=>{campaign.recipients.splice(index,1);recipientIndex=clamp(recipientIndex,0,Math.max(0,campaign.recipients.length-1));});});
$('#field-overlays').addEventListener('pointerdown',e=>{
 const overlay=e.target.closest('[data-field]');if(!overlay||e.button!==0)return;e.preventDefault();selected=overlay.dataset.field;const f=selectedField();renderInspector();$$('.layer').forEach(el=>el.classList.toggle('active',el.dataset.layer===selected));$$('.field-overlay').forEach(el=>{el.classList.toggle('selected',el.dataset.field===selected);el.setAttribute('aria-pressed',String(el.dataset.field===selected));});overlay.focus();
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
$('#field-overlays').addEventListener('keydown',e=>{const overlay=e.target.closest('[data-field]');if(!overlay)return;selected=overlay.dataset.field;const f=selectedField();if(e.key==='Enter'||e.key===' '){e.preventDefault();renderUI();return;}if(e.key.startsWith('Arrow')){e.preventDefault();const delta=e.shiftKey?5:.5;commit(()=>{f.x=clamp(f.x+(e.key==='ArrowRight'?delta:e.key==='ArrowLeft'?-delta:0),0,format().width-f.w);f.y=clamp(f.y+(e.key==='ArrowDown'?delta:e.key==='ArrowUp'?-delta:0),0,format().height-f.h);});$(`[data-field="${selected}"]`)?.focus();}});
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
   const task=pdfjs.getDocument({data:await file.arrayBuffer(),isEvalSupported:false,useSystemFonts:true,cMapUrl:new URL('vendor/cmaps/',document.baseURI).href,cMapPacked:true,standardFontDataUrl:new URL('vendor/standard_fonts/',document.baseURI).href,wasmUrl:new URL('vendor/wasm/',document.baseURI).href});
   let pdf;try{pdf=await task.promise;}catch{await task.destroy();throw new Error('Die PDF konnte nicht geöffnet werden. Bitte eine gültige, unverschlüsselte PDF verwenden.');}
   try{
    let mode='single',pageNumber=1;
    if(pdf.numPages>1){$('#busy').hidden=true;const answer=await modal('Seiten aus der PDF übernehmen',`<p>${escape(file.name)} enthält ${pdf.numPages} Seiten. Welche möchtest du verwenden?</p><label class="modal-choice"><input type="radio" name="pdf-mode" value="both" checked> Seite 1 als Vorderseite, Seite 2 als Rückseite</label><label class="modal-choice"><input type="radio" name="pdf-mode" value="single"> Eine Seite auf die aktuelle Mailing-Seite</label><label for="pdf-page">PDF-Seite</label><input id="pdf-page" type="number" min="1" max="${pdf.numPages}" value="1"><p style="margin-top:15px">Vorhandene Personalisierungsfelder bleiben erhalten und lassen sich danach anpassen.</p>`,[{id:'cancel',label:'Abbrechen'},{id:'ok',label:'Design übernehmen',primary:true}]);if(answer!=='ok')return;
      mode=$('input[name="pdf-mode"]:checked').value;pageNumber=clamp(Number($('#pdf-page').value)||1,1,pdf.numPages);$('#busy').hidden=false;
    }
    for(const[s,n]of mode==='both'?[['front',1],['back',2]]:[[target,pageNumber]]){
      const page=await pdf.getPage(n),base=page.getViewport({scale:1}),scale=Math.min(300/72,3500/Math.max(base.width,base.height));
      const viewport=page.getViewport({scale}),cvs=document.createElement('canvas');cvs.width=Math.round(viewport.width);cvs.height=Math.round(viewport.height);
      await page.render({canvasContext:cvs.getContext('2d'),viewport,background:'rgb(255,255,255)'}).promise;
      backgrounds.push([s,{kind:'image',data:cvs.toDataURL('image/png'),width:cvs.width,height:cvs.height,name:`${file.name} · Seite ${n}`}]);
    }
   }finally{await task.destroy();}
  }else if(['image/png','image/jpeg','image/webp'].includes(file.type)){
   const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('Die Datei konnte nicht gelesen werden.'));r.readAsDataURL(file);});
   const img=await imageFrom(src);if(img.width*img.height>80000000)throw new Error('Dieses Bild ist sehr groß. Bitte auf maximal 80 Megapixel verkleinern.');
   const scale=Math.min(1,3500/Math.max(img.width,img.height)),cvs=document.createElement('canvas');cvs.width=Math.round(img.width*scale);cvs.height=Math.round(img.height*scale);const ctx=cvs.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,cvs.width,cvs.height);ctx.drawImage(img,0,0,cvs.width,cvs.height);
   backgrounds.push([target,{kind:'image',data:cvs.toDataURL('image/png'),width:cvs.width,height:cvs.height,name:file.name}]);
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
 if(await confirm('Format ändern?',`Das Mailing wird auf ${next.width} × ${next.height} mm umgestellt. Positionen werden proportional angepasst. Prüfe danach beide Seiten und lade bei Bedarf passende Designs hoch.`,'Format übernehmen'))commit(()=>{for(const s of Object.values(campaign.sides))for(const f of s.fields){f.x=f.x/old.width*next.width;f.y=f.y/old.height*next.height;f.w=f.w/old.width*next.width;f.h=f.h/old.height*next.height;if(f.type==='qr')f.w=f.h=Math.min(f.w,f.h);}campaign.format=next.id;});else e.target.value=campaign.format;
};
$$('[data-side]').forEach(b=>b.onclick=()=>setSide(b.dataset.side));$$('[data-tab]').forEach(b=>b.onclick=()=>setView(b.dataset.tab));$$('[data-add]').forEach(b=>b.onclick=()=>addField(b.dataset.add));
$('#open-preview').onclick=()=>setView('preview');$('#undo').onclick=undo;$('#redo').onclick=redo;$('#guides-toggle').onclick=()=>{guides=!guides;renderUI(false,false);};
function fitArtboard(){if(view!=='design')return;const area=$('#canvas-scroll'),style=getComputedStyle(area);const availableW=area.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);const availableH=area.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom)-28;const base=Math.max(180,Math.min(840,availableW,Math.max(180,availableH)*format().width/format().height));const factor=$('#zoom').value==='fit'?1:Number($('#zoom').value);$('#artboard-wrap').style.width=`${base*factor}px`;$('#artboard-wrap').style.maxWidth='none';}
$('#zoom').onchange=fitArtboard;new ResizeObserver(fitArtboard).observe($('#canvas-scroll'));
for(const id of ['active-recipient','preview-recipient'])$('#'+id).onchange=e=>{recipientIndex=Number(e.target.value)||0;renderUI();};
$('#prev-recipient').onclick=()=>{recipientIndex=Math.max(0,recipientIndex-1);renderUI();};$('#next-recipient').onclick=()=>{recipientIndex=Math.min(campaign.recipients.length-1,recipientIndex+1);renderUI();};
$('#add-recipient').onclick=()=>{if(campaign.recipients.length>=1000)return toast('Maximal 1.000 Empfänger pro Kampagne.',true);commit(()=>{campaign.recipients.push({id:uid(),company:'',first_name:'',salutation:'',website:'',chatbot_url:''});recipientIndex=campaign.recipients.length-1;});$(`[data-row="${recipientIndex}"][data-key="company"]`)?.focus();};
$('#csv-template').onclick=()=>download(new Blob([csvString([{company:'Muster GmbH',first_name:'Anna',salutation:'Hallo Anna,',website:'muster.example',chatbot_url:'https://chattastic.de/'}],Object.keys(KEYS))],{type:'text/csv;charset=utf-8'}),'kontaktstoff-empfaenger-vorlage.csv');
$('#csv-export').onclick=()=>download(new Blob([csvString(campaign.recipients,keys())],{type:'text/csv;charset=utf-8'}),filename()+'-empfaenger.csv');
$('#csv-upload').onclick=()=>$('#csv-file').click();
$('#csv-file').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;if(file.size>5*1024*1024)return toast('Bitte eine CSV mit maximal 5 MB verwenden.',true);try{const rows=parseCSV(await file.text());const result=await modal('Empfänger importieren',`<p>${rows.length} Empfänger erkannt. Firmenname und Chatbot-Link werden automatisch deinen Personalisierungsfeldern zugeordnet.</p><p style="margin-top:12px">${escape(Object.keys(rows[0]).filter(k=>k!=='id').join(' · '))}</p>`,[{id:'cancel',label:'Abbrechen'},{id:'append',label:'Hinzufügen'},{id:'replace',label:'Liste ersetzen',primary:true}]);if(!['append','replace'].includes(result))return;if(result==='append'&&campaign.recipients.length+rows.length>1000)throw new Error('Insgesamt sind maximal 1.000 Empfänger möglich.');commit(()=>{campaign.recipients=result==='replace'?rows:[...campaign.recipients,...rows];campaign.sample=result==='append'?campaign.sample:false;recipientIndex=0;});toast(`${rows.length} Empfänger importiert.`);}catch(e){toast(e.message,true);}};
$('#rename-campaign').onclick=async()=>{const promise=modal('Kampagne umbenennen',`<label for="campaign-name">Name deiner Kampagne</label><input id="campaign-name" maxlength="120" value="${escape(campaign.name)}">`,[{id:'cancel',label:'Abbrechen'},{id:'ok',label:'Speichern',primary:true}]);$('#campaign-name').focus();$('#campaign-name').select();if(await promise==='ok'){const name=$('#campaign-name').value.trim();if(name)commit(()=>campaign.name=name);}};
$('#project-export').onclick=()=>{download(new Blob([JSON.stringify(campaign,null,2)],{type:'application/json'}),filename()+'.kontaktstoff.json');toast('Projekt inklusive Designs und Empfängern gesichert.');};
$('#project-file').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;if(file.size>40*1024*1024)return toast('Projektdateien dürfen maximal 40 MB groß sein.',true);await busy('Projekt wird geöffnet …',async()=>{let imported;try{imported=validateCampaign(JSON.parse(await file.text()));}catch(e){throw new Error('Projekt konnte nicht importiert werden: '+e.message);}await flushSave();imported.id=uid();imported.name=(imported.name+' · Import').slice(0,120);campaign=imported;hasActive=true;history=[];future=[];side='front';selected=campaign.sides.front.fields[0]?.id;recipientIndex=0;view='design';changed();toast('Projekt als eigenständige Kampagne geöffnet.');});};
async function activateCampaign(next,initialView){
 await flushSave();try{campaign=validateCampaign(next);}catch(e){toast('Die Kampagne konnte nicht geöffnet werden: '+e.message,true);return;}hasActive=true;history=[];future=[];side='front';recipientIndex=0;selected=campaign.sides.front.fields[0]?.id;view=initialView||(campaign.onboarding?.active?'setup':'design');clearAudit();changed();
}
async function showDashboard(){
 await flushSave();try{sessionStorage.removeItem('kontaktstoff-active');}catch{}view='dashboard';renderVersion++;renderUI();const version=++dashboardVersion;
 try{dashboardCampaigns=(await listCampaigns()).sort((a,b)=>b.updatedAt-a.updatedAt);}catch{dashboardCampaigns=[];toast('Lokaler Speicher ist nicht verfügbar. Du kannst trotzdem mit einer Projektdatei arbeiten.',true);}
 if(view!=='dashboard'||version!==dashboardVersion)return;
 $('#dashboard-view').innerHTML=dashboardHTML(dashboardCampaigns);
 $('#campaign-search').oninput=e=>{const query=e.target.value.toLowerCase().trim();let visible=0;$$('[data-campaign-card]').forEach(card=>{card.hidden=!card.dataset.name.includes(query);if(!card.hidden)visible++;});$('#search-empty').hidden=visible>0||!dashboardCampaigns.length;};
 // Render sequentially to keep large local libraries responsive.
 for(const c of dashboardCampaigns){if(view!=='dashboard'||version!==dashboardVersion)break;const canvas=$(`[data-dashboard-thumb="${c.id}"]`);if(canvas)try{await renderCanvas(canvas,c,'front',c.recipients[0]||{company:'Ihr Unternehmen',salutation:'Guten Tag,',chatbot_url:'https://chattastic.de/'},{scale:2});}catch{canvas.replaceWith(document.createTextNode('Vorschau nicht verfügbar'));}}
}
const campaignList=showDashboard;
$('#dashboard-view').onclick=async e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-dashboard-new'))return activateCampaign(createCampaign(true));
 if(b.hasAttribute('data-dashboard-import'))return $('#project-file').click();
 if(b.dataset.dashboardTemplate)return activateCampaign(createTemplate(b.dataset.dashboardTemplate));
 const id=b.dataset.dashboardOpen||b.dataset.dashboardCopy||b.dataset.dashboardDelete,c=dashboardCampaigns.find(c=>c.id===id);if(!c)return;
 if(b.dataset.dashboardOpen)return activateCampaign(c);
 if(b.dataset.dashboardCopy){const copy=clone(c);copy.id=uid();copy.name=(c.name+' · Kopie').slice(0,120);copy.updatedAt=Date.now();try{await saveCampaign(copy);toast('Eine unabhängige Kopie wurde erstellt.');return showDashboard();}catch{toast('Die Kopie konnte nicht gespeichert werden. Bitte sichere dein Projekt als Datei.',true);return;}}
 if(b.dataset.dashboardDelete&&await confirm('Kampagne löschen?',`„${c.name}“ wird aus diesem Browser entfernt. Sichere bei Bedarf vorher eine Projektdatei.`,'Löschen')){try{await pendingSaves;if(campaign.id===id){clearTimeout(saveTimer);hasActive=false;}await removeCampaign(id);toast('Kampagne gelöscht.');await showDashboard();}catch{toast('Löschen war nicht möglich.',true);}}
};
async function newCampaign(){const result=await modal('Dein Mailing beginnt hier.',`<p><strong>Von null starten:</strong> Eine eigene Kampagne mit zwei leeren Seiten. Wir erklären dir Schritt für Schritt, wie daraus ein persönliches Mailing wird.</p><div class="help-step" style="margin-top:22px"><b>1</b><div><h3>Deine Idee festhalten</h3><p>Was bietest du an, für wen und mit welchem Ziel?</p></div></div><div class="help-step"><b>2</b><div><h3>Design und persönliche Felder</h3><p>Eigene Designs hochladen oder mit Farbe und Text beginnen.</p></div></div><div class="help-step"><b>3</b><div><h3>Empfänger hinzufügen und in 3D prüfen</h3><p>Dein Mailing mit echten Daten von beiden Seiten ansehen.</p></div></div><p>Oder öffne die chattastic-Vorlage, um den Editor erst einmal kennenzulernen.</p>`,[{id:'cancel',label:'Abbrechen'},{id:'template',label:'Beispiel ausprobieren'},{id:'blank',label:'Von null starten',primary:true}]);if(!['blank','template'].includes(result))return;await flushSave();campaign=createCampaign(result==='blank');hasActive=true;history=[];future=[];side='front';selected=campaign.sides.front.fields[0]?.id;recipientIndex=0;view=result==='blank'?'setup':'design';changed();toast(result==='blank'?'Deine eigene Kampagne. Wir starten mit deiner Idee.':'Beispielkampagne geöffnet.');}
$('#campaigns-button').onclick=campaignList;$('#breadcrumb-campaigns').onclick=campaignList;$('#new-campaign').onclick=newCampaign;$('#new-campaign-top').onclick=newCampaign;
$('#help-button').onclick=()=>modal('Vom Design zum persönlichen Mailing',`<div class="help-step"><b>1</b><div><h3>Dein Design, auf beiden Seiten.</h3><p>Nutze die Vorlage oder lade deine Designs hoch. Bei einer zweiseitigen PDF kannst du beide Seiten gleichzeitig übernehmen. Bilder werden vollständig eingepasst.</p></div></div><div class="help-step"><b>2</b><div><h3>Platz für Persönlichkeit.</h3><p>Lege Text- und QR-Felder über das Design. Ziehe sie an ihren Platz und verbinde sie mit Spalten aus deiner Empfängerliste. Ein Hintergrund in der passenden Farbe kann alte Platzhalter abdecken.</p></div></div><div class="help-step"><b>3</b><div><h3>Für jeden Kontakt einmal prüfen.</h3><p>Importiere eine CSV oder bearbeite Empfänger direkt. Wechsle in der Vorschau zwischen ihnen und exportiere ein Ansichts-PDF. Ein Scan öffnet den vollständigen Link aus der jeweiligen Zeile.</p></div></div><p><strong>Deine Daten bleiben hier.</strong> Designs, Empfänger und Kampagnen werden nur in diesem Browser gespeichert. Mit „Projekt sichern“ erhältst du eine Datei für Backups und zum Weiterarbeiten auf anderen Geräten. Es gibt noch keine Cloud-Synchronisierung oder Versandfunktion.</p><p style="margin-top:12px">Tastatur: ⌘/Strg Z rückgängig · ⌘/Strg Umschalt Z wiederholen · Pfeiltasten zum Verschieben eines ausgewählten Felds. Der Export ist eine RGB-Ansicht ohne Druckbeschnitt.</p>`);
async function exportProof(type){
 await busy(type==='pdf'?'Dein PDF wird erstellt …':'Dein Bild wird erstellt …',async()=>{
   const snapshot=clone(campaign),person=clone(recipient());if(checks(snapshot).some(i=>i.level==='error'))throw new Error('Bitte zuerst die offenen Punkte im Kampagnen-Check beheben.');
   const canvases=[];for(const s of type==='pdf'?['front','back']:[side]){const cvs=document.createElement('canvas');const overflow=await renderCanvas(cvs,snapshot,s,person,{scale:300/25.4});if(overflow.length)throw new Error('Ein Textfeld ist zu klein. Bitte vor dem Export vergrößern.');canvases.push(cvs);}
   const company=String(person.company||'vorschau').replace(/[^\p{L}\p{N}]+/gu,'-').slice(0,60);
   if(type==='png'){const blob=await new Promise(r=>canvases[0].toBlob(r,'image/png'));download(blob,`${filename()}-${company}-${side==='front'?'vorderseite':'rueckseite'}.png`);}
   else{const{PDFDocument}=await import('pdf-lib');const doc=await PDFDocument.create();doc.setTitle(snapshot.name+' · '+(person.company||'Vorschau'));doc.setSubject('Kontaktstoff Ansichts-PDF · RGB · ohne Beschnitt');const f=FORMATS.find(f=>f.id===snapshot.format);for(const cvs of canvases){const img=await doc.embedPng(cvs.toDataURL('image/png'));const page=doc.addPage([f.width*72/25.4,f.height*72/25.4]);page.drawImage(img,{x:0,y:0,width:page.getWidth(),height:page.getHeight()});}download(new Blob([await doc.save()],{type:'application/pdf'}),`${filename()}-${company}-ansicht.pdf`);}
   toast(type==='pdf'?'Zweiseitiges Ansichts-PDF exportiert.':'Mailing-Seite als PNG exportiert.');
 });
}
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
 commit(()=>{campaign.recipients.push({id:uid(),company,first_name:first,salutation:first?'Hallo '+first+',':'Guten Tag,',chatbot_url:url,website:''});recipientIndex=campaign.recipients.length-1;});toast('Empfänger hinzugefügt. Deine Felder verwenden jetzt diese Daten.');
});
$('#setup-view').addEventListener('click',e=>{
 const step=e.target.closest('[data-guide-step]');if(step){guideStep(Number(step.dataset.guideStep));return;}
 const control=e.target.closest('[data-guide-action]');if(!control)return;const action=control.dataset.guideAction;
 if(action==='next'){if(campaign.onboarding.step===0&&!$('#setup-name').value.trim()){$('#setup-name').focus();toast('Gib deiner Kampagne bitte einen Namen.',true);return;}guideStep(campaign.onboarding.step+1);}
 if(action==='previous')guideStep(campaign.onboarding.step-1);
 if(action==='finish'){commit(()=>campaign.onboarding.active=false);previewMode='3d';setView('preview');toast('Dein Einstieg ist abgeschlossen. Alle Schritte bleiben über die Anleitung erreichbar.');}
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
$('#image-upload').onclick=()=>$('#image-file').click();
$('#image-file').onchange=async e=>{
 const file=e.target.files[0];e.target.value='';if(!file)return;
 if(campaign.sides[side].fields.length>=40)return toast('Maximal 40 Elemente pro Seite.',true);
 if(file.size>20*1024*1024)return toast('Bitte ein Bild mit maximal 20 MB verwenden.',true);
 if(!['image/png','image/jpeg','image/webp'].includes(file.type))return toast('Bitte PNG, JPG oder WebP verwenden.',true);
 await busy('Dein Bildelement wird vorbereitet …',async()=>{
  const source=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Bild konnte nicht gelesen werden.'));reader.readAsDataURL(file);});
  const image=await imageFrom(source);if(image.width*image.height>80000000)throw new Error('Bitte das Bild auf maximal 80 Megapixel verkleinern.');
  const scale=Math.min(1,2000/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  const w=Math.min(70,65*image.width/image.height),h=w*image.height/image.width;
  commit(()=>{const f={id:uid(),type:'image',text:'',data:canvas.toDataURL('image/png'),x:15,y:15,w:Math.max(2,w),h:Math.max(2,h),fontSize:12,weight:'400',align:'left',color:'#202321',background:'transparent',autoFit:true};campaign.sides[side].fields.push(f);selected=f.id;});toast('Bild eingefügt. Ziehen und Größe rechts anpassen.');
 });
};
$('#add-shape').onclick=()=>{if(campaign.sides[side].fields.length>=40)return toast('Maximal 40 Elemente pro Seite.',true);commit(()=>{const f={id:uid(),type:'shape',text:'',x:15,y:15,w:70,h:30,fontSize:12,weight:'400',align:'left',color:'#202321',background:'#e2ff54',autoFit:true};campaign.sides[side].fields.push(f);selected=f.id;});};
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

window.addEventListener('beforeunload',()=>{clearTimeout(saveTimer);flushSave();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)flushSave();});
hydrateIcons();
const params=new URLSearchParams(location.search);
try{
 const campaigns=await listCampaigns();const latest=campaigns.sort((a,b)=>b.updatedAt-a.updatedAt)[0];
 if(params.get('start')==='blank'){campaign=createCampaign(true);hasActive=true;view='setup';await saveCampaign(campaign);}
 else if(params.has('template')){campaign=createTemplate(params.get('template'));hasActive=true;view='setup';await saveCampaign(campaign);}
 else if(params.has('demo')){hasActive=true;if(latest)campaign=validateCampaign(latest);else await saveCampaign(campaign);view=campaign.onboarding?.active?'setup':'design';}
 else if(latest&&sessionStorage.getItem('kontaktstoff-active')===latest.id){campaign=validateCampaign(latest);hasActive=true;view=campaign.onboarding?.active?'setup':'design';}
 else view='dashboard';
 selected=campaign.sides.front.fields[0]?.id;
}catch{saveFailed=true;saveState('Speichern nicht verfügbar',true);toast('Lokaler Speicher ist nicht verfügbar. Sichere dein Projekt als Datei.',true);view='dashboard';}
if(params.has('start')||params.has('template'))window.history.replaceState({},'',location.pathname);
if(hasActive)try{sessionStorage.setItem('kontaktstoff-active',campaign.id);}catch{}
await document.fonts.ready;if(view==='dashboard')await showDashboard();else renderUI();
