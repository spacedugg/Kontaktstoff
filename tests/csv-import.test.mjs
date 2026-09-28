import test from 'node:test';
import assert from 'node:assert/strict';
import {readCSVTable,guessMapping,mappedRecipients} from '../studio/src/csv-import.js';
const keys=['company','first_name','salutation','personal_note','chatbot_url','postal_code'];
test('CSV mapping accepts CRM headers, multiline quotes and keeps leading postal zeros',()=>{
 const t=readCSVTable('\ufeffAccount Name;First Name;Nachricht;QR Link;PLZ\r\n"Studio; Nord";Anna;"Hallo,\nmit \\"Idee\\"";https://example.org/a;01067'.replaceAll('\\"','""'));
 const m=guessMapping(t.headers,keys),{recipients}=mappedRecipients(t,m);assert.equal(recipients[0].company,'Studio; Nord');assert.equal(recipients[0].salutation,'Hallo Anna,');assert.equal(recipients[0].postal_code,'01067');assert.match(recipients[0].personal_note,/Hallo,\nmit "Idee"/);
});
test('unfamiliar columns can be mapped by index; common links do not replace personal links',()=>{
 const t=readCSVTable('Customer,Contact,Destination\nAcme,Jo,https://example.org/jo\nOther,Kim,');const r=mappedRecipients(t,{company:0,first_name:1,chatbot_url:2},{fallbackURL:'https://example.org/general'});assert.equal(r.recipients[0].chatbot_url,'https://example.org/jo');assert.equal(r.recipients[1].chatbot_url,'https://example.org/general');assert.equal(r.missingLinks,0);assert.throws(()=>mappedRecipients(t,{company:-1}));
});
test('bad cells, unmatched quotes, missing companies and unsafe links remain visible',()=>{
 assert.throws(()=>readCSVTable('Firma,Name\n"Broken,A'));assert.throws(()=>readCSVTable('Firma,Name\nAcme,A,extra'));
 const t=readCSVTable('Firma\tVorname\tLink\nAcme\tAnna\tjavascript:alert(1)');assert.equal(mappedRecipients(t,guessMapping(t.headers,keys)).invalidLinks,1);
 assert.throws(()=>mappedRecipients(readCSVTable('Firma;Name\n;Anna'),{company:0}));assert.throws(()=>mappedRecipients(t,{company:0},{fallbackURL:'javascript:alert(1)'}));
});
