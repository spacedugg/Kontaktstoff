import {chromium,expect} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1512,height:1080},acceptDownloads:true,reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:4177';
async function project(){const event=page.waitForEvent('download');await page.locator('#project-export').click();return JSON.parse(await readFile(await(await event).path(),'utf8'));}
try{
 await page.goto(base);await expect(page.locator('#hero-stage')).toHaveAttribute('aria-busy','false');
 await page.screenshot({path:'test-results/promotions-home.png'});
 const fronts=[];
 for(const id of ['chattastic','raumwerk','morgen']){
  await page.locator(`.promotion-tabs [data-promotion="${id}"]`).click();await expect(page.locator('#hero-stage')).toHaveAttribute('aria-busy','false');
  await expect(page.locator('#gallery-open')).toHaveAttribute('href','studio/?example='+id);await expect(page.locator('#gallery-error')).toBeHidden();
  fronts.push(await page.locator('#hero-front').evaluate(c=>c.toDataURL()));
  await page.locator('#hero-flip').click();await expect(page.locator('#hero-stage')).toHaveAttribute('data-face','back');
  const canvas=await page.locator('#hero-back').evaluate(c=>({data:Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data),width:c.width,height:c.height}));
  assert.ok(jsQR(new Uint8ClampedArray(canvas.data),canvas.width,canvas.height)?.data.includes(id==='chattastic'?'chattastic.de':'example.org'));
  await page.screenshot({path:`test-results/promotions-${id}-back.png`});
  await page.locator('#hero-reset').click();await page.screenshot({path:`test-results/promotions-${id}-front.png`});
 }
 assert.equal(new Set(fronts).size,3);
 await page.locator('#demo-company').fill('Mein persönliches Teststudio');await expect(page.locator('#hero-front')).toHaveAttribute('aria-label','Vorderseite für Mein persönliches Teststudio');
 assert.notEqual(await page.locator('#hero-front').evaluate(c=>c.toDataURL()),fronts[2]);
 for(const width of [1024,768,390]){await page.setViewportSize({width,height:950});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`test-results/promotions-home-${width}.png`,fullPage:true});}
 await page.setViewportSize({width:1512,height:1080});await page.locator('.hero-actions a').click();await expect(page.locator('#tutorial-view')).toBeVisible();
 const tutorial=await project();await page.locator('[data-tutorial-action="skip"]').click();await expect(page.locator('#design-view')).toBeVisible();
 const blank=await project();assert.notEqual(blank.id,tutorial.id);assert.equal(blank.sample,false);assert.equal(blank.recipients.length,0);assert.equal(blank.sides.front.fields.length,0);assert.equal(blank.sides.back.fields.length,0);assert.equal(blank.onboarding.active,false);
 await page.reload();await expect(page.locator('#design-view')).toBeVisible();await page.locator('#breadcrumb-campaigns').click();await expect(page.locator('.dashboard-card')).toHaveCount(2);
 await page.locator('[data-dashboard-new]').first().click();await expect(page.locator('#tutorial-view')).toBeVisible();
 for(const id of ['chattastic','raumwerk','morgen']){
  await page.goto(base+'/studio/?example='+id);await expect(page.locator('#three-d-view')).toBeVisible();await page.waitForFunction(()=>document.querySelector('#three-d-back').width>500);
  const c=await project();assert.equal(c.templateId,id);assert.equal(c.recipients.length,3);assert.ok(c.sides.front.fields.some(f=>f.type==='image'));assert.ok(c.sides.front.fields.some(f=>f.text==='{{company}}'));
  await page.locator('#audit-all').click();await expect(page.locator('#audit-results')).toContainText('Alle Empfänger geprüft');
  await page.locator('#preview-mode-2d').click();await page.locator('#toast').evaluate(e=>e.classList.remove('show'));await page.locator('#proof-spread').screenshot({path:`test-results/promotions-${id}-spread.png`});
  if(id!=='chattastic')await expect(page.locator('#example-preview-note')).toContainText('example.org');
 }
 await page.locator('#breadcrumb-campaigns').click();await expect(page.locator('.dashboard-card')).toHaveCount(6);await expect(page.locator('[data-dashboard-example]')).toHaveCount(3);
 await page.screenshot({path:'test-results/promotions-dashboard.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('Promotions passed: three distinct designs, decoded QR destinations, personalization, responsive layouts, tutorial entry + skip into empty independent campaign, persistence, complete samples and audits.');
}finally{await browser.close();}
