import test from 'node:test';import assert from 'node:assert/strict';
import {designEntries,designStatus} from '../konto/src/design-workspace.js';
import {tiltFold,turnFold} from '../studio/src/fold-navigation.js';
import {styleRehaGiftCard,alignRehaGiftCard} from '../studio/src/reha-gift-card.js';
import {toPFSSelfmailer} from '../studio/src/pfs-selfmailer.js';
import {createCampaign} from '../studio/src/core.js';
test('design workspace matches source IDs and keeps campaign feedback reachable',()=>{
 const r={id:'r',sourceKind:'designs',sourceId:'d',events:[],version:1,status:'approved',stale:true};
 const items=designEntries([{id:'d',name:'Same name'},{id:'other',name:'Same name'}],[r,{id:'legacy',sourceKind:'campaigns',sourceId:'c',title:'Legacy',project:{}}]);
 assert.equal(items[0].review.id,'r');assert.equal(items[1].review,undefined);assert.equal(items[2].kind,'campaigns');assert.equal(designStatus(r).state,'ready');assert.equal(designStatus().state,'draft');
 const orphan=designEntries([], [r])[0];assert.equal(orphan.kind,'archived');assert.equal(orphan.review.id,'r');
});
test('fold gestures cannot turn the reading face upside down; explicit flip changes side',()=>{
 let s={x:-12,y:-24};for(let i=0;i<100;i++)s=tiltFold(s,100,100);
 assert.deepEqual(s,{x:35,y:55});s={x:turnFold(s.x),y:0};assert.equal(s.x,180);
 for(let i=0;i<100;i++)s=tiltFold(s,-100,-100);assert.deepEqual(s,{x:145,y:-55});assert.equal(turnFold(s.x),360);
});
test('coupon code stays inside white artwork inset after PFS aspect ratio conversion',()=>{
 const base=createCampaign();base.format='selfmailer-dl-4';base.sides.back.fields=[];
 const p=toPFSSelfmailer(styleRehaGiftCard(base)),fields=p.sides.back.fields,art=fields.find(f=>f.brandRole==='decoration'),code=fields.find(f=>f.text==='Schlaf30');
 const k=Math.min(art.w/1060,art.h/1600),top=art.y+(art.h-1600*k)/2,left=art.x+(art.w-1060*k)/2;
 assert.ok(code.y>=top+1150*k);assert.ok(code.y+code.h<=top+1435*k);assert.ok(code.x>=left+140*k);assert.ok(code.x+code.w<=left+920*k);
 assert.deepEqual(alignRehaGiftCard(p),p);
});

test('campaign sharing resolves exact source IDs and never matches another campaign by name',async()=>{
 const {campaignReview}=await import('../konto/src/campaign-sharing.js');
 const reviews=[{id:'design-review',sourceKind:'designs',sourceId:'design-a'},{id:'campaign-review',sourceKind:'campaigns',sourceId:'campaign-a'}];
 const c={id:'campaign-a',meta:{designId:'design-a'}};assert.equal(campaignReview(c,reviews).id,'campaign-review');
 c.meta.builder={version:1};assert.equal(campaignReview(c,reviews).id,'campaign-review');
 c.id='unrelated';assert.equal(campaignReview(c,reviews).id,'design-review');c.meta.designId='another-design';assert.equal(campaignReview(c,reviews),null);
});
test('ZYVO PFS cover fills its panel without modifying logos, recipients or archived DIN-lang artwork',async()=>{
 const {fillZyvoCover}=await import('../studio/src/zyvo-panel.js');
 const p={format:'selfmailer-maxi-4',selfmailer:{design:'zyvo-lifestyle-comeback'},recipients:[{id:'one'}],sides:{front:{fields:[{type:'image',brandRole:'artwork',y:125,w:235,fit:'contain'},{type:'image',brandRole:'brand',y:130,w:30,fit:'contain'}]}}};
 const fixed=fillZyvoCover(p);assert.equal(fixed.sides.front.fields[0].fit,'cover');assert.equal(fixed.sides.front.fields[1].fit,'contain');assert.deepEqual(fixed.recipients,p.recipients);assert.equal(p.sides.front.fields[0].fit,'contain');
 p.format='selfmailer-dl-4';assert.deepEqual(fillZyvoCover(p),p);
});
