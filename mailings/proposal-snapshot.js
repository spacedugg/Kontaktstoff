import {validateCampaign} from '../studio/src/core.js';

// A sales example carries artwork only, never the source mailing list or briefing.
export function proposalSnapshot(source){
 const pick=(value,keys)=>Object.fromEntries(keys.filter(k=>value[k]!==undefined).map(k=>[k,structuredClone(value[k])]));
 const project={version:1,id:'sales-example',name:String(source.name||'Mailing-Entwurf').slice(0,120),format:source.format,updatedAt:0,recipients:[],sides:{}};
 for(const side of ['front','back']){
  const s=source.sides?.[side];if(!s)throw Error('Das Design braucht eine Vorder- und Rückseite.');
  project.sides[side]={background:pick(s.background,['kind','color','data','width','height','bleed']),fields:s.fields.map(f=>pick(f,['id','type','text','x','y','w','h','fontSize','color','weight','align','background','fit','data','autoFit','display','postalAddress','brandRole']))};
 }
 return validateCampaign(project);
}
