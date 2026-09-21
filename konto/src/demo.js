import {createPromotion} from '../../studio/src/promotions.js';
import {defaults} from './model.js';
export function demoCampaign(){
 const project=createPromotion('chattastic');project.id='demo';project.name='Neue Projektkunden';const names=['Bergmann Objektbau','Hafenquartier','Westwerk Technik','Nordstern Handel'];
 project.recipients=Array.from({length:300},(_,i)=>({...project.recipients[i%3],id:'demo-'+i,company:names[i]||'Beispielunternehmen '+(i+1)}));
 const meta={...defaults(),audience:'B2B-Dienstleister in Norddeutschland',cost:1350,status:'requested'};
 for(const [i,r]of project.recipients.entries())meta.outcomes[r.id]={shipping:'sent',sales:i<4?'won':i<11?'appointment':i<27?'conversation':'new',contribution:i<4?1800:0,wonAt:i<4?`2026-09-${String(3+i*5).padStart(2,'0')}`:'',note:'',nextStep:''};
 return {id:'demo',project,meta,revision:1,visits:project.recipients.slice(0,42).map(r=>({recipient_id:r.id,count:1}))};
}
