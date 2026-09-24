import {isSelfmailer} from './formats.js';
import {renderCanvas} from './render.js';
import {Mailing3D} from './three-d.js';
// The 3D view always uses the immutable review snapshot. Pins stay on flat spreads.
export function mountReviewFold(root,project,{mode='2d',onMode=()=>{},flatSelectors=[]}={}){
 if(!root||!isSelfmailer(project))return null;
 if(!document.querySelector('link[data-fold-styles]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/selfmailer-3d.css';link.dataset.foldStyles='';document.head.append(link);}
 const shell=document.createElement('div');shell.className='review-fold';
 shell.innerHTML='<div class="review-view-tabs" role="group" aria-label="Designansicht"><button type="button" data-review-view="2d" aria-pressed="true">Kommentieren · 2D</button><button type="button" data-review-view="3d" aria-pressed="false">Aufklappen · 3D</button></div><div class="review-fold-preview" hidden><div class="review-fold-stage" tabindex="0" role="img" aria-label="Selfmailer drehen und aufklappen"><div class="mailing-3d-card"><canvas data-fold-source="front" hidden></canvas><canvas data-fold-source="back" hidden></canvas></div></div><p class="review-fold-help">Eine Stelle ändern? Wechsle zu „Kommentieren · 2D“ und klicke auf das Design.</p></div>';
 root.prepend(shell);const preview=shell.querySelector('.review-fold-preview'),stage=shell.querySelector('.review-fold-stage'),flat=flatSelectors.flatMap(selector=>[...root.querySelectorAll(selector)]);let viewer=null,pending=null,disposed=false,currentMode=null;const hiddenState=new Map();
 async function setMode(next){mode=next;onMode(next);preview.hidden=mode!=='3d';if(next!==currentMode){for(const node of flat){if(next==='3d'){hiddenState.set(node,node.hidden);node.hidden=true;}else if(hiddenState.has(node))node.hidden=hiddenState.get(node);}currentMode=next;}for(const button of shell.querySelectorAll('[data-review-view]'))button.setAttribute('aria-pressed',String(button.dataset.reviewView===mode));
  if(mode==='3d'&&!pending){viewer=new Mailing3D(stage);viewer.setSelfmailer(true);pending=(async()=>{const front=shell.querySelector('[data-fold-source=front]'),back=shell.querySelector('[data-fold-source=back]');await Promise.all([renderCanvas(front,project,'front',project.recipients[0],{scale:5}),renderCanvas(back,project,'back',project.recipients[0],{scale:5})]);if(!disposed)viewer.setSpreads(front,back);})().catch(()=>{if(!disposed){shell.querySelector('.review-fold-help').textContent='Die 3D-Ansicht konnte nicht geladen werden. Die 2D-Ansicht ist weiter verfügbar.';}});}
  viewer?.setVisible(mode==='3d');viewer?.paint();if(pending)await pending;
 }
 shell.querySelectorAll('[data-review-view]').forEach(button=>button.onclick=()=>void setMode(button.dataset.reviewView));void setMode(mode);
 return {setMode,destroy(){disposed=true;viewer?.destroy();shell.remove();for(const node of flat)if(hiddenState.has(node))node.hidden=hiddenState.get(node);}};
}
