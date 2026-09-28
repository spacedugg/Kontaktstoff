export function ratingValue(value){const raw=String(value).trim().replace(',','.');if(!/^[0-5](?:\.\d+)?$/.test(raw))return null;const number=Number(raw);return number<=5?number:null;}
import {FORMATS,sideNames,sideLabel,isSelfmailer,POSTAL_ZONES} from './formats.js';
export {FORMATS,sideNames} from './formats.js';
export const KEYS = { company:'Firmenname', first_name:'Vorname',last_name:'Nachname',contact_role:'Funktion',email:'E-Mail',phone:'Telefon',industry:'Branche',employee_count:'Mitarbeiterzahl',source_url:'Kontaktquelle', salutation:'Ansprache', personal_note:'Persönliche Nachricht', personal_headline:'Persönliche Überschrift',product_id:'Produkt-ID',product_name:'Produktname',product_variant:'Größe / Variante',product_url:'Produktseite',cart_url:'Warenkorb-Link',checkout_id:'Checkout-ID',coupon_code:'Gutscheincode',offer_text:'Gutschein-Angebot',offer_terms:'Gutscheinbedingungen',rating_current:'Sterne: Ausgangswert',rating_example:'Sterne: Beispielwert danach', website:'Website', chatbot_url:'Ziel-Link',street:'Straße & Hausnummer',postal_code:'PLZ',city:'Ort',country:'Land' };
export const uid = () => crypto.randomUUID();
export const clone = value => structuredClone(value);
export const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
export const validURL = value => { try { const u=new URL(value); return ['https:','http:'].includes(u.protocol) && !!u.hostname; } catch { return false; } };
export const resolveText = (template,recipient={}) => String(template).replace(/\{\{\s*([\w-]+)\s*\}\}/g,(_,key)=>String(recipient[key] ?? ''));
export function resolveField(field,recipient={}){const text=resolveText(field.text,recipient);if(!field.postalAddress)return text;return text.split('\n').map(v=>v.trim()).filter((v,i,lines)=>v&&(i===0||v!==lines[i-1])).join('\n');}
export const missingKeys = (template,recipient={}) => [...String(template).matchAll(/\{\{\s*([\w-]+)\s*\}\}/g)].map(m=>m[1]).filter(key=>!String(recipient[key]??'').trim());
export function createCampaign(blank=false) {
  const field=(type,text,x,y,w,h,color='#ffffff',fontSize=12)=>({id:uid(),type,text,x,y,w,h,color,fontSize,weight:'700',align:'left',background:'transparent',autoFit:true});
  return { version:1,id:uid(),name:blank?'Neue Kampagne':'chattastic · Der erste Kontakt',format:'a5-landscape',updatedAt:Date.now(),sample:!blank,...(blank?{brief:{sender:'',audience:'',goal:'chatbot',offer:''},onboarding:{active:true,step:0,personalizationSkipped:false}}:{}),
    sides:{front:{background:{kind:blank?'blank':'template'},fields:blank?[]:[field('text','{{company}}',126,17,70,12),field('text','{{chatbot_url}}',12,137,150,6,'#2563eb',9),field('qr','{{chatbot_url}}',178,119,24,24,'#0f172a')]},back:{background:{kind:blank?'blank':'template'},fields:blank?[]:[field('qr','{{chatbot_url}}',143,55,34,34,'#0f172a'),field('text','Für {{company}}',129,98,62,13,'#ffffff',10),field('text','{{chatbot_url}}',129,119,62,10,'#ffffff',8)]}},
    recipients:blank?[]:[{id:uid(),company:'Nordlicht Immobilien',first_name:'Anna',salutation:'Hallo Anna,',website:'nordlicht.example',chatbot_url:'https://chattastic.de/'},{id:uid(),company:'Studio Hafenblick',first_name:'Jonas',salutation:'Hallo Jonas,',website:'hafenblick.example',chatbot_url:'https://chattastic.de/'},{id:uid(),company:'Bergmann Haustechnik',first_name:'Sarah',salutation:'Hallo Sarah,',website:'bergmann.example',chatbot_url:'https://chattastic.de/'}] };
}
export function parseCSV(input) {
  input=input.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  const first=input.split('\n')[0];
  const delimiter=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
  const rows=[]; let row=[],cell='',quoted=false;
  for(let i=0;i<input.length;i++) {
    const ch=input[i];
    if(ch==='"') { if(quoted&&input[i+1]==='"'){cell+='"';i++;} else if(quoted || cell==='') quoted=!quoted; else cell+=ch; }
    else if(ch===delimiter&&!quoted){row.push(cell.trim());cell='';}
    else if(ch==='\n'&&!quoted){row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell='';}
    else cell+=ch;
  }
  if(quoted) throw new Error('Ein Anführungszeichen in der CSV-Datei ist nicht geschlossen.');
  row.push(cell.trim());if(row.some(Boolean))rows.push(row);
  if(rows.length<2) throw new Error('Die CSV braucht eine Kopfzeile und mindestens einen Empfänger.');
  const aliases={firma:'company',firmenname:'company',unternehmen:'company',vorname:'first_name',ansprache:'salutation',anrede:'salutation',url:'chatbot_url',link:'chatbot_url',chatbot_link:'chatbot_url',chatbot:'chatbot_url',webseite:'website',strasse:'street',straße:'street',strasse_hausnummer:'street',plz:'postal_code',postleitzahl:'postal_code',ort:'city',stadt:'city',land:'country'};
  const headers=rows.shift().map(h=>{const key=h.toLowerCase().replace(/[\s-]+/g,'_');return aliases[key]||key;});
  if(headers.some(h=>!/^\w+$/.test(h)||['__proto__','constructor','prototype','id'].includes(h)))throw new Error('Bitte einfache Spaltennamen verwenden: company, first_name, salutation, website, chatbot_url.');
  if(new Set(headers).size!==headers.length)throw new Error('Spaltennamen dürfen nicht doppelt vorkommen.');
  if(!headers.includes('company'))throw new Error('Eine Spalte „company“ oder „Firmenname“ fehlt.');
  if(rows.length>1000)throw new Error('Bitte maximal 1.000 Empfänger pro Kampagne importieren.');
  return rows.map((r,i)=>{if(r.some(cell=>cell.length>5000))throw new Error(`Zeile ${i+2}: Ein Wert ist länger als 5.000 Zeichen.`);if(r.length!==headers.length)throw new Error(`Zeile ${i+2}: Anzahl der Spalten stimmt nicht.`);return Object.fromEntries([['id',uid()],...headers.map((h,j)=>[h,r[j]])]);});
}
export function csvString(rows,keys) { return '\uFEFF'+[keys,...rows.map(r=>keys.map(k=>String(r[k]??'')))].map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n'); }
export function validateCampaign(value) {
  if(!value||value.version!==1||!/^[-a-zA-Z0-9_]{1,100}$/.test(value.id)||!FORMATS.some(f=>f.id===value.format)||typeof value.name!=='string'||!value.name.trim()||value.name.length>120) throw new Error('Dies ist keine unterstützte Kontaktstoff-Kampagne.');
  if(!Array.isArray(value.recipients)||value.recipients.length>1000)throw new Error('Ungültige Empfängerliste.');
  if(value.recipients.some(r=>!r||!/^[-a-zA-Z0-9_]{1,100}$/.test(r.id)||Object.keys(r).some(k=>['__proto__','prototype','constructor'].includes(k))||Object.values(r).some(v=>typeof v!=='string'||v.length>5000)))throw new Error('Ungültige Empfängerdaten.');
  if(value.brief && (!['sender','audience','goal','offer'].every(key=>typeof value.brief[key]==='string'&&value.brief[key].length<=1000)))throw new Error('Ungültiges Kampagnenbriefing.');
  if(value.onboarding && (!Number.isInteger(value.onboarding.step)||value.onboarding.step<0||value.onboarding.step>5||typeof value.onboarding.active!=='boolean'))throw new Error('Ungültiger Anleitungsstand.');
  if(value.tutorial&&(!Number.isInteger(value.tutorial.step)||value.tutorial.step<0||value.tutorial.step>7||typeof value.tutorial.active!=='boolean'||!/^[-a-zA-Z0-9_]{1,100}$/.test(value.tutorial.fieldId)))throw new Error('Ungültiger Tutorialstand.');
  if(value.onboarding?.designReady!==undefined&&typeof value.onboarding.designReady!=='boolean')throw new Error('Ungültiger Anleitungsmodus.');
  const format=FORMATS.find(f=>f.id===value.format);
  for(const side of ['front','back']){
    const s=value.sides?.[side];
    if(!s||!['blank','template','image'].includes(s.background?.kind)||!Array.isArray(s.fields)||s.fields.length>(value.format==='selfmailer-dl-4'?80:40))throw new Error('Ungültige Designseite.');
    if(s.background.color!==undefined&&!/^#[0-9a-f]{6}$/i.test(s.background.color))throw new Error('Ungültige Flächenfarbe.');
    if(s.background.kind==='image'&&(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s.background.data)||s.background.data.length>16000000||![s.background.width,s.background.height].every(n=>Number.isFinite(n)&&n>0)))throw new Error('Ungültige Bilddatei im Projekt.');
    if(s.background.bleed!==undefined&&(![0,3].includes(s.background.bleed)||s.background.kind!=='image'||(s.background.bleed===3&&(value.format!=='selfmailer-dl-4'||Math.abs(s.background.width/s.background.height-216/204)>.005))))throw new Error('Ungültiger Design-Beschnitt.');
    for(const f of s.fields){
      if(f.variantKey!==undefined||f.variants!==undefined){if(f.type!=='image'||typeof f.variantKey!=='string'||!/^\w{1,50}$/.test(f.variantKey)||!f.variants||typeof f.variants!=='object'||Array.isArray(f.variants)||Object.keys(f.variants).length>20||Object.entries(f.variants).some(([k,v])=>!/^[-\w]{1,60}$/.test(k)||['__proto__','prototype','constructor'].includes(k)||typeof v!=='string'||v.length>16000000||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v)))throw new Error('Ungültige Produktbild-Zuordnung.');}
      if(f.display!==undefined&&(f.display!=='stars'||f.type!=='text'))throw new Error('Ungültige Felddarstellung.');
      if(f.fit!==undefined&&!['contain','cover'].includes(f.fit))throw new Error('Ungültige Bildanpassung.');
      if(f.type==='image'&&(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(f.data)||f.data.length>16000000))throw new Error('Ungültiges Bildelement.');
      if(!f||!/^[-a-zA-Z0-9_]{1,100}$/.test(f.id)||!['text','qr','image','shape'].includes(f.type)||typeof f.text!=='string'||f.text.length>5000||![f.x,f.y,f.w,f.h,f.fontSize].every(Number.isFinite)||f.x<0||f.y<0||f.w<2||f.h<2||f.x+f.w>format.width+.1||f.y+f.h>format.height+.1||f.fontSize<6||f.fontSize>80||!/^#[0-9a-f]{6}$/i.test(f.color)||!['400','700'].includes(f.weight)||!['left','center','right'].includes(f.align)||!(f.background==='transparent'||/^#[0-9a-f]{6}$/i.test(f.background))) throw new Error('Ungültige Personalisierungsfelder.');
    }
    if(new Set(s.fields.map(f=>f.id)).size!==s.fields.length)throw new Error('Doppelte Feld-IDs.');
  }
  if(new Set(value.recipients.map(r=>r.id)).size!==value.recipients.length)throw new Error('Doppelte Empfänger-IDs.');
  const result=clone(value);
  // Older tutorials also carried the six-step setup, creating two competing guides.
  if(result.tutorial){
    if(result.tutorial.version!==2){result.tutorial.step=[0,0,1,1,1,2,3,3][result.tutorial.step];result.tutorial.version=2;}
    if(result.tutorial.step>3)throw new Error('Ungültiger Tutorialstand.');
    delete result.onboarding;
  }
  return result;
}
export function checks(campaign) {
  const issues=[];const format=FORMATS.find(f=>f.id===campaign.format);
  if(isSelfmailer(campaign)){
    issues.push({level:'info',text:'Selfmailer: 4 Flächen auf 2 Druckseiten. Falz bei 99 mm. Für die Produktion: „Druck-PDF“ mit 3 mm Beschnitt und CMYK-Profil der Druckerei verwenden. Die Designfreigabe ersetzt keine Druckprüfung.'});
    for(const f of campaign.sides.front.fields){if(f.type==='shape'&&f.background==='#ffffff')continue;for(const z of POSTAL_ZONES){if(f.x<z.x+z.w&&f.x+f.w>z.x&&f.y<z.y+z.h&&f.y+f.h>z.y&&!(z.id==='address'&&f.postalAddress))issues.push({level:'error',text:'Außenseite: Ein Element überlagert die Zone „'+z.name+'“. Bitte im Layout verschieben.'});}}
  }
  if(campaign.sample)issues.push({level:'info',text:'Beispielkampagne: Empfänger sind fiktiv. Die QR-Codes enthalten Demo-Links; vor dem Einsatz durch eigene Ziele ersetzen.'});
  if(!campaign.recipients.length)issues.push({level:'error',text:'Noch keine Empfänger vorhanden.'});
  for(const side of sideNames(campaign)){const label=sideLabel(campaign,side);
    const s=campaign.sides[side];
    if(s.background.kind==='blank'&&!s.fields.length)issues.push({level:'error',text:`${label}: Das Design ist noch leer.`});
    if(s.background.kind==='image'){
      const dpi=Math.min(s.background.width/((format.width+2*(s.background.bleed||0))/25.4),s.background.height/((format.height+2*(s.background.bleed||0))/25.4));
      if(dpi<200)issues.push({level:'warning',text:`${label}: Bildauflösung etwa ${Math.round(dpi)} dpi. Für den Druck empfehlen wir 300 dpi.`});
      if(Math.abs(s.background.width/s.background.height-format.width/format.height)>.035)issues.push({level:'warning',text:`${label}: Das Bildformat weicht ab. Das Design wird vollständig mit weißen Rändern eingepasst.`});
    }
    for(const f of s.fields){
      if(f.fit!==undefined&&!['contain','cover'].includes(f.fit))throw new Error('Ungültige Bildanpassung.');
      if(f.type==='image'&&(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(f.data)||f.data.length>16000000))throw new Error('Ungültiges Bildelement.');
      if(f.type!=='shape'&&(f.x<5||f.y<5||f.x+f.w>format.width-5||f.y+f.h>format.height-5))issues.push({level:'warning',text:`${label}: Ein Feld liegt außerhalb des 5-mm-Sicherheitsabstands.`});
      if(f.type==='qr'&&Math.min(f.w,f.h)<20)issues.push({level:'warning',text:`${label}: Ein QR-Code ist kleiner als 20 mm.`});
      if(f.type==='image'&&f.variantKey&&campaign.recipients.some(r=>!Object.hasOwn(f.variants||{},r[f.variantKey])))issues.push({level:'error',text:`${label}: Für mindestens eine Produkt-ID fehlt das passende Bild.`});
      if(f.type==='shape'||f.type==='image')continue;
      if(f.display==='stars'&&campaign.recipients.some(r=>ratingValue(resolveText(f.text,r))===null))issues.push({level:'error',text:`${label}: Sterne benötigen einen Wert zwischen 0 und 5.`});
      const missing=campaign.recipients.filter(r=>f.postalAddress?(![r.company,r.first_name,r.last_name].some(v=>v?.trim())||missingKeys(f.text,r).some(k=>!['company','first_name','last_name'].includes(k))):missingKeys(f.text,r).length);
      if(missing.length)issues.push({level:'error',text:`${label}: ${missing.length} Empfänger ohne Wert für „${f.text}“.`});
      if(f.type==='qr'){
        const invalid=campaign.recipients.filter(r=>!validURL(resolveText(f.text,r))||resolveText(f.text,r).length>1000);
        if(invalid.length)issues.push({level:'error',text:`${label}: ${invalid.length} ungültige oder zu lange QR-Ziellinks (max. 1.000 Zeichen).`});
      }
    }
  }
  return issues;
}

export function setupProgress(campaign) {
  const designed=s=>s.background.kind!=='blank'||s.fields.length>0;
  return [Boolean(campaign.name.trim()),FORMATS.some(f=>f.id===campaign.format),designed(campaign.sides.front)&&designed(campaign.sides.back),Boolean(campaign.onboarding?.personalizationSkipped||Object.values(campaign.sides).some(s=>s.fields.some(f=>f.type==='qr'||/\{\{/.test(f.text)))),campaign.recipients.some(r=>Boolean(r.company?.trim())),campaign.onboarding?.active===false];
}
