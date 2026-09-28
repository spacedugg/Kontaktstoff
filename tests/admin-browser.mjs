import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4183';await mkdir('test-results/admin',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/admin/');await page.locator('[name=password]').fill('wrong');await page.getByRole('button',{name:'Backend öffnen →'}).click();await expect(page.locator('#error')).toContainText('Passwort stimmt nicht');
 await page.locator('[name=password]').fill('local-admin-test-passphrase');await page.getByRole('button',{name:'Backend öffnen →'}).click();await expect(page).toHaveURL(/konto\/\?tab=campaigns/);
 await expect(page.locator('.topbar')).toContainText('Admin');await expect(page.getByRole('link',{name:'Anfragen-Eingang'})).toBeVisible();
 await page.goto(origin+'/konto/?tab=designs');await expect(page.getByRole('heading',{name:'Deine Designbibliothek.'})).toBeVisible();await page.reload();await expect(page.locator('.topbar')).toContainText('Admin');
 await page.locator('[data-action=logout]').click();await expect(page).toHaveURL(/\/admin\/$/);await expect(page.locator('#password')).toBeVisible();
 assert.equal((await(await context.request.get(origin+'/api/auth/me')).json()).user,null);
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/admin/login-mobile.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
 console.log('Admin login, incorrect password, team access, session persistence, logout and mobile layout passed.');
}finally{await browser.close();}
