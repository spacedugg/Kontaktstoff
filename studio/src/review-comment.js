import {renderCanvas} from './render.js';
import {isSelfmailer,sideLabel} from './formats.js';
import {spreadToFace,faceToSpread} from './fold-coordinates.js';

const labels={'cover':'Titelseite','postal':'Anschrift','inside-top':'Innenseite oben','inside-bottom':'Innenseite unten'};
function styles(){if(document.querySelector('[data-comment-styles]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/review-comment.css';link.dataset.commentStyles='';document.head.append(link);}

// The preview and marker always refer to the same immutable review and spread coordinates.
export async function mountCommentContext(root,project,point,{onMove=null}={}){
 styles();root.replaceChildren();if(!point?.side)return;
 const folded=isSelfmailer(project),local=folded?spreadToFace(point):{face:point.side,x:point.x,y:point.y};
 const title=document.createElement('strong');title.textContent=folded?labels[local.face]:sideLabel(project,point.side);
 const preview=document.createElement('div');preview.className='comment-location';
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','Ausgewählte Stelle auf dem Design');
 const marker=document.createElement('span');marker.className='comment-location-pin';marker.textContent='+';marker.setAttribute('aria-hidden','true');
 const position=p=>{marker.style.left=p.x*100+'%';marker.style.top=p.y*100+'%';};position(local);
 preview.append(canvas,marker);const hint=document.createElement('small');hint.textContent=onMove?'Die Markierung zeigt deine Stelle. Zum Versetzen hier ins Design klicken.':'Dein Kommentar gehört zu dieser markierten Stelle.';
 root.className='comment-context';root.append(title,preview,hint);
 const source=document.createElement('canvas');await renderCanvas(source,project,point.side,project.recipients[0],{scale:6});
 if(!root.contains(preview))return;
 canvas.width=source.width;canvas.height=source.height/(folded?2:1);
 const lower=folded&&['cover','inside-bottom'].includes(local.face);
 canvas.getContext('2d').drawImage(source,0,lower?canvas.height:0,source.width,canvas.height,0,0,canvas.width,canvas.height);source.width=source.height=1;
 if(onMove){preview.tabIndex=0;preview.setAttribute('role','button');preview.setAttribute('aria-label','Markierung versetzen. Pfeiltasten zum Verschieben.');
  const move=(x,y)=>{local.x=Math.max(0,Math.min(1,x));local.y=Math.max(0,Math.min(1,y));position(local);onMove(folded?faceToSpread(local.face,local):{side:point.side,x:local.x,y:local.y});};
  preview.onclick=e=>{const r=preview.getBoundingClientRect();move((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);};
  preview.onkeydown=e=>{const delta={ArrowLeft:[-.01,0],ArrowRight:[.01,0],ArrowUp:[0,-.01],ArrowDown:[0,.01]}[e.key];if(delta){e.preventDefault();move(local.x+delta[0],local.y+delta[1]);}};
 }
}

export function showCommentContext(project,comment){
 styles();const dialog=document.createElement('dialog');dialog.className='comment-read-dialog';dialog.setAttribute('aria-label','Kommentar zur markierten Stelle');
 const title=document.createElement('h2');title.textContent=comment.side?'Kommentar zur Markierung':'Allgemeiner Kommentar';
 const context=document.createElement('div'),name=document.createElement('strong'),text=document.createElement('p'),close=document.createElement('button');
 name.textContent=comment.name||'Kommentar';text.textContent=comment.text;text.className='comment-read-text';close.textContent='Zurück zum Design';close.className='button';close.type='button';close.onclick=()=>dialog.close();
 dialog.append(title,context,name,text,close);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
 void mountCommentContext(context,project,comment).catch(()=>{context.textContent='Die Designvorschau konnte nicht geladen werden.';});
}
