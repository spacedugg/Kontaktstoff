import {uid} from './core.js';
import {rehaGiftArt} from './reha-gift-art.js';

export function styleRehaGiftCard(project){
 const c=structuredClone(project);
 const t=(text,x,y,w,h,fontSize,color,weight='400')=>({id:uid(),type:'text',text,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true});
 c.sides.back.fields=c.sides.back.fields.filter(f=>!(f.x>=140&&f.y<99));
 c.sides.back.fields.push(
  {...t('',144,7,57,86,10,'#ffffff'),type:'image',data:rehaGiftArt,fit:'contain',brandRole:'decoration'},
  t('FÜR IHRE BESTELLUNG',152,19,42,7,7,'#e5f4fa','700'),
  t('30 €',151,32,45,26,43,'#ffffff','700'),
  t('Mehr Komfort.\nEin bisschen günstiger.',152,52,41,12,9,'#e5f4fa'),
  t('IHR CODE IM CHECKOUT',154,70,36,5,6,'#527783','700'),
  t('Schlaf30',154,76,34,9,14,'#174559','700')
 );return alignRehaGiftCard(c);
}

// Text follows the actual contained artwork, including any letterboxing caused
// by a new print format. Keep the coupon code inside its white inset.
export function alignRehaGiftCard(project){
 const c=structuredClone(project),fields=c.sides.back.fields;
 const art=fields.find(f=>f.type==='image'&&f.data===rehaGiftArt);
 if(!art)return c;
 const k=Math.min(art.w/1060,art.h/1600),left=art.x+(art.w-1060*k)/2,top=art.y+(art.h-1600*k)/2;
 const original=[['FÜR IHRE BESTELLUNG',152,19,42,7,7],['30 €',151,32,45,26,43],['Mehr Komfort.\nEin bisschen günstiger.',152,52,41,12,9],['IHR CODE IM CHECKOUT',154,70,36,5,6],['Schlaf30',154,74.5,34,8.5,14]];
 for(const [text,x,y,w,h,fontSize] of original){const f=fields.find(f=>f.type==='text'&&f.text===text&&f.x>=art.x&&f.y>=art.y&&f.y<art.y+art.h);if(!f)continue;Object.assign(f,{x:left+(x-144)/57*1060*k,y:top+(y-7)/86*1600*k,w:w/57*1060*k,h:h/86*1600*k,fontSize:fontSize/57*1060*k});}
 return c;
}
