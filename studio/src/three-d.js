// A two-sided CSS 3D card. Both faces use the same renderer as PDF and 2D proof.
export class Mailing3D {
  constructor(root) {
    this.root = root;
    this.card = root.querySelector('.mailing-3d-card');
    this.state = { x: -12, y: -24, panX: 0, panY: 0, scale: 1 };
    this.mode = 'rotate';
    this.pointers = new Map();
    root.addEventListener('pointerdown', event => this.down(event));
    root.addEventListener('pointermove', event => this.move(event));
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) root.addEventListener(type, event => this.up(event));
    root.addEventListener('wheel', event => {
      if (!root.matches(':focus-within') && !event.ctrlKey) return;
      event.preventDefault(); this.zoom(Math.exp(-event.deltaY * .002));
    }, { passive: false });
    root.addEventListener('keydown', event => {
      if (event.target !== root) return;
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
  down(event) {
    if (event.button !== 0) return;
    event.preventDefault(); this.root.focus({ preventScroll: true });
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
  zoom(factor) { this.state.scale *= factor; this.paint(); }
  reset() { this.state = { x: -12, y: -24, panX: 0, panY: 0, scale: 1 }; this.paint(); }
  front() { this.state.x = -8; this.state.y = -12; this.paint(); }
  back() { this.state.x = -8; this.state.y = 168; this.paint(); }
  flip() { this.state.y += 180; this.paint(); }
  paint() {
    const s = this.state;
    s.x = Math.max(-75, Math.min(75, s.x)); s.scale = Math.max(.55, Math.min(1.8, s.scale));
    s.panX = Math.max(-this.root.clientWidth * .4, Math.min(this.root.clientWidth * .4, s.panX));
    s.panY = Math.max(-this.root.clientHeight * .4, Math.min(this.root.clientHeight * .4, s.panY));
    this.card.style.transform = `translate3d(${s.panX}px, ${s.panY}px, 0) scale(${s.scale}) rotateX(${s.x}deg) rotateY(${s.y}deg)`;
    this.root.dataset.face = Math.cos(s.y * Math.PI / 180) >= 0 ? 'front' : 'back';
    const label = document.querySelector('#three-d-position');
    if (label) label.textContent = `${this.root.dataset.face === 'front' ? 'Vorderseite' : 'Rückseite'} · ${Math.round(s.scale * 100)} %`;
  }
}
