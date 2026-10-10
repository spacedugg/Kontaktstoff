// A single horizontal fold, with two independently printed sides per leaf.
// The outside is read after turning the open sheet around its horizontal axis:
// postal panel above, cover below. No changes to the printable design are made.
export class FoldView {
 constructor(owner){
  this.owner=owner;this.root=owner.root;this.card=owner.card;this.open=0;this.frame=0;this.playing=false;this.events=new AbortController();
  if(!document.querySelector('link[data-fold-styles]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/selfmailer-3d.css';link.dataset.foldStyles='';document.head.append(link);}
  this.savedStyle=this.card.getAttribute('style');this.card.classList.add('fold-enabled');this.root.classList.add('fold-stage');
  this.book=document.createElement('div');this.book.className='fold-book';
  this.book.innerHTML='<div class="fold-leaf fold-base"><div class="fold-surface fold-inside"><canvas data-fold-face="inside-bottom"></canvas></div><div class="fold-surface fold-outside"><canvas data-fold-face="postal"></canvas></div></div><div class="fold-leaf fold-flap"><div class="fold-surface fold-inside"><canvas data-fold-face="inside-top"></canvas></div><div class="fold-surface fold-outside"><canvas data-fold-face="cover"></canvas></div></div><div class="fold-crease"></div>';
  this.card.append(this.book);this.flap=this.book.querySelector('.fold-flap');
  this.controls=document.createElement('div');this.controls.className='fold-controls';
  this.controls.innerHTML='<div class="fold-actions"><button type="button" data-fold-toggle>Aufklappen ↗</button><button type="button" data-fold-play aria-pressed="false">▶ Animation starten</button><button type="button" data-fold-reset aria-label="3D-Ansicht zurücksetzen" title="Ansicht zurücksetzen">↺</button></div><label class="fold-range"><span>Falz <output>Geschlossen</output></span><input type="range" min="0" max="100" step="1" value="0" aria-label="Selfmailer aufklappen" aria-valuetext="Geschlossen"></label><p>Ziehen zum Drehen · Mit zwei Fingern zoomen</p>';
  this.root.after(this.controls);this.slider=this.controls.querySelector('input');
  this.controls.querySelector('[data-fold-toggle]').onclick=()=>{this.stop();this.owner.state.x=-18;this.owner.state.y=-18;this.owner.state.panX=this.owner.state.panY=0;this.animate(this.open<50?100:0);};
  this.controls.querySelector('[data-fold-play]').onclick=()=>this.playing?this.stop():this.play();
  this.controls.querySelector('[data-fold-reset]').onclick=()=>this.owner.reset();
  this.slider.oninput=()=>{this.stop();this.set(Number(this.slider.value));this.owner.paint();};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stop();},{signal:this.events.signal});
  this.resize=new ResizeObserver(()=>this.owner.paint());this.resize.observe(this.root);this.set(0);
 }
 textures(outside,inside){
  const copy=(name,src,lower)=>{const dst=this.book.querySelector(`[data-fold-face="${name}"]`);dst.width=src.width;dst.height=Math.round(src.height/2);dst.getContext('2d').drawImage(src,0,lower?src.height/2:0,src.width,src.height/2,0,0,dst.width,dst.height);if(this.root.classList.contains('review-fold-stage')){let image=dst.parentElement.querySelector('.fold-preview-image');if(!image){image=document.createElement('img');image.className='fold-preview-image';image.alt='';image.draggable=false;dst.after(image);dst.classList.add('fold-raster-source');}image.src=dst.toDataURL('image/png');}};
  copy('postal',outside,false);copy('cover',outside,true);copy('inside-top',inside,false);copy('inside-bottom',inside,true);this.owner.paint();
 }
 set(value){this.open=Math.max(0,Math.min(100,value));const closed=1-this.open/100;
  this.flap.style.transform=`translateZ(.6px) rotateX(${-179.9*closed}deg)`;
  this.book.style.transform=`translateY(${-25*closed}%)`;
  this.book.style.setProperty('--fold-shadow',String(.02+.22*Math.sin(closed*Math.PI)));
  this.root.dataset.fold=String(Math.round(this.open));this.slider.value=String(Math.round(this.open));
  const label=this.open<1?'Geschlossen':this.open>99?'Ganz aufgeklappt':Math.round(this.open)+' % offen';
  this.slider.setAttribute('aria-valuetext',label);this.controls.querySelector('output').textContent=label;
  this.controls.querySelector('[data-fold-toggle]').textContent=this.open<50?'Aufklappen ↗':'Zuklappen ↙';
 }
 size(){if(this.root.clientWidth&&this.root.clientHeight){const review=this.root.classList.contains('review-fold-stage'),visibleHeight=review?99*(1+this.open/100):198;this.card.style.width=Math.round(Math.min(this.root.clientWidth*(review?.88:.8),this.root.clientHeight*(review?.76:.70)*210/visibleHeight))+'px';this.card.style.aspectRatio='210/198';}}
 animate(target){this.stop();const from=this.open,start=performance.now(),duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:850;this.card.classList.add('fold-moving');
  const tick=now=>{if(!this.root.isConnected){this.destroy();return;}const p=duration?Math.min(1,(now-start)/duration):1,e=p*p*(3-2*p);this.set(from+(target-from)*e);this.owner.paint();if(p<1)this.frame=requestAnimationFrame(tick);else{this.frame=0;this.card.classList.remove('fold-moving');}};this.frame=requestAnimationFrame(tick);
 }
 play(){this.stop();this.playing=true;this.controls.querySelector('[data-fold-play]').textContent='Ⅱ Animation pausieren';this.controls.querySelector('[data-fold-play]').setAttribute('aria-pressed','true');this.root.dataset.loop='playing';this.card.classList.add('fold-moving');this.owner.state.panX=this.owner.state.panY=0;this.owner.state.scale=1;
  const start=performance.now(),keys=[[0,0,-12,-20],[1,0,-12,-20],[3,100,-18,-20],[5,100,-12,20],[7,100,168,10],[9,0,168,-12],[11,0,348,-20],[12,0,348,-20]];
  const tick=now=>{if(!this.root.isConnected){this.destroy();return;}if(document.hidden||!this.root.getClientRects().length){this.stop();return;}const time=((now-start)/1000)%12,i=keys.findIndex((k,n)=>n<keys.length-1&&time>=k[0]&&time<keys[n+1][0]),a=keys[Math.max(0,i)],b=keys[Math.max(0,i)+1],t=(time-a[0])/(b[0]-a[0]),e=t*t*(3-2*t);this.set(a[1]+(b[1]-a[1])*e);this.owner.state.x=a[2]+(b[2]-a[2])*e;this.owner.state.y=a[3]+(b[3]-a[3])*e;this.owner.paint();this.frame=requestAnimationFrame(tick);};this.frame=requestAnimationFrame(tick);
 }
 stop(){cancelAnimationFrame(this.frame);this.frame=0;this.playing=false;this.card.classList.remove('fold-moving');this.root.dataset.loop='paused';const button=this.controls.querySelector('[data-fold-play]');button.textContent='▶ Animation starten';button.setAttribute('aria-pressed','false');}
 visible(visible){this.controls.hidden=!visible;if(!visible)this.stop();}
 destroy(){this.stop();this.resize.disconnect();this.events.abort();this.controls.remove();this.book.remove();this.root.classList.remove('fold-stage');this.card.classList.remove('fold-enabled');if(this.savedStyle===null)this.card.removeAttribute('style');else this.card.setAttribute('style',this.savedStyle);}
}
