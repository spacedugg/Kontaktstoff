import {uid} from './core.js';
import {cartArt} from './cart-art.js';
import {brandLogoDark} from './bewertungspush-art.js';
import {refreshArt} from './client-refresh-art.js';

const text=(value,x,y,w,h,size=10,color='#17263f',weight='400',role='')=>({id:uid(),type:'text',text:value,x,y,w,h,fontSize:size,color,weight,align:'left',background:'transparent',autoFit:true,...(role?{brandRole:role}:{})});
const shape=(x,y,w,h,color)=>({...text('',x,y,w,h),type:'shape',background:color});
const image=(data,x,y,w,h,fit='contain',role='artwork')=>({...text('',x,y,w,h),type:'image',data,fit,brandRole:role});
const qr=(value,x,y,w=34)=>({...text(value,x,y,w,w),type:'qr',background:'#ffffff'});
const postal=c=>({...text(c.sides.front.fields.find(f=>f.postalAddress)?.text||'{{company}}\n{{first_name}} {{last_name}}\n{{street}}\n{{postal_code}} {{city}}',134,45,70,33,10,'#111111'),postalAddress:true});
const polite=r=>({...r,salutation:(r.salutation||'').replace(/^Guten Tag Frau /,'Liebe Frau ').replace(/^Guten Tag Herr /,'Lieber Herr ')});

// Apply a cover-only revision without resetting edited copy, recipients or inside pages.
export function refreshBewertungspushStars(source,{recovery=false}={}){
 const c=structuredClone(source);
 const fields=c.sides.front.fields.filter(f=>f.type==='image'&&f.x===0&&f.y===99&&f.w===210&&f.h===99);
 if(c.format!=='selfmailer-dl-4'||fields.length!==1)throw Error('Unerwartetes BewertungsPush-Titellayout.');
 fields[0].data=refreshArt[recovery?'bp-recovery':'bp-acquisition'];
 return c;
}

