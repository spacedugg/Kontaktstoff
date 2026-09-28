import {createCampaign,uid} from './core.js';
import {cartArt} from './cart-art.js';
export const CART_BRANDS={
 'reha-sleep':{name:'RehaSleep',host:'https://reha-sleep.de',products:[
  {id:'komfort',name:'RehaSleep™ Komfort',variant:'90 × 200 cm · Beispielgröße',path:'/products/lattenrost-elektrisch-verstellbar'},
  {id:'deluxe',name:'RehaSleep™ Deluxe',variant:'100 × 200 cm · Beispielgröße',path:'/products/lattenrost-elektrisch'},
  {id:'classic',name:'Matratze Classic 20',variant:'90 × 200 cm · Beispielgröße',path:'/products/kaltschaum-matratze'}]},
 zyvo:{name:'ZYVO',host:'https://zyvo.de',products:[
  {id:'one',name:'ZYVO® One',variant:'Weiß · Größe 39 · Beispielauswahl',path:'/en/products/one'},
  {id:'rest',name:'ZYVO® Rest Pillow',variant:'Weiß · Beispielauswahl',path:'/en/products/restpillow'},
  {id:'base',name:'ZYVO® Base Socks',variant:'Weiß · Beispielauswahl',path:'/en/products/base'}]}
};
export function createCartCampaign(id){
 const brand=CART_BRANDS[id];if(!brand)throw Error('Unbekannter Shop.');const reha=id==='reha-sleep';
 const c=createCampaign(true),ink=reha?'#203b48':'#10151d',accent=reha?'#1878b9':'#2f75f4',muted=reha?'#5a707c':'#536174';
 const t=(text,x,y,w,h,fontSize=12,color=ink,weight='400')=>({id:uid(),type:'text',text,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true});
 const s=(x,y,w,h,color)=>({...t('',x,y,w,h),type:'shape',background:color});
 const img=(data,x,y,w,h,fit='contain')=>({...t('',x,y,w,h),type:'image',data,fit});
 const product=(x,y,w,h)=>({...img(cartArt[brand.products[0].id],x,y,w,h),variantKey:'product_id',variants:Object.fromEntries(brand.products.map(p=>[p.id,cartArt[p.id]]))});
 c.name=brand.name+' · Ihre Auswahl wartet auf einen zweiten Blick';c.templateId=id;c.sample=true;c.onboarding={active:false,step:5,personalizationSkipped:false};
 c.brief={sender:brand.name,audience:'Personen mit abgebrochenem Checkout und vorhandener Postanschrift',goal:'website',offer:'Persönliche Erinnerung mit ausgewähltem Produkt und individuellem Rückkehr-Link. Ohne zusätzlichen Rabatt.'};
 c.recipients=brand.products.map((p,i)=>{const first=['Anna','Michael','Lisa'][i],last=['Berger','Weber','Klein'][i],productURL=brand.host+p.path,url=productURL+'?utm_source=kontaktstoff&utm_medium=direct_mail&utm_campaign=cart_recovery_pilot&utm_content=demo_'+(i+1);return{
  id:uid(),first_name:first,last_name:last,company:first+' '+last,segment:p.name,salutation:reha?['Guten Tag Frau Berger,','Guten Tag Herr Weber,','Guten Tag Frau Klein,'][i]:'Hey '+first+',',personal_note:reha?'Sie haben sich für mehr Komfort zu Hause interessiert. Manchmal braucht eine gute Entscheidung einfach einen zweiten Blick. Hier finden Sie Ihre Auswahl noch einmal.':'Du hast etwas entdeckt, das zu dir passt. Und dann kam etwas dazwischen? Hier kommt eine kleine Erinnerung an deine Auswahl.',product_id:p.id,product_name:p.name,product_variant:p.variant,product_url:productURL,cart_url:url,chatbot_url:url,checkout_id:'DEMO-'+id.toUpperCase()+'-'+(i+1),coupon_code:'',offer_text:'',offer_terms:'',street:'',postal_code:'',city:'',country:'Deutschland',website:brand.host
 };});
 if(reha){
 c.sides.front={background:{kind:'blank',color:'#f7f6f0'},fields:[
  img(cartArt.rehaRoom,99,0,111,125,'cover'),
  img(cartArt.rehaLogo,12,12,70,23),
  t('Für {{first_name}} {{last_name}}',12,42,82,8,11,muted),
  t('Ihr Komfort.\nNoch einen\nSchritt entfernt.',12,58,87,40,28,ink,'700'),
  t('Ihre Auswahl verdient\neinen zweiten Blick.',12,104,84,16,12,muted),
  s(119,14,77,19,'#ffffff'),t('100 Nächte Probeschlafen',123,20,69,10,12,accent,'700'),
  s(113,77,85,46,'#ffffff'),product(116,79,79,42),
  s(0,126,210,22,'#e5eff4'),t('{{product_name}}',12,131,111,8,13,ink,'700'),t('{{product_variant}}',12,140,111,5,8,muted),
  t('Auswahl ansehen →',136,135,62,9,12,accent,'700')
 ]};
 }else{
 c.sides.front={background:{kind:'blank',color:'#eeecec'},fields:[
  s(0,0,210,30,'#10151d'),img(cartArt.zyvoLogo,12,8,43,14),t('DEIN ALLTAG. DEINE AUSWAHL.',110,12,88,8,9,'#ffffff','700'),
  product(97,33,111,93),
  t('Gute Wahl,\n{{first_name}}.\nJetzt wird’s\ndeins.',12,45,89,66,30,ink,'700'),
  t('Nur noch einen Scan entfernt.',12,114,89,9,10,muted),
  s(0,128,210,20,'#ffffff'),t('{{product_name}}',12,132,102,8,12,ink,'700'),t('{{product_variant}}',12,140,111,5,8,muted),
  s(134,132,64,12,accent),t('Zurück zu deiner Auswahl →',138,136,57,7,8.5,'#ffffff','700')
 ]};
 }
 c.sides.back={background:{kind:'blank',color:reha?'#fcfcf8':'#ffffff'},fields:[
  ...(reha?[img(cartArt.rehaLogo,12,9,57,19)]:[s(12,11,42,15,'#10151d'),img(cartArt.zyvoLogo,15,13,35,11)]),
  t(reha?'EINE PERSÖNLICHE ERINNERUNG':'SCHON ENTDECKT. NOCH NICHT DEINS.',94,16,104,8,8,muted,'700'),
  t('{{salutation}}',12,37,121,12,20,ink,'700'),
  t('{{personal_note}}',12,56,120,30,12,ink),
  s(12,92,120,2,reha?'#d6e5ed':'#e2e8f2'),
  product(12,100,43,28),t(reha?'IHRE AUSWAHL':'DEINE AUSWAHL',61,100,70,5,7,muted,'700'),t('{{product_name}}',61,108,70,10,13,ink,'700'),t('{{product_variant}}',61,120,70,8,8.5,muted),
  s(144,36,54,96,reha?'#e5eff4':'#eaf1ff'),t(reha?'Hier geht es\nfür Sie weiter.':'Deine Auswahl.\nDein nächster Schritt.',150,42,42,18,13,ink,'700'),
  {...t('{{cart_url}}',153,65,36,36),type:'qr',background:'#ffffff'},
  t(reha?'Scannen. Auswahl ansehen.\nIn Ruhe entscheiden.':'Scannen. Auswahl ansehen.\nWeiter geht’s.',149,108,45,14,9,muted),
  t(reha?'reha-sleep.de':'zyvo.de',150,124,44,6,9,accent,'700'),
  t(reha?'Fragen offen? Wir helfen Ihnen gern.  ·  Ihr RehaSleep-Team':'Noch Fragen? Wir sind für dich da.  ·  Dein ZYVO-Team',12,137,186,8,9,muted)
 ]};return c;
}
export function applyCartCoupon(campaign){
 const c=structuredClone(campaign),blue=c.templateId==='reha-sleep'?'#1878b9':'#2f75f4';c.name+=' · Gutscheinentwurf';
 // A layout placeholder only: no invented discount or redeemable code.
 const field=(text,x,y,w,h,fontSize=10,color=blue,weight='700')=>({id:uid(),type:'text',text,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true});
 c.sides.back.fields=c.sides.back.fields.filter(f=>!(f.x<140&&f.y>=92&&f.y<132));
 c.sides.back.fields.push({...field('',12,95,120,35),type:'shape',background:'#eaf1ff'},field('{{offer_text}}',17,99,110,10,13),field('Code: {{coupon_code}}',17,110,110,9,12),field('{{offer_terms}}',17,122,110,6,7,'#52647c','400'));
 return c;
}
