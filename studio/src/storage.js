const DB='kontaktstoff-studio-v1';
let connection;
function open(){return connection ||= new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('campaigns',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function transact(mode,action){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('campaigns',mode);const req=action(tx.objectStore('campaigns'));tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
export const listCampaigns=()=>transact('readonly',s=>s.getAll());
export const saveCampaign=campaign=>transact('readwrite',s=>s.put(campaign));
export const removeCampaign=id=>transact('readwrite',s=>s.delete(id));
