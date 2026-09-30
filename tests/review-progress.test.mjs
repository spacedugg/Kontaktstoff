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
test('missing sources and expired links have actionable states instead of promising a new version',()=>{
 const r={status:'open',version:1,events:[],sourceMissing:true,stale:false};
 assert.equal(reviewProgress(r).state,'archived');
 r.expiresAt=Date.now()-1000;assert.equal(reviewProgress(r).state,'expired');
});
