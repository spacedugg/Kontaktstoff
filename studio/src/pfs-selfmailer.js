import {alignRehaGiftCard} from './reha-gift-card.js';
import {toSelfmailer} from './selfmailer.js';
import {PFS_FORMAT_ID,isPFS,FORMATS} from './formats.js';
import {uid} from './core.js';

// Keep previous revisions immutable. This creates a new editable layout; the
// delivery address, clear zones and separator are controlled by the renderer.
export function toPFSSelfmailer(source){
 if(isPFS(source))return alignRehaGiftCard(source);
 const c=toSelfmailer(source),old=FORMATS.find(f=>f.id===c.format),sx=235/old.width,sy=250/old.height;
 for(const [side,page] of Object.entries(c.sides)){
  page.fields=page.fields.filter(f=>!f.postalAddress).map(f=>{
   const n={...f,x:f.x*sx,y:f.y*sy,w:f.w*sx,h:f.h*sy,fontSize:Math.min(80,f.fontSize*sx)};
   if(c.selfmailer?.design?.startsWith('bp-')&&f.type==='image'&&f.x===0&&f.w===210&&[99,198].includes(f.h))n.fit='stretch';
   // Keep photos/logos proportional; backgrounds may cover their whole panel.
   if(side==='front'&&f.y<old.foldY&&f.type!=='shape'){
    const right=n.y<40?156:n.y+n.h>55?146:232;
    if(n.x+n.w>right){const k=Math.min(1,(right-10)/n.w);n.x=10;n.w*=k;n.h*=k;n.fontSize=Math.max(6,n.fontSize*k);}
    if(n.y+n.h>107){n.y=Math.max(3,107-n.h);}
   }
   for(const key of ['x','y','w','h'])n[key]=Math.round(n[key]*10000)/10000;
   if(['text','qr'].includes(n.type)){n.x=Math.max(3,Math.min(n.x,232-n.w));n.y=Math.max(3,Math.min(n.y,247-n.h));}
   if(n.type==='qr')n.w=n.h=Math.min(n.w,n.h);
   return n;
  });
  if(page.background.kind==='image'){
   const bg=page.background,b=bg.bleed||0;
   // Retain all supplied artwork proportionally inside the new spread.
   const k=Math.min(235/(old.width+2*b),250/(old.height+2*b));
   page.fields.unshift({id:uid(),type:'image',text:'',data:bg.data,x:(235-(old.width+2*b)*k)/2,y:(250-(old.height+2*b)*k)/2,w:(old.width+2*b)*k,h:(old.height+2*b)*k,fontSize:12,color:'#000000',weight:'400',align:'left',background:'transparent',fit:'contain'});
   page.background={kind:'blank',color:'#ffffff'};
  }
 }
 c.sides.front.fields.push({id:uid(),type:'text',text:'{{postal_salutation}}\n{{postal_name}}\n{{street}}\n{{postal_code}} {{city}}',x:164,y:79,w:68,h:25,fontSize:10,color:'#000000',weight:'400',align:'left',background:'transparent',autoFit:false,postalAddress:'pfs'});
 c.format=PFS_FORMAT_ID;c.selfmailer={...c.selfmailer,pfsVersion:1,sourceFormat:source.format};
 c.name=c.name.replace(/DIN[- ]lang(?:[- ]Selfmailer)?/gi,'Standard-Maxi-Selfmailer').replace(/DIN[- ]A5[- ]Mailing/gi,'Standard-Maxi-Selfmailer').slice(0,120);
 return alignRehaGiftCard(c);
}
