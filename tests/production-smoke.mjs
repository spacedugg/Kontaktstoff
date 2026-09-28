// Explicit opt-in: creates one clearly marked synthetic account/request on live.
// No email is sent. The campaign is soft-deleted and sessions closed afterwards.
import {chromium,expect} from '@playwright/test';
import {randomBytes,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {createCampaign} from '../studio/src/core.js';
import {defaults} from '../konto/src/model.js';
if(process.env.LIVE_SMOKE!=='1')throw Error('Set LIVE_SMOKE=1 to run this production write test.');
const root='https://www.kontaktstoff.com',browser=await chromium.launch({channel:'chrome',headless:true}),context=await browser.newContext(),page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));let csrf='',id;
async function call(route,method='GET',data){const r=await context.request.fetch(root+'/api'+route,{method,headers:{Origin:root,...(csrf?{'X-CSRF-Token':csrf}:{})},...(data?{data}: {})});return {status:r.status(),data:await r.json()};}
try{
 const health=await call('/health');assert.equal(health.status,200);assert.equal(health.data.storage,'postgres');assert.equal(health.data.email,false);
 const email='connection-test-'+Date.now()+'@example.invalid',password=randomBytes(32).toString('base64url');
 await page.goto(root+'/konto/');await page.locator('[data-action=login]').click();await page.locator('[data-auth-switch]').click();await page.locator('#auth-form [name=company]').fill('TEST – technischer Verbindungstest');await page.locator('#auth-form [name=name]').fill('Testkonto – keine echte Anfrage');await page.locator('#auth-form [name=email]').fill(email);await page.locator('#auth-form [name=password]').fill(password);await page.locator('#auth-form button').click();await expect(page.locator('#auth-dialog')).not.toBeVisible();await expect(page.locator('[data-action=logout]')).toBeVisible();
 const me=await call('/auth/me');assert.ok(me.data.user);csrf=me.data.csrf;assert.equal(me.data.user.operator,false);
 const session=(await context.cookies()).find(c=>c.name==='__Host-kontaktstoff');assert.ok(session?.httpOnly&&session?.secure);
 const project=createCampaign();project.name='TEST – Verbindung geprüft, bitte ignorieren';const meta={...defaults(),designService:true,leadSource:'research',audience:'Technischer Test, keine echten Leads',region:'Test',notes:'Automatisierter Verbindungstest. Keine Bearbeitung, kein Angebot, kein Versand.'};
 let result=await call('/campaigns','POST',{project,meta});assert.equal(result.status,201);id=result.data.id;
 result=await call('/campaigns/'+id,'PUT',{...result.data,project:{...result.data.project,name:'TEST – Speicherung erfolgreich'}});assert.equal(result.status,200);assert.equal(result.data.revision,2);
 const requested=await call('/campaigns/'+id+'/request','POST',{key:randomUUID(),revision:2});assert.equal(requested.status,201);assert.equal(requested.data.notification,'not_configured');
 const saved=await call('/campaigns/'+id);assert.equal(saved.data.meta.status,'requested');
 const tracked=await call('/campaigns/'+id+'/tracking','POST',{revision:saved.data.revision});assert.equal(tracked.status,200);
 const redirect=await context.request.get(tracked.data.project.recipients[0].chatbot_url,{maxRedirects:0});assert.equal(redirect.status(),302);
 const stats=await call('/campaigns/'+id+'/stats');assert.equal(stats.data.requests.length,1);assert.ok(stats.data.visits.some(v=>Number(v.count)===1));
 assert.equal((await call('/operator/requests')).status,403);
 await call('/auth/logout','POST',{});csrf='';const signed=await call('/auth/login','POST',{email,password});assert.equal(signed.status,200);csrf=signed.data.csrf;assert.equal((await call('/campaigns/'+id)).data.project.name,'TEST – Speicherung erfolgreich');
 await page.goto(root+'/konto/?tab=campaigns');await expect(page.locator('.campaign-tile')).toContainText('TEST – Speicherung erfolgreich');
 await page.goto(root+'/konto/?tab=company');await expect(page.locator('.account-security')).toContainText('E-Mail-Versand eingerichtet');await page.screenshot({path:'test-results/production-account-connected.png',fullPage:true});
 await call('/campaigns/'+id,'DELETE');assert.equal((await call('/campaigns/'+id)).status,404);assert.deepEqual(errors,[]);
 console.log('Production smoke passed: PostgreSQL, UI registration, secure session, campaign save, request persistence, tracking, operator protection, logout/login, dashboard. Synthetic campaign soft-deleted; clearly marked test request retained. No emails sent.');
}finally{try{if(csrf)await call('/auth/logout','POST',{});}finally{await browser.close();}}
