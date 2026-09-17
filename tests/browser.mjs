import { chromium, expect } from '@playwright/test';
import { PDFDocument, rgb } from 'pdf-lib';
import { readFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1512,height:1050},acceptDownloads:true});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const open=()=>page.goto(process.env.STUDIO_URL||'http://127.0.0.1:4177/studio/?demo=1');
const waitCanvas=()=>page.waitForFunction(()=>document.querySelector('#design-canvas').width>500);
async function snapshot(name){await page.screenshot({path:`test-results/${name}.png`,fullPage:true});}
async function download(button){const promise=page.waitForEvent('download');await page.locator(button).click();const d=await promise;return {data:await readFile(await d.path()),name:d.suggestedFilename()};}
async function project(){return JSON.parse((await download('#project-export')).data.toString());}
try{
 await open();await waitCanvas();await expect(page.locator('#resolved')).toHaveText('Nordlicht Immobilien');
 await snapshot('studio-desktop');
 await page.locator('#active-recipient').selectOption('1');await expect(page.locator('#resolved')).toHaveText('Studio Hafenblick');
 await page.locator('#field-text').fill('Für {{company}}');await expect(page.locator('#resolved')).toHaveText('Für Studio Hafenblick');
 await page.locator('#field-x').fill('115');await page.locator('#field-x').press('Tab');
 let p=await project();assert.equal(p.sides.front.fields[0].x,115);assert.equal(p.sides.front.fields[0].text,'Für {{company}}');
 await page.locator('#undo').click();await expect(page.locator('#field-x')).toHaveValue('126.0');await page.locator('#redo').click();await expect(page.locator('#field-x')).toHaveValue('115.0');
 const field=page.locator('.field-overlay.selected');const bounds=await field.boundingBox();await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width/2+20,bounds.y+bounds.height/2+14,{steps:5});await page.mouse.up();
 p=await project();assert.ok(p.sides.front.fields[0].x>115);
 await page.locator('.field-overlay.selected').focus();await page.keyboard.press('ArrowRight');
 const after=await project();assert.equal(after.sides.front.fields[0].x,p.sides.front.fields[0].x+.5);
 await page.locator('#duplicate-field').click();await expect(page.locator('#field-count')).toHaveText('4');await page.locator('#delete-field').click();await expect(page.locator('#field-count')).toHaveText('3');
 await page.locator('[data-side="back"]').click();await expect(page.locator('#side-title')).toHaveText('Rückseite');await page.locator('[data-side="front"]').click();
 await page.locator('[data-tab="recipients"]').click();
 const csv='Firmenname;Vorname;Ansprache;Website;Chatbot-Link\nNordlicht Test;Anna;Hallo Anna,;example.org;https://example.org/chat/anna\nBergmann Test;Ben;Hallo Ben,;example.org;https://example.org/chat/ben';
 await page.locator('#csv-file').setInputFiles({name:'kontakte.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});await expect(page.locator('#modal')).toBeVisible();await page.locator('[data-result="replace"]').click();await expect(page.locator('#data-count')).toHaveText('2 Empfänger');
 await expect(page.locator('#sample-notice')).toBeHidden();
 await page.locator('[data-row="0"][data-key="company"]').fill('Nordlicht & Partner');
 await page.locator('[data-tab="design"]').click();await expect(page.locator('#resolved')).toHaveText('Für Nordlicht & Partner');
 await page.waitForTimeout(300);
 const qrPixels=await page.evaluate(()=>{const c=document.querySelector('#design-canvas');const scale=c.width/210;const data=c.getContext('2d').getImageData(Math.floor(178*scale),Math.floor(119*scale),Math.ceil(24*scale),Math.ceil(24*scale));return {data:Array.from(data.data),width:data.width,height:data.height};});
 const decoded=jsQR(new Uint8ClampedArray(qrPixels.data),qrPixels.width,qrPixels.height);assert.equal(decoded?.data,'https://example.org/chat/anna');
 await page.locator('#next-recipient').click();await page.waitForTimeout(300);
 const qr2=await page.evaluate(()=>{const c=document.querySelector('#design-canvas'),s=c.width/210,d=c.getContext('2d').getImageData(Math.floor(178*s),Math.floor(119*s),Math.ceil(24*s),Math.ceil(24*s));return{data:Array.from(d.data),width:d.width,height:d.height};});assert.equal(jsQR(new Uint8ClampedArray(qr2.data),qr2.width,qr2.height)?.data,'https://example.org/chat/ben');
 await page.locator('#open-preview').click();await expect(page.locator('#pdf-export')).toBeEnabled();await page.waitForTimeout(400);await snapshot('studio-proof');
 const exported=await download('#pdf-export');const pdf=await PDFDocument.load(exported.data);assert.equal(pdf.getPageCount(),2);assert.ok(Math.abs(pdf.getPage(0).getWidth()-210*72/25.4)<.01);assert.ok(Math.abs(pdf.getPage(0).getHeight()-148*72/25.4)<.01);
 await page.locator('[data-tab="recipients"]').click();await page.locator('[data-row="1"][data-key="chatbot_url"]').fill('javascript:alert(1)');await page.locator('[data-tab="preview"]').click();await expect(page.locator('#pdf-export')).toBeDisabled();await expect(page.locator('#check-list')).toContainText('ungültige');
 await page.locator('[data-tab="recipients"]').click();await page.locator('[data-row="1"][data-key="chatbot_url"]').fill('https://example.org/chat/ben');
 await page.locator('[data-tab="design"]').click();
 const uploaded=await PDFDocument.create();for(const color of [rgb(.96,.9,.7),rgb(.7,.9,.96)]){const pg=uploaded.addPage([595.28,419.53]);pg.drawRectangle({x:0,y:0,width:595.28,height:419.53,color});}
 await page.locator('#design-file').setInputFiles({name:'zwei-seiten.pdf',mimeType:'application/pdf',buffer:Buffer.from(await uploaded.save())});await expect(page.locator('#modal')).toBeVisible({timeout:20000});await page.locator('[data-result="ok"]').click();await expect(page.locator('#busy')).toBeHidden({timeout:30000});await expect(page.locator('#background-info')).toContainText('zwei-seiten.pdf');
 p=await project();assert.equal(p.sides.front.background.kind,'image');assert.equal(p.sides.back.background.kind,'image');assert.equal(p.sides.front.fields.length,3);
 await page.waitForTimeout(700);await page.reload();await waitCanvas();await expect(page.locator('#background-info')).toContainText('zwei-seiten.pdf');await expect(page.locator('#recipient-count')).toHaveText('2');
 const pngBuffer=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=600;c.height=420;const ctx=c.getContext('2d');ctx.fillStyle='#f0efdf';ctx.fillRect(0,0,600,420);return c.toDataURL().split(',')[1];});
 await page.locator('#design-file').setInputFiles({name:'design.png',mimeType:'image/png',buffer:Buffer.from(pngBuffer,'base64')});await expect(page.locator('#background-info')).toHaveText('design.png');
 await page.locator('#open-preview').click();await expect(page.locator('#check-list')).toContainText('Bildauflösung');
 await page.locator('[data-tab="design"]').click();
 const saved=await project();await page.locator('#project-file').setInputFiles({name:'restore.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(saved))});await expect(page.locator('#rename-campaign')).toContainText('Import');
 await page.locator('#breadcrumb-campaigns').click();await expect(page.locator('.dashboard-card')).toHaveCount(2);await page.locator('.campaign-card-content [data-dashboard-open]').first().click();
 // A malicious import is rejected and the current campaign remains intact.
 const bad=structuredClone(saved);bad.sides.front.fields[0].id='x" onclick="alert(1)';await page.locator('#project-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bad))});await expect(page.locator('#toast')).toContainText('nicht importiert');
 await page.locator('#new-campaign').click();await page.locator('[data-result="template"]').click();await expect(page.locator('#example-preview-note')).toBeVisible();await page.locator('[data-tab="design"]').click();await waitCanvas();await page.waitForTimeout(300);await snapshot('studio-desktop-final');
 await expect(page.locator('#format-select')).toHaveValue('a5-landscape');assert.equal((await project()).format,'a5-landscape');
 // Long text overflow is visible in preflight and prevents a clipped export.
 await page.locator('#field-text').fill('X'.repeat(300));await page.locator('#field-fit').uncheck();await page.locator('#open-preview').click();await expect(page.locator('#check-list')).toContainText('Textfeld');await expect(page.locator('#pdf-export')).toBeDisabled();
 await page.locator('[data-tab="design"]').click();await page.locator('#undo').click();await page.locator('#undo').click();
 for(const width of [1024,768,390]){await page.setViewportSize({width,height:900});await page.waitForTimeout(200);const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));assert.ok(dims.scroll<=dims.width+1,`Overflow at ${width}: ${dims.scroll}`);await snapshot('studio-'+width);}
 await page.setViewportSize({width:390,height:844});await page.locator('#open-preview').click();await page.waitForTimeout(300);await snapshot('studio-mobile-proof');
 assert.deepEqual(errors,[]);console.log('Browser tests passed: personalization, drag, keyboard, undo/redo, CSV, decoded recipient QR links, PDF export dimensions, invalid URL blocking, two-page PDF upload, PNG upload, persistence, project roundtrip, malicious import rejection, A5 format, text overflow and responsive layouts.');
}finally{await browser.close();}
