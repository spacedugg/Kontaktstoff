import test from 'node:test';
import assert from 'node:assert/strict';
import {ratingValue,validateCampaign,checks,KEYS} from '../studio/src/core.js';
import {createBewertungspush} from '../studio/src/bewertungspush.js';
import {guessMapping,readCSVTable,mappedRecipients} from '../studio/src/csv-import.js';
test('ratings accept German and decimal values but reject absent or impossible ratings',()=>{
 assert.equal(ratingValue('4,2'),4.2);assert.equal(ratingValue('4.7'),4.7);assert.equal(ratingValue('0'),0);assert.equal(ratingValue('5'),5);
 for(const input of ['',null,'5.1','-1','4 stars','Infinity','{{rating_current}}'])assert.equal(ratingValue(input),null);
 const c=createBewertungspush();assert.equal(validateCampaign(c).sides.front.fields.filter(f=>f.display==='stars').length,2);c.recipients[0].rating_current='9';assert.ok(checks(c).some(c=>c.level==='error'&&c.text.includes('Sterne')));
});
test('CSV ratings remain individual recipient fields through import and project validation',()=>{
 const table=readCSVTable('company;rating_current;rating_example\nHotel A;4,2;4,7\nHotel B;3,9;4,4');const {recipients}=mappedRecipients(table,guessMapping(table.headers,Object.keys(KEYS)));assert.equal(recipients[0].rating_current,'4,2');assert.equal(recipients[1].rating_example,'4,4');const c=createBewertungspush();c.recipients=recipients;assert.equal(validateCampaign(c).recipients[1].rating_current,'3,9');
});
