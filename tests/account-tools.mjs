import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const user={id:'test-operator',email:'team@example.org',profile:{company:'Kontaktstoff',name:'Test Team'},operator:true,emailVerified:true};
const record={id:'request-test',createdAt:Date.now(),status:'new',note:'',workflowRevision:0,project:{name:'Testkampagne',recipients:[]},profile:{company:'Test GmbH',name:'Anna Beispiel'},email:'anna@example.org',meta:{quantity:250,formatRequest:'a5',designService:true,leadSource:'research',audience:'Agenturen',region:'Deutschland'}};
let resetSubmitted=false,workflowSaved=false;
try{
 await page.route('**/api/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  let data={};
  if(path==='/api/auth/me')data={user,csrf:'test-csrf'};
  else if(path==='/api/health')data={email:true,available:true};
  else if(path==='/api/campaigns')data={campaigns:[]};
  else if(path==='/api/operator/requests')data={requests:[{...record,campaign:record.project.name,company:record.profile.company}]};
  else if(path==='/api/operator/requests/request-test'){if(route.request().method()==='PUT'){Object.assign(record,route.request().postDataJSON(),{workflowRevision:1});workflowSaved=true;}data=record;}
  else if(path==='/api/auth/reset'){resetSubmitted=true;data={ok:true};}
  else if(path==='/api/auth/forgot')data={ok:true,message:'Falls ein Konto besteht, erhältst du einen Link.'};
  await route.fulfill({json:data});
 });
 await page.goto('http://127.0.0.1:4181/konto/?tab=inbox');
 await expect(page.getByRole('heading',{name:'Eingegangene Anfragen.'})).toBeVisible();await page.locator('[data-open-request]').click();
 await expect(page.getByRole('heading',{name:'Testkampagne'})).toBeVisible();await page.locator('[name=status]').selectOption('reviewing');await page.locator('[name=note]').fill('Bitte Angebot vorbereiten.');await page.locator('#workflow-form button').click();await expect(page.locator('[name=status]')).toHaveValue('reviewing');assert.ok(workflowSaved);
 await page.setViewportSize({width:390,height:850});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'test-results/operator-inbox-mobile.png',fullPage:true});
 await page.goto('http://127.0.0.1:4181/konto/#reset='+'a'.repeat(43));await expect(page.getByRole('heading',{name:'Neues Passwort festlegen.'})).toBeVisible();assert.equal(new URL(page.url()).hash,'');assert.equal(resetSubmitted,false);
 await page.locator('#auth-dialog [name=password]').fill('test-new-password-123');await page.locator('#auth-dialog [name=confirmation]').fill('test-new-password-456');await page.locator('#auth-dialog form button').click();await expect(page.locator('#auth-dialog .error')).toContainText('stimmen nicht');assert.equal(resetSubmitted,false);
 await page.locator('#auth-dialog [name=confirmation]').fill('test-new-password-123');await page.locator('#auth-dialog form button').click();await expect(page.getByRole('heading',{name:'Passwort gespeichert.'})).toBeVisible();assert.equal(resetSubmitted,true);assert.deepEqual(errors,[]);
 console.log('Account UI passed: operator inbox, status change, mobile layout, explicit reset submission, confirmation validation, fragment removal.');
}finally{await browser.close();}
