import {uid} from './core.js';
import {styleRehaSleepSelfmailer} from './reha-selfmailer.js';

// Full-bleed artwork stays separate from editable copy and personalisation.
export function createRehaCloudVariant(source,{name,art,warm=false}){
 const c=styleRehaSleepSelfmailer(source);
 c.recipients=c.recipients.map(r=>({...r,salutation:(r.salutation||'').replace(/^Guten Tag Frau /,'Liebe Frau ').replace(/^Guten Tag Herr /,'Lieber Herr ')}));c.id=uid();c.name='RehaSleep · '+name;
 const ink='#173947',muted='#58717a',blue='#237ca6',paper=warm?'#faf6ef':'#f3f8fb';
 const t=(text,x,y,w,h,fontSize=10,color=ink,weight='400',role='')=>({id:uid(),type:'text',text,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true,...(role?{brandRole:role}:{})});
 const s=(x,y,w,h,color)=>({...t('',x,y,w,h),type:'shape',background:color});
 const img=(data,x,y,w,h,role='photo')=>({...t('',x,y,w,h),type:'image',data,fit:'cover',brandRole:role});
 const originalLogo=c.sides.front.fields.find(f=>f.brandRole==='brand');
 const logo=(x,y,w=35)=>({...originalLogo,id:uid(),x,y,w,h:w*16/48,fit:'contain'});
 const address=c.sides.front.fields.find(f=>f.postalAddress);
 const qr=c.sides.back.fields.find(f=>f.type==='qr');
 c.sides.front={background:{kind:'blank',color:'#ffffff'},fields:[
  logo(12,10),t('Ein guter Gedanke\nverdient eine zweite Nacht.',12,32,108,26,23),
  t('Eine persönliche Einladung von RehaSleep.',12,65,104,8,9,muted),
  t('reha-sleep.de',12,77,40,6,8,blue),address,
  img(art,0,99,210,99),logo(10,105,34),
  t('{{salutation}}',10,122,110,7,9,muted,'700'),
  t(warm?'Ihr Platz auf\nWolke sieben.':'Endlich schlafen\nwie auf Wolken?',10,135,warm?110:88,33,warm?32:26,ink,'400','headline'),
  t('Komfort, der sich Ihnen anpasst.\nEntdecken Sie Ihren RehaSleep-Lattenrost.',10,169,87,12,9,muted),

  t('30 € Rabatt auf Ihre Bestellung.',10,189,118,6,9,ink,'700','cta'),
  t('CODE: Schlaf30',153,189,47,6,9,blue,'700')
 ]};
 c.sides.back={background:{kind:'blank',color:'#ffffff'},fields:[
  logo(12,8,32),t('NOCH EIN GUTER GRUND, ZURÜCKZUKOMMEN.',12,27,123,6,7,muted,'700'),
  t('Ihr Komfort.\nIhre Entscheidung.',12,39,125,26,25),
  t('{{salutation}}',12,70,124,8,10,ink,'700'),
  t('Sie haben sich bei uns umgesehen. Vielleicht fehlte nur noch ein guter Moment? Nehmen Sie sich Zeit für Ihre Entscheidung – und 30 € Rabatt für Ihre Bestellung.',12,81,119,14,9,muted),
  s(146,9,53,80,paper),t('FÜR IHRE BESTELLUNG',152,19,41,7,7,muted,'700'),
  t('30 €',152,33,42,23,39,blue),t('Ihr persönlicher Anstoß.\nFür mehr Komfort.',152,71,42,13,9,muted),
  s(0,99,210,99,paper),t('Machen Sie es\nsich wieder bequem.',12,111,131,27,26),
  t('01',12,146,9,7,9,blue,'700'),t('Sortiment entdecken',26,146,106,7,10,ink,'700'),
  t('02',12,159,9,7,9,blue,'700'),t('30 € sparen mit Code Schlaf30',26,159,107,7,10,ink,'700'),
  t('03',12,172,9,7,9,blue,'700'),t('Auf mehr Komfort freuen',26,172,107,7,10,ink,'700'),
  s(147,115,52,65,'#ffffff'),{...qr,id:uid(),x:155,y:123,w:36,h:36,background:'#ffffff'},
  t('Ihr Weg zurück\nzu RehaSleep.',154,164,39,11,8,ink,'700'),
  t('Herzliche Grüße, Ihr RehaSleep-Team',12,190,122,5,7.5,muted),
  t('reha-sleep.de',154,190,45,5,7.5,blue)
 ]};
 return c;
}
