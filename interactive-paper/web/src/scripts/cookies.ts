const preferenceKey='impulse-privacy-v1';
const cookieBanner=document.querySelector<HTMLElement>('[data-cookie-banner]');
const cookieDialog=document.querySelector<HTMLDialogElement>('[data-cookie-dialog]');
const cookieStatus=document.querySelector<HTMLElement>('[data-cookie-status]');
let hasChoice=false;
try {const saved=JSON.parse(localStorage.getItem(preferenceKey)||'null');hasChoice=saved?.version===1&&saved?.necessary===true;} catch {}
if(cookieBanner)cookieBanner.hidden=hasChoice;
function savePrivacy(){let stored=true;try{localStorage.setItem(preferenceKey,JSON.stringify({version:1,necessary:true,analytics:false,marketing:false}));}catch{stored=false;}if(cookieBanner)cookieBanner.hidden=true;if(cookieStatus)cookieStatus.textContent=stored?'Ihre Auswahl wurde gespeichert.':'Ihre Auswahl gilt für diesen Besuch.';cookieDialog?.close();}
document.querySelectorAll('[data-cookie-settings]').forEach(button=>button.addEventListener('click',()=>{if(cookieStatus)cookieStatus.textContent='';cookieDialog?.showModal();}));
document.querySelector('[data-cookie-essential]')?.addEventListener('click',savePrivacy);
document.querySelector('[data-cookie-save]')?.addEventListener('click',savePrivacy);
document.querySelector('[data-cookie-close]')?.addEventListener('click',()=>cookieDialog?.close());
document.querySelector('[data-cookie-reset]')?.addEventListener('click',()=>{try{localStorage.removeItem(preferenceKey);}catch{}if(cookieBanner)cookieBanner.hidden=false;if(cookieStatus)cookieStatus.textContent='Ihre gespeicherte Auswahl wurde gelöscht.';});
