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
 await page.goto(process.env.STUDIO_URL||'http://127.0.0.1:4177/studio/');await page.waitForFunction(()=>document.querySelector('#design-canvas').width>500);
 await page.locator('#open-preview').click();await page.waitForFunction(()=>document.querySelector('#three-d-front').width>500);
 await expect(page.locator('#three-d-view')).toBeVisible();assert.equal(await page.locator('#three-d-front').evaluate(c=>c.toDataURL()),await page.locator('#proof-front').evaluate(c=>c.toDataURL()));
 await shot('3d-front');
 await page.locator('#three-d-flip').click();await expect(page.locator('#three-d-stage')).toHaveAttribute('data-face','back');await page.waitForTimeout(650);await shot('3d-back');
 const before=await page.locator('.mailing-3d-card').getAttribute('style');const box=await page.locator('#three-d-stage').boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+70,box.y+box.height/2+30,{steps:8});await page.mouse.up();assert.notEqual(await page.locator('.mailing-3d-card').getAttribute('style'),before);
 await page.locator('#three-d-pan').click();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+40,box.y+box.height/2+10,{steps:4});await page.mouse.up();assert.match(await page.locator('.mailing-3d-card').getAttribute('style'),/translate3d\(40px, 10px/);
 await page.locator('#three-d-plus').click();await expect(page.locator('#three-d-position')).toContainText('115 %');await page.locator('#three-d-reset').click();await expect(page.locator('#three-d-position')).toHaveText('Vorderseite · 100 %');
 await page.locator('#three-d-stage').focus();await page.keyboard.press('ArrowRight');assert.match(await page.locator('.mailing-3d-card').getAttribute('style'),/translate3d\(5px/);
 await page.locator('#preview-mode-2d').click();await expect(page.locator('#proof-spread')).toBeVisible();await expect(page.locator('#three-d-view')).toBeHidden();
 await page.locator('#new-campaign-top').click();await page.locator('[data-result="blank"]').click();await expect(page.locator('#setup-view')).toBeVisible();
 let c=await project();assert.equal(c.recipients.length,0);assert.equal(c.sample,false);assert.equal(c.sides.front.background.kind,'blank');assert.equal(c.sides.front.fields.length,0);
 await page.locator('#setup-name').fill('Hotelkampagne Herbst');await page.locator('[data-brief="sender"]').fill('Meine Agentur');await page.locator('[data-brief="audience"]').fill('Hotels in Hamburg');await page.locator('[data-brief="offer"]').fill('Wir beantworten Gästefragen rund um die Uhr.');await shot('guide-step-1');
 await page.locator('[data-guide-action="next"]').click();await expect(page.locator('#setup-view')).toContainText('Wir starten mit DIN A5');await page.locator('[data-guide-action="next"]').click();await expect(page.locator('#setup-view')).toContainText('Gib deinem Mailing ein Gesicht');await shot('guide-step-3');
 await page.waitForTimeout(500);await page.reload();await expect(page.locator('#setup-view')).toBeVisible();await expect(page.locator('#setup-view')).toContainText('Gib deinem Mailing ein Gesicht');
 await page.locator('[data-guide-action="edit-front"]').click();await expect(page.locator('#design-view')).toBeVisible();await expect(page.locator('#guide-return')).toBeVisible();
 await page.locator('#page-color').fill('#203522');await page.locator('[data-add="text"]').click();await page.locator('#field-text').fill('Ein guter erster Eindruck.');await page.locator('#field-color').fill('#ffffff');await page.locator('#back-to-guide').click();await expect(page.locator('#setup-view')).toContainText('1 eigene Elemente');
 await page.locator('[data-guide-action="edit-back"]').click();await page.locator('[data-add="text"]').click();await page.locator('#field-text').fill('Lernen Sie uns kennen.');await page.locator('#back-to-guide').click();
 await page.locator('[data-guide-action="next"]').click();await expect(page.locator('#setup-view')).toContainText('Was soll sich je Empfänger ändern');await page.locator('[data-guide-action="field-company"]').click();await page.locator('#guide-field-side').selectOption('back');await page.locator('[data-guide-action="field-qr"]').click();await expect(page.locator('#guide-field-side')).toHaveValue('back');await shot('guide-step-4');
 await page.locator('[data-guide-action="next"]').click();await page.locator('[name="company"]').fill('Hotel Nordlicht');await page.locator('[name="first_name"]').fill('Anna');await page.locator('[name="chatbot_url"]').fill('https://example.org/hotel-demo');await page.locator('#guide-recipient-form [type="submit"]').click();await expect(page.locator('#setup-view')).toContainText('1 Empfänger vorhanden');await shot('guide-step-5');
 await page.locator('[data-guide-action="next"]').click();await expect(page.locator('#setup-view')).toContainText('Einmal drehen');await shot('guide-step-6');await page.locator('[data-guide-action="three-d"]').click();await expect(page.locator('#three-d-view')).toBeVisible();await page.waitForTimeout(500);
 c=await project();assert.equal(c.brief.sender,'Meine Agentur');assert.equal(c.recipients[0].salutation,'Hallo Anna,');assert.equal(c.sides.front.background.color,'#203522');assert.equal(c.sides.back.fields.filter(f=>f.type==='qr').length,1);assert.equal(c.sides.front.fields.filter(f=>f.text==='{{company}}').length,1);
 await page.locator('#back-to-guide').click();await page.locator('[data-guide-action="finish"]').click();await expect(page.locator('#guide-return')).toBeHidden();assert.equal((await project()).onboarding.active,false);
 await page.locator('#breadcrumb-campaigns').click();await expect(page.locator('.campaign-item')).toHaveCount(2);await page.locator('[data-result="cancel"]').click();
 // Persisted guide remains accessible even after completion.
 await page.locator('[data-tab="setup"]').click();await expect(page.locator('#setup-view')).toBeVisible();await page.locator('[data-guide-step="0"]').click();await expect(page.locator('#setup-name')).toHaveValue('Hotelkampagne Herbst');
 for(const width of [1024,768,390]){await page.setViewportSize({width,height:900});await page.waitForTimeout(150);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Guide overflow at ${width}`);await shot(`guide-${width}`);}
 await page.locator('[data-guide-step="5"]').click();await page.locator('[data-guide-action="three-d"]').click();await page.waitForTimeout(500);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot('3d-mobile');
 assert.deepEqual(errors,[]);console.log('3D and guide tests passed: both actual textures, flip, rotation, panning, zoom, keyboard, truly blank creation, briefing, resume after reload, two-sided scratch design, guide navigation, personalization, first recipient, completion, campaign preservation and responsive layouts.');
}finally{await browser.close();}
