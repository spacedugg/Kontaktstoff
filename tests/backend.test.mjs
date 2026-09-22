import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {connectDB} from '../server/db.js';
import {createAPI} from '../server/api.js';
import {createCampaign} from '../studio/src/core.js';
import {defaults,metrics} from '../konto/src/model.js';
import {createMailer} from '../server/mail.js';
const origin='http://localhost:9000';
async function fixture(options={}){const db=await connectDB({file:':memory:'}),handle=createAPI(db,{origin,...options});async function request(route,{method='GET',body,account,prepared=false,headers={}}={}){const req=Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]);Object.assign(req,{url:route,method,headers:{origin,'content-type':'application/json',...(account?{cookie:account.cookie,'x-csrf-token':account.csrf}:{}),...headers},socket:{remoteAddress:'127.0.0.1'},...(prepared?{body}:{})});let status,raw;const received={};const res={setHeader:(k,v)=>received[k]=v,writeHead:(s,h)=>{status=s;Object.assign(received,h);},end:data=>raw=data};await handle(req,res);return {status,headers:received,data:raw?JSON.parse(raw):null};}async function register(email){const r=await request('/api/auth/register',{method:'POST',body:{email,password:'a-test-password-123',profile:{company:'Test GmbH',name:'Mara Test'}}});assert.equal(r.status,201);return {cookie:r.headers['Set-Cookie'].split(';')[0],csrf:r.data.csrf};}return {db,request,register};}
test('real accounts require same-origin writes, hash passwords and isolate campaigns',async()=>{const {db,request,register}=await fixture();try{const a=await register('a@example.org'),b=await register('b@example.org');const project=createCampaign(true),created=await request('/api/campaigns',{method:'POST',account:a,body:{project,meta:defaults()}});assert.equal(created.status,201);const id=created.data.id;assert.equal((await request('/api/campaigns/'+id,{account:b})).status,404);assert.equal((await request('/api/campaigns')).status,401);assert.equal((await request('/api/campaigns/'+id,{method:'DELETE',account:a,headers:{origin:'https://other.example'}})).status,403);assert.equal((await request('/api/campaigns/'+id,{method:'DELETE',account:a,headers:{'x-csrf-token':'bad'}})).status,403);assert.equal((await request('/api/campaigns',{account:b})).data.campaigns.length,0);assert.ok(!(await db.query('SELECT password FROM users')).rows[0].password.includes('a-test-password'));assert.match(a.cookie,/kontaktstoff_session=/);await request('/api/auth/logout',{method:'POST',account:a,body:{}});assert.equal((await request('/api/auth/me',{account:a})).data.user,null);}finally{await db.close();}});
test('optimistic revisions reject stale edits and service requests retain immutable snapshots',async()=>{const {db,request,register}=await fixture();try{const a=await register('request@example.org'),project=createCampaign(true),meta={...defaults(),designService:true,leadSource:'research',audience:'Webdesign-Agenturen',region:'DACH'};const c=(await request('/api/campaigns',{method:'POST',account:a,body:{project,meta}})).data;assert.equal((await request('/api/campaigns/'+c.id,{method:'PUT',account:a,body:{...c,revision:0}})).status,409);const key=crypto.randomUUID(),r=await request('/api/campaigns/'+c.id+'/request',{method:'POST',account:a,body:{key,revision:1}});assert.equal(r.status,201);assert.equal((await request('/api/campaigns/'+c.id+'/request',{method:'POST',account:a,body:{key,revision:1}})).data.id,key);assert.equal((await db.query('SELECT * FROM requests')).rows.length,1);const next=(await request('/api/campaigns/'+c.id,{account:a})).data;next.project.name='Changed after request';const update=await request('/api/campaigns/'+c.id,{method:'PUT',account:a,body:next});assert.equal(update.status,200);assert.notEqual(JSON.parse((await db.query('SELECT payload FROM requests')).rows[0].payload).project.name,'Changed after request');assert.equal(update.data.meta.status,'requested');}finally{await db.close();}});
test('requests validate prerequisites and invalid campaign data is not accepted',async()=>{const {db,request,register}=await fixture();try{const a=await register('invalid@example.org'),project=createCampaign(true);const c=(await request('/api/campaigns',{method:'POST',account:a,body:{project,meta:defaults()}})).data;const r=await request('/api/campaigns/'+c.id+'/request',{method:'POST',account:a,body:{key:crypto.randomUUID(),revision:1}});assert.equal(r.status,400);assert.match(r.data.error,/Kontaktliste/);assert.equal((await request('/api/campaigns',{method:'POST',account:a,body:{project:{},meta:{}}})).status,400);assert.equal((await request('/api/campaigns',{method:'POST',account:a,body:{project,meta:{...defaults(),targetURL:'javascript:alert(1)'}}})).status,400);}finally{await db.close();}});
test('tracking creates per-contact redirects, counts visits, excludes HEAD and stops deleted campaigns',async()=>{const {db,request,register}=await fixture();try{const a=await register('track@example.org'),b=await register('other@example.org'),project=createCampaign();project.sample=false;const c=(await request('/api/campaigns',{method:'POST',account:a,body:{project,meta:defaults()}})).data;const updated=await request('/api/campaigns/'+c.id+'/tracking',{method:'POST',account:a,body:{revision:1}});assert.equal(updated.status,200);const links=updated.data.project.recipients.map(r=>new URL(r.chatbot_url).pathname);assert.equal(new Set(links).size,3);const click=await request(links[0]);assert.equal(click.status,302);assert.equal(click.headers.Location,'https://chattastic.de/');await request(links[0]);await request(links[0],{method:'HEAD'});await request(links[1],{headers:{'user-agent':'crawler'}});const stats=(await request('/api/campaigns/'+c.id+'/stats',{account:a})).data;assert.equal(Number(stats.visits.find(v=>v.recipient_id===project.recipients[0].id).count),2);assert.equal((await request('/api/campaigns/'+c.id+'/stats',{account:b})).status,404);const m=metrics(updated.data.project,updated.data.meta,stats.visits);assert.equal(m.scans,2);assert.equal(m.scannedContacts,1);await request('/api/campaigns/'+c.id,{method:'DELETE',account:a});assert.equal((await request(links[0])).status,404);}finally{await db.close();}});
test('server data survives database reconnection',async()=>{const dir=await mkdtemp(path.join(tmpdir(),'kontaktstoff-db-')),file=path.join(dir,'db.sqlite');try{const first=await connectDB({file});await first.query('INSERT INTO users(id,email,password,profile,created_at) VALUES($1,$2,$3,$4,$5)',['id','persist@example.org','hash','{}',Date.now()]);await first.close();const second=await connectDB({file});assert.equal((await second.query('SELECT email FROM users')).rows[0].email,'persist@example.org');await second.close();}finally{await rm(dir,{recursive:true,force:true});}});
test('funnel and ROI use actual won contribution and cumulative sales stages',()=>{const project={recipients:[{id:'1'},{id:'2'},{id:'3'}]},meta={...defaults(),cost:100,outcomes:{1:{sales:'won',shipping:'sent',contribution:300},2:{sales:'appointment',shipping:'sent',contribution:500},3:{sales:'conversation',shipping:'pending',contribution:0}}};assert.deepEqual({...metrics(project,meta),rows:[]},{sent:2,conversations:3,appointments:2,won:1,contribution:300,cost:100,roi:200,scans:0,scannedContacts:0,rows:[]});assert.equal(metrics(project,{...meta,cost:0}).roi,null);});

