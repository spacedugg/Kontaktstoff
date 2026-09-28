import test from 'node:test';
import assert from 'node:assert/strict';
import {mailingScenario} from '../homepage/impact.js';
test('scenario distinguishes post-scan conversion from total mailing conversion',()=>{
 assert.deepEqual(mailingScenario(1000,5,20),{sent:1000,visitors:50,leads:10,conversion:1});
 assert.deepEqual(mailingScenario(500,10,40),{sent:500,visitors:50,leads:20,conversion:4});
});
test('scenario keeps fractional expectations until display and handles zero rates',()=>{
 assert.deepEqual(mailingScenario(100,.5,20),{sent:100,visitors:.5,leads:.1,conversion:.1});
 assert.equal(mailingScenario(1000,0,100).leads,0);assert.equal(mailingScenario(1000,100,0).leads,0);
 assert.equal(mailingScenario(1000,100,100).leads,1000);
});
test('scenario rejects invalid numbers and impossible rates',()=>{
 for(const values of [[-1,5,20],[100,101,20],[100,5,101],[NaN,5,20],[100,Infinity,20],[100,5,-1]])assert.throws(()=>mailingScenario(...values),RangeError);
});
