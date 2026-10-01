import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {connectDB} from '../server/db.js';
import {createAPI} from '../server/api.js';
import {proposalService} from '../server/proposals.js';
import {proposalDay,proposalMetrics,recordProposalView} from '../server/proposal-metrics.js';
import {MMS_PROPOSAL} from '../mailings/proposal-config.js';
const origin='https://www.kontaktstoff.com';
async function request(api,url,{method='GET',headers={}}={}){let status,body;await api({url,method,headers:{origin,...headers}},{writeHead(s){status=s;},end(v){body=v;}});return {status,body};}
test('sales-page requests count once; metadata, bots, previews and operator sessions do not; private metrics stay private',async()=>{
 const db=await connectDB({file:':memory:'});try{
 const service=proposalService(db),api=createAPI(db,{origin,operatorEmails:'team@example.org'});
 let page=await service.save(null,{draft:MMS_PROPOSAL});assert.equal(page.stats,null);
 assert.equal((await request(api,'/idee/'+page.slug)).status,404);
 page=await service.save(page.id,{draft:MMS_PROPOSAL,revision:page.revision,publish:true});assert.equal(page.stats.total,0);
 const start=page.stats.startedAt,url='/idee/'+page.slug;
 for(const options of [{method:'HEAD'},{headers:{dnt:'1'}},{headers:{'sec-gpc':'1'}},{headers:{purpose:'prefetch'}},{headers:{'sec-purpose':'prefetch;prerender'}},{headers:{'sec-fetch-dest':'image'}},...['LinkedInBot','WhatsApp','facebookexternalhit','Googlebot','Slackbot','TelegramBot','Discordbot','HeadlessChrome'].map(ua=>({headers:{'user-agent':ua}}))])assert.equal((await request(api,url,options)).status,200);
 await request(api,'/api/proposal?slug='+page.slug);
 await request(api,'/api/proposal-image?slug='+page.slug);
 assert.equal((await service.get(page.id)).stats.total,0);
 await db.query('INSERT INTO users(id,email,password,profile,created_at) VALUES($1,$2,$3,$4,$5)',['team','team@example.org','unused','{}',Date.now()]);
 await db.query('INSERT INTO email_verifications(user_id,verified_at) VALUES($1,$2)',['team',Date.now()]);
 await db.query('INSERT INTO sessions(token,user_id,csrf,expires) VALUES($1,$2,$3,$4)',[createHash('sha256').update('team-session').digest('hex'),'team','unused',Date.now()+60000]);
 const headers={cookie:'__Host-kontaktstoff=team-session'};
 await request(api,url,{headers});assert.equal((await service.get(page.id)).stats.total,0);
 const operatorResult=await request(api,'/api/operator/proposals',{headers});assert.equal(operatorResult.status,200);assert.equal(JSON.parse(operatorResult.body).items[0].stats.total,0);
 assert.equal((await request(api,'/api/operator/proposals')).status,401);
 await Promise.all(Array.from({length:12},()=>request(api,url,{headers:{'sec-fetch-dest':'document','user-agent':'Mozilla/5.0'}})));
 page=await service.get(page.id);assert.equal(page.stats.total,12);assert.equal(page.stats.today,12);
 assert.equal((await db.query('SELECT * FROM proposal_page_views')).rows.length,1);
 assert.deepEqual(Object.keys((await db.query('SELECT * FROM proposal_page_views')).rows[0]).sort(),['count','day','proposal_id']);
 assert.equal(JSON.stringify(await service.public(page.slug)).includes('startedAt'),false);
 assert.equal((await request(api,url,{headers:{dnt:'1'}})).body.includes('startedAt'),false);
 page=await service.save(page.id,{draft:MMS_PROPOSAL,revision:page.revision,publish:true});assert.equal(page.stats.total,12);assert.equal(page.stats.startedAt,start);
 page=await service.disable(page.id,{revision:page.revision});await request(api,url);assert.equal((await service.get(page.id)).stats.total,12);
 }finally{await db.close();}
});
test('daily counts use Berlin dates and separate pages, missing slugs never get counters',async()=>{
 const db=await connectDB({file:':memory:'});try{
 const s=proposalService(db),a=await s.save(null,{draft:MMS_PROPOSAL,publish:true}),b=await s.save(null,{draft:MMS_PROPOSAL,publish:true});
 const before=Date.parse('2026-10-01T21:59:00Z'),after=Date.parse('2026-10-01T22:01:00Z');
 assert.equal(proposalDay(before),'2026-10-01');assert.equal(proposalDay(after),'2026-10-02');
 await recordProposalView(db,a.slug,before);await recordProposalView(db,a.slug,after);await recordProposalView(db,'missing',after);
 const stats=await proposalMetrics(db,undefined,after);assert.equal(stats[a.id].total,2);assert.equal(stats[a.id].today,1);assert.equal(stats[b.id].total,0);
 }finally{await db.close();}
});
