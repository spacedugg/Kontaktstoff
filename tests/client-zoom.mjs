import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
await build({stdin:{contents:"export {createBewertungspush,applyBewertungspushOffer} from './studio/src/bewertungspush.js';export {renderCanvas} from './studio/src/render.js';",resolveDir:process.cwd()},bundle:true,format:'esm',outfile:'tmp/pdfs/offer-check.js'});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4177/fuer/bewertungspush/#entwurf');await expect(page.locator('#client-stage')).toHaveAttribute('aria-busy','false');
 await page.locator('#client-zoom').click();await expect(page.locator('#client-zoom-dialog')).toBeVisible();
 await expect(page.locator('.zoom-viewport')).toHaveAttribute('aria-busy','false');assert.ok(await page.locator('.zoom-sheet canvas').evaluate(c=>c.width)>3000);
 const initial=await page.locator('.zoom-sheet canvas').evaluate(c=>c.getBoundingClientRect().width);
 await page.locator('#zoom-in').click();await expect(page.locator('.zoom-scale output')).toHaveText('125 %');assert.ok(await page.locator('.zoom-sheet canvas').evaluate(c=>c.getBoundingClientRect().width)>initial);
 await page.locator('.zoom-scale input').fill('300');await expect(page.locator('.zoom-scale output')).toHaveText('300 %');await expect(page.locator('#zoom-in')).toBeDisabled();
 await page.locator('[data-zoom-side="back"]').click();await expect(page.locator('.zoom-sheet canvas')).toHaveAttribute('aria-label','Rückseite vergrößert');
 const vp=page.locator('.zoom-viewport'),box=await vp.boundingBox();const before=await vp.evaluate(el=>el.scrollLeft);await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2-100,box.y+box.height/2-60);await page.mouse.up();assert.ok(await vp.evaluate(el=>el.scrollLeft)>before);
 await page.locator('#zoom-fit').click();await expect(page.locator('.zoom-scale output')).toHaveText('100 %');await page.keyboard.press('Escape');await expect(page.locator('#client-zoom-dialog')).not.toBeVisible();await expect(page.locator('#client-zoom')).toBeFocused();
 await page.locator('[data-view="flat"]').click();await page.locator('[data-open-zoom="back"]').click();await expect(page.locator('[data-zoom-side="back"]')).toHaveAttribute('aria-pressed','true');await page.locator('#zoom-close').click();
 await page.locator('#client-offer').check();await expect(page.locator('#offer-status')).toContainText('Angebotsidee aktiv');await expect(page.locator('#client-stage')).toHaveAttribute('aria-busy','false');
 const layouts=await page.evaluate(async()=>{const {createBewertungspush,applyBewertungspushOffer,renderCanvas}=await import('/tmp/pdfs/offer-check.js');const c=applyBewertungspushOffer(createBewertungspush());const results=[];for(const r of c.recipients)for(const side of ['front','back'])results.push(await renderCanvas(document.createElement('canvas'),c,side,r,{scale:3}));return results;});assert.ok(layouts.every(r=>r.length===0),JSON.stringify(layouts));
 await page.locator('#client-flat').screenshot({path:'tmp/pdfs/offer-preview.png'});
 await page.locator('#client-studio').click();const draft=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('kontaktstoff-client-draft')));assert.ok(draft.name.includes('Angebotsidee'));assert.ok(draft.sides.front.fields.some(f=>f.text.includes('Erste erfolgreiche Löschung gratis.')));
 await page.goto('http://127.0.0.1:4177/fuer/bewertungspush/#entwurf');await expect(page.locator('#client-offer')).not.toBeChecked();
 await page.setViewportSize({width:390,height:844});await page.locator('#client-zoom').click();await page.locator('#zoom-in').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const dialog=await page.locator('#client-zoom-dialog').boundingBox();assert.ok(dialog.x>=0&&dialog.x+dialog.width<=391);await page.screenshot({path:'tmp/pdfs/zoom-mobile.png'});await page.keyboard.press('Escape');
 await page.goto('http://127.0.0.1:4177/fuer/money-making-sprint/');await page.locator('#client-zoom').click();await expect(page.locator('#client-zoom-dialog')).toBeVisible();assert.equal(await page.locator('#client-offer').count(),0);assert.deepEqual(errors,[]);
 console.log('Zoom, side selection, drag, fit, focus, mobile, optional offer layout and studio handoff passed.');
}finally{await browser.close();}
