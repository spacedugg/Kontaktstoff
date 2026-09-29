import {uid} from './core.js';
import {cartArt} from './cart-art.js';
import {rehaCouponArt} from './reha-coupon-art.js';

export function styleRehaSleepSelfmailer(project){
 const c=structuredClone(project),ink='#203b48',blue='#1878b9',paper='#f8f7f2';
 const t=(text,x,y,w,h,fontSize=11,color=ink,weight='400',role='')=>({id:uid(),type:'text',text,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true,...(role?{brandRole:role}:{})});
 const s=(x,y,w,h,color)=>({...t('',x,y,w,h),type:'shape',background:color});
 const img=(data,x,y,w,h,fit='contain',role='photo')=>({...t('',x,y,w,h),type:'image',data,fit,brandRole:role});
 const logo=(x,y,w=48)=>img(cartArt.rehaLogo,x,y,w,16,'contain','brand');
 const address=c.sides.front.fields.find(f=>f.postalAddress)||{...t('{{first_name}} {{last_name}}\n{{street}}\n{{postal_code}} {{city}}',134,45,70,33,10),postalAddress:true};
 const qr=c.sides.back.fields.find(f=>f.type==='qr');
 c.sides.front={background:{kind:'blank',color:'#ffffff'},fields:[
  logo(10,8),t('EIN KLEINER ANSTOSS.\nFÜR MEHR KOMFORT.',10,33,105,22,19,ink,'700'),
  t('Persönlich für {{first_name}} {{last_name}}',10,62,108,10,11,blue),
  t('Ihr RehaSleep-Team',10,75,105,6,10),address,
  s(0,99,210,99,paper),img(cartArt.rehaRoom,96,101,114,95,'cover'),
  logo(10,106,49),t('FÜR {{first_name}} {{last_name}}',10,125,83,6,8,blue,'700'),
  t('Gönnen Sie\nsich mehr\nKomfort.',10,136,84,38,29,ink,'700','headline'),
  t('Eine gute Entscheidung.\nJetzt 30 € günstiger.',10,180,79,12,11,blue,'700','cta'),
  img(rehaCouponArt,96,155,111,40,'contain','decoration'),
  t('30 €',108,165,38,18,36,blue,'700'),
  t('RABATT FÜR SIE',152,164,42,5,7,ink,'700'),
  t('Schlaf30',152,171,43,9,18,blue,'700'),
  t('Ihr Code im Checkout',152,182,43,5,7)
 ]};
 c.sides.back={background:{kind:'blank',color:paper},fields:[
  logo(11,6),img(cartArt.rehaRoom,150,2,60,95,'cover'),
  t('Ein guter Moment,\nsich etwas Gutes zu tun.',11,27,130,24,24,ink,'700'),
  t('{{salutation}}',11,55,128,9,12,blue,'700'),
  t('Sie haben sich bei RehaSleep umgesehen, aber noch nicht entschieden? Machen Sie es sich leichter: Entdecken Sie unser Sortiment und sparen Sie mit Schlaf30 30 € auf Ihre Bestellung.',11,68,127,20,10.5),
  t('Herzliche Grüße, Ihr RehaSleep-Team',11,90,128,6,9,ink,'700'),
  s(0,99,210,99,'#e7f1f6'),t('Ihr nächster Schritt?\nEin bisschen mehr Wohlfühlen.',11,108,185,21,22,ink,'700'),
  img(rehaCouponArt,8,133,130,50,'contain','decoration'),
  t('30 €',21,145,45,22,42,blue,'700'),
  t('IHR RABATTCODE',76,144,50,6,8,ink,'700'),
  t('Schlaf30',76,154,52,13,22,blue,'700'),
  t('Im Checkout eingeben.',76,170,51,6,8),
  {...t(qr?.text||'https://reha-sleep.de/collections/all',154,138,35,35),type:'qr',background:'#ffffff'},
  t('Scannen. Entdecken. Sparen.',145,178,57,8,8.5,blue,'700'),
  t('Zum Sortiment → reha-sleep.de/collections/all',11,188,130,6,8,ink)
 ]};
 return c;
}
