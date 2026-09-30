import {reviewProgress} from './review-project.js';
// A review belongs to its actual source, never to a similarly named design.
export function designEntries(designs,reviews,records=[]){
 const entries=designs.map(d=>({...d,kind:'designs',review:reviews.find(r=>r.sourceKind==='designs'&&r.sourceId===d.id)}));
 for(const r of reviews.filter(r=>r.sourceKind==='campaigns')){
  const c=records.find(c=>c.id===r.sourceId);entries.push({id:r.sourceId,kind:'campaigns',name:c?.project.name||r.title,project:c?.project||r.project,review:r});
 }
 for(const r of reviews.filter(r=>r.sourceKind==='designs'&&!designs.some(d=>d.id===r.sourceId))){entries.push({id:r.id,kind:'archived',name:r.title,project:r.project,review:r});}
 return entries;
}
export function designStatus(review){return review?reviewProgress(review):{state:'draft',label:'Entwurf · noch nicht geteilt',open:[]};}
