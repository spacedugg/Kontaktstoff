import {uid} from './core.js';
import {FORMATS,isSelfmailer} from './formats.js';

// Two printable spreads, four panels. Postal geometry follows the supplied
// DIN-Lang-4-Seiter template. No postage indicia is baked into the artwork.
export function toSelfmailer(source){
 const c=structuredClone(source);if(isSelfmailer(c))return c;
 const original=structuredClone(c.sides),all=Object.values(original).flatMap(s=>s.fields),id=c.templateId||'';
 const value=role=>all.find(f=>f.brandRole===role)?.text;
 const textAt=(side,i)=>original[side].fields[i]?.text||'';
 const cart=['reha-sleep','zyvo'].includes(id),review=id==='bewertungspush',mms=id==='money-making-sprint';
 const brand=value('brand')||c.brief?.sender||'Deine Marke';
 const palettes={ 'money-making-sprint':['#7338ea','#f5f0ff','#211333'],bewertungspush:['#4285f4','#f5f8ff','#14233e'],'reha-sleep':['#1878b9','#f3f5ef','#203b48'],zyvo:['#2f75f4','#edf2ff','#10151d'],chattastic:['#165eda','#f2f5ff','#17243b'],raumwerk:['#405847','#f6f3ed','#24372b'],morgen:['#8b4637','#fbf2e9','#402923']};
 const accentField=all.find(f=>f.brandRole==='headline');
 const [accent,paper,ink]=palettes[id]||[c.brandColor||accentField?.color||'#405847',original.front.background.color||'#f6f3ed','#202d2a'];
 const t=(text,x,y,w,h,fontSize=12,color=ink,role='',weight='400')=>({id:uid(),type:'text',text,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true,...(role?{brandRole:role}:{})});
 const s=(x,y,w,h,color)=>({...t('',x,y,w,h),type:'shape',background:color});
 const image=(src,x,y,w,h,role='photo')=>({...structuredClone(src),id:uid(),x,y,w,h,brandRole:role,...(role==='brand'&&id==='zyvo'?{background:ink}:{})});
 const logo=all.find(f=>f.type==='image'&&(f.brandRole==='brand'||(cart&&f.w<80&&f.y<30)||(review&&f.w<80&&f.y<30)));
 const brandAt=(x,y,w=105)=>logo?image(logo,x,y,Math.min(w,logo.w/logo.h*11),11,'brand'):t(brand,x,y,w,12,16,ink,'brand','700');
 const photo=all.find(f=>f.type==='image'&&f.variantKey)||all.find(f=>f.type==='image'&&f.brandRole==='photo')||all.find(f=>f.type==='image'&&f.w<200&&f.h>45);
 const qrSource=all.find(f=>f.type==='qr');
 const qr=(x,y,size)=>({...t(qrSource?.text||'{{chatbot_url}}',x,y,size,size),type:'qr',background:'#ffffff'});
 const headline=value('headline')||(mms?'Hey {{first_name}},\n'+textAt('front',5):review?'Ihr guter Ruf.\nWieder im Fokus.':cart?original.front.fields.find(f=>f.type==='text'&&f.fontSize>=28)?.text:id==='chattastic'?'Gute Fragen.\nSofort eine Antwort.':id==='raumwerk'?'Mehr Raum.\nFür gute Arbeit.':id==='morgen'?'Ein guter Tag\nbeginnt persönlich.':null);
 const body=value('body')||((mms||review||cart||c.recipients.some(r=>r.personal_note))?'{{personal_note}}':c.brief?.offer||'Eine persönliche Einladung für Sie.');
 const cta=value('cta')||(mms?'Lass uns über euch sprechen.':review?'Bewertungen prüfen lassen':cart?(id==='reha-sleep'?'Ihre Auswahl ansehen':'Deine Auswahl ansehen'):'Persönlich kennenlernen');
 const offer=mms?textAt('back',4):review?textAt('back',5):cart?(id==='reha-sleep'?'Ihre Auswahl, ganz in Ruhe. Entscheiden Sie, was zu Ihnen passt.':'Deine Auswahl ist nur einen Scan entfernt. Schau sie dir noch einmal an.'):(c.brief?.offer||body);
 const signature=value('signature')||(mms?textAt('back',6):review?'Ihr Team von BewertungsPush':id==='reha-sleep'?'Ihr RehaSleep-Team':'Dein Team von '+brand);
 c.format='selfmailer-dl-4';c.selfmailer={version:1,sourceFormat:source.format};
 if(!all.length&&Object.values(original).every(s=>s.background.kind==='blank'))return c;
 // Upper outside panel is the postal back; lower panel is the cover.
 let front=[s(0,0,210,99,'#ffffff'),brandAt(10,10,100),t('PERSÖNLICH FÜR',10,36,104,5,8,accent,'','700'),t('{{company}}',10,46,108,17,18,ink,'','700'),t(review||id==='reha-sleep'?'Persönlich für Sie.':'Persönlich für dich.',10,70,105,10,10,ink),
  {...t('{{company}}\n{{first_name}} {{last_name}}\n{{street}}\n{{postal_code}} {{city}}',134,45,70,33,10,'#111111'),postalAddress:true},s(0,99,210,99,paper)];
 const native=!!headline;
 if(native){
  front.push(brandAt(11,108,100));
  if(review){
   front.push(t('PERSÖNLICH FÜR {{company}}',11,128,106,7,8,accent,'','700'),t(headline,11,141,111,31,27,ink,'headline','700'),t('Unberechtigte Bewertungen prüfen und löschen lassen.',11,175,112,14,10,ink,'body'),s(133,112,67,70,'#e7efff'),t('{{rating_current}}',141,120,42,15,28,ink,'','700'),{...t('{{rating_current}}',141,138,41,6),display:'stars',color:'#efad27'},t('→',179,137,18,15,28,accent,'','700'),t('{{rating_example}}',151,153,44,20,36,accent,'','700'),{...t('{{rating_example}}',151,175,41,6),display:'stars',color:'#efad27'},t('Beispielwerte · keine Ergebniszusage',132,187,69,5,6.5,ink));
  }else if(mms){
   front.push(s(135,99,75,99,accent),s(147,127,51,48,'#dfff52'),t('↗',153,125,42,43,80,ink,'','700'),t('FÜR\n{{company}}',145,180,55,14,10,'#ffffff','','700'),t(headline,11,133,119,43,29,ink,'headline','700'),t('Eine persönliche Frage von Jakob. →',11,185,119,7,10,accent,'','700'));
  }else if(photo){
   front.push(image(photo,121,99,89,99),s(129,177,73,13,'#ffffff'),t(cart?'{{product_name}}':'Für {{first_name}}',132,181,67,8,10,ink,'','700'),t(headline,11,132,102,42,28,ink,'headline','700'),t(cta+' →',11,183,104,10,11,accent,'cta','700'));
  }else if(id==='return-ticket'){
   front.push(s(141,99,69,99,accent),t('DEIN\nCOME\nBACK.',150,125,51,48,30,'#ffffff','','700'),...Array.from({length:9},(_,i)=>s(137,104+i*10,2,5,'#dcb8a3')),t('Für {{first_name}}',11,128,113,8,10,accent),t(headline,11,143,118,35,30,ink,'headline','700'),t(cta+' →',11,184,117,8,11,accent,'cta','700'));
  }else if(id==='invitation'){
   front.push(s(7,126,196,65,accent),s(10,129,190,59,paper),t('PERSÖNLICHE EINLADUNG',17,134,176,7,9,accent,'','700'),t(headline.replaceAll('\n',' '),17,146,169,27,28,ink,'headline','700'),t('Für {{first_name}}',17,177,97,8,11,accent),t('↗',174,171,20,15,28,accent,'','700'));
  }else{
   const bold=['bold-type','stacked-note','fresh-start'].includes(id);
   if(bold)front.push(s(139,116,60,70,accent),t('↗',145,125,49,45,70,'#ffffff','','700'));
   else front.push(s(11,124,188,1,accent),t('01',157,145,43,30,56,accent,'','700'));
   front.push(t('Für {{first_name}}',11,128,130,7,10,accent),t(headline,11,139,134,41,28,ink,'headline','700'),t(cta+' →',11,185,170,8,11,accent,'cta','700'));
  }
 }else{
  // Unrecognised/uploaded artwork is fitted without cropping or discarding it.
  const f=FORMATS.find(f=>f.id===source.format),scale=Math.min(210/f.width,99/f.height),w=f.width*scale,h=f.height*scale,dx=(210-w)/2,dy=99+(99-h)/2;
  if(original.front.background.kind==='image')front.push({...t('',dx,dy,w,h),type:'image',data:original.front.background.data,fit:'contain'});
  else front.push(s(dx,dy,w,h,original.front.background.color||'#ffffff'));
  front.push(...original.front.fields.map(f=>({...f,id:uid(),x:dx+f.x*scale,y:dy+f.y*scale,w:f.w*scale,h:Math.max(f.h*scale,f.type==='text'?6*25.4/72*1.3*f.text.split('\n').length:2),fontSize:Math.max(6,f.fontSize*scale)})));
 }
 let back=[s(0,0,210,99,paper),brandAt(12,10,130),t('{{salutation}}',12,31,182,12,21,ink,'','700'),t(body,12,49,180,29,14,ink,'body'),t(signature,12,83,179,10,12,accent,'signature','700'),s(0,99,210,99,'#ffffff'),s(0,99,5,99,accent),t(cta,12,110,121,22,25,ink,'cta','700'),t(offer,12,140,118,28,12,ink),t(review?'Keine Vorkasse. Zahlung nur bei erfolgreicher Löschung.':mms?'Angebot. Wunschkunden. Ein wiederholbarer Akquise-Ablauf.':cart?'{{product_name}} · {{product_variant}}':'Ein Scan. Ihr persönlicher nächster Schritt.',12,178,118,13,10,accent,'','700'),s(144,109,55,75,paper),qr(152,118,39),t('Scannen & ansehen',149,165,47,8,10,ink,'','700'),t('{{chatbot_url}}',12,192,186,5,6.5,ink)];
 if(cart&&photo){back=back.filter(f=>f.y!==140);back.push(image(photo,12,139,43,29),t(offer,61,139,69,31,11,ink));}
 if(review)back.push(t('Über die Löschung entscheidet Google.',144,187,57,6,6.5,ink));
 if(!native){const f=FORMATS.find(f=>f.id===source.format),scale=Math.min(186/f.width,85/f.height),dx=(210-f.width*scale)/2,dy=7;back=back.filter(f=>f.y>=99);if(original.back.background.kind==='image')back.unshift({...t('',dx,dy,f.width*scale,f.height*scale),type:'image',data:original.back.background.data,fit:'contain'});else back.unshift(s(dx,dy,f.width*scale,f.height*scale,original.back.background.color||'#ffffff'));back.splice(1,0,...original.back.fields.map(f=>({...f,id:uid(),x:dx+f.x*scale,y:dy+f.y*scale,w:f.w*scale,h:Math.max(f.h*scale,f.type==='text'?6*25.4/72*1.3*f.text.split('\n').length:2),fontSize:Math.max(6,f.fontSize*scale)})));}
 c.sides={front:{background:{kind:'blank',color:paper},fields:front},back:{background:{kind:'blank',color:'#ffffff'},fields:back}};
 for(const side of Object.values(c.sides))for(const f of side.fields){f.w=Math.max(2,f.w);f.h=Math.max(2,f.h);if(f.color==='#ffffff')f.brandOnAccent=true;}
 return c;
}
