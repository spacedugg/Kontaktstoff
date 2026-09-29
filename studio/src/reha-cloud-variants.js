import {uid} from './core.js';
import {styleRehaSleepSelfmailer} from './reha-selfmailer.js';

// Artwork is supplied separately so the editor bundle does not include both images.
export function createRehaCloudVariant(source,{name,art,warm=false}){
 const c=styleRehaSleepSelfmailer(source);c.id=uid();c.name='RehaSleep · '+name;
 const t=(text,x,y,w,h,fontSize,color='#1878b9',weight='700')=>({id:uid(),type:'text',text,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true});
 const f=c.sides.front.fields;
 for(const field of f){
  if(field.type==='image'&&field.brandRole==='photo'){field.data=art;field.x=90;field.y=103.5;field.w=120;field.h=90;field.fit='contain';}
  if(field.type==='shape'&&field.y===99)field.background=warm?'#fff7eb':'#f1f7fb';
  if(field.brandRole==='headline'){field.text=warm?'Ihr Platz\nauf Wolke\nsieben.':'Schlafen\nwie auf\nWolken.';field.y=133;field.w=78;field.h=34;field.fontSize=29;}
  if(field.type==='image'&&field.brandRole==='decoration'){field.x=5;field.y=165;field.w=84;field.h=31;}
 }
 // Keep a smaller coupon alongside the image so the entire product stays visible.
 c.sides.front.fields=f.filter(field=>!(field.type==='text'&&(field.brandRole==='cta'||['30 €','RABATT FÜR SIE','Schlaf30','Ihr Code im Checkout'].includes(field.text))));
 c.sides.front.fields.push(t('30 €',17,176,25,13,24),t('IHR RABATTCODE',49,173,34,5,6.5,'#203b48'),t('Schlaf30',49,180,34,8,14));
 for(const field of c.sides.back.fields){
  if(field.type==='image'&&field.brandRole==='photo'){field.data=art;field.x=139;field.y=29;field.w=68;field.h=51;field.fit='contain';}
  if(field.text==='Ein guter Moment,\nsich etwas Gutes zu tun.'){field.text=warm?'Mehr Leichtigkeit.\nNacht für Nacht.':'Zeit für Ihr\nWohlfühlgefühl.';field.w=122;}
  if(field.type==='text'&&field.y===68)field.w=122;
  if(field.type==='shape'&&field.y===99)field.background=warm?'#f6edde':'#e7f1f6';
 }
 return c;
}
