import {PDFDocument} from 'pdf-lib';
import {FORMATS,sideNames} from './core.js';
import {renderCanvas} from './render.js';
// Export the exact reviewed snapshot, never the mutable source design.
export async function downloadReviewPDF(review){
 const {project,title,version}=structuredClone(review),format=FORMATS.find(f=>f.id===project.format),doc=await PDFDocument.create();
 doc.setTitle(`${title} · Version ${version}`);doc.setSubject('Designfreigabe · RGB-Ansicht · 300 dpi · ohne Beschnitt · kein Druck-PDF');doc.setCreator('Kontaktstoff');
 for(const side of sideNames(project)){
  const canvas=document.createElement('canvas');await renderCanvas(canvas,project,side,project.recipients[0]||{},{scale:300/25.4});
  const image=await doc.embedPng(canvas.toDataURL()),page=doc.addPage([format.width*72/25.4,format.height*72/25.4]);
  page.drawImage(image,{x:0,y:0,width:page.getWidth(),height:page.getHeight()});canvas.width=canvas.height=1;
 }
 const url=URL.createObjectURL(new Blob([await doc.save()],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download=(title||'Design').replace(/[^\p{L}\p{N}]+/gu,'-').slice(0,90)+`-version-${version}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
