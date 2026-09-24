import {FoldView} from './fold-view.js';
const viewers=new WeakMap();
// A two-sided CSS 3D card. Both faces use the same renderer as PDF and 2D proof.
export class Mailing3D {
  constructor(root) {
    viewers.get(root)?.destroy();viewers.set(root,this);
    this.events=new AbortController();
    this.root = root;
    this.card = root.querySelector('.mailing-3d-card');
    this.state = { x: -12, y: -24, panX: 0, panY: 0, scale: 1 };
    this.mode = 'rotate';
    this.pointers = new Map();
    this.listen('pointerdown', event => this.down(event));
    this.listen('pointermove', event => this.move(event));
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) this.listen(type, event => this.up(event));
    this.listen('wheel', event => {
      if (!root.matches(':focus-within') && !event.ctrlKey) return;
      event.preventDefault(); this.zoom(Math.exp(-event.deltaY * .002));
    }, { passive: false });
    this.listen('keydown', event => {
      if (event.target !== root) return;
      this.fold?.stop();
      if(this.fold&&event.key.toLowerCase()==='f'){event.preventDefault();this.fold.animate(this.fold.open<50?100:0);return;}
      const d = event.shiftKey ? 12 : 5;
      if (event.key.startsWith('Arrow')) {
        event.preventDefault();
        if (this.mode === 'pan') {
          this.state.panX += event.key === 'ArrowRight' ? d : event.key === 'ArrowLeft' ? -d : 0;
          this.state.panY += event.key === 'ArrowDown' ? d : event.key === 'ArrowUp' ? -d : 0;
        } else {
          this.state.y += event.key === 'ArrowRight' ? d : event.key === 'ArrowLeft' ? -d : 0;
          this.state.x += event.key === 'ArrowUp' ? d : event.key === 'ArrowDown' ? -d : 0;
        }
        this.paint();
      }
      if (event.key === '+' || event.key === '=') { event.preventDefault(); this.zoom(1.12); }
      if (event.key === '-') { event.preventDefault(); this.zoom(1 / 1.12); }
      if (event.key.toLowerCase() === 'r') this.reset();
    });
    this.paint();
  }
  listen(type,callback,options={}){this.root.addEventListener(type,callback,{...options,signal:this.events.signal});}
  setSelfmailer(enabled){if(enabled&&!this.fold)this.fold=new FoldView(this);if(!enabled&&this.fold){this.fold.destroy();this.fold=null;}this.paint();}
  setSpreads(outside,inside){this.fold?.textures(outside,inside);}
  setVisible(visible){this.fold?.visible(visible);}
  destroy(){this.fold?.destroy();this.fold=null;this.events.abort();viewers.delete(this.root);}
  down(event) {
    if (event.button !== 0) return;
    this.fold?.stop();event.preventDefault(); this.root.focus({ preventScroll: true });
    this.root.setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.root.classList.add('dragging');
    this.card.classList.add('instant');
  }
  move(event) {
    const previous = this.pointers.get(event.pointerId);
    if (!previous) return;
    const next = { x: event.clientX, y: event.clientY };
    if (this.pointers.size === 2) {
      const other = [...this.pointers.entries()].find(([id]) => id !== event.pointerId)[1];
      const before = Math.hypot(previous.x - other.x, previous.y - other.y);
      const after = Math.hypot(next.x - other.x, next.y - other.y);
      if (before > 10) this.state.scale *= after / before;
      this.state.panX += (next.x - previous.x) / 2;
      this.state.panY += (next.y - previous.y) / 2;
    } else if (this.mode === 'pan' || event.shiftKey) {
      this.state.panX += next.x - previous.x;
      this.state.panY += next.y - previous.y;
    } else {
      this.state.y += (next.x - previous.x) * .55;
      this.state.x -= (next.y - previous.y) * .4;
    }
    this.pointers.set(event.pointerId, next); this.paint();
  }
  up(event) {
    this.pointers.delete(event.pointerId);
    if (!this.pointers.size) { this.root.classList.remove('dragging'); this.card.classList.remove('instant'); }
  }
  setMode(mode) { this.mode = mode; this.root.dataset.mode = mode; }
  zoom(factor) { this.fold?.stop();this.state.scale *= factor; this.paint(); }
  reset() { this.fold?.stop();this.fold?.set(0);this.state = { x: -12, y: -24, panX: 0, panY: 0, scale: 1 }; this.paint(); }
  front() { this.fold?.stop();this.fold?.set(0);this.state.x = -8; this.state.y = -12; this.paint(); }
  back() { this.fold?.stop();this.fold?.set(0);this.state.x = this.fold?168:-8; this.state.y = this.fold?12:168; this.paint(); }
  flip() { this.fold?.stop();if(this.fold)this.state.x+=180;else this.state.y += 180; this.paint(); }
  paint() {
    const s = this.state;
    this.fold?.size();if(!this.fold)s.x = Math.max(-75, Math.min(75, s.x)); s.scale = Math.max(.55, Math.min(1.8, s.scale));
    s.panX = Math.max(-this.root.clientWidth * .4, Math.min(this.root.clientWidth * .4, s.panX));
    s.panY = Math.max(-this.root.clientHeight * .4, Math.min(this.root.clientHeight * .4, s.panY));
    this.card.style.transform = `translate3d(${s.panX}px, ${s.panY}px, 0) scale(${s.scale}) rotateX(${s.x}deg) rotateY(${s.y}deg)`;
    this.root.dataset.face = Math.cos(s.y * Math.PI / 180) >= 0 ? 'front' : 'back';
    if(this.fold)this.root.dataset.face=Math.cos(s.x*Math.PI/180)>=0?'front':'back';
    this.onViewChange?.();
    const label = this.root.parentElement.querySelector('#three-d-position');
    if (label) label.textContent = `${this.fold?(this.fold.open>50?'Aufgeklappt':this.root.dataset.face==='front'?'Titelseite':'Postanschrift'):(this.root.dataset.face === 'front' ? 'Vorderseite' : 'Rückseite')} · ${Math.round(s.scale * 100)} %`;
  }
}
