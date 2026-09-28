import test from 'node:test';
import assert from 'node:assert/strict';
import {toSelfmailer} from '../studio/src/selfmailer.js';
import {FORMATS,POSTAL_ZONES} from '../studio/src/formats.js';
import {createClientCampaign,CLIENT_CAMPAIGNS} from '../studio/src/client-campaigns.js';
import {createBrandTemplate,BRAND_TEMPLATES} from '../studio/src/brand-templates.js';
import {createPromotion,PROMOTIONS} from '../studio/src/promotions.js';
import {validateCampaign,checks,resolveField} from '../studio/src/core.js';
const cases=[...CLIENT_CAMPAIGNS.map(t=>[t.id,()=>createClientCampaign(t.id)]),...BRAND_TEMPLATES.map(t=>[t.id,()=>createBrandTemplate(t.id)]),...PROMOTIONS.map(t=>[t.id,()=>createPromotion(t.id)])];
for(const [name,make] of cases)test('selfmailer: '+name+' keeps recipients, editable fields and postal geometry',()=>{
 const original=make(),before=JSON.stringify(original),p=toSelfmailer(original);
 assert.equal(JSON.stringify(original),before);assert.deepEqual(p.recipients,original.recipients);assert.equal(p.format,'selfmailer-dl-4');validateCampaign(p);
 assert.ok(p.sides.front.fields.some(f=>f.postalAddress));assert.ok(p.sides.back.fields.some(f=>f.type==='qr'));
 assert.equal(checks(p).filter(i=>i.text.includes('überlagert')).length,0);
 assert.deepEqual(toSelfmailer(p),p);
 if(['reha-sleep','zyvo'].includes(name)){assert.ok(p.sides.front.fields.some(f=>f.variantKey==='product_id'));assert.equal(p.sides.back.fields.find(f=>f.type==='qr').text,'{{cart_url}}');}
});
test('exact 4-panel print geometry; postal collisions fail preflight',()=>{
 const f=FORMATS.find(f=>f.id==='selfmailer-dl-4');assert.deepEqual([f.width,f.height,f.closedWidth,f.closedHeight,f.bleed,f.pages,f.panels],[210,198,210,99,3,2,4]);
 const p=toSelfmailer(createClientCampaign('money-making-sprint'));
 const field=p.sides.front.fields.find(f=>f.type==='text'&&!f.postalAddress);field.x=140;field.y=8;field.w=40;
 assert.ok(checks(p).some(i=>i.level==='error'&&i.text.includes('Frankierung')));
});

test('postal name is optional for a company address and address edits are rendered',()=>{const c=toSelfmailer(createClientCampaign('money-making-sprint'));assert.equal(checks(c).filter(i=>i.level==='error').length,0);const f=c.sides.front.fields.find(f=>f.postalAddress);assert.equal(resolveField(f,{company:'Anna Beispiel',first_name:'Anna',last_name:'Beispiel',street:'Weg 1',postal_code:'12345',city:'Musterstadt'}),'Anna Beispiel\nWeg 1\n12345 Musterstadt');f.text='{{company}}\nZu Händen {{first_name}}\n{{street}}';assert.equal(resolveField(f,{company:'Studio',first_name:'Anna',street:'Weg 2'}),'Studio\nZu Händen Anna\nWeg 2');});

test('BewertungsPush DIN-lang keeps rating placeholders and the personal QR editable',()=>{
 const source=createClientCampaign('bewertungspush');for(const r of source.recipients)Object.assign(r,{street:'Musterstraße 1',postal_code:'10115',city:'Berlin'});source.recipients[0].rating_current='3,8';source.recipients[0].rating_example='4,5';source.recipients[0].personal_note='Eine individuelle Nachricht.';
 const p=toSelfmailer(source);assert.deepEqual(p.recipients,source.recipients);assert.equal(p.selfmailer.design,'bewertungspush-editorial');
 for(const key of ['rating_current','rating_example']){assert.ok(p.sides.front.fields.some(f=>f.type==='text'&&f.display==='stars'&&f.text==='{{'+key+'}}'));assert.ok(p.sides.front.fields.some(f=>!f.display&&f.text==='{{'+key+'}}'));}
 assert.ok(p.sides.back.fields.some(f=>f.text==='{{personal_note}}'));assert.equal(p.sides.back.fields.find(f=>f.type==='qr').text,'{{chatbot_url}}');
 assert.equal(checks(p).filter(i=>i.level==='error').length,0);
});
