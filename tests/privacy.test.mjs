import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {connectDB} from '../server/db.js';
import {countRedirect,privacyMaintenance} from '../server/privacy.js';
import {privacyLinks} from '../scripts/privacy-pages.mjs';

test('QR redirect metrics honor privacy signals without changing redirect eligibility',()=>{
 const request={method:'GET',headers:{'user-agent':'Mozilla/5.0'}};
 assert.equal(countRedirect(request),true);
 for(const headers of [{dnt:'1'},{'sec-gpc':'1'},{'user-agent':'Slackbot preview'}])assert.equal(countRedirect({...request,headers:{...request.headers,...headers}}),false);
 assert.equal(countRedirect({...request,method:'HEAD'}),false);
 assert.equal(countRedirect({...request,headers:{dnt:'0'}}),true);
});

test('expired security records are removed while current sessions and user content remain',async()=>{
 const db=await connectDB({file:':memory:'});try{
 await db.query('INSERT INTO users VALUES($1,$2,$3,$4,$5)',['u','test@example.org','hash','{}',1]);
 for(const expires of [50,200]){
  await db.query('INSERT INTO sessions VALUES($1,$2,$3,$4)',['s'+expires,'u','c'+expires,expires]);
  await db.query('INSERT INTO account_tokens VALUES($1,$2,$3,$4)',['t'+expires,'u','reset',expires]);
  await db.query('INSERT INTO rate_limits VALUES($1,$2,$3)',['r'+expires,1,expires]);
 }
 let time=100;const clean=privacyMaintenance(db,{now:()=>time,interval:10});await Promise.all([clean(),clean()]);
 for(const table of ['sessions','account_tokens','rate_limits'])assert.equal((await db.query('SELECT * FROM '+table)).rows.length,1);
 assert.equal((await db.query('SELECT * FROM users')).rows.length,1);
 time=201;await clean();for(const table of ['sessions','account_tokens','rate_limits'])assert.equal((await db.query('SELECT * FROM '+table)).rows.length,0);
 }finally{await db.close();}
});

test('privacy links work without scripts and CSP blocks unapproved external services',async()=>{
 const html=privacyLinks('<html><head></head><body><main>Test</main></body></html>');
 assert.match(html,/href="\/cookies.html"/);assert.match(html,/href="\/impressum.html"/);assert.equal(privacyLinks(html),html);
 const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url))),headers=config.headers[0].headers;
 const policy=headers.find(h=>h.key==='Content-Security-Policy').value;
 for(const directive of ["connect-src 'self'","frame-src 'none'","object-src 'none'","script-src 'self' 'wasm-unsafe-eval'","form-action 'self'"])assert.ok(policy.includes(directive));
 assert.equal(headers.find(h=>h.key==='Referrer-Policy').value,'no-referrer');
 const privacy=await readFile(new URL('../inhalte/recht/datenschutz.html',import.meta.url),'utf8');assert.ok(privacy.includes('Temoa GmbH'));assert.ok(privacy.includes('Empfängerdatensatz'));assert.ok(!privacy.includes('speichert keine Eingaben'));
});
