import test from 'node:test';import assert from 'node:assert/strict';
import {PDFDocument,PDFName,decodePDFRawStream} from 'pdf-lib';
import {drawPrintArtwork} from '../studio/src/print-orientation.js';
async function sheet(format,side){
 const doc=await PDFDocument.create(),p=doc.addPage([600,720]);p.setTrimBox(9,9,582,702);p.setBleedBox(0,0,600,720);
 drawPrintArtwork(p,{format},side,PDFName.of('Mailing'));
 const saved=await PDFDocument.load(await doc.save()),page=saved.getPages()[0];
 const streams=page.node.Contents();let content='';for(let i=0;i<streams.size();i++)content+=new TextDecoder().decode(decodePDFRawStream(streams.lookup(i)).decode());
 return{page,content};
}
for(const format of ['selfmailer-maxi-4','selfmailer-dl-4'])for(const side of ['front','back'])test(`${format} ${side}: physical half turn, stable page and bleed boxes`,async()=>{
 const {page,content}=await sheet(format,side);
 assert.match(content,/^q\n-1 0 0 -1 600 720 cm\n/);assert.match(content,/600 0 0 720 0 0 cm\n\/Mailing Do/);
 assert.equal(page.getRotation().angle,0);assert.deepEqual(page.getTrimBox(),{x:9,y:9,width:582,height:702});assert.deepEqual(page.getBleedBox(),{x:0,y:0,width:600,height:720});
 if(format==='selfmailer-maxi-4'&&side==='front'){assert.equal((content.match(/ re\n/g)||[]).length,1);assert.ok(content.indexOf(' re\n')>content.indexOf('-1 0 0 -1'));}
 assert.equal((content.match(/^q$/gm)||[]).length,(content.match(/^Q$/gm)||[]).length);
});
test('ordinary postcard keeps its original print orientation',async()=>{const{content}=await sheet('a5-landscape','front');assert.doesNotMatch(content,/-1 0 0 -1/);assert.match(content,/\/Mailing Do/);});
