import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewProgress} from '../konto/src/review-project.js';
test('the project next step reflects current unresolved comments and unpublished changes',()=>{
 const r={version:2,status:'changes',events:[{id:'old',type:'comment',version:1},{id:'current',type:'comment',version:2}]};
 assert.equal(reviewProgress(r).open.length,1);assert.equal(reviewProgress(r).state,'changes');
 r.events.push({type:'resolve',commentId:'current'});assert.equal(reviewProgress(r).state,'open');
 r.status='approved';assert.equal(reviewProgress(r).state,'approved');
 r.stale=true;assert.equal(reviewProgress(r).state,'ready');
 r.status='revoked';assert.equal(reviewProgress(r).state,'revoked');
});
