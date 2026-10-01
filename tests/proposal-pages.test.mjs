import test from 'node:test';
import assert from 'node:assert/strict';
import {connectDB} from '../server/db.js';
import {createAPI} from '../server/api.js';
import {proposalService,validateProposal} from '../server/proposals.js';
import {proposalHTML} from '../server/proposal-page.js';
import {proposalHref,MMS_PROPOSAL} from '../mailings/proposal-config.js';
import {proposalSnapshot} from '../mailings/proposal-snapshot.js';
import {proposalProject,proposalPerson} from '../mailings/proposal-design.js';
const origin='https://www.kontaktstoff.com';
async function request(api,url,method='GET',body){let status,headers,result;await api({url,method,headers:{origin,'content-type':'application/json'},body,socket:{remoteAddress:'test'}},{writeHead(s,h){status=s;headers=h;},end(b){result=b;}});return {status,headers,body:Buffer.isBuffer(result)?result.toString():result};}
test('personal page and social image expose published snapshots only; inquiries retain their company association',async()=>{
 const db=await connectDB({file:':memory:'});try{
 const service=proposalService(db),api=createAPI(db,{origin}),draft={...MMS_PROPOSAL,contactName:'Jakob',shareImage:'data:image/png;base64,aGVsbG8='};let r=await service.save(null,{draft});
 assert.equal((await request(api,'/idee/'+r.slug)).status,404);
 assert.equal((await request(api,'/api/proposal-image?slug='+r.slug)).status,404);
 r=await service.save(r.id,{draft,revision:r.revision,publish:true});
 const page=await request(api,'/idee/'+r.slug+'/');assert.equal(page.status,200);assert.match(page.headers['Content-Type'],/text\/html/);assert.match(page.body,/og:title/);assert.match(page.body,/Money Making Sprint/);assert.match(page.body,/data-proposal-slug=/);assert.match(page.body,/\/api\/proposal-image\?slug=/);
 assert.equal((await request(api,'/api/proposal-image?slug='+r.slug)).body,'hello');assert.equal((await service.public(r.slug)).proposal.shareImage,undefined);
 r=await service.save(r.id,{draft:{...draft,company:'Private new name'},revision:r.revision});assert.doesNotMatch((await request(api,'/idee/'+r.slug)).body,/Private new name/);
 const inquiry=await request(api,'/api/sales-inquiries','POST',{id:crypto.randomUUID(),name:'Test',company:'Test',email:'test@example.org',useCase:'b2b',quantity:100,proposalSlug:r.slug,sourceCompany:'Forged'});assert.equal(inquiry.status,201);
 const row=(await db.query('SELECT payload FROM sales_inquiries')).rows[0];assert.equal(JSON.parse(row.payload).sourceCompany,'Money Making Sprint');
 await service.disable(r.id,{revision:r.revision});assert.equal((await request(api,'/idee/'+r.slug)).status,404);assert.equal((await request(api,'/api/proposal-image?slug='+r.slug)).status,404);
 }finally{await db.close();}
});
test('page metadata escapes company names and never embeds executable proposal content',()=>{
 const page=proposalHTML({slug:'example-123',proposal:{...MMS_PROPOSAL,company:'\"><script>alert(1)</script>',intro:'A & B'}},origin);assert.ok(page.includes('&lt;script&gt;'));assert.ok(!page.includes('<script>alert(1)</script>'));assert.equal(proposalHref('example-123',origin),origin+'/idee/example-123/');
});
test('imported sales artwork strips recipient lists, notes and variants; uses a fictitious recipient and a deliberate QR target',()=>{
 const project=proposalProject(MMS_PROPOSAL);project.recipients=[{id:'customer',first_name:'Private',email:'private@example.org'}];project.brief={sender:'internal',audience:'secret',goal:'private',offer:'hidden'};
 const snapshot=proposalSnapshot(project);assert.deepEqual(snapshot.recipients,[]);assert.equal(snapshot.brief,undefined);assert.ok(!JSON.stringify(snapshot).includes('private@example.org'));
 const d=validateProposal({...MMS_PROPOSAL,designProject:project}),p=proposalProject(d);assert.equal(d.designProject.brief,undefined);assert.equal(p.recipients.length,1);assert.equal(p.recipients[0].first_name,'Anna');assert.equal(p.recipients[0].last_name,'Beispiel');assert.equal(proposalPerson(d).email,'');assert.ok(Object.values(p.sides).flatMap(s=>s.fields).filter(f=>f.type==='qr').every(f=>f.text==='{{chatbot_url}}'));
});
