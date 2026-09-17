import QRCode from 'qrcode';
import {FORMATS,resolveText,validURL} from './core.js';
const images=new Map(), codes=new Map();
export function imageFrom(src){if(images.size>=32&&!images.has(src))images.delete(images.keys().next().value);if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{images.delete(src);reject(new Error('Das Bild konnte nicht gelesen werden.'));};image.src=src;}));return images.get(src);}
function rect(ctx,x,y,w,h,color,r=0){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function label(ctx,text,x,y,size=4,color='#0f172a',weight='400',align='left'){ctx.font=`${weight} ${size}px Kontakt, sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(text,x,y);}
function logo(ctx,x,y,light=false){rect(ctx,x,y,8,6.5,light?'#ffffff':'#2563eb',2);ctx.fillStyle=light?'#ffffff':'#2563eb';ctx.beginPath();ctx.moveTo(x+2,y+5);ctx.lineTo(x+2,y+9);ctx.lineTo(x+5,y+6);ctx.fill();for(let i=0;i<3;i++){ctx.fillStyle=light?'#2563eb':'#ffffff';ctx.beginPath();ctx.arc(x+2+i*2,y+3.1,.45,0,7);ctx.fill();}label(ctx,'chat',x+11,y+6.5,7,light?'#ffffff':'#0f172a','700');label(ctx,'tastic',x+26,y+6.5,7,'#ff8065','700');}
function template(ctx,side,w,h){
  ctx.save();ctx.scale(w/210,h/148);
  if(side==='front'){
    rect(ctx,0,0,210,148,'#2563eb');logo(ctx,12,10,true);
    label(ctx,'PERSÖNLICH FÜR',126,14,2.5,'#d4e2ff','700');
    label(ctx,'Ihre Website.',12,44,13,'#ffffff','700');label(ctx,'Jetzt mit',12,60,13,'#ffffff','700');label(ctx,'Antworten.',12,76,13,'#ff8065','700');
    label(ctx,'Ihr KI-Assistent beantwortet Kundenfragen.',12,91,3.7,'#ffffff');label(ctx,'Auch wenn Sie gerade keine Zeit haben.',12,97,3.7,'#ffffff');
    label(ctx,'Auf Basis Ihrer Website. Rund um die Uhr.',12,110,3,'#ffffff','700');
    rect(ctx,124,34,73,76,'#154bbf',5);rect(ctx,122,32,73,76,'#ffffff',5);
    rect(ctx,127,37,9,9,'#eef3ff',3);label(ctx,'c',129.6,43.5,6,'#2563eb','700');
    label(ctx,'Ihr Website-Assistent',140,41,3.1,'#0f172a','700');label(ctx,'So könnte Ihr Chat aussehen',140,46,2.3,'#68758b');
    rect(ctx,135,56,55,14,'#2563eb',4);label(ctx,'Was bieten Sie an?',139,65,3.4,'#ffffff','700');
    rect(ctx,127,76,63,22,'#eef3ff',4);label(ctx,'Hallo! Ich helfe Ihnen gern,',131,83,3.1);label(ctx,'das passende Angebot',131,88,3.1);label(ctx,'zu finden. Was suchen Sie?',131,93,3.1);
    rect(ctx,0,118,210,30,'#ffffff');label(ctx,'Stellen Sie Ihrer Website eine Frage.',12,129,5.1,'#0f172a','700');label(ctx,'Scannen und Ihren Assistenten ausprobieren.',12,135,3.2,'#64748b');
  }else{
    rect(ctx,0,0,210,148,'#f7f9fd');logo(ctx,12,10);
    label(ctx,'Aus Fragen werden',12,36,9.4,'#0f172a','700');label(ctx,'neue Kontakte.',12,48,9.4,'#0f172a','700');
    label(ctx,'Ein Besucher interessiert sich für Ihr Angebot.',12,58,3.5,'#526078');label(ctx,'Ihr Assistent hilft genau in diesem Moment.',12,64,3.5,'#526078');
    [['Antworten statt warten.','Kundenfragen klären, auch nach Feierabend.'],['Ihr Angebot. Ihr Auftritt.','Wissen aus Ihrer Website, in Ihrem Design.'],['Den nächsten Kontakt gewinnen.','Interessenten hinterlassen ihre Kontaktdaten.']].forEach(([title,body],i)=>{let y=77+i*16;rect(ctx,12,y-5,8,8,'#e8effd',2);label(ctx,`0${i+1}`,14,y,3,'#2563eb','700');label(ctx,title,25,y,3.9,'#0f172a','700');label(ctx,body,25,y+6,3.1,'#526078');});
    rect(ctx,124,29,74,95,'#2563eb',5);label(ctx,'JETZT SELBST AUSPROBIEREN',131,39,2.65,'#d4e2ff','700');label(ctx,'Ihr Assistent wartet.',131,48,5.2,'#ffffff','700');
    rect(ctx,140,52,40,40,'#ffffff',3);label(ctx,'Scannen. Eine Frage stellen.',130,115,3.3,'#ffffff','700');
    rect(ctx,12,132,186,.2,'#dce3ee');label(ctx,'Ihr nächster Schritt beginnt hier.',12,140,3.9,'#0f172a','700');label(ctx,'Persönlichen Assistenten kennenlernen.',12,146,2.6,'#526078');label(ctx,'hey@chattastic.de',161,140,3.5,'#2563eb','700');
  }
  ctx.restore();
}
export function wrap(ctx,text,width){const result=[];for(const paragraph of text.split('\n')){let line='';for(const word of paragraph.split(' ')){const test=line?line+' '+word:word;if(ctx.measureText(test).width>width&&line){result.push(line);line=word;}else line=test;}result.push(line);}return result;}
export function layoutText(ctx,field,value){let size=field.fontSize*25.4/72;let lines;const min=Math.min(size,6*25.4/72);do{ctx.font=`${field.weight} ${size}px Kontakt, sans-serif`;lines=wrap(ctx,value,field.w-1);if(!field.autoFit||(lines.length*size*1.3<=field.h&&lines.every(s=>ctx.measureText(s).width<=field.w-1))||size<=min)break;size=Math.max(min,size-.15);}while(true);return{size,lines,overflow:lines.length*size*1.3>field.h+.01||lines.some(s=>ctx.measureText(s).width>field.w-1)};}
export async function renderCanvas(canvas,campaign,side,recipient,{scale=5,fields=true}={}){
  await document.fonts.ready;
  const format=FORMATS.find(f=>f.id===campaign.format),{width:w,height:h}=format;
  const temp=document.createElement('canvas');temp.width=Math.round(w*scale);temp.height=Math.round(h*scale);
  const ctx=temp.getContext('2d');ctx.scale(scale,scale);rect(ctx,0,0,w,h,'#ffffff');
  const background=campaign.sides[side].background;
  if(background.kind==='blank'&&background.color)rect(ctx,0,0,w,h,background.color);
  if(background.kind==='template')template(ctx,side,w,h);
  if(background.kind==='image'){const img=await imageFrom(background.data);const ratio=Math.min(w/img.width,h/img.height);ctx.drawImage(img,(w-img.width*ratio)/2,(h-img.height*ratio)/2,img.width*ratio,img.height*ratio);}
  const overflow=[];
  if(fields)for(const field of campaign.sides[side].fields){
    const value=resolveText(field.text,recipient);
    if(field.background!=='transparent')rect(ctx,field.x,field.y,field.w,field.h,field.background);
    if(field.type==='shape'){continue;}
    if(field.type==='image'){const img=await imageFrom(field.data);const ratio=(field.fit==='cover'?Math.max:Math.min)(field.w/img.width,field.h/img.height);ctx.save();ctx.beginPath();ctx.rect(field.x,field.y,field.w,field.h);ctx.clip();ctx.drawImage(img,field.x+(field.w-img.width*ratio)/2,field.y+(field.h-img.height*ratio)/2,img.width*ratio,img.height*ratio);ctx.restore();continue;}
    if(field.type==='qr'){
      if(validURL(value)&&value.length<=1000){let code=codes.get(value);if(!code){code=await QRCode.toDataURL(value,{errorCorrectionLevel:'M',margin:4,width:800,color:{dark:'#101820',light:'#ffffff'}});if(codes.size>=128)codes.delete(codes.keys().next().value);codes.set(value,code);}const img=await imageFrom(code);const size=Math.min(field.w,field.h);ctx.drawImage(img,field.x,field.y,size,size);}
      else{rect(ctx,field.x,field.y,field.w,field.h,'#fff1f0');label(ctx,'Link fehlt',field.x+2,field.y+field.h/2,3,'#b43e36');}
    }else{
      const layout=layoutText(ctx,field,value);if(layout.overflow)overflow.push(field.id);
      ctx.save();ctx.beginPath();ctx.rect(field.x,field.y,field.w,field.h);ctx.clip();
      ctx.font=`${field.weight} ${layout.size}px Kontakt, sans-serif`;ctx.fillStyle=field.color;ctx.textBaseline='top';ctx.textAlign=field.align;
      const x=field.x+(field.align==='center'?field.w/2:field.align==='right'?field.w:0);
      layout.lines.forEach((line,i)=>ctx.fillText(line,x,field.y+i*layout.size*1.3));ctx.restore();
    }
  }
  canvas.width=temp.width;canvas.height=temp.height;canvas.getContext('2d').drawImage(temp,0,0);return overflow;
}
