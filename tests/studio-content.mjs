import {build} from 'esbuild';
import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
await mkdir('test-results',{recursive:true});
await build({stdin:{contents:"export {renderCanvas} from './studio/src/render.js';",resolveDir:process.cwd()},outfile:'test-results/card-audit.mjs',bundle:true,format:'esm'});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1080},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function project(){const wait=page.waitForEvent('download');await page.locator('#project-export').click();return JSON.parse(await readFile(await(await wait).path(),'utf8'));}
try{
 await page.goto('http://127.0.0.1:4177/studio/?start=1');
 await expect(page.locator('[data-start-thumb]')).toHaveCount(3);await page.waitForFunction(()=>[...document.querySelectorAll('[data-start-thumb]')].every(c=>c.width>500));await page.screenshot({path:'test-results/visual-template-start.png',fullPage:true});
 await page.locator('[name=template][value=morgen]').check();await page.locator('#start-name').fill('Persönliche Einladung');await page.locator('#campaign-start-form [type=submit]').click();
 await expect(page.locator('body')).toHaveClass(/content-editing/);await expect(page.locator('#field-x')).toBeHidden();await expect(page.locator('#field-text')).toBeVisible();
 await expect(page.locator('#active-recipient')).toContainText('Platzhalter');
 const before=await project();assert.equal(before.templateId,'morgen');assert.equal(before.recipients.length,0);
 await page.locator('#field-text').fill('FÜR {{first_name}} – ZEIT FÜR EINE PAUSE');await expect(page.locator('#resolved')).toContainText('FÜR Vorname');
 await page.locator('#design-view').screenshot({path:'test-results/content-editor-desktop.png'});
 const overlay=page.locator('.field-overlay.selected'),box=await overlay.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+35,box.y+box.height/2+20);await page.mouse.up();
 const edited=await project(),field=edited.sides.front.fields.find(f=>f.text==='FÜR {{first_name}} – ZEIT FÜR EINE PAUSE'),old=before.sides.front.fields.find(f=>f.id===field.id);assert.equal(field.x,old.x);assert.equal(field.y,old.y);
 await page.locator('[data-editor-mode=layout]').click();await expect(page.locator('#field-x')).toBeVisible();await page.locator('#field-size').fill('18');await page.locator('#field-size').press('Tab');await expect(page.locator('#field-size')).toHaveValue('18');
 await page.locator('[data-editor-mode=content]').click();await page.locator('[data-side=back]').click();await page.locator('#layer-list button').filter({hasText:'Persönliche Nachricht'}).click();await expect(page.locator('#field-text')).toHaveValue('{{personal_note}}');
 await page.locator('[data-workflow-next]').click();await page.locator('#add-recipient').click();await page.locator('[data-key=company]').fill('Mein Testteam');await page.locator('[data-key=first_name]').fill('Mara');await page.locator('[data-key=salutation]').fill('Hallo Mara,');await page.locator('[data-key=personal_note]').fill('Nach eurem Projektabschluss laden wir euch auf einen Kaffee ein.');await page.locator('[data-key=chatbot_url]').fill('https://example.org/mein-testteam');
 await page.locator('[data-tab=design]').click();await page.locator('#layer-list button').filter({hasText:'Persönliche Nachricht'}).click();await expect(page.locator('#resolved')).toContainText('Nach eurem Projektabschluss');await page.locator('#recipient-field-value').fill('Mara, auf euren Projektabschluss! Wir laden euch auf einen Kaffee ein.');await expect(page.locator('#resolved')).toContainText('Mara, auf euren Projektabschluss!');await page.screenshot({path:'test-results/personal-message-editor.png',fullPage:true});
 await expect(page.locator('#save-state')).toContainText('Lokal gespeichert');await page.reload();await expect(page.locator('#design-view')).toBeVisible();await expect(page.locator('#active-recipient')).toContainText('Mein Testteam');
 for(const width of [1024,768,390]){await page.setViewportSize({width,height:950});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Editor overflow at '+width);}
 await page.screenshot({path:'test-results/content-editor-mobile.png',fullPage:true});
 // All new designs fit real recipient data and survive the project schema.
 const audits=await page.evaluate(async()=>{const {createPromotion}=await import('/studio/src/promotions.js'),{validateCampaign}=await import('/studio/src/core.js'),{renderCanvas}=await import('/test-results/card-audit.mjs');const results=[];for(const id of ['chattastic','raumwerk','morgen']){const c=validateCampaign(createPromotion(id));for(const r of c.recipients)for(const side of ['front','back']){const canvas=document.createElement('canvas');results.push({id,side,company:r.company,overflow:await renderCanvas(canvas,c,side,r)});}}return results;});
 assert.deepEqual(audits.filter(a=>a.overflow.length),[]);assert.deepEqual(errors,[]);console.log('Content editor passed: visual template selection, real content edits, locked layout in content mode, optional typography, editable personal messages, persistence, responsive layout, and 18 card variants without text overflow.');
}finally{await browser.close();}
