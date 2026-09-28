import test from 'node:test';
import assert from 'node:assert/strict';
import {salesLink,salesConfig,loomURL} from '../mailings/config.js';
import {salesService} from '../server/sales.js';
import {connectDB} from '../server/db.js';
test('portable sales links only allow Loom share URLs and safely round-trip company names',()=>{
 const url=salesLink({company:'A & B <Nord>',useCase:'recovery',loom:'https://www.loom.com/share/1234567890abcdef1234567890abcdef?sid=private'},'https://www.kontaktstoff.com');const parsed=salesConfig(new URL(url).searchParams);assert.equal(parsed.company,'A & B <Nord>');assert.equal(parsed.useCase,'recovery');assert.equal(parsed.loom,'https://www.loom.com/share/1234567890abcdef1234567890abcdef');
 for(const url of ['javascript:alert(1)','https://loom.com.evil.org/share/1234567890abcdef','https://example.org','https://user:pass@loom.com/share/1234567890abcdef'])assert.equal(loomURL(url),'');assert.throws(()=>salesLink({loom:'https://evil.org'},'https://www.kontaktstoff.com'));
});
test('inquiries persist idempotently, validate contact details, and revision-protect internal status',async()=>{
 const db=await connectDB({file:':memory:'});try{const s=salesService(db),input={id:crypto.randomUUID(),name:'Anna',company:'Test GmbH',email:'anna@example.org',useCase:'b2b',quantity:100,message:'Testanfrage'};
 await Promise.all([s.create(input),s.create(input)]);let list=await s.list();assert.equal(list.items.length,1);assert.equal(list.items[0].status,'new');await assert.rejects(()=>s.create({...input,message:'anderer Inhalt'}),e=>e.status===409);
 await s.update(input.id,{status:'contacted',note:'Telefonat planen',revision:1});await assert.rejects(()=>s.update(input.id,{status:'archived',revision:1}),e=>e.status===409);list=await s.list();assert.equal(list.items[0].note,'Telefonat planen');assert.equal(list.items[0].revision,2);
 for(const invalid of [{email:'bad'},{name:''},{useCase:'unknown'},{quantity:-1},{website:'javascript:alert(1)'},{website_extra:'spam'}])await assert.rejects(()=>s.create({...input,id:crypto.randomUUID(),...invalid}),e=>e.status===400);
 assert.equal((await s.list()).items.length,1);
 }finally{await db.close();}
});
