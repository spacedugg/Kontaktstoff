import test from 'node:test';
import assert from 'node:assert/strict';
import {createCampaign,validateCampaign,parseCSV,resolveText,missingKeys,checks,csvString,validURL} from '../studio/src/core.js';
test('default campaign round-trips with no blocking errors',()=>{const c=createCampaign();assert.deepEqual(validateCampaign(JSON.parse(JSON.stringify(c))),c);assert.equal(checks(c).filter(i=>i.level==='error').length,0);});
test('personalization resolves independently for every recipient',()=>{assert.equal(resolveText('Hallo {{first_name}}, {{company}}',{first_name:'Anna',company:'A & B'}),'Hallo Anna, A & B');assert.deepEqual(missingKeys('{{company}} {{chatbot_url}}',{company:'A'}),['chatbot_url']);});
test('German CSV, escaped quotes, commas and multiline values',()=>{const r=parseCSV('\uFEFFFirmenname;Vorname;Chatbot-Link;notiz\r\n"A; B";Anna;https://example.com/a;"Zeile 1\nZeile ""2"""');assert.equal(r[0].company,'A; B');assert.equal(r[0].chatbot_url,'https://example.com/a');assert.equal(r[0].notiz,'Zeile 1\nZeile "2"');const again=parseCSV(csvString(r,['company','first_name','chatbot_url','notiz']));assert.equal(again[0].notiz,r[0].notiz);});
test('CSV rejects ambiguous columns, malformed rows and prototype keys',()=>{for(const csv of ['Firma;company\na;b','company;url\na','company;__proto__\na;b','company;url\na;"oops'])assert.throws(()=>parseCSV(csv));});
test('URLs allow only explicit HTTP(S)',()=>{for(const bad of ['javascript:alert(1)','data:text/html,hi','example.com',''])assert.equal(validURL(bad),false);assert.equal(validURL('https://example.com/chat?id=1'),true);});
test('preflight reports missing data and invalid QR destinations',()=>{const c=createCampaign();c.recipients[1].chatbot_url='javascript:alert(1)';c.recipients[2].company='';const errors=checks(c).filter(i=>i.level==='error');assert.ok(errors.some(i=>i.text.includes('QR-Ziellinks')));assert.ok(errors.some(i=>i.text.includes('ohne Wert')));});
test('project import rejects executable assets, injected IDs and invalid geometry',()=>{for(const mutate of [c=>c.sides.front.background={kind:'image',data:'data:image/svg+xml;base64,AAAA',width:100,height:100},c=>c.sides.front.fields[0].id='x" onclick="alert(1)',c=>c.sides.front.fields[0].x=-1,c=>c.sides.front.fields[0].fontSize=1000,c=>c.sides.front.fields[0].color='red; background:url(x)',c=>c.recipients.push(c.recipients[0])]){const c=createCampaign();mutate(c);assert.throws(()=>validateCampaign(c));}});
test('empty campaign warns about both missing designs',()=>{const c=createCampaign(true);assert.equal(checks(c).filter(i=>i.level==='error').length,3);});

test('a blank campaign has no template or sample recipients',()=>{const c=createCampaign(true);assert.equal(c.sample,false);assert.deepEqual(c.recipients,[]);assert.deepEqual(c.sides.front.fields,[]);assert.equal(c.onboarding.step,0);assert.equal(c.onboarding.active,true);assert.deepEqual(validateCampaign(c),c);});
test('saved onboarding state and page colors are validated',()=>{const c=createCampaign(true);c.sides.front.background.color='#112233';assert.deepEqual(validateCampaign(c),c);c.onboarding.step=99;assert.throws(()=>validateCampaign(c));c.onboarding.step=2;c.sides.front.background.color='url(javascript:x)';assert.throws(()=>validateCampaign(c));});

test('editable templates have no sample contacts and survive project import', async()=>{
 const {createTemplate,TEMPLATES}=await import('../studio/src/templates.js');
 for(const template of TEMPLATES){const c=createTemplate(template.id);assert.equal(c.recipients.length,0);assert.equal(c.sample,false);assert.deepEqual(validateCampaign(c),c);assert.ok(c.sides.front.fields.some(f=>f.type==='shape'));assert.ok(c.sides.back.fields.some(f=>f.type==='qr'));}
});
test('decorative image elements reject external and executable sources',()=>{
 const c=createCampaign(true);const common={id:'test-image',type:'image',text:'',x:0,y:0,w:20,h:20,fontSize:12,weight:'400',align:'left',color:'#000000',background:'transparent',autoFit:true};
 for(const data of ['https://example.org/image.png','data:image/svg+xml;base64,PHN2Zz4=','javascript:alert(1)']){c.sides.front.fields=[{...common,data}];assert.throws(()=>validateCampaign(c));}
});
test('postal CSV aliases retain postal codes as strings and reject oversized values',()=>{
 const rows=parseCSV('Firma;Straße;PLZ;Ort;Land\nStudio;Hauptstraße 4;01067;Dresden;Deutschland');assert.equal(rows[0].postal_code,'01067');assert.equal(rows[0].street,'Hauptstraße 4');assert.equal(rows[0].city,'Dresden');assert.equal(rows[0].country,'Deutschland');assert.throws(()=>parseCSV('Firma;Ansprache\nStudio;'+ 'x'.repeat(5001)));
});
