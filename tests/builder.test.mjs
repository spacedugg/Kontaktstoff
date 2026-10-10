import test from 'node:test';
import assert from 'node:assert/strict';
import {BRAND_TEMPLATES,createBrandTemplate,applyBrandText,recolorBrand,PREVIEW_PERSON} from '../studio/src/brand-templates.js';
import {validateCampaign,checks,uid} from '../studio/src/core.js';
import {campaignReadiness} from '../konto/src/builder-model.js';
import {defaults} from '../konto/src/model.js';
import {payload} from '../server/validation.js';
test('ten distinct editable layouts validate and resolve their fields without invented recipient records',()=>{
 assert.equal(BRAND_TEMPLATES.length,10);const signatures=new Set();
 for(const t of BRAND_TEMPLATES){const p=createBrandTemplate(t.id);assert.equal(p.recipients.length,0);validateCampaign(p);signatures.add(JSON.stringify(p.sides.front.fields.map(f=>[f.type,f.x,f.y,f.w,f.h])));p.recipients=[{id:uid(),...PREVIEW_PERSON}];assert.deepEqual(checks(p).filter(i=>i.level==='error'),[]);}
 assert.equal(signatures.size,10);
});
test('branding changes both faces while preserving personalized placeholders and uploaded logos',()=>{
 const p=createBrandTemplate('stacked-note'),before=p.sides.back.fields.find(f=>f.type==='qr').text;
 applyBrandText(p,'brand','Nordwerk');applyBrandText(p,'headline','Eine neue Idee.');recolorBrand(p,'#884422');
 assert.ok(Object.values(p.sides).every(s=>s.fields.some(f=>f.brandRole==='brand'&&f.text==='Nordwerk')));assert.equal(p.sides.back.fields.find(f=>f.type==='qr').text,before);assert.equal(p.brief.sender,'Nordwerk');
 const logo=p.sides.front.fields.find(f=>f.brandRole==='brand');logo.type='image';applyBrandText(p,'brand','Nordwerk');assert.equal(logo.type,'image');
});
test('guided submissions require postal data and resolved placeholders; research can be requested before contacts exist',()=>{
 const p=createBrandTemplate('personal-letter'),m={...defaults(),audience:'Kunden',builder:{version:1,step:3}};
 assert.ok(campaignReadiness(p,m).errors.some(e=>e.includes('Empfängerliste')));p.recipients=[{id:uid(),...PREVIEW_PERSON}];assert.ok(campaignReadiness(p,m).errors.some(e=>e.includes('Postanschrift')));
 Object.assign(p.recipients[0],{street:'Testweg 1',postal_code:'01234',city:'Teststadt',country:'Deutschland'});assert.deepEqual(campaignReadiness(p,m).errors,[]);p.sample=true;assert.ok(campaignReadiness(p,m).errors.some(e=>e.includes('Beispielkontakte')));
 p.sample=false;p.recipients=[];m.leadSource='research';m.region='Hamburg';assert.deepEqual(campaignReadiness(p,m).errors,[]);assert.equal(payload({project:p,meta:m}).meta.builder.step,3);assert.throws(()=>payload({project:p,meta:{...m,builder:{version:1,step:99}}}));
});
