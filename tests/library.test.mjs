import {scryptSync} from 'node:crypto';
import {ADMIN_ID,ADMIN_EMAIL} from '../server/admin-auth.js';
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
test('internal admin uses a server secret, preserves its workspace, and rejects guest and customer access',async()=>{
 const encode=password=>'0123456789abcdef0123456789abcdef:'+scryptSync(password,'0123456789abcdef0123456789abcdef',64).toString('hex');
 const password='admin-test-only-passphrase',adminPasswordHash=encode(password),{db,request,register}=await fixture({adminPasswordHash});
 try{
  assert.equal((await request('/api/auth/admin',{method:'POST',body:{password},headers:{origin:'https://evil.example'}})).status,403);
  assert.equal((await request('/api/auth/admin',{method:'POST',body:{password:'wrong'}})).status,401);
  const r=await request('/api/auth/admin',{method:'POST',body:{password}});assert.equal(r.status,200);assert.equal(r.data.user.admin,true);assert.equal(r.data.user.operator,true);assert.equal(r.data.user.password,undefined);
  const admin={cookie:r.headers['Set-Cookie'].split(';')[0],csrf:r.data.csrf};assert.match(r.headers['Set-Cookie'],/HttpOnly/);
  assert.equal((await request('/api/operator/requests',{account:admin})).status,200);
  const c=await request('/api/campaigns',{method:'POST',account:admin,body:{project:createCampaign(true)}});assert.equal(c.status,201);
  const second=await request('/api/auth/admin',{method:'POST',body:{password}});assert.equal(second.data.user.id,ADMIN_ID);
  const customer=await register('not-admin@example.org');assert.equal((await request('/api/operator/requests',{account:customer})).status,403);
  assert.equal((await request('/api/campaigns/'+c.data.id,{account:customer})).status,404);
  assert.equal((await request('/api/auth/register',{method:'POST',body:{email:ADMIN_EMAIL,password,profile:{company:'Fake',name:'Fake'}}})).status,403);
  assert.equal((await request('/api/auth/login',{method:'POST',body:{email:ADMIN_EMAIL,password}})).status,403);
  assert.equal((await request('/api/campaigns',{method:'POST',account:{...admin,csrf:'wrong'},body:{project:createCampaign(true)}})).status,403);
  await request('/api/auth/logout',{method:'POST',account:admin,body:{}});assert.equal((await request('/api/auth/me',{account:admin})).data.user,null);
  for(let i=0;i<8;i++)await request('/api/auth/admin',{method:'POST',body:{password:'wrong'}});
  assert.equal((await request('/api/auth/admin',{method:'POST',body:{password}})).status,429);
 }finally{await db.close();}
 const disabled=await fixture();try{assert.equal((await disabled.request('/api/auth/admin',{method:'POST',body:{password}})).status,503);}finally{await disabled.db.close();}
});
test('audiences and designs are isolated, revision protected and composed into independent campaign snapshots',async()=>{
 const {db,request,register}=await fixture();try{
 const a=await register('library@example.org'),b=await register('otherlib@example.org'),project=createCampaign();project.recipients[0].street='Beispielstraße 1';
 const design=await request('/api/library/designs',{method:'POST',account:a,body:{project}});assert.equal(design.status,200);const d=design.data;
 const audience=(await request('/api/library/audiences',{method:'POST',account:a,body:{name:'Warenkorbabbrecher',recipients:project.recipients}})).data;
 assert.equal((await request('/api/library/designs/'+d.id,{account:b})).status,404);
 assert.equal((await request('/api/library/designs',{account:b})).data.items.length,0);
 assert.equal((await request('/api/library/audiences/'+audience.id,{method:'PUT',account:a,body:{...audience,revision:0}})).status,409);
 const c=await request('/api/compose',{method:'POST',account:a,body:{name:'Pilot',designId:d.id,designRevision:d.revision,audienceId:audience.id,audienceRevision:audience.revision,meta:{...defaults(),goal:'purchase'}}});assert.equal(c.status,200);assert.equal(c.data.project.sample,false);assert.equal(c.data.meta.designId,d.id);
 assert.equal((await request('/api/compose',{method:'POST',account:b,body:{name:'Foreign',designId:d.id,designRevision:1,audienceId:audience.id,audienceRevision:1}})).status,404);
 audience.recipients[0].first_name='Changed';await request('/api/library/audiences/'+audience.id,{method:'PUT',account:a,body:audience});
 const saved=(await request('/api/campaigns/'+c.data.id,{account:a})).data;assert.equal(saved.project.recipients[0].first_name,'Anna');
 assert.equal((await request('/api/library/audiences/'+audience.id,{method:'DELETE',account:a,body:{revision:1}})).status,409);
 }finally{await db.close();}
});
test('campaign drafts may defer either resource and be completed later without adopting demo contacts',async()=>{
 const {db,request,register}=await fixture();try{
  const account=await register('drafts@example.org'),other=await register('drafts-other@example.org'),project=createCampaign();
  const d=(await request('/api/library/designs',{method:'POST',account,body:{project}})).data;
  const a=(await request('/api/library/audiences',{method:'POST',account,body:{name:'Eigene Kontakte',recipients:project.recipients}})).data;
  for(const [useDesign,useAudience] of [[false,false],[true,false],[false,true]]){
   const body={name:'Später fertigstellen',...(useDesign?{designId:d.id,designRevision:d.revision}:{}),...(useAudience?{audienceId:a.id,audienceRevision:a.revision}:{})};
   const response=await request('/api/compose',{method:'POST',account,body});assert.equal(response.status,200);
   const c=response.data;assert.equal(c.project.recipients.length,useAudience?3:0);assert.equal(c.meta.status,'draft');
   assert.equal(c.meta.designId,useDesign?d.id:'');assert.equal(c.meta.audienceId,useAudience?a.id:'');
   assert.equal(c.project.sides.front.fields.length,useDesign?project.sides.front.fields.length:0);
   c.project.sides=structuredClone(project.sides);c.project.recipients=structuredClone(a.recipients);
   const saved=await request('/api/campaigns/'+c.id,{method:'PUT',account,body:c});assert.equal(saved.status,200);
   const reopened=(await request('/api/campaigns/'+c.id,{account})).data;assert.equal(reopened.project.recipients.length,3);assert.deepEqual(reopened.project.sides,project.sides);
  }
  assert.equal((await request('/api/compose',{method:'POST',account,body:{name:'   '}})).status,400);
  assert.equal((await request('/api/compose',{method:'POST',account:other,body:{name:'Foreign',designId:d.id,designRevision:1}})).status,404);
  assert.equal((await request('/api/compose',{method:'POST',account:other,body:{name:'Foreign',audienceId:a.id,audienceRevision:1}})).status,404);
  assert.equal((await request('/api/compose',{method:'POST',account,body:{name:'Stale',designId:d.id,designRevision:0}})).status,409);
 }finally{await db.close();}
});
test('review links expose only one chosen proof, support annotations, resolution, approval and immutable new versions',async()=>{
 const {db,request,register}=await fixture();try{
 const a=await register('review@example.org'),b=await register('review-other@example.org'),project=createCampaign();project.recipients[0].email='private@example.org';
 const d=(await request('/api/library/designs',{method:'POST',account:a,body:{project}})).data;
 let r=(await request('/api/reviews',{method:'POST',account:a,body:{sourceKind:'designs',sourceId:d.id,sourceRevision:d.revision}})).data;
 const token=new URLSearchParams(new URL(r.url).hash.slice(1)).get('token'),headers={authorization:'Bearer '+token};
 const opened=await request('/api/review',{headers});assert.equal(opened.status,200);assert.equal(opened.data.project.recipients.length,1);assert.equal(opened.data.project.recipients[0].email,undefined);assert.equal(opened.data.sourceId,undefined);
 assert.equal((await db.query('SELECT token_hash FROM reviews')).rows[0].token_hash.includes(token),false);
 assert.equal((await request('/api/reviews/'+r.id,{account:b})).status,404);
 assert.equal((await request('/api/review',{headers:{authorization:'Bearer invalid'}})).status,404);
 assert.equal((await request('/api/review',{method:'POST',headers:{...headers,origin:'https://evil.example'},body:{type:'comment'}})).status,403);
 let comment=await request('/api/review',{method:'POST',headers,body:{type:'comment',name:'Kunde',text:'Logo größer',side:'front',x:.2,y:.3,version:1,revision:1}});assert.equal(comment.status,200);r=comment.data;
 assert.equal((await request('/api/review',{method:'POST',headers,body:{type:'approve',name:'Kunde',confirm:true,version:1,revision:r.revision}})).status,409);
 assert.equal((await request('/api/review',{method:'POST',headers,body:{type:'comment',name:'Kunde',text:'Bad',side:'front',x:9,y:0,version:1,revision:r.revision}})).status,400);
 r=(await request('/api/reviews/'+r.id+'/resolve',{method:'POST',account:a,body:{revision:r.revision,commentId:r.events[0].id}})).data;
 r=(await request('/api/review',{method:'POST',headers,body:{type:'approve',name:'Kunde',confirm:true,version:1,revision:r.revision}})).data;assert.equal(r.status,'approved');
 assert.equal((await request('/api/review',{method:'POST',headers,body:{type:'comment',name:'Kunde',text:'Late',version:1,revision:r.revision}})).status,409);
 d.project.name='Überarbeitet';const updated=(await request('/api/library/designs/'+d.id,{method:'PUT',account:a,body:d})).data;
 assert.equal((await request('/api/reviews/'+r.id,{account:a})).data.stale,true);
 r=(await request('/api/reviews/'+r.id+'/publish',{method:'POST',account:a,body:{revision:r.revision,sourceRevision:updated.revision}})).data;assert.equal(r.version,2);assert.equal(r.status,'open');assert.equal(r.events.filter(e=>e.type==='approve')[0].version,1);assert.equal(r.versions.length,2);
 assert.equal((await request('/api/review',{method:'POST',headers,body:{type:'approve',name:'Kunde',confirm:true,version:1,revision:r.revision}})).status,409);
 const old=(await db.query('SELECT payload FROM review_versions WHERE review_id=$1 AND version=1',[r.id])).rows[0];assert.notEqual(JSON.parse(old.payload).name,'Überarbeitet');
 const rotated=(await request('/api/reviews/'+r.id+'/link',{method:'POST',account:a,body:{revision:r.revision}})).data;assert.equal((await request('/api/review',{headers})).status,404);
 const token2=new URLSearchParams(new URL(rotated.url).hash.slice(1)).get('token');await request('/api/reviews/'+r.id+'/revoke',{method:'POST',account:a,body:{revision:rotated.revision}});assert.equal((await request('/api/review',{headers:{authorization:'Bearer '+token2}})).status,404);
 }finally{await db.close();}
});
test('cart recovery tracking changes the QR field actually used by the design',async()=>{const {db,request,register}=await fixture();try{const account=await register('cart-track@example.org'),project=createCampaign();for(const side of Object.values(project.sides))for(const field of side.fields)if(field.type==='qr')field.text='{{cart_url}}';for(const r of project.recipients)r.cart_url='https://example.org/recover/'+r.id;const c=(await request('/api/campaigns',{method:'POST',account,body:{project,meta:defaults()}})).data;const tracked=await request('/api/campaigns/'+c.id+'/tracking',{method:'POST',account,body:{revision:c.revision}});assert.equal(tracked.status,200);assert.match(tracked.data.project.recipients[0].cart_url,/\/r\//);assert.equal((await request(new URL(tracked.data.project.recipients[0].cart_url).pathname)).headers.Location,project.recipients[0].cart_url);}finally{await db.close();}});
