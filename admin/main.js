import {api} from '../konto/src/api.js';
const form=document.querySelector('#admin-login'),error=document.querySelector('#error');
const enter=()=>location.replace('/konto/?tab=campaigns');
api('/auth/me').then(s=>{if(s.user?.admin)enter();}).catch(()=>{});
form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('button');button.disabled=true;error.hidden=true;try{await api('/auth/admin',{method:'POST',body:{password:new FormData(form).get('password')}});form.reset();enter();}catch(e){error.textContent=e.message;error.hidden=false;button.disabled=false;}};
