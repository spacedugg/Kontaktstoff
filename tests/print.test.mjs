import test from 'node:test';
import assert from 'node:assert/strict';
import {detectBleed,validateICC,preparePrintImport} from '../studio/src/print.js';
import {FORMATS} from '../studio/src/formats.js';
import {createCampaign,validateCampaign} from '../studio/src/core.js';
import {toSelfmailer} from '../studio/src/selfmailer.js';
test('print import distinguishes physical trim, bleed and incorrect panel sizes',()=>{
 const f=FORMATS[0];assert.equal(detectBleed(216,204,f),3);assert.equal(detectBleed(210,198,f),0);assert.equal(detectBleed(210,99,f),null);assert.equal(detectBleed(297,210,f),null);
});
test('ICC validator rejects RGB, truncated profiles and out-of-range tag offsets',()=>{
 const bytes=new Uint8Array(160),v=new DataView(bytes.buffer);v.setUint32(0,160);bytes.set(new TextEncoder().encode('prtr'),12);bytes.set(new TextEncoder().encode('CMYK'),16);bytes.set(new TextEncoder().encode('acsp'),36);v.setUint32(128,1);v.setUint32(136,144);v.setUint32(140,16);assert.equal(validateICC(bytes),bytes);
 const rgb=bytes.slice();rgb.set(new TextEncoder().encode('RGB '),16);assert.throws(()=>validateICC(rgb));assert.throws(()=>validateICC(bytes.slice(0,159)));v.setUint32(140,17);assert.throws(()=>validateICC(bytes));
});
test('project validation accepts explicit bleed and rejects impossible dimensions',()=>{
 const c=toSelfmailer(createCampaign());c.sides.front.background={kind:'image',data:'data:image/png;base64,AAAA',width:2551,height:2409,bleed:3};assert.equal(validateCampaign(c).sides.front.background.bleed,3);
 c.sides.front.background.bleed=20;assert.throws(()=>validateCampaign(c));c.sides.front.background.bleed=3;c.sides.front.background.width=1000;assert.throws(()=>validateCampaign(c));
});

test('PDF import exposes supplied bleed hidden by a trim-sized CropBox',async()=>{
 const {PDFDocument}=await import('pdf-lib');const doc=await PDFDocument.create(),mm=72/25.4,p=doc.addPage([216*mm,204*mm]);p.setCropBox(3*mm,3*mm,210*mm,198*mm);
 const imported=await PDFDocument.load(await preparePrintImport(await doc.save(),FORMATS[0]));assert.deepEqual(imported.getPages()[0].getCropBox(),imported.getPages()[0].getMediaBox());
});