// Explicitly applied redesigns; never silently overwrite a saved customer project.
export function refreshBewertungspush(source,{recovery=false}={}){
 const c=structuredClone(source),ink='#17263f',blue='#2e72e7',muted='#566982';
 const t=(v,x,y,w,h,size=10,color=ink,weight='400',role='')=>text(v,x,y,w,h,size,color,weight,role);
 const logo=(x,y,w=48)=>image(brandLogoDark,x,y,w,w/6.1,'contain','brand');
 const stars=(key,x,y,w,h)=>({...t('{{'+key+'}}',x,y,w,h),display:'stars',color:'#eda61d'});
 const address=postal(c),oldQR=c.sides.back.fields.find(f=>f.type==='qr');
 c.format='selfmailer-dl-4';c.selfmailer={...c.selfmailer,design:recovery?'bp-return-editorial':'bp-reputation-editorial',version:3};
 c.recipients=c.recipients.map(polite);
 if(c.sample)for(const r of c.recipients){r.street ||= 'Musterstraße 12';r.postal_code ||= '12345';r.city ||= 'Beispielstadt';}
 if(recovery)for(const r of c.recipients){
  r.personal_note='Sie haben Ihre Prüfung bei BewertungsPush begonnen, aber noch nicht abgeschlossen. Vielleicht kam etwas dazwischen. Wenn Sie weitermachen möchten, finden Sie über den QR-Code den Einstieg zu BewertungsPush.';
 }
 c.sides.front={background:{kind:'blank',color:'#ffffff'},fields:[
  logo(12,11),t(recovery?'Eine kleine Erinnerung.\nFür Ihren guten Ruf.':'Gute Arbeit verdient\neinen guten Ruf.',12,34,111,25,23),
  t('{{company}}',12,65,111,8,11,blue,'700'),t('bewertungspush.de',12,77,43,6,8,muted),address,
  image(refreshArt[recovery?'bp-recovery':'bp-acquisition'],0,99,210,99),logo(11,106,48),
  t('{{salutation}}',11,123,101,7,9,muted,'700'),
  t(recovery?'Kurz pausiert.\nJetzt Ihren Ruf\nnach vorn bringen.':'Ihr guter Ruf.\nZurück im\nMittelpunkt.',11,136,99,37,recovery?25:28,ink,'400','headline'),
  t(recovery?'Ihre Prüfung ist noch nicht abgeschlossen.\nMachen Sie den nächsten Schritt.':'Unberechtigte Google-Bewertungen?\nWir prüfen, was sich ändern lässt.',11,177,100,11,9,muted),
  t('Keine Vorkasse. Zahlung nur bei erfolgreicher Löschung.',11,191,153,5,7.8,blue,'700'),
  {...t('Aufklappen →',166,191,33,5,7.8,ink,'700'),align:'right'}
 ]};
 if(recovery)c.sides.front.fields.push(
  t('IHR NÄCHSTER SCHRITT',130,129,61,6,6.8,muted,'700'),
  t('Unternehmen finden',126,141,65,8,10,ink,'700'),
  t('Bewertungen auswählen',126,152,65,8,9.5,ink,'700'),
  t('Prüfung fortsetzen →',126,168,61,8,10,'#ffffff','700'),
  t('Für {{company}}',118,186,81,5,7,muted)
 );else c.sides.front.fields.push(
  t('BEISPIEL · HEUTE',118,161,28,5,6,muted,'700'),t('{{rating_current}}',118,168,28,12,23,ink,'700'),stars('rating_current',118,182,26,4),
  t('BEISPIEL · POTENZIAL',154,137,40,5,6,muted,'700'),t('{{rating_example}}',154,144,41,18,35,blue,'700'),stars('rating_example',154,165,36,5),
  t('Beispielwerte, keine Ergebniszusage.',114,187,86,4,6,muted)
 );
 const entry=recovery?'Prüfung fortsetzen.\nMit einem guten Gefühl.':'Der nächste Schritt\nfür Ihren guten Ruf.';
 c.sides.back={background:{kind:'blank',color:'#ffffff'},fields:[
  image(refreshArt['bp-inside'],0,0,210,198),logo(11,9,48),
  t(recovery?'Ein guter Anfang.\nJetzt weitermachen.':'Ihr Unternehmen.\nIhr guter Eindruck.',11,28,127,25,24),
  t('{{salutation}}',11,59,128,8,11,blue,'700'),
  t('{{personal_note}}',11,70,124,23,10,ink,'400','body'),
  {...t(recovery?'Guter Ruf.\nNächster Schritt.':'Ihr guter Ruf.\nUnsere Aufgabe.',146,69,53,16,15,blue,'700'),align:'center'},
  t(entry,11,110,127,26,23),
  t('01',11,143,9,7,9,blue,'700'),t('Unternehmen finden',26,143,109,7,10,ink,'700'),
  t('02',11,155,9,7,9,blue,'700'),t('Bewertungen auswählen',26,155,109,7,10,ink,'700'),
  t('03',11,167,9,7,9,blue,'700'),t(recovery?'Auftrag abschließen':'Prüfung beauftragen',26,167,109,7,10,ink,'700'),
  t('0 € Vorkasse.',15,179,44,8,15,blue,'700'),t('Sie zahlen nur bei\nerfolgreicher Löschung.',64,179,65,10,8.5,ink),
  qr(oldQR?.text||(recovery?'{{cart_url}}':'{{chatbot_url}}'),155,122,35),
  {...t(recovery?'Jetzt Prüfung\nfortsetzen.':'Jetzt Bewertungen\nprüfen lassen.',150,164,46,14,10.5,'#ffffff','700'),align:'center'},
  {...t('bewertungspush.de/suche',148,185,49,5,7,muted),align:'center'},
  t('Über die Löschung entscheidet Google. Eine höhere Sternebewertung ist nicht garantiert.',11,192,187,4,6.5,muted)
 ]};return c;
}

