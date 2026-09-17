// Shared, responsive card interaction. Fit the card before rotating it inside the stage.
export function mountCardPreview({stage,card,flip,reset}){
 let x=7,y=-12,z=-4,drag=null;
 const paint=()=>{card.style.transform=`rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;const back=Math.cos(y*Math.PI/180)<0;stage.dataset.face=back?'back':'front';flip.textContent=back?'Vorderseite ansehen ↻':'Rückseite ansehen ↻';};
 const fit=()=>{if(!stage.clientWidth||!stage.clientHeight)return;card.style.width=Math.floor(Math.min(stage.clientWidth*.78,stage.clientHeight*.94))+'px';};
 const home=()=>{x=7;y=-12;z=-4;fit();paint();};
 const observer=new ResizeObserver(fit);observer.observe(stage);
 stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={px:e.clientX,py:e.clientY,x,y};stage.setPointerCapture(e.pointerId);});
 stage.addEventListener('pointermove',e=>{if(!drag)return;y=drag.y+(e.clientX-drag.px)*.65;x=Math.max(-40,Math.min(40,drag.x-(e.clientY-drag.py)*.35));paint();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(event,()=>drag=null);
 stage.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();if(e.key==='ArrowLeft')y-=15;if(e.key==='ArrowRight')y+=15;if(e.key==='ArrowUp')x=Math.max(-40,x-10);if(e.key==='ArrowDown')x=Math.min(40,x+10);paint();});
 flip.onclick=()=>{y+=180;paint();};reset.onclick=home;home();return {reset:home};
}
