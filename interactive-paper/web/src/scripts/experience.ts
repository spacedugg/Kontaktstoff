const experience = document.querySelector<HTMLElement>('[data-experience]');
if (experience) {
  const ready = experience.querySelector<HTMLElement>('[data-ready]')!;
  const product = experience.querySelector<HTMLElement>('[data-product-view]')!;
  const videoView = experience.querySelector<HTMLElement>('[data-video-view]')!;
  const video = videoView.querySelector<HTMLVideoElement>('video')!;
  const status = experience.querySelector<HTMLElement>('[data-demo-status]')!;
  const actions = experience.querySelector<HTMLElement>('[data-demo-actions]')!;
  const tap = experience.querySelector<HTMLButtonElement>('[data-tap]')!;
  const reset = experience.querySelector<HTMLButtonElement>('[data-demo-reset]')!;
  const model = experience.querySelector<HTMLElement>('[data-model]')!;
  const hint = experience.querySelector<HTMLElement>('[data-model-hint]')!;
  let mode: 'product' | 'video' = 'product';
  let started = false;
  let visible = true;
  let generation = 0;
  let viewer: { rotate: (direction: number) => void; reset: () => void; setActive: (value: boolean) => void; dispose: () => void } | undefined;
  let viewerPromise: Promise<void> | undefined;
  function viewerActivity() { viewer?.setActive(visible && started && mode === 'product' && !document.hidden); }
  function activeStatus() {
    if (mode === 'video') return 'Video-Story geöffnet. Mit den Videotasten abspielen.';
    return viewer ? '3D-Beispiel geöffnet. Drehen Sie die Ansicht.' : 'Beispiel als Produktbild geöffnet. 3D ist auf diesem Gerät nicht verfügbar.';
  }
  async function ensureViewer() {
    if (viewerPromise) return viewerPromise;
    viewerPromise = (async () => {
      try {
        const { createViewer } = await import('./product-viewer.js');
        viewer = createViewer(model);
        model.querySelector<HTMLElement>('[data-model-fallback]')!.hidden = true;
        viewerActivity();
      } catch {
        hint.textContent = '3D nicht verfügbar · Produktbild';
        model.setAttribute('aria-label', 'Beispielkopfhörer als Produktbild. 3D ist auf diesem Gerät nicht verfügbar.');
        experience!.querySelectorAll<HTMLButtonElement>('[data-rotate], [data-reset-view]').forEach(button => button.disabled = true);
      }
    })();
    return viewerPromise;
  }
  function showMode() {
    product.hidden = !started || mode !== 'product'; videoView.hidden = !started || mode !== 'video';
    if (mode !== 'video') video.pause(); viewerActivity();
  }
  experience.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.addEventListener('click', async () => {
    mode = button.dataset.mode === 'video' ? 'video' : 'product'; experience.dataset.mode = mode;
    experience.querySelectorAll('[data-mode]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    showMode(); if (started && mode === 'product') await ensureViewer();
    if (started) status.textContent = activeStatus();
  }));
  tap.addEventListener('click', async () => {
    const ticket = ++generation; tap.disabled = true; started = true;
    experience.dataset.phase = 'opening'; ready.hidden = true;
    status.textContent = 'Das Beispiel-Erlebnis wird geöffnet …'; showMode();
    if (mode === 'product') await ensureViewer();
    if (ticket !== generation) return;
    experience.dataset.phase = 'active';
    status.textContent = activeStatus();
    actions.hidden = false; reset.hidden = false; tap.disabled = false;
    if (mode === 'video') video.play().catch(() => {});
  });
  reset.addEventListener('click', () => {
    ++generation; started = false; video.pause(); video.currentTime = 0; viewer?.reset();
    experience.dataset.phase = 'ready'; ready.hidden = false; actions.hidden = true; reset.hidden = true; tap.disabled = false;
    status.textContent = 'Karte bereit. Sie starten das Erlebnis.'; showMode(); tap.focus();
  });
  experience.querySelectorAll<HTMLButtonElement>('[data-rotate]').forEach(button => button.addEventListener('click', () => viewer?.rotate(Number(button.dataset.rotate))));
  experience.querySelector('[data-reset-view]')?.addEventListener('click', () => viewer?.reset());
  model.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); viewer?.rotate(event.key === 'ArrowLeft' ? -1 : 1); }
    if (event.key === 'Home') { event.preventDefault(); viewer?.reset(); }
  });
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; viewerActivity(); }); observer.observe(experience);
  document.addEventListener('visibilitychange', viewerActivity);
  window.addEventListener('pagehide', event => {
    video.pause();
    if (event.persisted) { viewer?.setActive(false); return; }
    observer.disconnect(); viewer?.dispose();
  });
  window.addEventListener('pageshow', viewerActivity);
  document.querySelectorAll<HTMLButtonElement>('[data-select-demo]').forEach(button => button.addEventListener('click', () => {
    const selected = experience.querySelector<HTMLButtonElement>(`[data-mode="${button.dataset.selectDemo}"]`);
    selected?.click(); experience.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' }); selected?.focus({ preventScroll: true });
  }));
  const dialog = document.querySelector<HTMLDialogElement>('[data-recipient-dialog]')!;
  const title = dialog.querySelector<HTMLElement>('[data-recipient-title]')!;
  const content = dialog.querySelector<HTMLElement>('[data-recipient-content]')!;
  experience.querySelectorAll<HTMLButtonElement>('[data-recipient-action]').forEach(button => button.addEventListener('click', () => {
    content.replaceChildren();
    const paragraph = (text: string, className = '') => { const p = document.createElement('p'); p.textContent = text; p.className = className; content.append(p); return p; };
    if (button.dataset.recipientAction === 'product') {
      title.textContent = 'Ihr Produkt. Direkt erreichbar.';
      const image = document.createElement('img'); image.src = '/images/headphones-example.webp'; image.alt = 'Frei gestalteter Beispielkopfhörer'; image.className = 'recipient-product-image'; content.append(image);
      paragraph('Nach dem Erlebnis könnte dieser Schritt direkt zu Ihrem Produkt im Shop führen.');
      paragraph('Hier wird keine Bestellung aufgegeben. Produkt und Darstellung dienen nur als Beispiel.', 'sample-note');
    } else if (button.dataset.recipientAction === 'service') {
      title.textContent = 'Aus Neugier wird ein Gespräch.';
      paragraph('Hier könnte Ihr Angebot stehen: kurz erklärt, mit den passenden Leistungen und einer Möglichkeit, mehr zu erfahren.');
      paragraph('Beispiel: Eine persönliche Beratung, ein abgestimmtes Konzept und eine klare nächste Aktion.');
      paragraph('Diese Ansicht illustriert eine Dienstleistung. Sie enthält kein verbindliches Angebot.', 'sample-note');
    } else {
      title.textContent = 'Welcher Moment passt?';
      paragraph('Wählen Sie einen Beispieltermin. Die Zeiten sind frei erzeugte Demodaten und keine echten Verfügbarkeiten.');
      const slots = document.createElement('div'); slots.className = 'booking-slots'; slots.setAttribute('role', 'group'); slots.setAttribute('aria-label', 'Beispieltermine');
      const note = paragraph('Noch kein Beispieltermin gewählt.', 'sample-note'); note.setAttribute('role', 'status');
      const today = new Date(); let count = 0;
      for (let offset = 1; count < 3; offset++) {
        const date = new Date(today); date.setDate(today.getDate() + offset); date.setHours(12, 0, 0, 0);
        const day = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short' }).format(date);
        if (day.startsWith('Sa') || day.startsWith('So')) continue;
        const label = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', day: 'numeric', month: 'long' }).format(date) + ' · 10:30 Uhr';
        const slot = document.createElement('button'); slot.type = 'button'; slot.textContent = label; slot.setAttribute('aria-pressed', 'false');
        slot.addEventListener('click', () => { slots.querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === slot))); note.textContent = `Beispieltermin gewählt: ${label}. Es wurde kein echter Termin gebucht.`; }); slots.append(slot); count++;
      }
      content.insertBefore(slots, note);
    }
    dialog.showModal();
  }));
}