export function refreshZyvo(source){
 const c=structuredClone(source),ink='#111b24',blue='#347bef',muted='#63707d';
 const t=(v,x,y,w,h,size=10,color=ink,weight='400',role='')=>text(v,x,y,w,h,size,color,weight,role);
 const address=postal(c),oldQR=c.sides.back.fields.find(f=>f.type==='qr');
 address.text='{{first_name}} {{last_name}}\n{{street}}\n{{postal_code}} {{city}}';
 const originals=Object.values(c.sides).flatMap(s=>s.fields),productSource=originals.find(f=>f.type==='image'&&f.variantKey==='product_id');
 const product=(x,y,w,h)=>({...image(productSource?.data||cartArt.one,x,y,w,h,'contain','photo'),variantKey:'product_id',variants:productSource?.variants||{one:cartArt.one,rest:cartArt.rest,base:cartArt.base}});
 const logo=(x,y,w=32,dark=false)=>image(dark?refreshArt['zyvo-logo-dark']:cartArt.zyvoLogo,x,y,w,w/3.104,'contain','brand');
 c.format='selfmailer-dl-4';c.selfmailer={...c.selfmailer,design:'zyvo-comeback-editorial',version:2};
 c.sides.front={background:{kind:'blank',color:'#ffffff'},fields:[
  logo(12,10,33,true),t('Ein zweiter Blick.\nFür deinen Alltag.',12,35,108,25,23),
  t('Persönlich für {{first_name}}',12,67,110,8,10,blue,'700'),t('zyvo.de',12,79,40,5,8,muted),address,
  image(refreshArt['zyvo-cover'],0,99,210,99),product(113,100,93,93),logo(12,108,33),
  t('{{salutation}}',12,128,92,8,10,'#c4d2df'),
  t('Schon fast\ndein.',12,139,94,38,38,'#ffffff','400','headline'),
  t('Dein nächster guter Schritt\nbeginnt mit einem zweiten Blick.',12,179,89,11,9,'#d0dbe6'),
  t('DEIN COMEBACK →',12,192,89,5,7.5,'#ffffff','700'),
  shape(119,181,81,12,'#ffffff'),t('{{product_name}}',123,184,74,7,10,ink,'700')
 ]};
 c.sides.back={background:{kind:'blank',color:'#ffffff'},fields:[
  logo(12,9,31,true),t('Gute Wahl.\nNoch nicht vorbei.',12,28,126,25,25),
  t('{{salutation}}',12,59,122,8,11,blue,'700'),
  t('Du hast dir bei ZYVO etwas ausgesucht, aber noch nicht bestellt. Vielleicht kam etwas dazwischen? Hier ist deine Erinnerung – schau dir deine Auswahl noch einmal in Ruhe an.',12,70,120,23,10,muted),
  product(149,11,50,50),t('{{product_name}}',147,68,54,8,11,ink,'700'),t('Deine Auswahl.\nDein nächster Schritt.',147,80,54,12,9,muted),
  shape(0,99,210,99,'#111b24'),shape(0,99,6,99,blue),
  t('Zurück zu deinem\nguten Gefühl.',12,111,126,25,25,'#ffffff'),
  t('01',12,146,9,7,9,'#7aafff','700'),t('Code scannen',27,146,104,7,11,'#ffffff','700'),
  t('02',12,160,9,7,9,'#7aafff','700'),t('Auswahl ansehen',27,160,104,7,11,'#ffffff','700'),
  t('03',12,174,9,7,9,'#7aafff','700'),t('In deinem Tempo entscheiden',27,174,109,7,10,'#ffffff','700'),
  shape(146,114,54,70,'#ffffff'),qr(oldQR?.text||'{{cart_url}}',155,121,36),
  {...t('Jetzt wieder\nentdecken →',151,165,44,13,10,ink,'700'),align:'center'},
  t('FOR ACTIVE AND REST.',12,190,119,5,7.5,'#8fa9c0','700'),t('zyvo.de',154,190,42,5,8,'#ffffff')
 ]};return c;
}
