import {FORMATS,checks,sideNames} from './core.js';
import {zipSync,strToU8} from 'fflate';
import {sideLabel} from './formats.js';
import {renderCanvas} from './render.js';
import {createPrintPDF,printWarnings,validateICC} from './print.js';
import {downloadReviewPDF} from './review-pdf.js';
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function openDesignDownload(project,{version=null,approved=false,editURL=''}={}){
 const snapshot=structuredClone(project),format=FORMATS.find(f=>f.id===snapshot.format);
 if(!document.querySelector('[data-download-styles]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/design-download.css';link.dataset.downloadStyles='';document.head.append(link);}
 const d=document.createElement('dialog');d.className='design-download';d.setAttribute('aria-labelledby','design-download-title');
 d.innerHTML=`<button type="button" class="dialog-close" data-close aria-label="Download schließen">×</button><h2 id="design-download-title">Dateien herunterladen</h2><p>${escape(snapshot.name)}${version?' · Version '+version:''}</p><p class="download-state">${approved?'Freigegebener Designstand':'Aktueller Entwurf · noch nicht freigegeben'}${snapshot.sample?' · enthält Beispieldaten':''}</p><div class="download-previews">${sideNames(snapshot).map(s=>`<figure><canvas data-download-side="${s}"></canvas><figcaption>${sideLabel(snapshot,s)}</figcaption></figure>`).join('')}</div><label>Personalisierung<select data-person>${snapshot.recipients.map((r,i)=>`<option value="${i}">${escape(r.company||[r.first_name,r.last_name].filter(Boolean).join(' ')||'Kontakt '+(i+1))}</option>`).join('')||'<option value="0">Noch kein Empfänger</option>'}</select></label><section class="download-option"><div><h3>PDF zum Weitergeben</h3><p>Alle Seiten · 300 dpi · zum Prüfen und Weitergeben</p></div><button class="button" type="button" data-proof>PDF herunterladen ↓</button></section><section class="download-option"><div><h3>Hochauflösende Bilder</h3><p>Alle Seiten als PNG · 300 dpi im Endformat · zusammen als ZIP</p></div><button class="button" type="button" data-images>Bilder herunterladen ↓</button></section>${format.download?`<section class="download-option"><div><h3>Leere Druckvorlage</h3><p>Für ein eigenes Design: INDD, EPS, SVG und Maß-PDF mit Falz und Postzonen.</p></div><a class="button" href="${escape(format.download)}" download>Vorlagen herunterladen ↓</a></section>`:''}<section class="download-option print-option"><h3>Datei für die Druckerei</h3><p>${format.width+6} × ${format.height+6} mm · 3 mm Beschnitt · CMYK · 300 dpi</p><label>CMYK-Farbprofil der Druckerei (.icc / .icm)<input type="file" accept=".icc,.icm" data-profile></label><small>Das Profil kommt von deiner Druckerei. Es wird nur lokal für diesen Download verwendet.</small><p data-profile-info role="status"></p><div data-issues role="status">Druckdaten werden geprüft …</div>${editURL?`<a href="${escape(editURL)}" class="download-edit">Design und Empfängerdaten bearbeiten ↗</a>`:''}<details><summary>Technische Druckdaten</summary><p>Endformat ${format.width} × ${format.height} mm, zusätzlich 3 mm Beschnitt auf jeder Seite. Alle ${sideNames(snapshot).length} Druckseiten in einer Datei, mit eingebettetem CMYK-Profil und definierten Schnitt- und Beschnittgrenzen.</p><p>Der Export wird mit 300 dpi gerastert und verlustfrei komprimiert. Kein zertifiziertes PDF/X. Ohne hochgeladenen Beschnitt werden Randpixel nach außen fortgesetzt. Die Vorschau oben zeigt das Endformat.</p></details><label class="download-confirm"><input type="checkbox" data-confirm> Ich habe Texte, persönliche Daten, QR-Ziel, Bildqualität und Beschnitt geprüft. Das Farbprofil passt zur Druckerei.</label><button class="button primary" type="button" data-print disabled>Druck-PDF herunterladen ↓</button></section><p data-progress role="status"></p><p data-error class="error" hidden role="alert"></p>`;
 document.body.append(d);d.showModal();const $=s=>d.querySelector(s);let profile=null,valid=false,busy=false,generation=0,profileGeneration=0;const controller=new AbortController();
 const person=()=>snapshot.recipients[Number($('[data-person]').value)]||{};
 const enable=()=>{$('[data-print]').disabled=busy||!valid||!profile||!$('[data-confirm]').checked;$('[data-proof]').disabled=busy;$('[data-images]').disabled=busy;$('[data-person]').disabled=busy;$('[data-profile]').disabled=busy;};
 const error=e=>{$('[data-error]').textContent=e.message;$('[data-error]').hidden=false;};
 const close=()=>d.close();$('[data-close]').onclick=close;d.addEventListener('close',()=>{generation++;controller.abort();d.remove();},{once:true});
 async function inspect(){const g=++generation;valid=false;enable();$('[data-confirm]').checked=false;$('[data-error]').hidden=true;
  const selected={...snapshot,recipients:snapshot.recipients.length?[person()]:[]};
  const issues=checks(selected).filter(i=>i.level==='error').map(i=>i.text);
  try{for(const canvas of d.querySelectorAll('[data-download-side]')){const overflow=await renderCanvas(canvas,snapshot,canvas.dataset.downloadSide,person(),{scale:2});if(overflow.length)issues.push(sideLabel(snapshot,canvas.dataset.downloadSide)+': Ein Textfeld ist zu klein.');}
   const warnings=await printWarnings(snapshot);if(g!==generation||!d.open)return;
   $('[data-issues]').innerHTML=issues.length?'<strong>Vor dem Druck ergänzen:</strong><ul>'+[...new Set(issues)].map(i=>'<li>'+escape(i)+'</li>').join('')+'</ul>':'<p>Format und Inhalte geprüft.</p>';
   if(warnings.length)$('[data-issues]').innerHTML+='<strong>Bildqualität prüfen:</strong><ul>'+warnings.map(w=>'<li>'+escape(w)+'</li>').join('')+'</ul>';
   valid=!issues.length;enable();
  }catch(e){if(g===generation&&d.open)error(e);}
 }
 $('[data-person]').onchange=()=>void inspect();$('[data-confirm]').onchange=enable;
 $('[data-profile]').onchange=async()=>{const n=++profileGeneration;profile=null;enable();$('[data-profile-info]').textContent='';try{const f=$('[data-profile]').files[0];if(!f)return;if(f.size>10*1024*1024)throw Error('Das Farbprofil darf höchstens 10 MB groß sein.');const bytes=validateICC(new Uint8Array(await f.arrayBuffer()));if(n!==profileGeneration||!d.open)return;profile=bytes;$('[data-profile-info]').textContent='Profil gewählt: '+f.name;enable();}catch(e){if(n===profileGeneration)error(e);}};
 async function run(action){busy=true;enable();$('[data-error]').hidden=true;try{$('[data-progress]').textContent='Dateien werden erstellt …';await action();if(d.open)$('[data-progress]').textContent='Download erstellt.';}catch(e){if(d.open)error(e);}finally{busy=false;if(d.open)enable();}}
 $('[data-proof]').onclick=()=>run(()=>downloadReviewPDF({project:{...snapshot,recipients:[person()]},title:snapshot.name,version:version||'Entwurf'}));
 $('[data-images]').onclick=()=>run(async()=>{
  const files={},name=snapshot.name.replace(/[^\p{L}\p{N}]+/gu,'-').slice(0,70)+(version?'-v'+version:'')+(snapshot.sample?'-BEISPIEL':'');
  for(const side of sideNames(snapshot)){
   if(!d.open)return;
   const canvas=document.createElement('canvas');
   try{await renderCanvas(canvas,snapshot,side,person(),{scale:300/25.4});const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Bild konnte nicht erstellt werden.');files[name+'-'+sideLabel(snapshot,side)+'.png']=new Uint8Array(await blob.arrayBuffer());}finally{canvas.width=canvas.height=1;}
  }
  if(!d.open)return;
  files['LIES-MICH.txt']=strToU8(`${snapshot.name}\n${format.width} × ${format.height} mm · Auflösung für 300 dpi\nRGB-Bilder ohne Beschnitt, zum Ansehen und Weitergeben.\nFür die Druckerei den separaten CMYK-Druck-PDF-Export verwenden.\n${snapshot.sample?'Enthält Beispieldaten.':''}`);
  const url=URL.createObjectURL(new Blob([zipSync(files,{level:0})],{type:'application/zip'})),a=document.createElement('a');a.href=url;a.download=name+'-bilder.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
 });
 $('[data-print]').onclick=()=>run(async()=>{const bytes=await createPrintPDF({...snapshot,name:snapshot.name+(version?' · Version '+version:'')},{profile,people:[person()],signal:controller.signal,onProgress:t=>{if(d.open)$('[data-progress]').textContent=t;}});if(!d.open)return;const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download=snapshot.name.replace(/[^\p{L}\p{N}]+/gu,'-').slice(0,70)+(version?'-v'+version:'')+(snapshot.sample?'-BEISPIEL':'')+'-druck-cmyk.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);});
 void inspect();return d;
}
