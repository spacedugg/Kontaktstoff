import {api} from '../konto/src/api.js';
const form=document.querySelector('#admin-login'),error=document.querySelector('#error');
const params=new URLSearchParams(location.search);
const enter=()=>{const target=new URL('/konto/',location.origin);target.searchParams.set('tab',params.get('bereich')==='verkaufsseiten'?'sales-links':'campaigns');const proposal=params.get('proposal')||'';if(params.get('bereich')==='verkaufsseiten'&&/^[a-f0-9-]{36}$/i.test(proposal))target.searchParams.set('proposal',proposal);location.replace(target.href);};
api('/auth/me').then(s=>{if(s.user?.admin)enter();}).catch(()=>{});
form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('button');button.disabled=true;error.hidden=true;try{await api('/auth/admin',{method:'POST',body:{password:new FormData(form).get('password')}});form.reset();enter();}catch(e){error.textContent=e.message;error.hidden=false;button.disabled=false;}};
