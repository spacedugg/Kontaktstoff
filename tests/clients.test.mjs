import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CLIENT_PAGES} from '../clients/catalog.js';
import {createClientCampaign} from '../studio/src/client-campaigns.js';
import {validateCampaign,checks,resolveText} from '../studio/src/core.js';
test('customer concepts round-trip through the studio and QR destinations match the proposed booking page',async()=>{
 for(const client of CLIENT_PAGES){
  const campaign=validateCampaign(JSON.parse(JSON.stringify(createClientCampaign(client.id))));
  assert.equal(campaign.templateId,client.id);assert.equal(campaign.sample,true);assert.equal(campaign.format,'a5-landscape');
  assert.deepEqual(checks(campaign).filter(c=>c.level==='error'),[]);
  for(const recipient of campaign.recipients){const url=new URL(recipient.chatbot_url);assert.equal(url.origin+url.pathname,client.target);assert.equal(url.searchParams.get('utm_medium'),'direct_mail');assert.ok(resolveText(campaign.sides.front.fields.find(f=>f.text.includes('{{first_name}}')).text,recipient).includes(recipient.first_name));}
  const html=await readFile(new URL(`../fuer/${client.id}/index.html`,import.meta.url),'utf8');assert.ok(html.includes(`data-client="${client.id}"`));assert.ok(html.includes(`/studio/?client=${client.id}`));assert.ok(html.includes('noindex,nofollow'));
 }
});
test('opening a prospect design creates independent campaigns without changing the original',()=>{
 const first=createClientCampaign('money-making-sprint'),next=createClientCampaign('money-making-sprint');assert.notEqual(first.id,next.id);first.sides.front.fields[0].text='Changed';assert.notEqual(next.sides.front.fields[0].text,'Changed');assert.throws(()=>createClientCampaign('unknown'));
});
