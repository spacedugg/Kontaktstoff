import test from 'node:test';import assert from 'node:assert/strict';
import {pointOnQuad,faceToSpread,spreadToFace} from '../studio/src/fold-coordinates.js';
test('perspective picking maps projected points back onto the printed surface',()=>{
 const project=(u,v)=>({x:(260*u+30*v+80)/(.3*u+.1*v+1),y:(40*u+180*v+60)/(.3*u+.1*v+1)}),quad=[[0,0],[1,0],[1,1],[0,1]].map(([u,v])=>project(u,v));
 for(const [u,v] of [[0,0],[1,1],[.2,.8],[.75,.3]]){const p=project(u,v),r=pointOnQuad(quad,p.x,p.y);assert.ok(Math.abs(r.x-u)<1e-8);assert.ok(Math.abs(r.y-v)<1e-8);}
 assert.equal(pointOnQuad(quad,-100,-100),null);assert.equal(pointOnQuad(Array(4).fill({x:0,y:0}),0,0),null);
});
test('four paper faces map to stable outside/inside coordinates, including the bottom edge',()=>{for(const face of ['cover','postal','inside-top','inside-bottom'])for(const y of [.2,.8]){const p=faceToSpread(face,{x:.4,y});const r=spreadToFace(p);assert.equal(r.face,face);assert.ok(Math.abs(r.y-y)<1e-8);}assert.equal(spreadToFace({side:'back',x:1,y:1}).y,1);});
