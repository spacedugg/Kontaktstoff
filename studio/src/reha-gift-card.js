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
 );return c;
}
