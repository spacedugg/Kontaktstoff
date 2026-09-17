import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {unzipSync,strFromU8} from 'fflate';
import {PDFDocument} from 'pdf-lib';
import {createTemplate,TEMPLATES} from '../studio/src/templates.js';
import {uid} from '../studio/src/core.js';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({acceptDownloads:true,viewport:{width:1400,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const recipients=Array.from({length:3},(_,i)=>({id:uid(),company:'Unternehmen '+(i+1),first_name:'Anna',salutation:'Guten Tag Anna,',chatbot_url:'https://example.org/demo/'+i,street:'Hafenstraße 12',postal_code:'01067',city:'Dresden',country:'Deutschland'}));
async function upload(c){await page.locator('#project-file').setInputFiles({name:'kampagne.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(c))});await expect(page.locator('#rename-campaign')).toContainText('Import');}
try{
 await page.goto('http://127.0.0.1:4177/studio/');
 for(const t of TEMPLATES){const c=createTemplate(t.id);c.recipients=structuredClone(recipients);c.onboarding.active=false;await upload(c);await page.locator('#open-preview').click();await page.locator('#audit-all').click();await expect(page.locator('#audit-results')).toContainText('Alle Empfänger geprüft');await expect(page.locator('#audit-results')).not.toContainText('Fehler gefunden');if(t.id==='chattastic'){await expect(page.locator('#audit-results')).toContainText('5-mm-Sicherheitsabstands');await expect(page.locator('#audit-results')).not.toContainText('dpi.');}else await expect(page.locator('#audit-results')).toContainText('0 Hinweise');}
 await page.locator('#handoff-export').click();await page.locator('#package-from').fill('2');await page.locator('#package-to').fill('2');const event=page.waitForEvent('download');await page.locator('[data-result="export"]').click();const files=unzipSync(await readFile(await(await event).path()));const report=JSON.parse(strFromU8(files['uebergabe.json']));assert.deepEqual(report.recipientRange,[2,2]);assert.equal(report.pages.length,1);assert.equal(report.pages[0].company,'Unternehmen 2');assert.equal(report.pages[0].front,1);assert.equal((await PDFDocument.load(files['mailings-ansicht.pdf'])).getPageCount(),2);assert.equal(JSON.parse(strFromU8(files['kampagne.kontaktstoff.json'])).recipients.length,3);assert.ok(!strFromU8(files['empfaenger.csv']).includes('Unternehmen 1'));
 // A blocking error in any recipient prevents handoff, even if that row is outside the selected range.
 const broken=createTemplate('dialog');broken.onboarding.active=false;broken.recipients=structuredClone(recipients);broken.recipients[2].chatbot_url='javascript:alert(1)';await upload(broken);await page.locator('#open-preview').click();await page.locator('#handoff-export').click();await page.locator('#package-to').fill('1');await page.locator('[data-result="export"]').click();await expect(page.locator('#toast')).toContainText('offene Fehler');await expect(page.locator('#busy')).toBeHidden();
 // Cancelling a real multi-recipient render must not download a partial package.
 const large=createTemplate('chattastic');large.onboarding.active=false;large.recipients=Array.from({length:20},(_,i)=>({...recipients[0],id:uid(),company:'Kontakt '+i,chatbot_url:'https://example.org/'+i}));await upload(large);await page.locator('#open-preview').click();let downloads=0;page.on('download',()=>downloads++);await page.locator('#handoff-export').click();await page.locator('[data-result="export"]').click();await page.locator('#cancel-job').click();await expect(page.locator('#busy')).toBeHidden({timeout:20000});await expect(page.locator('#toast')).toContainText('abgebrochen');assert.equal(downloads,0);
 assert.deepEqual(errors,[]);console.log('Handoff tests passed: all three templates pass full audit, subset PDF/CSV/manifests match, full project retained, errors outside range block export, cancellation prevents partial download.');
}finally{await browser.close();}
