import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1512,height:1050},acceptDownloads:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function project(){const event=page.waitForEvent('download');await page.locator('#project-export').click();return JSON.parse(await readFile(await(await event).path(),'utf8'));}
async function shot(name){await page.locator('#toast').evaluate(e=>e.classList.remove('show'));await page.screenshot({path:`test-results/${name}.png`,fullPage:true});}
try{
 await page.goto(process.env.STUDIO_URL||'http://127.0.0.1:4177/studio/?demo=1');await page.waitForFunction(()=>document.querySelector('#design-canvas').width>500);
 await page.locator('#open-preview').click();await page.waitForFunction(()=>document.querySelector('#three-d-front').width>500);
 await expect(page.locator('#three-d-view')).toBeVisible();assert.equal(await page.locator('#three-d-front').evaluate(c=>c.toDataURL()),await page.locator('#proof-front').evaluate(c=>c.toDataURL()));
 await shot('3d-front');
 await page.locator('#three-d-flip').click();await expect(page.locator('#three-d-stage')).toHaveAttribute('data-face','back');await page.waitForTimeout(650);await shot('3d-back');
 const before=await page.locator('.mailing-3d-card').getAttribute('style');await page.locator('#three-d-stage').scrollIntoViewIfNeeded();let box=await page.locator('#three-d-stage').boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+70,box.y+box.height/2+30,{steps:8});await page.mouse.up();assert.notEqual(await page.locator('.mailing-3d-card').getAttribute('style'),before);
 await page.locator('#three-d-pan').click();await page.locator('#three-d-stage').scrollIntoViewIfNeeded();box=await page.locator('#three-d-stage').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+40,box.y+box.height/2+10,{steps:4});await page.mouse.up();assert.match(await page.locator('.mailing-3d-card').getAttribute('style'),/translate3d\(40px, 10px/);
 await page.locator('#three-d-plus').click();await expect(page.locator('#three-d-position')).toContainText('115 %');await page.locator('#three-d-reset').click();await expect(page.locator('#three-d-position')).toHaveText('Vorderseite · 100 %');
 await page.locator('#three-d-stage').focus();await page.keyboard.press('ArrowRight');assert.match(await page.locator('.mailing-3d-card').getAttribute('style'),/translate3d\(5px/);
 await page.locator('#preview-mode-2d').click();await expect(page.locator('#proof-spread')).toBeVisible();await expect(page.locator('#three-d-view')).toBeHidden();
 for(const width of [1024,768,390]){await page.setViewportSize({width,height:900});await page.locator('#preview-mode-3d').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Preview overflow at ${width}`);await shot(`3d-${width}`);}
 assert.deepEqual(errors,[]);console.log('3D tests passed: actual textures, flip, rotation, panning, zoom, keyboard, 2D mode and responsive preview');
}finally{await browser.close();}
