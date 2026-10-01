import {api} from './api.js';
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=v=>Number(v).toLocaleString('de-DE');
const date=v=>new Date(v).toLocaleString('de-DE',{timeZone:'Europe/Berlin',dateStyle:'medium',timeStyle:'short'});
export const proposalCountLabel=r=>r?.stats?`${n(r.stats.total)} Seitenaufrufe · seit ${date(r.stats.startedAt)}`:'Messung beginnt mit der Veröffentlichung';
export async function mountProposalTracking(root,{notice=()=>{}}={}){
 let selected=new URLSearchParams(location.search).get('salesPage')||'';
 async function refresh(){
  root.innerHTML='<p role="status">Verkaufsseiten-Aufrufe werden geladen …</p>';
  try{
   const {items}=await api('/operator/proposals');if(!root.isConnected)return;
   const pages=items.filter(r=>r.live||r.stats);
   selected=pages.some(r=>r.slug===selected)?selected:pages.find(r=>r.slug==='money-making-sprint-23d4fcb9')?.slug||pages[0]?.slug||'';
   function paint(){
    const r=pages.find(r=>r.slug===selected),s=r?.stats,link=r?location.origin+'/idee/'+r.slug:'';
    root.innerHTML=`<div class="panel-heading"><div><span class="eyebrow">GETEILTE LINKS</span><h1>Verkaufsseiten-Aufrufe</h1></div><button class="button" data-refresh>Aktualisieren ↻</button></div><p>Hier siehst du, wie oft die persönliche Seite aufgerufen wurde, deren Link du verschickst. Unabhängig vom Versandstatus deiner Mailing-Kampagnen.</p>${r?`<label>Verkaufsseite auswählen<select data-page>${pages.map(p=>`<option value="${h(p.slug)}" ${p.slug===selected?'selected':''}>${h(p.company)}${p.live?'':' · deaktiviert'}</option>`).join('')}</select></label><p><a href="${h(link)}" target="_blank" rel="noopener" style="overflow-wrap:anywhere">${h(link)}</a></p><div class="metrics"><article class="metric accent"><span>Seitenaufrufe insgesamt</span><strong>${s?n(s.total):'—'}</strong><small>${s?'Seit Beginn der Messung':'Noch nicht erfasst'}</small></article><article class="metric"><span>Heute</span><strong>${s?n(s.today):'—'}</strong><small>Zeitzone Berlin</small></article></div><p><strong>${s?'Messung seit '+h(date(s.startedAt))+' Uhr.':'Noch keine Messung aktiv.'}</strong> Frühere Aufrufe wurden nicht erfasst.${r.live?'':' Dieser Link ist derzeit deaktiviert.'}</p><div class="actions"><button class="button" data-copy>Link kopieren</button><a class="button" href="/konto/?tab=sales-links&proposal=${h(r.id)}">Verkaufsseite bearbeiten →</a></div>`:'<p>Noch keine veröffentlichte Verkaufsseite vorhanden.</p><a class="button" href="/konto/?tab=sales-links">Verkaufsseite erstellen →</a>'}<p class="under-note">Gezählt werden Seitenaufrufe, keine eindeutigen Personen. Erneutes Laden zählt erneut. Angemeldete Team-Aufrufe, erkannte Bots und Linkvorschauen sowie DNT-/GPC-Widersprüche werden ausgenommen. Eigene Aufrufe ohne Team-Anmeldung können mitzählen. QR-Links und Designfreigaben sind eigene Messbereiche.</p>`;
    root.querySelector('[data-refresh]').onclick=refresh;
    if(r){root.querySelector('[data-page]').onchange=e=>{selected=e.target.value;const u=new URL(location.href);u.searchParams.set('salesPage',selected);history.replaceState(null,'',u);paint();};root.querySelector('[data-copy]').onclick=async()=>{try{await navigator.clipboard.writeText(link);notice('Verkaufsseiten-Link kopiert.');}catch{notice('Bitte den angezeigten Link kopieren.');}};}
   }paint();
  }catch(e){if(root.isConnected){root.innerHTML=`<p role="alert">Aufrufe konnten nicht geladen werden: ${h(e.message)}</p><button class="button" data-retry>Erneut versuchen</button>`;root.querySelector('[data-retry]').onclick=refresh;}}
 }await refresh();
}