test('Vercel parsed-body requests work and malformed bodies are rejected',async()=>{const {db,request,register}=await fixture();try{const a=await register('prepared@example.org');const created=await request('/api/campaigns',{method:'POST',account:a,prepared:true,body:{project:createCampaign(true),meta:defaults()}});assert.equal(created.status,201);assert.equal((await request('/api/profile',{method:'PUT',account:a,prepared:true,body:null})).status,400);assert.equal((await request('/api/campaigns',{method:'POST',account:a,prepared:true,body:[]})).status,400);}finally{await db.close();}});

test('verification and password recovery use expiring single-use hashed secrets and revoke sessions',async()=>{
 const mails=[],f=await fixture({mailer:{configured:true,send:async mail=>mails.push(mail)}}),{db,request,register}=f;
 const token=(mail,kind)=>new URLSearchParams(new URL(mail.text.match(/http:\/\/localhost:9000\/konto\/#\S+/)[0]).hash.slice(1)).get(kind);
 try{
  const a=await register('recover@example.org');assert.equal(mails.length,1);const verify=token(mails[0],'verify');
  assert.equal((await request('/api/auth/me',{account:a})).data.user.emailVerified,false);
  assert.ok(!(await db.query('SELECT token FROM account_tokens')).rows.some(r=>r.token===verify));
  assert.equal((await request('/api/auth/verify',{method:'POST',body:{token:verify}})).status,200);
  assert.equal((await request('/api/auth/verify',{method:'POST',body:{token:verify}})).status,400);
  assert.equal((await request('/api/auth/me',{account:a})).data.user.emailVerified,true);
  const existing=await request('/api/auth/forgot',{method:'POST',body:{email:'recover@example.org'}}),missing=await request('/api/auth/forgot',{method:'POST',body:{email:'missing@example.org'}});assert.deepEqual(existing.data,missing.data);
  const reset=token(mails.at(-1),'reset');assert.equal((await request('/api/auth/reset',{method:'POST',body:{token:reset,password:'short'}})).status,400);
  assert.equal((await request('/api/auth/reset',{method:'POST',body:{token:reset,password:'new-test-password-123'}})).status,200);
  assert.equal((await request('/api/auth/me',{account:a})).data.user,null);
  assert.equal((await request('/api/auth/reset',{method:'POST',body:{token:reset,password:'another-test-password'}})).status,400);
  assert.equal((await request('/api/auth/login',{method:'POST',body:{email:'recover@example.org',password:'a-test-password-123'}})).status,401);
  assert.equal((await request('/api/auth/login',{method:'POST',body:{email:'recover@example.org',password:'new-test-password-123'}})).status,200);
  await request('/api/auth/forgot',{method:'POST',body:{email:'recover@example.org'}});const expired=token(mails.at(-1),'reset');await db.query('UPDATE account_tokens SET expires=0');assert.equal((await request('/api/auth/reset',{method:'POST',body:{token:expired,password:'new-test-password-123'}})).status,400);
 }finally{await db.close();}
});

test('operator inbox requires verified allowlist, keeps notes private and rejects stale workflow changes',async()=>{
 const mails=[],{db,request,register}=await fixture({operatorEmails:'team@example.org',notificationTo:'inbox@example.org',mailer:{configured:true,send:async m=>mails.push(m)}});
 try{
  const team=await register('team@example.org'),customer=await register('customer@example.org');
  assert.equal((await request('/api/operator/requests',{account:team})).status,403);await db.query('INSERT INTO email_verifications(user_id,verified_at) SELECT id,$1 FROM users WHERE email=$2',[Date.now(),'team@example.org']);
  const c=(await request('/api/campaigns',{method:'POST',account:customer,body:{project:createCampaign(true),meta:{...defaults(),designService:true,leadSource:'research',audience:'Testfirmen',region:'DE'}}})).data;
  const key=crypto.randomUUID(),r=await request('/api/campaigns/'+c.id+'/request',{method:'POST',account:customer,body:{key,revision:c.revision}});assert.equal(r.data.notification,'sent');
  await request('/api/campaigns/'+c.id+'/request',{method:'POST',account:customer,body:{key,revision:c.revision}});assert.equal(mails.filter(m=>m.id==='request-'+key).length,1);
  assert.equal((await request('/api/operator/requests',{account:customer})).status,403);assert.equal((await request('/api/operator/requests/'+key,{account:customer})).status,403);
  assert.equal((await request('/api/operator/requests',{account:team})).data.requests.length,1);
  const update=await request('/api/operator/requests/'+key,{method:'PUT',account:team,body:{status:'reviewing',note:'Private team note',workflowRevision:0}});assert.equal(update.status,200);assert.equal(update.data.workflowRevision,1);
  assert.equal((await request('/api/operator/requests/'+key,{method:'PUT',account:team,body:{status:'quoted',note:'stale',workflowRevision:0}})).status,409);
  const stats=(await request('/api/campaigns/'+c.id+'/stats',{account:customer})).data;assert.equal(stats.requests[0].status,'reviewing');assert.equal(JSON.stringify(stats).includes('Private team note'),false);
 }finally{await db.close();}
});

test('missing or failing email never discards a campaign request; notification can be retried',async()=>{
 let fail=true;const {db,request,register}=await fixture({notificationTo:'inbox@example.org',operatorEmails:'team@example.org',mailer:{configured:true,send:async()=>{if(fail)throw Error('offline');}}});
 try{const a=await register('team@example.org');await db.query('INSERT INTO email_verifications(user_id,verified_at) SELECT id,$1 FROM users',[Date.now()]);const c=(await request('/api/campaigns',{method:'POST',account:a,body:{project:createCampaign(true),meta:{...defaults(),designService:true,leadSource:'research',audience:'Test',region:'DE'}}})).data;const key=crypto.randomUUID();const r=await request('/api/campaigns/'+c.id+'/request',{method:'POST',account:a,body:{key,revision:c.revision}});assert.equal(r.status,201);assert.equal(r.data.notification,'pending');assert.equal((await db.query('SELECT id FROM requests')).rows.length,1);fail=false;assert.equal((await request('/api/operator/requests/'+key+'/notify',{method:'POST',account:a,body:{}})).data.notification,'sent');}finally{await db.close();}
 const f=await fixture({mailer:{configured:false}});try{assert.equal((await f.request('/api/auth/forgot',{method:'POST',body:{email:'test@example.org'}})).status,503);}finally{await f.db.close();}
});

test('mailer uses provider idempotency and never exposes provider errors or credentials',async()=>{
 let sent;const mailer=createMailer({key:'test-secret',from:'Kontaktstoff <test@example.org>',fetcher:async(url,options)=>{sent={url,options};return {ok:true};}});
 await mailer.send({to:'recipient@example.org',subject:'Test',text:'Private message',id:'unique-request'});assert.equal(sent.options.headers['Idempotency-Key'],'unique-request');assert.equal(JSON.parse(sent.options.body).to[0],'recipient@example.org');
 const broken=createMailer({key:'secret',from:'test@example.org',fetcher:async()=>({ok:false})});await assert.rejects(()=>broken.send({id:'test'}),/E-Mail-Dienst/);
});

test('guided handoff records the checked revision and tracking daily counts are isolated',async()=>{
 const {db,request,register}=await fixture();try{
 const {createBrandTemplate,PREVIEW_PERSON}=await import('../studio/src/brand-templates.js');const a=await register('builder@example.org'),b=await register('builder-other@example.org'),project=createBrandTemplate('stacked-note');
 project.recipients=[{id:'person-1',...PREVIEW_PERSON,street:'Testweg 1',postal_code:'01234',city:'Teststadt',country:'Deutschland'}];
 let c=(await request('/api/campaigns',{method:'POST',account:a,body:{project,meta:{...defaults(),audience:'Testkunden',builder:{version:1,step:3}}}})).data;
 const key=crypto.randomUUID();assert.equal((await request('/api/campaigns/'+c.id+'/request',{method:'POST',account:a,body:{key,revision:c.revision}})).status,400);
 const submitted=await request('/api/campaigns/'+c.id+'/request',{method:'POST',account:a,body:{key,revision:c.revision,confirmed:true}});assert.equal(submitted.status,201);
 const snapshot=JSON.parse((await db.query('SELECT payload FROM requests WHERE id=$1',[key])).rows[0].payload);assert.equal(snapshot.submission.scope,'design-and-data-review');assert.equal(snapshot.revision,1);
 c=(await request('/api/campaigns/'+c.id,{account:a})).data;c=(await request('/api/campaigns/'+c.id+'/tracking',{method:'POST',account:a,body:{revision:c.revision}})).data;
 const url=new URL(c.project.recipients[0].chatbot_url);await request(url.pathname);await request(url.pathname);
 const stats=(await request('/api/campaigns/'+c.id+'/stats',{account:a})).data;assert.equal(stats.scanDays.reduce((n,d)=>n+Number(d.count),0),2);assert.deepEqual(stats.trackedRecipientIds,['person-1']);assert.equal((await request('/api/campaigns/'+c.id+'/stats',{account:b})).status,404);
 }finally{await db.close();}
});

test('public sales inquiries do not need accounts but remain operator-only and origin-protected',async()=>{
 const {db,request,register}=await fixture({operatorEmails:'sales-operator@example.org'});try{const input={id:crypto.randomUUID(),name:'Mara',company:'Test GmbH',email:'mara@example.org',useCase:'b2b',quantity:100};
 assert.equal((await request('/api/sales-inquiries',{method:'POST',body:input,headers:{origin:'https://evil.example'}})).status,403);
 const posted=await request('/api/sales-inquiries',{method:'POST',body:input});assert.equal(posted.status,201);assert.deepEqual(Object.keys(posted.data).sort(),['id','ok']);assert.equal((await db.query('SELECT * FROM users')).rows.length,0);
 const regular=await register('sales-normal@example.org'),operator=await register('sales-operator@example.org');const user=(await db.query('SELECT id FROM users WHERE email=$1',['sales-operator@example.org'])).rows[0];await db.query('INSERT INTO email_verifications(user_id,verified_at) VALUES($1,$2)',[user.id,Date.now()]);
 assert.equal((await request('/api/operator/sales')).status,401);assert.equal((await request('/api/operator/sales',{account:regular})).status,403);
 const list=await request('/api/operator/sales',{account:operator});assert.equal(list.status,200);assert.equal(list.data.items[0].email,'mara@example.org');assert.equal((await request('/api/operator/sales/'+input.id,{method:'PUT',account:operator,headers:{'x-csrf-token':'bad'},body:{status:'contacted',revision:1}})).status,403);
 assert.equal((await request('/api/operator/sales/'+input.id,{method:'PUT',account:operator,body:{status:'contacted',note:'Nur intern',revision:1}})).status,200);
 assert.equal((await request('/api/sales-inquiries')).status,401);
 }finally{await db.close();}
});
