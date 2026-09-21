let csrf='';
export async function api(path,{method='GET',body}={}){
 // Keep account cookies and write origins on the same production domain,
 // including visits through older Vercel links cached at the edge.
 if(['kontaktstoff.com','kontaktstoff.vercel.app','kontaktstoff-spaceduggs-projects.vercel.app'].includes(location.hostname)){
  location.replace('https://www.kontaktstoff.com'+location.pathname+location.search+location.hash);
  return new Promise(()=>{});
 }
 let response;try{response=await fetch('/api'+path,{method,credentials:'same-origin',headers:{...(body?{'Content-Type':'application/json'}:{}),...(method!=='GET'&&csrf?{'X-CSRF-Token':csrf}:{})},...(body?{body:JSON.stringify(body)}:{})});}catch{throw new Error('Der Kundenbereich ist gerade nicht erreichbar. Dein lokaler Entwurf bleibt erhalten.');}
 let result;try{result=await response.json();}catch{throw new Error('Die Server-Anbindung ist hier noch nicht eingerichtet. Du kannst weiter lokal gestalten.');}
 if(!response.ok){const e=new Error(result.error||'Die Anfrage ist fehlgeschlagen.');e.status=response.status;throw e;}if(result.csrf)csrf=result.csrf;return result;
}
