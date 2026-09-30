import test from 'node:test';import assert from 'node:assert/strict';
import {toPFSSelfmailer} from '../studio/src/pfs-selfmailer.js';
import {FORMATS,PFS_FORMAT_ID,PFS_SEPARATOR,postalZones,pfsAddress} from '../studio/src/formats.js';
import {validateCampaign,checks} from '../studio/src/core.js';
import {createClientCampaign,CLIENT_CAMPAIGNS} from '../studio/src/client-campaigns.js';
import {limitPFSInk,detectBleed} from '../studio/src/print.js';
test('PFS physical dimensions and postal areas match the supplied Full-Service template',()=>{
 const f=FORMATS.find(f=>f.id===PFS_FORMAT_ID);assert.deepEqual([f.width,f.height,f.closedWidth,f.closedHeight,f.foldY,f.bleed],[235,250,235,125,125,3]);assert.equal(detectBleed(241,256,f),3);assert.equal(detectBleed(216,204,f),null);
 const zones=postalZones({format:f.id});assert.deepEqual(zones.find(z=>z.id==='coding'),{id:'coding',name:'Codierzone · 150 × 15 mm',x:85,y:110,w:150,h:15});assert.equal(PFS_SEPARATOR.w,1.2);const quiet=zones.find(z=>z.id==='separator');assert.equal(PFS_SEPARATOR.x-quiet.x,5);assert.equal(PFS_SEPARATOR.y-quiet.y,5);
});
for(const {id} of CLIENT_CAMPAIGNS)test('PFS reflow preserves '+id+' data and produces safe editable fields',()=>{const original=createClientCampaign(id),before=structuredClone(original),p=toPFSSelfmailer(original);validateCampaign(p);assert.deepEqual(original,before);assert.deepEqual(p.recipients,original.recipients);assert.deepEqual(toPFSSelfmailer(p),p);assert.equal(checks(p).filter(i=>i.text.includes('überlagert')||i.text.includes('Sicherheitsabstand')&&i.level==='error').length,0);});
test('PFS limits postal line length and does not guess salutation or gender',()=>{assert.deepEqual(pfsAddress({first_name:'Anna',last_name:'Berger',street:'Weg 1',postal_code:'12345',city:'Berlin'}),['','Anna Berger','Weg 1','12345 Berlin']);const p=toPFSSelfmailer(createClientCampaign('reha-sleep'));p.recipients[0].postal_salutation='a'.repeat(29);assert.ok(checks(p).some(i=>i.level==='error'&&i.text.includes('28 Zeichen')));});
test('PFS color limits preserve white and pure black, reject faint and excessive coverage',()=>{const bytes=new Uint8Array([0,0,0,0,1,2,3,4,255,255,255,255,0,0,0,255,26,0,0,0]);limitPFSInk(bytes);assert.deepEqual([...bytes.slice(0,8)],Array(8).fill(0));assert.ok(bytes.slice(8,12).reduce((a,b)=>a+b,0)<=765);assert.deepEqual([...bytes.slice(12)],[0,0,0,255,26,0,0,0]);});
