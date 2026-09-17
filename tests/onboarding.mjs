import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:4177/studio/';
const records=()=>page.evaluate(async()=>{const s=await import('/studio/src/storage.js');return {active:await s.listCampaigns(),deleted:await s.listDeletedCampaigns()};});
try{
 await page.goto(base+'?start=1');await expect(page.locator('#start-view')).toBeVisible();assert.equal((await records()).active.length,0);
 await page.locator('[data-start-back]').click();await expect(page.locator('#dashboard-empty')).toBeVisible();
 await page.locator('.creations-header [data-dashboard-new]').click();await page.locator('#start-name').fill('Mein echter Pilot');
 await page.screenshot({path:'test-results/new-start-desktop.png',fullPage:true});
 await page.locator('#campaign-start-form [type=submit]').click();await expect(page.locator('#design-view')).toBeVisible();await expect(page.locator('#tutorial-view')).toBeHidden();await expect(page.locator('#setup-view')).toBeHidden();await expect(page.locator('#workflow-hint')).toContainText('1. Gestalte');await expect(page.locator('#rename-campaign')).toHaveText('Mein echter Pilot');
 await expect.poll(async()=>(await records()).active.length).toBe(1);let c=(await records()).active[0];assert.equal(c.sample,false);assert.equal(c.recipients.length,0);assert.equal(c.onboarding.active,false);
 await page.locator('[data-workflow-next]').click();await expect(page.locator('#recipients-view')).toBeVisible();await expect(page.locator('#workflow-hint')).toContainText('2. Für wen');
 await page.locator('[data-workflow-next]').click();await expect(page.locator('#preview-view')).toBeVisible();await expect(page.locator('#workflow-hint')).toContainText('3. Prüfe');
 await page.locator('#delete-campaign').click();await page.getByRole('button',{name:'Abbrechen',exact:true}).click();assert.equal((await records()).active.length,1);
 await page.locator('#delete-campaign').click();await page.locator('[data-result=ok]').click();await expect(page.locator('#dashboard-empty')).toBeVisible();assert.equal((await records()).deleted.length,1);
 // A delayed autosave from another tab must not recreate the trashed record.
 const blocked=await page.evaluate(async campaign=>{const s=await import('/studio/src/storage.js');try{await s.saveCampaign(campaign);return false;}catch{return true;}},c);assert.equal(blocked,true);
 await page.reload();await expect(page.locator('#dashboard-empty')).toBeVisible();await page.locator('#creation-trash summary').click();await page.locator('[data-dashboard-restore]').click();await expect(page.locator('.dashboard-card')).toHaveCount(1);assert.equal((await records()).deleted.length,0);
 await page.locator('[data-dashboard-copy]').click();await expect(page.locator('.dashboard-card')).toHaveCount(2);await page.locator('#campaign-search').fill('Kopie');await expect(page.locator('.dashboard-card:visible')).toHaveCount(1);await page.locator('[data-dashboard-delete]:visible').click();await page.locator('[data-result=ok]').click();await expect(page.locator('.dashboard-card')).toHaveCount(1);
 await page.locator('.creations-header [data-dashboard-new]').click();await page.locator('#start-name').fill('Upload-Projekt');await page.locator('input[value=upload]').check();await expect(page.locator('.start-template')).toBeHidden();await page.locator('#campaign-start-form [type=submit]').click();await expect(page.locator('#upload-button')).toBeFocused();await expect.poll(async()=>(await records()).active.length).toBe(2);
 const upload=(await records()).active.find(c=>c.name==='Upload-Projekt');assert.equal(upload.sides.front.fields.length,0);assert.equal(upload.recipients.length,0);
 await page.locator('#breadcrumb-campaigns').click();await page.screenshot({path:'test-results/creations-desktop.png',fullPage:true});
 await page.locator('.creations-header [data-dashboard-new]').click();await page.locator('#start-name').fill('Leere Karte');await page.locator('input[value=blank]').check();await page.locator('#campaign-start-form [type=submit]').click();await expect(page.locator('#empty-artboard')).toBeVisible();
 await page.locator('#breadcrumb-campaigns').click();for(const width of [768,390]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'Dashboard overflow '+width);}await page.locator('#toast').evaluate(e=>e.classList.remove('show'));await page.screenshot({path:'test-results/creations-mobile.png',fullPage:true});
 await page.locator('.creations-header [data-dashboard-new]').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1));await page.screenshot({path:'test-results/new-start-mobile.png',fullPage:true});
 await page.goto(base+'?tutorial=1');await expect(page.locator('#start-view')).toBeVisible();assert.equal((await records()).active.length,3);
 assert.deepEqual(errors,[]);console.log('Passed: real campaign start, all three modes, no practice recipients, contextual next steps, cancel/delete/restore, reload persistence, late-autosave protection, independent copy, responsive layouts and legacy entry.');
}finally{await browser.close();}
