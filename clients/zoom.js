// A flat, high-resolution reading view; rotation stays in the main 3D preview.
export function mountZoom({dialog,source,face}){
 const $=s=>dialog.querySelector(s),viewport=$('.zoom-viewport'),canvas=$('canvas'),range=$('input'),output=$('output');
 let side='front',zoom=1,base=1,opener=null,drag=null,revision=0;
 const paint=()=>{canvas.style.width=base*zoom+'px';canvas.style.height=base*zoom*148/210+'px';range.value=Math.round(zoom*100);output.value=Math.round(zoom*100)+' %';$('#zoom-out').disabled=zoom<=1;$('#zoom-in').disabled=zoom>=3;};
 const fit=()=>{base=Math.max(1,Math.min(viewport.clientWidth-40,(viewport.clientHeight-40)*210/148));paint();};
 const setZoom=(value,x=viewport.clientWidth/2,y=viewport.clientHeight/2)=>{
  const before=canvas.getBoundingClientRect(),v=viewport.getBoundingClientRect(),px=(v.left+x-before.left)/before.width,py=(v.top+y-before.top)/before.height;
  zoom=Math.min(3,Math.max(1,value));paint();const after=canvas.getBoundingClientRect();viewport.scrollLeft+=after.left+px*after.width-(v.left+x);viewport.scrollTop+=after.top+py*after.height-(v.top+y);
 };
 const refresh=async()=>{if(!dialog.open)return;const version=++revision;viewport.setAttribute('aria-busy','true');dialog.querySelectorAll('[data-zoom-side]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.zoomSide===side)));try{const original=await source(side);if(version!==revision||!dialog.open)return;canvas.width=original.width;canvas.height=original.height;canvas.getContext('2d').drawImage(original,0,0);canvas.setAttribute('aria-label',side==='front'?'Vorderseite vergrößert':'Rückseite vergrößert');}catch{if(version===revision)canvas.setAttribute('aria-label','Vorschau konnte nicht geladen werden. Bitte Ansicht erneut öffnen.');}finally{if(version===revision)viewport.setAttribute('aria-busy','false');}};
 const open=(which=face(),trigger=document.activeElement)=>{opener=trigger;side=which;zoom=1;dialog.showModal();document.body.classList.add('client-zoom-open');fit();refresh();viewport.scrollTo(0,0);};
 $('#zoom-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{document.body.classList.remove('client-zoom-open');drag=null;opener?.focus();});
 dialog.querySelectorAll('[data-zoom-side]').forEach(b=>b.onclick=()=>{side=b.dataset.zoomSide;refresh();});
 $('#zoom-in').onclick=()=>setZoom(zoom+.25);$('#zoom-out').onclick=()=>setZoom(zoom-.25);$('#zoom-fit').onclick=()=>{zoom=1;fit();viewport.scrollTo(0,0);};range.oninput=()=>setZoom(Number(range.value)/100);
 viewport.addEventListener('wheel',e=>{e.preventDefault();const r=viewport.getBoundingClientRect();setZoom(zoom*Math.exp(-e.deltaY*.002),e.clientX-r.left,e.clientY-r.top);},{passive:false});
 viewport.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);});
 viewport.addEventListener('pointermove',e=>{if(!drag)return;viewport.scrollLeft=drag.left-(e.clientX-drag.x);viewport.scrollTop=drag.top-(e.clientY-drag.y);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(event,()=>drag=null);
 dialog.addEventListener('keydown',e=>{if(e.target.matches('input'))return;if(e.key==='+'||e.key==='='){e.preventDefault();setZoom(zoom+.25);}if(e.key==='-'){e.preventDefault();setZoom(zoom-.25);}});
 new ResizeObserver(()=>{if(dialog.open)fit();}).observe(viewport);
 return {open,refresh};
}
