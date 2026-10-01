export function countRedirect(req){
 return req.method==='GET'&&req.headers.dnt!=='1'&&req.headers['sec-gpc']!=='1'&&!/bot|crawler|spider|preview|slack|facebookexternalhit/i.test(req.headers['user-agent']||'');
}

// Expired authentication/security records only; never remove customer content.
export function privacyMaintenance(db,{now=Date.now,interval=3600000}={}){
 let next=0,running;
 return async()=>{
  if(running)return running;
  const time=now();if(time<next)return;
  running=db.tx(async q=>{
   for(const table of ['sessions','account_tokens','rate_limits'])await q(`DELETE FROM ${table} WHERE expires <= $1`,[time]);
  }).then(()=>{next=time+interval;}).finally(()=>{running=null;});
  return running;
 };
}
