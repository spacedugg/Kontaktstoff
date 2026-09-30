import test from 'node:test';import assert from 'node:assert/strict';
import {bleedRect,imageFrame} from '../studio/src/bleed.js';
const format={width:235,height:250};
test('cover artwork extends through outer trim but never across the fold',()=>{
 assert.deepEqual(imageFrame({x:0,y:125,w:235,h:125,fit:'cover'},format),{x:-3,y:125,w:241,h:128});
 assert.deepEqual(bleedRect({x:0,y:0,w:235,h:125},format),{x:-3,y:-3,w:241,h:128});
});
test('inset pictures, contained logos and existing larger bleed retain placement',()=>{
 const inset={x:12,y:14,w:60,h:40,fit:'cover'};assert.deepEqual(imageFrame(inset,format),{x:12,y:14,w:60,h:40});
 const logo={x:0,y:0,w:35,h:12,fit:'contain'};assert.equal(imageFrame(logo,format),logo);
 assert.deepEqual(bleedRect({x:-5,y:-5,w:245,h:260},format),{x:-5,y:-5,w:245,h:260});
});
test('postal areas continue into right bleed without moving their inner boundaries',()=>{
 assert.deepEqual(bleedRect({x:151.6368,y:60,w:83.3632,h:50},format),{x:151.6368,y:60,w:86.3632,h:50});
});
