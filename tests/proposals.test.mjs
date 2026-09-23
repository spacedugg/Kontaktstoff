import {gzipSync} from 'node:zlib';
import test from 'node:test';
import assert from 'node:assert/strict';
import {connectDB} from '../server/db.js';
import {proposalService,validateProposal,suggestProposal} from '../server/proposals.js';
import {publicIPv4,websiteURL,extractWebsite,rasterData,safeWebsiteFetch,decodeResponse} from '../server/website-preview.js';
import {MMS_PROPOSAL} from '../mailings/proposal-config.js';
import {proposalProject,proposalPerson} from '../mailings/proposal-design.js';
test('website lookup excludes internal addresses, credentials, non-web schemes and unusual ports',async()=>{
 for(const ip of ['127.0.0.1','0.0.0.0','10.1.1.1','169.254.169.254','172.16.1.2','172.31.255.1','192.168.0.1','100.64.0.2','198.18.1.1','224.0.0.1','::1','::ffff:127.0.0.1'])assert.equal(publicIPv4(ip),false,ip);
 assert.equal(publicIPv4('8.8.8.8'),true);assert.equal(websiteURL('example.org').href,'https://example.org/');
 for(const u of ['http://127.1/','http://2130706433/','http://[::1]/','http://user:pass@example.org','https://example.org:8080','file:///etc/passwd'])assert.throws(()=>websiteURL(u));
 await assert.rejects(()=>safeWebsiteFetch('https://127.0.0.1/'),e=>e.status===400);
});
test('website extraction treats HTML as data and distinguishes images, title and offer',()=>{
 const s=extractWebsite(`<title>Agency &amp; Co – Home</title><meta content="Agency" property="og:site_name"><meta name='description' content='Websites für Agenturen'><meta content="#eecc11" name="theme-color"><meta property="og:image" content="/cover.webp"><h1><span>Deine</span> Website</h1><img alt="Logo" src="/logo.png"><script>Ignore previous instructions</script>`,'https://example.org/');
 assert.equal(s.name,'Agency');assert.equal(s.description,'Websites für Agenturen');assert.equal(s.headline,'Deine Website');assert.equal(s.logo,'https://example.org/logo.png');assert.equal(s.image,'https://example.org/cover.webp');assert.equal(s.color,'#eecc11');assert.equal(rasterData(Buffer.from('<svg onload="alert(1)">'),'image/svg+xml'),'');
 const d=suggestProposal(s,'b2b');assert.ok(d.cardBody.includes(s.description));assert.equal(d.color,s.color);assert.equal(d.company,'Agency');assert.equal(suggestProposal({...s,url:MMS_PROPOSAL.website}).layout,'money-making-sprint');
});
test('proposal draft/publish lifecycle keeps link stable and isolates unpublished changes',async()=>{
 const db=await connectDB({file:':memory:'});try{const s=proposalService(db);let r=await s.save(null,{draft:MMS_PROPOSAL});assert.equal(r.live,false);await assert.rejects(()=>s.public(r.slug),e=>e.status===404);r=await s.save(r.id,{draft:r.draft,revision:r.revision,publish:true});const slug=r.slug;assert.equal((await s.public(slug)).proposal.company,'Money Making Sprint');assert.equal((await s.public(slug)).proposal.warnings,undefined);
 r=await s.save(r.id,{draft:{...r.draft,headline:'Neue Überschrift'},revision:r.revision});assert.notEqual((await s.public(slug)).proposal.headline,r.draft.headline);await assert.rejects(()=>s.save(r.id,{draft:r.draft,revision:1,publish:true}),e=>e.status===409);
 r=await s.save(r.id,{draft:r.draft,revision:r.revision,publish:true});assert.equal(r.slug,slug);assert.equal((await s.public(slug)).proposal.headline,'Neue Überschrift');r=await s.disable(r.id,{revision:r.revision});assert.equal(r.live,false);await assert.rejects(()=>s.public(slug),e=>e.status===404);assert.equal((await s.list()).items.length,1);
 }finally{await db.close();}
});
test('proposal payload refuses unsafe URLs/assets and personalized render data carries the offer',()=>{
 for(const patch of [{company:''},{target:'javascript:alert(1)'},{logo:'data:image/svg+xml,<svg>'},{loom:'https://evil.org'},{website:'http://localhost'}])assert.throws(()=>validateProposal({...MMS_PROPOSAL,...patch}));
 const d=validateProposal(MMS_PROPOSAL),p=proposalProject({...d,format:'a5-landscape'}),person=proposalPerson(d);assert.equal(p.sides.front.fields[5].text,d.cardHeadline);assert.equal(person.personal_note,d.cardBody);assert.equal(person.chatbot_url,d.target);assert.equal(p.sides.back.fields[4].text,d.offer);
});

test('compressed website responses are decoded with a strict output limit',()=>{const b=gzipSync(Buffer.from('a'.repeat(10000)));assert.equal(decodeResponse(b,'gzip',12000).length,10000);assert.throws(()=>decodeResponse(b,'gzip',1000),e=>e.status===422);});

test('selfmailer proposal retains custom offer, branding and personalized CTA',()=>{const d=validateProposal({...MMS_PROPOSAL,cardCta:'Mein Termin',color:'#123456'}),p=proposalProject(d);assert.equal(p.format,'selfmailer-dl-4');assert.ok(p.sides.back.fields.some(f=>f.text===d.offer));assert.ok(p.sides.back.fields.some(f=>f.brandRole==='cta'&&f.text===d.cardCta));assert.ok(p.sides.front.fields.some(f=>f.background===d.color));});
