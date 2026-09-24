import {isSelfmailer} from './formats.js';
import {renderCanvas} from './render.js';
import {Mailing3D} from './three-d.js';
import {pointOnQuad,faceToSpread,spreadToFace} from './fold-coordinates.js';
// Picking and pins use the same immutable review snapshot and spread coordinates.
export function mountReviewFold(root,project,{initialState=null,flatSelectors=[],comments=[],resolved=new Set(),editable=true,onMark=()=>{},onComment=()=>{}}={}){
 if(!root||!isSelfmailer(project))return null;
 if(!document.querySelector('link[data-fold-styles]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/selfmailer-3d.css';link.dataset.foldStyles='';document.head.append(link);}
 const shell=document.createElement('div');shell.className='review-fold';
 shell.innerHTML='<div class="review-fold-heading"><strong>Dein Mailing. Dein Feedback.</strong><p class="review-fold-hint"></p></div><div class="review-face-tools" role="group" aria-label="Mailingseite"><button type="button" data-review-face="cover">Titelseite</button><button type="button" data-review-face="inside-top">Innenseiten</button><button type="button" data-review-face="postal">Anschrift</button><button type="button" data-review-zoom="out" aria-label="Verkleinern">−</button><button type="button" data-review-zoom="in" aria-label="Vergrößern">+</button></div><div class="review-fold-stage" tabindex="0" role="group" aria-label="Mailing: Ziehen zum Drehen, eine Stelle zum Kommentieren anklicken. Mit Enter die Mitte markieren."><div class="mailing-3d-card"><canvas data-fold-source="front" hidden></canvas><canvas data-fold-source="back" hidden></canvas></div></div><p class="review-fold-help" role="status">Design wird geladen …</p>';
 root.prepend(shell);const stage=shell.querySelector('.review-fold-stage'),help=shell.querySelector('.review-fold-help'),flat=flatSelectors.flatMap(selector=>[...root.querySelectorAll(selector)]),hiddenState=new Map(flat.map(n=>[n,n.hidden])),events=new AbortController();for(const node of flat)node.hidden=true;
 let disposed=false,ready=false,gesture=null,pendingTap=null;const viewer=new Mailing3D(stage);viewer.setSelfmailer(true);if(!initialState){viewer.state.x=0;viewer.state.y=0;viewer.paint();}if(initialState){Object.assign(viewer.state,initialState.state);viewer.fold.set(initialState.open);viewer.paint();}stage.classList.toggle('review-readonly',!editable);
 const hint=editable?'Eine Stelle anklicken und kommentieren. Ziehen zum Drehen.':'Freigegebener Stand · Ziehen zum Drehen und Aufklappen.';shell.querySelector('.review-fold-hint').textContent=hint;
 const faces=new Map();for(const canvas of stage.querySelectorAll('[data-fold-face]')){const surface=canvas.parentElement,name=canvas.dataset.foldFace;surface.dataset.reviewSurface=name;for(const [x,y] of [[0,0],[1,0],[1,1],[0,1]]){const probe=document.createElement('i');probe.className='fold-corner';probe.style.left=x*100+'%';probe.style.top=y*100+'%';surface.append(probe);}faces.set(name,surface);}
 const detail=document.createElement('section');detail.className='review-detail-spreads';
 detail.innerHTML='<h2>Beide Seiten im Detail</h2><p>Vollständig aufgeklappt, ohne Perspektive. '+(editable?'Auch hier kannst du eine Stelle anklicken und kommentieren.':'Der freigegebene Designstand.')+'</p>'+['front','back'].map(side=>`<article class="review-detail-page"><header><h3>${side==='front'?'Außenseite':'Innenseite'}</h3><div><button type="button" data-detail-zoom="out" data-side="${side}" aria-label="${side==='front'?'Außenseite':'Innenseite'} verkleinern">−</button><output data-detail-scale="${side}">100 %</output><button type="button" data-detail-zoom="in" data-side="${side}" aria-label="${side==='front'?'Außenseite':'Innenseite'} vergrößern">+</button></div></header><div class="review-detail-scroll"><div class="review-detail-sheet" data-detail-side="${side}" tabindex="${editable?0:-1}" role="${editable?'button':'img'}" aria-label="${side==='front'?'Außenseite':'Innenseite'} vollständig${editable?' · Stelle kommentieren':''}"><img data-detail-image="${side}" alt="${side==='front'?'Außenseite':'Innenseite'} des Mailings" draggable="false"></div></div></article>`).join('');
 shell.append(detail);const detailZoom={front:1,back:1},detailScales={front:0,back:0},detailRendering=new Set();
 async function sharpenDetail(side){if(disposed||!ready||detailRendering.has(side))return;const sheet=detail.querySelector(`[data-detail-side="${side}"]`),required=()=>Math.max(12,Math.min(24,Math.ceil(sheet.clientWidth*(window.devicePixelRatio||1)/210/2)*2));if(detailScales[side]>=required())return;detailRendering.add(side);try{while(!disposed&&detailScales[side]<required()){const scale=required(),source=document.createElement('canvas');await renderCanvas(source,project,side,project.recipients[0],{scale});if(disposed)return;const target=sheet.querySelector('img');target.src=source.toDataURL('image/png');detailScales[side]=scale;source.width=source.height=1;}}finally{detailRendering.delete(side);}}
 function detailPin(p,label,cls=''){const el=document.createElement('button');el.type='button';el.className='fold-comment-pin '+cls;el.style.left=p.x*100+'%';el.style.top=p.y*100+'%';el.textContent=label;detail.querySelector(`[data-detail-side="${p.side}"]`).append(el);return el;}
 const markDetail=(side,x,y)=>{if(!ready||!editable)return;clearPoint();const pin=detailPin({side,x,y},'+','fold-pending-pin');pin.tabIndex=-1;pin.setAttribute('aria-hidden','true');onMark({side,x,y});};
 for(const sheet of detail.querySelectorAll('[data-detail-side]')){
  let down=null;
  sheet.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};},{signal:events.signal});
  sheet.addEventListener('pointercancel',()=>down=null,{signal:events.signal});
  sheet.onclick=e=>{if(e.target.closest('button')||!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)return;down=null;const box=sheet.getBoundingClientRect();markDetail(sheet.dataset.detailSide,Math.max(0,Math.min(1,(e.clientX-box.left)/box.width)),Math.max(0,Math.min(1,(e.clientY-box.top)/box.height)));};
  sheet.onkeydown=e=>{if(e.target===sheet&&(e.key==='Enter'||e.key===' ')){e.preventDefault();markDetail(sheet.dataset.detailSide,.5,.5);}};
 }
 for(const button of detail.querySelectorAll('[data-detail-zoom]'))button.onclick=()=>{const side=button.dataset.side;detailZoom[side]=Math.max(1,Math.min(3,detailZoom[side]+(button.dataset.detailZoom==='in'?.5:-.5)));detail.querySelector(`[data-detail-side="${side}"]`).style.width=detailZoom[side]*100+'%';detail.querySelector(`[data-detail-scale="${side}"]`).textContent=detailZoom[side]*100+' %';void sharpenDetail(side).catch(()=>{});};
 function pin(p,label,cls=''){const surface=faces.get(p.face),el=document.createElement('button');el.type='button';el.className='fold-comment-pin '+cls;el.style.left=p.x*100+'%';el.style.top=p.y*100+'%';el.textContent=label;surface.append(el);return el;}
 function clearPoint(){shell.classList.remove('review-marking');shell.querySelector('.review-fold-hint').textContent=hint;shell.querySelectorAll('.fold-pending-pin').forEach(n=>n.remove());}
 comments.forEach((c,i)=>{if(!c.side)return;const flatPin=detailPin(c,String(i+1),resolved.has(c.id)?'resolved':'');flatPin.setAttribute('aria-label','Kommentar '+(i+1)+' ansehen');flatPin.onclick=e=>{e.stopPropagation();onComment(c);};const el=pin(spreadToFace(c),String(i+1),resolved.has(c.id)?'resolved':'');el.dataset.foldComment=c.id;el.setAttribute('aria-label','Kommentar '+(i+1)+' ansehen');el.addEventListener('pointerdown',e=>e.stopPropagation());el.onclick=e=>{e.stopPropagation();onComment(c);};});
 function showFace(face){viewer.fold.stop();viewer.state.panX=viewer.state.panY=0;if(face==='cover'){viewer.fold.set(0);viewer.state.x=viewer.state.y=0;viewer.paint();}else if(face==='postal'){viewer.fold.set(0);viewer.state.x=180;viewer.state.y=0;viewer.paint();}else{viewer.state.x=viewer.state.y=0;viewer.fold.animate(100);viewer.paint();}}
 function markAt(face,x,y){if(!ready||!editable)return;const surface=faces.get(face);if(!surface)return;const points=[...surface.querySelectorAll('.fold-corner')].map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y};}),p=pointOnQuad(points,x,y);if(!p)return;clearPoint();const el=pin({face,...p},'+','fold-pending-pin');el.tabIndex=-1;el.setAttribute('aria-hidden','true');onMark(faceToSpread(face,p));}
 stage.addEventListener('pointerdown',e=>{if(e.target.closest('.fold-comment-pin'))return;pendingTap=null;if(gesture){gesture.cancelled=true;return;}const surface=e.target.closest('[data-review-surface]');gesture={id:e.pointerId,x:e.clientX,y:e.clientY,face:surface?.dataset.reviewSurface,cancelled:false};},{signal:events.signal});
 stage.addEventListener('pointermove',e=>{if(gesture&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>7)gesture.cancelled=true;},{signal:events.signal});
 stage.addEventListener('pointerup',e=>{if(!gesture||e.pointerId!==gesture.id)return;const g=gesture;gesture=null;if(!g.cancelled&&g.face)pendingTap={face:g.face,x:e.clientX,y:e.clientY};},{signal:events.signal});
 stage.addEventListener('pointercancel',()=>{gesture=null;pendingTap=null;},{signal:events.signal});
 // Open only on the completed click, so a synthesized touch click cannot hit the new dialog.
 stage.addEventListener('click',e=>{const tap=pendingTap;pendingTap=null;if(!tap||e.target.closest('.fold-comment-pin'))return;e.preventDefault();e.stopPropagation();markAt(tap.face,tap.x,tap.y);},{signal:events.signal});
 stage.addEventListener('keydown',e=>{if(e.target!==stage||e.key!=='Enter')return;e.preventDefault();const r=stage.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height*.48,surface=document.elementFromPoint(x,y)?.closest('[data-review-surface]');if(surface)markAt(surface.dataset.reviewSurface,x,y);},{signal:events.signal});
 document.addEventListener('close',clearPoint,{capture:true,signal:events.signal});
 shell.querySelectorAll('[data-review-face]').forEach(b=>b.onclick=()=>showFace(b.dataset.reviewFace));shell.querySelectorAll('[data-review-zoom]').forEach(b=>b.onclick=()=>viewer.zoom(b.dataset.reviewZoom==='in'?1.15:1/1.15));
 // Render for high-density screens and zoom, with a bounded texture budget.
 let textureScale=0,qualityTimer=0,painting=false;
 const quality=()=>Math.max(12,Math.min(16,Math.ceil(viewer.card.clientWidth*(window.devicePixelRatio||1)*viewer.state.scale*1.5/210/2)*2));
 async function paintTextures(){
  if(disposed||painting||textureScale>=quality())return;
  painting=true;
  try{
   do{
    const scale=quality(),front=document.createElement('canvas'),back=document.createElement('canvas');
    await renderCanvas(front,project,'front',project.recipients[0],{scale});
    await renderCanvas(back,project,'back',project.recipients[0],{scale});
    if(disposed){front.width=back.width=1;return;}
    textureScale=scale;viewer.setSpreads(front,back);for(const [side,source] of [['front',front],['back',back]]){if(detailScales[side]<=scale){const target=detail.querySelector(`[data-detail-image="${side}"]`);target.src=source.toDataURL('image/png');detailScales[side]=scale;}}front.width=front.height=back.width=back.height=1;
    ready=true;stage.dataset.textureScale=String(scale);
    help.textContent=editable?'Deine Markierungen bleiben direkt an der richtigen Stelle des Mailings.':'Dieser Designstand ist bestätigt.';
   }while(!disposed&&textureScale<quality());
  }finally{painting=false;}
 }
 function scheduleQuality(){for(const side of ['front','back'])void sharpenDetail(side).catch(()=>{});if(disposed||textureScale>=quality())return;clearTimeout(qualityTimer);qualityTimer=setTimeout(()=>paintTextures().catch(()=>{}),200);}
 viewer.onViewChange=scheduleQuality;
 const resize=new ResizeObserver(scheduleQuality);resize.observe(stage);
 const pending=paintTextures().catch(()=>{if(!disposed){viewer.setVisible(false);stage.hidden=true;for(const [n,hidden] of hiddenState)n.hidden=hidden;help.textContent='Die Falzansicht ist gerade nicht verfügbar. Du kannst unten auf dem Druckbogen kommentieren.';}});

 return {ready:pending,snapshot:()=>({state:{...viewer.state},open:viewer.fold.open}),promptMark(){viewer.fold.stop();shell.classList.add('review-marking');shell.querySelector('.review-fold-hint').textContent='Jetzt die gewünschte Stelle auf dem Mailing anklicken.';help.textContent='Tippe oder klicke jetzt direkt auf die Stelle im Mailing.';stage.scrollIntoView({behavior:'smooth',block:'center'});stage.focus({preventScroll:true});},showPoint(p){const point=spreadToFace(p);showFace(point.face);stage.scrollIntoView({behavior:'smooth',block:'center'});},destroy(){disposed=true;clearTimeout(qualityTimer);resize.disconnect();viewer.onViewChange=null;events.abort();viewer.destroy();shell.remove();for(const [n,hidden] of hiddenState)n.hidden=hidden;}};
}
