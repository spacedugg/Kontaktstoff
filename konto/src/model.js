export const SALES={new:'Noch offen',conversation:'Im Gespräch',appointment:'Termin vereinbart',won:'Kunde gewonnen',lost:'Kein Interesse'};
export const SHIPPING={pending:'Noch nicht versendet',sent:'Versendet',returned:'Rückläufer'};
export const defaults=()=>({designService:false,leadSource:'upload',audience:'',region:'',companySize:'',roles:'',exclusions:'',quantity:250,formatRequest:'a5',planning:null,goal:'appointment',targetURL:'',launchDate:'',notes:'',cost:0,status:'draft',outcomes:{}});
export function metrics(project,meta,visits=[]){
 const rows=project.recipients.map(r=>({...r,...(meta.outcomes?.[r.id]||{})}));
 const sent=rows.filter(r=>r.shipping==='sent').length,conversations=rows.filter(r=>['conversation','appointment','won'].includes(r.sales)).length,appointments=rows.filter(r=>['appointment','won'].includes(r.sales)).length,won=rows.filter(r=>r.sales==='won').length;
 const contribution=rows.filter(r=>r.sales==='won').reduce((sum,r)=>sum+Number(r.contribution||0),0),cost=Number(meta.cost||0);
 const activeIds=new Set(rows.map(r=>r.id));const relevant=visits.filter(v=>activeIds.has(v.recipient_id));
 return {sent,conversations,appointments,won,contribution,cost,roi:cost>0?(contribution-cost)/cost*100:null,scans:relevant.reduce((sum,v)=>sum+Number(v.count||0),0),scannedContacts:new Set(relevant.filter(v=>Number(v.count)>0).map(v=>v.recipient_id)).size,rows};
}
