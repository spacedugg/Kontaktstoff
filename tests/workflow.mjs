import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createCartCampaign} from '../studio/src/cart-campaigns.js';
import {csvString,FORMATS,createCampaign,uid,checks,validateCampaign,sideNames} from '../studio/src/core.js';
const origin='http://127.0.0.1:4183';await mkdir('test-results/workflow',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const testEmail='workflow-'+Date.now()+'@example.org';
const auth=await context.request.post(origin+'/api/auth/register',{headers:{origin},data:{email:testEmail,password:'safe-test-password-123',profile:{company:'Teststudio',name:'Anna Test'}}});assert.equal(auth.status(),201);const {csrf}=await auth.json();
const request=async(path,method='GET',data)=>{const r=await context.request.fetch(origin+'/api'+path,{method,headers:{origin,'x-csrf-token':csrf},...(data?{data}:{})});const result=await r.json();assert.ok(r.ok(),JSON.stringify(result));return result;};
try{
 // Guests can plan and persist a draft before choosing to sign in.
 const guestContext=await browser.newContext({viewport:{width:1440,height:1050}}),guest=await guestContext.newPage();
 guest.on('pageerror',e=>errors.push(e.message));
 await guest.goto(origin+'/konto/?tab=new-campaign');await guest.locator('[name=name]').fill('Mein Entwurf ohne Konto');
 await guest.locator('#wizard-form button[type=submit]').click();await expect(guest.locator('#auth-dialog')).not.toBeVisible();
 await expect(guest.locator('#wizard-form')).toContainText('Erst einmal ohne Konto.');
 await guest.getByRole('button',{name:'Entwurf anlegen ✓',exact:true}).click();await expect(guest).toHaveURL(/tab=brief/);
 await expect(guest.locator('#auth-dialog')).not.toBeVisible();await guest.reload();
 await expect(guest.locator('.request-summary h2')).toHaveText('Mein Entwurf ohne Konto');
 await guest.getByRole('button',{name:'Entwurf online speichern →',exact:true}).click();
 await expect(guest.locator('#auth-dialog')).toContainText('Ein Konto für alle deine Kampagnen');
 await guest.locator('[data-auth-close]').click();await expect(guest.locator('.request-summary h2')).toHaveText('Mein Entwurf ohne Konto');
 await guest.screenshot({path:'test-results/workflow/guest-draft.png',fullPage:true});
 await guest.getByRole('button',{name:'Entwurf online speichern →',exact:true}).click();await guest.locator('[data-auth-switch]').click();
 await guest.locator('#auth-form [name=email]').fill(testEmail);await guest.locator('#auth-form [name=password]').fill('safe-test-password-123');await guest.locator('#auth-form button').click();
 await expect(guest.locator('#notice')).toContainText('jetzt in deinem Konto gespeichert');
 assert.equal((await request('/campaigns')).campaigns.filter(c=>c.project.name==='Mein Entwurf ohne Konto').length,1);
 await guest.reload();await expect(guest.locator('.request-summary h2')).toHaveText('Mein Entwurf ohne Konto');await guestContext.close();
 await page.goto(origin+'/konto/?tab=audiences');await page.getByRole('button',{name:'+ Zielgruppe anlegen',exact:true}).click();await page.locator('[name=name]').fill('RehaSleep Checkouts');
 const rows=createCartCampaign('reha-sleep').recipients.map(r=>({...r,street:'Musterstraße 1',postal_code:'10115',city:'Berlin'}));await writeFile('test-results/workflow/contacts.csv',csvString(rows,Object.keys(rows[0]).filter(k=>!['id','company'].includes(k))));
 await page.locator('#audience-file').setInputFiles('test-results/workflow/contacts.csv');await page.locator('#csv-confirm').click();await expect(page.locator('#audience-form')).toContainText('3 Kontakte');await page.getByRole('button',{name:'Zielgruppe speichern ✓'}).click();await expect(page.locator('#notice')).toContainText('Zielgruppe gespeichert');await page.screenshot({path:'test-results/workflow/audience.png',fullPage:true});
 await page.goto(origin+'/konto/?tab=designs');await page.getByRole('button',{name:'+ Design erstellen',exact:true}).click();await page.locator('#flow-dialog [name=name]').fill('RehaSleep Freigabe');await page.locator('#flow-dialog [name=template]').selectOption('client:reha-sleep');await page.locator('#flow-dialog button[type=submit]').click();await page.waitForURL('**/studio/?design=*');await expect(page.locator('#rename-campaign')).toHaveText('RehaSleep Freigabe');
 await page.locator('#rename-campaign').click();await page.locator('#modal input').fill('RehaSleep Kartenentwurf');await page.locator('#modal [data-result=ok]').click();await expect(page.locator('#save-state')).toContainText('Im Konto gespeichert');
 await page.goto(origin+'/konto/?tab=designs');await page.getByRole('button',{name:'Zur Freigabe',exact:true}).click();await page.locator('#flow-dialog input[type=checkbox]').check();await page.locator('#flow-dialog button[type=submit]').click();await expect(page.locator('#share-url')).toBeVisible();const url=await page.locator('#share-url').inputValue();
 const publicContext=await browser.newContext({viewport:{width:1440,height:1050}}),review=await publicContext.newPage();review.on('pageerror',e=>errors.push(e.message));await review.goto(url);await expect(review.locator('[data-sheet=front] canvas')).toHaveJSProperty('width',1680);await review.locator('[data-sheet=front]').click({position:{x:80,y:70}});await review.locator('#comment-form [name=name]').fill('Kunde Test');await review.locator('#comment-form textarea').fill('Bitte das Logo größer machen.');await review.locator('#comment-form button[type=submit]').click();await expect(review.locator('.review-comment')).toContainText('Logo größer');await review.screenshot({path:'test-results/workflow/review-comment.png',fullPage:true});await expect(review.locator('#approve-form button')).toBeDisabled();
 await page.getByRole('button',{name:'Feedback aktualisieren ↻'}).click();await page.getByRole('button',{name:'Als erledigt markieren'}).click();await review.locator('#review-reload').click();await review.locator('#approve-form [name=name]').fill('Kunde Test');await review.locator('#approve-form [name=confirm]').check();await review.locator('#approve-form button').click();await expect(review.locator('#review-state')).toHaveText('Design freigegeben');
 let d=(await request('/library/designs')).items[0];d.project.name='RehaSleep Revision 2';d=await request('/library/designs/'+d.id,'PUT',d);await page.getByRole('button',{name:'Feedback aktualisieren ↻'}).click();await expect(page.locator('.banner')).toContainText('Quelldesign');await page.getByRole('button',{name:'Aktuellen Stand als neue Version teilen'}).click();await page.locator('#flow-dialog button[type=submit]').click();await expect(page.locator('.page-heading p')).toContainText('Version 2');await review.locator('#review-reload').click();await expect(review.locator('#review-state')).toHaveText('Wartet auf dein Feedback');await expect(review.locator('.review-title .eyebrow')).toContainText('VERSION 2');
 await review.setViewportSize({width:390,height:844});assert.ok(await review.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await review.screenshot({path:'test-results/workflow/review-mobile.png',fullPage:true});
 await page.goto(origin+'/konto/?tab=new-campaign');await page.locator('#wizard-form [name=name]').fill('September Rückgewinnung');await page.locator('[name=audienceId]').selectOption({index:1});await page.locator('[name=designId]').selectOption({index:1});await page.locator('#wizard-form button[type=submit]').click();await expect(page.locator('[data-proof=front]')).toBeVisible();await expect(page.locator('#wizard-checks .error')).toHaveCount(0);await page.screenshot({path:'test-results/workflow/campaign-proof.png',fullPage:true});await page.locator('#wizard-form button[type=submit]').click();await page.locator('#wizard-form button[type=submit]').click();await expect(page).toHaveURL(/tab=brief/);const campaigns=(await request('/campaigns')).campaigns;assert.equal(campaigns[0].project.recipients.length,3);assert.equal(campaigns[0].meta.goal,'purchase');
 // Start with just a name; revisit the choice step, save, and add contacts later in the editor.
 await page.goto(origin+'/konto/?tab=new-campaign');
 await expect(page.locator('#wizard-form [name=audienceId]')).not.toHaveAttribute('required','');
 await expect(page.locator('#wizard-form')).toContainText('Auch später möglich');
 await page.locator('#wizard-form [name=name]').fill('Erst mal eine Idee');
 await page.locator('#wizard-form button[type=submit]').click();
 await expect(page.locator('.flow-summary')).toContainText('Später hinzufügen');
 await page.getByRole('button',{name:'← Zurück',exact:true}).click();
 await expect(page.locator('#wizard-form [name=name]')).toHaveValue('Erst mal eine Idee');
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:'test-results/workflow/optional-draft-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:1050});
 await page.locator('#wizard-form button[type=submit]').click();await page.getByRole('button',{name:'Entwurf anlegen ✓',exact:true}).click();
 await expect(page).toHaveURL(/tab=brief/);await expect(page.getByRole('heading',{name:'Dein Entwurf ist gespeichert.'})).toBeVisible();
 const draft=(await request('/campaigns')).campaigns.find(c=>c.project.name==='Erst mal eine Idee');assert.equal(draft.project.recipients.length,0);
 await page.getByRole('link',{name:'Kontakte per CSV hinzufügen →',exact:true}).click();
 await expect(page.locator('#csv-file')).toBeAttached();await page.locator('#csv-file').setInputFiles('test-results/workflow/contacts.csv');await page.locator('#csv-confirm').click();
 await expect(page.locator('#save-state')).toContainText('Im Konto gespeichert');assert.equal((await request('/campaigns/'+draft.id)).project.recipients.length,3);
 // Each print format is a real, saved studio geometry; one-sided A4 exports one page.
 for(const format of FORMATS){const p=createCampaign(true);p.name=format.name;p.format=format.id;p.recipients=[{id:uid(),company:'Beispiel',first_name:'Anna'}];const f={id:uid(),type:'text',text:'Hallo {{first_name}}',x:10,y:10,w:100,h:20,fontSize:18,color:'#26382a',weight:'700',align:'left',background:'transparent',autoFit:true};p.sides.front.fields=[f];if(format.pages===2)p.sides.back.fields=[{...f,id:uid()}];assert.ok(validateCampaign(p));assert.equal(checks(p).filter(i=>i.level==='error').length,0);const saved=await request('/library/designs','POST',{project:p});if(format.pages===1){await page.goto(origin+'/studio/?design='+saved.id);await expect(page.locator('#dimensions')).toHaveText('210 × 297 mm');await expect(page.locator('[data-side=back]')).toBeHidden();await page.locator('#open-preview').click();const download=page.waitForEvent('download');await page.locator('#pdf-export').click();await(await download).saveAs('test-results/workflow/a4-single.pdf');}}
 await page.goto(origin+'/konto/?tab=designs');await page.screenshot({path:'test-results/workflow/designs.png',fullPage:true});await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'test-results/workflow/designs-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('CSV audience, B2C mapping, saved design editor, annotated review, approval, revision reset, campaign composition, seven formats, one-page A4 PDF and mobile layouts passed.');
}finally{await browser.close();}
