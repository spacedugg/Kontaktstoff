const menu = document.querySelector<HTMLButtonElement>('[data-menu]');
const navigation = document.querySelector<HTMLElement>('#site-nav');
function closeMenu() { menu?.setAttribute('aria-expanded', 'false'); if (navigation) navigation.dataset.open = 'false'; }
menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); if (navigation) navigation.dataset.open = String(open); });
navigation?.querySelectorAll('a, button').forEach(element => element.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

const enquiry = document.querySelector<HTMLDialogElement>('#enquiry');
document.querySelectorAll('[data-enquiry]').forEach(button => button.addEventListener('click', () => enquiry?.showModal()));
document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
  dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); });
});

const form = document.querySelector<HTMLFormElement>('[data-enquiry-form]');
const result = document.querySelector<HTMLElement>('[data-enquiry-result]');
const summary = document.querySelector<HTMLElement>('[data-enquiry-summary]');
let draft = '';
form?.addEventListener('submit', event => {
  event.preventDefault(); if (!form.reportValidity()) return;
  const values = new FormData(form); const value = (key: string) => String(values.get(key) || '').trim();
  draft = ['KONTAKTSTOFF · NFC DIRECT MAIL', 'Anfrageentwurf – noch nicht versendet', '', `Name: ${value('name')}`, `Unternehmen: ${value('company') || 'Nicht angegeben'}`, `E-Mail: ${value('email')}`, `Ziel: ${value('goal')}`, `Geplante Menge: ${value('quantity')}`, '', 'Idee:', value('idea') || 'Noch offen'].join('\n');
  if (summary) summary.textContent = draft; form.hidden = true; if (result) result.hidden = false;
  document.querySelector<HTMLButtonElement>('[data-download-enquiry]')?.focus();
});
document.querySelector('[data-edit-enquiry]')?.addEventListener('click', () => { if (result) result.hidden = true; if (form) { form.hidden = false; form.querySelector<HTMLInputElement>('input')?.focus(); } });
document.querySelector('[data-download-enquiry]')?.addEventListener('click', () => {
  if (!draft) return; const url = URL.createObjectURL(new Blob([draft], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'kontaktstoff-nfc-anfrage.txt'; document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});
