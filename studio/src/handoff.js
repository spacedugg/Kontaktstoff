import {sideLabel,isSelfmailer} from './formats.js';
import {zipSync,strToU8} from 'fflate';
import {PDFDocument} from 'pdf-lib';
import {FORMATS,sideNames,checks,csvString,resolveText} from './core.js';
import {renderCanvas,layoutText,imageFrom} from './render.js';
export async function auditCampaign(campaign,progress=()=>{},signal){
 await document.fonts.ready;
 const issues=checks(campaign),ctx=document.createElement('canvas').getContext('2d');
 for(let i=0;i<campaign.recipients.length;i++){
  if(signal?.aborted)throw new Error('Prüfung abgebrochen.');
  const recipient=campaign.recipients[i];
  for(const [side,label] of sideNames(campaign).map(side=>[side,sideLabel(campaign,side)]))for(const field of campaign.sides[side].fields){
   if(field.type==='text'&&field.display!=='stars'&&layoutText(ctx,field,resolveText(field.text,recipient)).overflow)issues.push({level:'error',text:`${label} · ${recipient.company||'Empfänger '+(i+1)}: Text „${field.text.slice(0,50)}“ passt nicht in das Feld.`,recipientId:recipient.id,side});
  }
  if(!recipient.company?.trim())issues.push({level:'error',text:`Empfänger ${i+1}: Firmenname fehlt.`});
  progress(i+1,campaign.recipients.length);
  if(i%25===0)await new Promise(r=>setTimeout(r,0));
 }
 for(const [side,label] of sideNames(campaign).map(side=>[side,sideLabel(campaign,side)]))for(const original of campaign.sides[side].fields.filter(f=>f.type==='image'))for(const data of new Set([original.data,...Object.values(original.variants||{})])){const field={...original,data};
  const image=await imageFrom(field.data),dpi=(field.fit==='cover'?Math.min:Math.max)(image.width/(field.w/25.4),image.height/(field.h/25.4));
  if(dpi<200)issues.push({level:'warning',text:`${label}: Ein Bildelement erreicht etwa ${Math.round(dpi)} dpi. Für scharfen Druck empfehlen wir 300 dpi.`});
 }
 const addresses=campaign.recipients.filter(r=>!r.street?.trim()||!r.postal_code?.trim()||!r.city?.trim());
 if(addresses.length)issues.push({level:'warning',text:`${addresses.length} Empfänger ohne vollständige Postanschrift. Vor dem Versand ergänzen; die Ansichts-PDFs können schon erstellt werden.`});
 const seen=new Set();let duplicates=0;
 for(const r of campaign.recipients){const key=[r.company,r.first_name,r.street,r.postal_code,r.city].map(v=>String(v||'').toLowerCase().trim()).join('|');if(seen.has(key))duplicates++;seen.add(key);}
 if(duplicates)issues.push({level:'warning',text:`${duplicates} mögliche doppelte Kontakte. Bitte die Empfängerliste prüfen.`});
 return issues;
}
export async function createHandoff(campaign,{from=0,to=campaign.recipients.length,onProgress=()=>{},signal}={}){
 const issues=await auditCampaign(campaign,()=>{},signal);
 if(issues.some(i=>i.level==='error'))throw new Error('Die Kampagne enthält offene Fehler. Bitte zuerst „Alle Empfänger prüfen“ ausführen.');
 const selected=campaign.recipients.slice(from,to);
 if(!selected.length||selected.length>50)throw new Error('Bitte zwischen 1 und 50 Empfänger pro Paket auswählen.');
 const doc=await PDFDocument.create(),format=FORMATS.find(f=>f.id===campaign.format);
 doc.setTitle(campaign.name);doc.setSubject('Personalisierte Ansichten · RGB · 300 dpi · ohne Beschnitt');
 for(let i=0;i<selected.length;i++){
  if(signal?.aborted)throw new Error('Export abgebrochen. Es wurde kein Paket heruntergeladen.');
  for(const side of sideNames(campaign)){
   const canvas=document.createElement('canvas');await renderCanvas(canvas,campaign,side,selected[i],{scale:300/25.4});
   const img=await doc.embedJpg(canvas.toDataURL('image/jpeg',.94));
   const page=doc.addPage([format.width*72/25.4,format.height*72/25.4]);page.drawImage(img,{x:0,y:0,width:page.getWidth(),height:page.getHeight()});canvas.width=canvas.height=1;
  }
  onProgress(i+1,selected.length);await new Promise(r=>setTimeout(r,0));
 }
 if(signal?.aborted)throw new Error('Export abgebrochen.');
 const keys=[...new Set(selected.flatMap(r=>Object.keys(r).filter(k=>k!=='id')))];
 const manifest={campaign:campaign.name,createdAt:new Date().toISOString(),format:{width:format.width,height:format.height,unit:'mm',...(isSelfmailer(campaign)?{closedWidth:210,closedHeight:99,foldY:99,panels:4,requiredBleed:3}:{})},colorSpace:'RGB',dpi:300,bleed:0,recipientRange:[from+1,to],pageOrder:isSelfmailer(campaign)?'Pro Empfänger Außenseite (oben Postanschrift, unten Titel), dann Innenseite':'Pro Empfänger Vorderseite, dann Rückseite',pages:selected.map((r,i)=>({company:r.company,recipientId:r.id,front:i*format.pages+1,...(format.pages===2?{back:i*2+2}:{})})),issues,brief:campaign.brief||{}};
 const readme=`KONTAKTSTOFF · KAMPAGNENÜBERGABE\n\n${campaign.name}\n${selected.length} Empfänger (Nr. ${from+1} bis ${to}) · ${selected.length*format.pages} Seiten\n\nINHALT\nmailings-ansicht.pdf: ${isSelfmailer(campaign)?'Außen-/Innenseite (vier Gestaltungsflächen)':'Vorder-/Rückseite'} pro Empfänger in Reihenfolge der CSV.\nempfaenger.csv: Daten des gewählten Bereichs.\nkampagne.kontaktstoff.json: Vollständiges Projekt mit allen Empfängern und Designs, im Studio importierbar.\nuebergabe.json: Seitenzuordnung, Briefing und Prüfergebnis.\n\nDRUCKABSTIMMUNG\nAnsichts-PDF, ${format.width} × ${format.height} mm, 300 dpi Rasterbilder, RGB, ohne Beschnitt. ${isSelfmailer(campaign)?'Geschlossen 210 × 99 mm, Falz bei 99 mm. Benötigtes Datenformat mit 3 mm Beschnitt: 216 × 204 mm.':''} Kein druckfertiges PDF/X. Bitte mit der Druckerei CMYK-Profil, Beschnitt, Papier und Kuvertierung abstimmen. Bei randabfallenden Motiven müssen die Quelldesigns entsprechend vorbereitet werden. QR-Codes vor Freigabe auch in Originalgröße auf Papier scannen.\n\nVERSAND\nDieses Paket löst keinen Auftrag aus. Postanschriften und Freigabe vor dem Versand separat prüfen. Das Paket enthält personenbezogene Empfängerdaten.\n\nHINWEISE\n${issues.map(i=>'- '+i.text).join('\n')||'Keine offenen Hinweise.'}\n`;
 const files={'mailings-ansicht.pdf':await doc.save(),'empfaenger.csv':strToU8(csvString(selected,keys)),'kampagne.kontaktstoff.json':strToU8(JSON.stringify(campaign,null,2)),'uebergabe.json':strToU8(JSON.stringify(manifest,null,2)),'BITTE-LESEN.txt':strToU8(readme)};
 return new Blob([zipSync(files,{level:0})],{type:'application/zip'});
}
