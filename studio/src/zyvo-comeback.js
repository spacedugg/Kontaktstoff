import {uid} from './core.js';
import {comebackArt} from './zyvo-comeback-art.js';
const text=(value,x,y,w,h,size,color='#172421',weight='400',align='left')=>({id:uid(),type:'text',text:value,x,y,w,h,fontSize:size,color,weight,align,background:'transparent',autoFit:true});
export function zyvoComeback(source){
 const c=structuredClone(source),front=c.sides.front.fields;
 const logo=front.find(f=>f.type==='image'&&f.brandRole==='brand'&&f.y<99);
 if(c.format!=='selfmailer-dl-4'||!logo)throw Error('Unerwartetes ZYVO-Layout');
 c.sides.front.fields=front.filter(f=>f.y<99);
 c.sides.front.fields.push(
  {...text('',0,99,210,99,10),type:'image',data:comebackArt.one,fit:'contain',variantKey:'product_id',variants:comebackArt,brandRole:'artwork'},
  {...logo,id:uid(),x:11,y:108,w:34,h:11},
  text('Hey {{first_name}},',11,126,83,8,11,'#172421','700'),
  {...text('Da geht\nnoch was.',10,139,85,35,36,'#172421','700'),brandRole:'headline'},
  text('Dein nächster Lieblingsmoment.\nVielleicht nur einen Scan entfernt.',11,178,83,10,9.5),
  text('DEIN\nCOMEBACK',100,115,32,16,12,'#ffffff','700','center')
 );
 for(const f of c.sides.back.fields){
  if(f.type==='shape'&&f.background==='#111b24')f.background='#f5f1e8';
  if(f.type==='text'&&f.y>=99){if(f.color==='#ffffff')f.color='#172421';if(['#7aafff','#8fa9c0'].includes(f.color))f.color='#347bef';}
  if(f.type==='text'&&f.y===28)f.text='Fast gefunden.\nJetzt wiederentdecken.';
  if(f.type==='text'&&f.y===111)f.text='Deine Auswahl.\nDein gutes Gefühl.';
 }
 c.selfmailer={...c.selfmailer,design:'zyvo-lifestyle-comeback',version:3};
 return c;
}
