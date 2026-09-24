import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createClientCampaign} from '../studio/src/client-campaigns.js';
import {toSelfmailer} from '../studio/src/selfmailer.js';
const origin='http://127.0.0.1:4183';await mkdir('test-results/review-fold',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),owner=await browser.newContext({viewport:{width:1440,height:1100}}),page=await owner.newPage(),guest=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),customer=await guest.newPage(),errors=[];for(const p of [page,customer])p.on('pageerror',e=>errors.push(e.message));
let design,review,csrf;
async function api(path,method='GET',data){const r=await owner.request.fetch(origin+'/api'+path,{method,headers:{origin,'X-CSRF-Token':csrf||''},...(data?{data}:{})});assert.ok(r.ok(),method+' '+path+': '+await r.text());return r.json();}
try{
 csrf=(await api('/auth/admin','POST',{password:'local-sales-test-only'})).csrf;
 design=await api('/library/designs','POST',{project:toSelfmailer(createClientCampaign('bewertungspush'))});
 await page.goto(origin+'/studio/?design='+design.id+'&view=preview');await expect(page.locator('#request-campaign')).toHaveText('Freigabe & Feedback →');await page.locator('#preview-mode-2d').click();
 for(const side of ['front','back']){const uri=await page.locator('#proof-'+side).evaluate(c=>c.toDataURL());await writeFile('test-results/review-fold/bewertungspush-'+side+'.png',Buffer.from(uri.split(',')[1],'base64'));}
 await page.locator('#request-campaign').click();await expect(page.locator('#flow-dialog')).toBeVisible();await page.locator('#flow-dialog input[type=checkbox]').check();await page.locator('#flow-dialog button[type=submit]').click();await expect(page.locator('.project-design')).toBeVisible();
 review=(await api('/reviews')).items.find(r=>r.sourceId===design.id);assert.ok(review?.url);
 await expect(page.locator('.fold-flap')).toBeVisible();await expect(page.locator('[data-review-view]')).toHaveCount(0);await page.locator('[data-fold-toggle]').click();await expect(page.locator('.review-fold-stage')).toHaveAttribute('data-fold','100');
 await customer.goto(review.url.replace(new URL(review.url).origin,origin));await expect(customer.locator('[data-fold-face=cover]')).toHaveJSProperty('width',1050);await expect(customer.locator('[data-review-view]')).toHaveCount(0);

 // Every printed surface is directly clickable, including a partly open cover.
 for(const face of ['cover','postal','inside-top','inside-bottom']){
  await customer.locator('[data-review-face="'+(face==='inside-bottom'?'inside-top':face)+'"]').click();
  if(face==='cover')await customer.locator('.fold-range input').fill('35');
  await customer.locator('.review-fold-stage').scrollIntoViewIfNeeded();await customer.waitForTimeout(1000);
  const hit=await customer.locator('[data-review-surface="'+face+'"] .fold-corner').evaluateAll(nodes=>{const r=nodes.map(n=>n.getBoundingClientRect());return {x:(r[0].x+r[2].x)/2,y:(r[0].y+r[2].y)/2};});
  await customer.touchscreen.tap(hit.x,hit.y);await expect(customer.locator('#comment-dialog')).toBeVisible();await expect(customer.locator('#point-info')).toContainText(['cover','postal'].includes(face)?'Außenseite':'Innenseite');await customer.locator('#comment-close').click();
 }
 await customer.locator('[data-review-face="inside-top"]').click();await expect(customer.locator('.review-fold-stage')).toHaveAttribute('data-fold','100');assert.ok(await customer.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await customer.screenshot({path:'test-results/review-fold/customer-mobile.png',fullPage:true});
 const stage=customer.locator('.review-fold-stage');await stage.scrollIntoViewIfNeeded();const box=await stage.boundingBox();await customer.mouse.move(box.x+box.width*.5,box.y+box.height*.4);await customer.mouse.down();await customer.mouse.move(box.x+box.width*.6,box.y+box.height*.5,{steps:8});await customer.mouse.up();await expect(customer.locator('#comment-dialog')).not.toBeVisible();
 await customer.locator('[data-review-face="inside-top"]').click();await customer.waitForTimeout(900);await customer.locator('#start-mark').click();await customer.waitForTimeout(700);
 const point=await customer.locator('[data-review-surface="inside-top"] .fold-corner').evaluateAll(nodes=>{const p=nodes.map(n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y};});return {x:(p[0].x+p[2].x)/2,y:(p[0].y+p[2].y)/2};});await customer.mouse.click(point.x,point.y);
 await expect(customer.locator('#comment-dialog')).toBeVisible();await customer.locator('#comment-form textarea').fill('Bitte die Überschrift etwas größer setzen.');await customer.locator('#comment-form input[name=name]').fill('Testkundin');await customer.locator('#comment-form button[type=submit]').click();await expect(customer.locator('.review-comment')).toContainText('Überschrift');await expect(customer.locator('#start-approve')).toBeDisabled();await expect(customer.locator('[data-review-surface="inside-top"] [data-fold-comment]')).toHaveCount(1);await expect(customer.locator('.review-fold-stage')).toHaveAttribute('data-fold','100');
 review=await api('/reviews/'+review.id);assert.equal(review.events.at(-1).side,'back');assert.ok(review.events.at(-1).x>0);review=await api('/reviews/'+review.id+'/resolve','POST',{revision:review.revision,commentId:review.events.at(-1).id});await customer.reload();await customer.locator('#start-approve').click();await customer.locator('#approve-form input[name=name]').fill('Testkundin');await customer.locator('#approve-form input[type=checkbox]').check();await customer.locator('#approve-form button').click();await expect(customer.locator('#review-state')).toHaveText('Design freigegeben');
 review=await api('/reviews/'+review.id);const sameURL=review.url;design=await api('/library/designs/'+design.id);design.project.sides.back.fields.find(f=>f.brandRole==='cta').text='Ihr nächster Schritt.';design=await api('/library/designs/'+design.id,'PUT',{revision:design.revision,project:design.project});assert.equal((await api('/reviews/'+review.id)).stale,true);review=await api('/reviews/'+review.id+'/publish','POST',{revision:review.revision,sourceRevision:design.revision});assert.equal(review.url,sameURL);assert.equal(review.status,'open');assert.equal(review.version,2);assert.ok(review.events.some(e=>e.type==='approve'&&e.version===1));await customer.reload();await expect(customer.locator('[data-fold-face=cover]')).toHaveJSProperty('width',1050);assert.deepEqual(errors,[]);
 console.log('Passed: studio → review, owner/customer 3D, mobile layout, direct 3D marking, drag suppression and surface pins, comment, resolution, approval, republish on same link and history.');
}finally{if(review){const r=await api('/reviews/'+review.id);await api('/reviews/'+review.id+'/delete','POST',{revision:r.revision});}if(design){const d=await api('/library/designs/'+design.id);await api('/library/designs/'+design.id,'DELETE',{revision:d.revision});}await browser.close();}
