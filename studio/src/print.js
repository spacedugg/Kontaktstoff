import {PDFDocument,PDFName,PDFString,pushGraphicsState,popGraphicsState,scale,drawObject} from 'pdf-lib';
import {FORMATS,checks,sideNames} from './core.js';
import {renderCanvas,imageFrom} from './render.js';
import {sideLabel} from './formats.js';
const mm=72/25.4;
export const PRINT_DPI=300;
export function detectBleed(widthMM,heightMM,format){
 const near=(a,b)=>Math.abs(a-b)<.6;
 if(near(widthMM,format.width+6)&&near(heightMM,format.height+6))return 3;
 if(near(widthMM,format.width)&&near(heightMM,format.height))return 0;
 return null;
}
// A printer PDF may hide bleed via CropBox while retaining it in MediaBox.
// Expose that supplied artwork before PDF.js rasterizes the page.
export async function preparePrintImport(bytes,format){
 if(format.id!=='selfmailer-dl-4')return bytes;
 const doc=await PDFDocument.load(bytes);let changed=false;
 for(const page of doc.getPages()){
  const box=page.getMediaBox(),rotated=Math.abs(page.getRotation().angle)%180===90;
  const width=(rotated?box.height:box.width)/mm,height=(rotated?box.width:box.height)/mm;
  if(detectBleed(width,height,format)===3){page.setCropBox(box.x,box.y,box.width,box.height);changed=true;}
 }
 return changed?await doc.save():bytes;
}
export function validateICC(bytes){
 if(!(bytes instanceof Uint8Array)||bytes.length<132||bytes.length>10*1024*1024)throw new Error('Bitte ein ICC-Druckprofil bis 10 MB wählen.');
 const sig=(n)=>String.fromCharCode(...bytes.slice(n,n+4));
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),size=view.getUint32(0),count=view.getUint32(128);
 if(sig(36)!=='acsp'||sig(16)!=='CMYK'||sig(12)!=='prtr'||size!==bytes.length||count>4096||132+count*12>size)throw new Error('Das ist kein gültiges CMYK-Ausgabeprofil. Bitte das ICC-Profil der Druckerei verwenden.');
 for(let i=0;i<count;i++){const start=view.getUint32(136+i*12),len=view.getUint32(140+i*12);if(start>size||len>size-start)throw new Error('Das ICC-Profil ist beschädigt.');}
 return bytes;
}
export async function printWarnings(campaign){
 const f=FORMATS.find(f=>f.id===campaign.format),warnings=[];
 for(const side of sideNames(campaign)){
  const {background:bg,fields}=campaign.sides[side],label=sideLabel(campaign,side);
  if(bg.kind==='image'){
   const bleed=bg.bleed||0,dpi=Math.min(bg.width/(f.width+2*bleed),bg.height/(f.height+2*bleed))*25.4;
   if(dpi<299)warnings.push(`${label}: Hintergrund nur ${Math.round(dpi)} dpi.`);
  }
  for(const field of fields.filter(f=>f.type==='image'))for(const data of new Set([field.data,...Object.values(field.variants||{})])){
   const img=await imageFrom(data),dpi=(field.fit==='cover'?Math.min:Math.max)(img.width/field.w,img.height/field.h)*25.4;
   if(dpi<299){warnings.push(`${label}: Bildelement nur ${Math.round(dpi)} dpi.`);break;}
  }
 }
 return [...new Set(warnings)];
}
export async function renderPrintCanvas(campaign,side,person,{dpi=PRINT_DPI}={}){
 const f=FORMATS.find(f=>f.id===campaign.format),factor=dpi/25.4,b=3;
 const trim=document.createElement('canvas'),overflow=await renderCanvas(trim,campaign,side,person,{scale:factor});
 if(overflow.length)throw new Error(`${sideLabel(campaign,side)}: Text passt nicht ins Feld. Bitte vor dem Druck korrigieren.`);
 const out=document.createElement('canvas');out.width=Math.round((f.width+2*b)*factor);out.height=Math.round((f.height+2*b)*factor);
 const ctx=out.getContext('2d'),x=Math.round(b*factor),y=x,w=out.width-2*x,h=out.height-2*y;
 ctx.imageSmoothingEnabled=false;
 // Extend only outer pixels; never scale the complete design to include bleed.
 for(const [sx,sy,sw,sh,dx,dy,dw,dh] of [[0,0,1,1,0,0,x,y],[trim.width-1,0,1,1,x+w,0,x,y],[0,trim.height-1,1,1,0,y+h,x,y],[trim.width-1,trim.height-1,1,1,x+w,y+h,x,y],[0,0,trim.width,1,x,0,w,y],[0,trim.height-1,trim.width,1,x,y+h,w,y],[0,0,1,trim.height,0,y,x,h],[trim.width-1,0,1,trim.height,x+w,y,x,h]])ctx.drawImage(trim,sx,sy,sw,sh,dx,dy,dw,dh);
 const bg=campaign.sides[side].background;
 if(bg.kind==='image'&&bg.bleed===3){const image=await imageFrom(bg.data);ctx.drawImage(image,0,0,out.width,out.height);}
 ctx.drawImage(trim,0,0,trim.width,trim.height,x,y,w,h);trim.width=trim.height=1;
 return out;
}
export async function createPrintPDF(campaign,{profile,people=campaign.recipients,onProgress=()=>{},signal}={}){
 if(campaign.format!=='selfmailer-dl-4')throw new Error('Der Druckexport ist für den vierseitigen DIN-lang-Selfmailer eingerichtet.');
 validateICC(profile);
 if(!people.length||people.length>10)throw new Error('Bitte 1 bis 10 Empfänger pro Druck-PDF auswählen.');
 if(checks({...campaign,recipients:people}).some(i=>i.level==='error'))throw new Error('Bitte zuerst die offenen Punkte im Kampagnen-Check korrigieren.');
 const runtime='/studio/vendor/lcms.mjs',lib=await import(runtime);
 const lcms=await lib.instantiate({locateFile:()=>'/studio/vendor/lcms.wasm'});
 let target,source,transform;
 try{
  target=lcms.cmsOpenProfileFromMem(profile,profile.length);if(!target)throw new Error('Das Druckprofil konnte nicht geöffnet werden.');
  source=lcms.cmsCreate_sRGBProfile();
  transform=lcms.cmsCreateTransform(source,lib.TYPE_RGB_8,target,lib.TYPE_CMYK_8,lib.INTENT_RELATIVE_COLORIMETRIC,lib.cmsFLAGS_BLACKPOINTCOMPENSATION);
  if(!transform)throw new Error('Mit diesem Profil ist keine CMYK-Umwandlung möglich.');
  const doc=await PDFDocument.create(),f=FORMATS.find(f=>f.id===campaign.format),profileName=lcms.cmsGetProfileInfoASCII(target,lib.cmsInfoDescription,'en','US')||'CMYK-Druckprofil';
  doc.setTitle(campaign.name+' · Druckdaten');doc.setSubject(`CMYK · ${profileName} · 300 dpi · 3 mm Beschnitt · gerastert · kein PDF/X`);doc.setCreator('Kontaktstoff');
  const icc=doc.context.register(doc.context.flateStream(profile,{N:4,Alternate:'DeviceCMYK'}));
  const intent=doc.context.obj({Type:'OutputIntent',S:'GTS_PDFX',OutputConditionIdentifier:PDFString.of(profileName),Info:PDFString.of(profileName),DestOutputProfile:icc});
  doc.catalog.set(PDFName.of('OutputIntents'),doc.context.obj([doc.context.register(intent)]));
  let index=0;
  for(const person of people)for(const side of sideNames(campaign)){
   if(signal?.aborted)throw new Error('Druckexport abgebrochen.');
   onProgress(`Druckseite ${++index} von ${people.length*2} wird erstellt …`);
   const canvas=await renderPrintCanvas(campaign,side,person),rgba=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,cmyk=new Uint8Array(rgba.length);
   for(let offset=0;offset<rgba.length;offset+=262144){
    if(signal?.aborted)throw new Error('Druckexport abgebrochen.');
    const count=Math.min(262144,rgba.length-offset)/4,chunk=new Uint8Array(count*3);
    for(let pixel=0;pixel<count;pixel++){const source=offset+pixel*4,dest=pixel*3;chunk[dest]=rgba[source];chunk[dest+1]=rgba[source+1];chunk[dest+2]=rgba[source+2];}
    cmyk.set(lcms.cmsDoTransform(transform,chunk,count),offset);
    await new Promise(r=>setTimeout(r,0));
   }
   const img=doc.context.register(doc.context.flateStream(cmyk,{Type:'XObject',Subtype:'Image',Width:canvas.width,Height:canvas.height,ColorSpace:doc.context.obj(['ICCBased',icc]),BitsPerComponent:8}));
   const width=(f.width+6)*mm,height=(f.height+6)*mm,page=doc.addPage([width,height]);
   page.setTrimBox(3*mm,3*mm,f.width*mm,f.height*mm);page.setBleedBox(0,0,width,height);page.setCropBox(0,0,width,height);
   const name=page.node.newXObject('Mailing',img);page.pushOperators(pushGraphicsState(),scale(width,height),drawObject(name),popGraphicsState());canvas.width=canvas.height=1;
  }
  onProgress('PDF wird verpackt …');return await doc.save();
 }finally{if(transform)lcms.cmsDeleteTransform(transform);if(source)lcms.cmsCloseProfile(source);if(target)lcms.cmsCloseProfile(target);}
}
