const DB='kontaktstoff-studio-v1';
let connection;
function open(){return connection ||= new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('campaigns',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function transact(mode,action){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('campaigns',mode);const req=action(tx.objectStore('campaigns'));tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
// Read and write within one transaction so a late autosave cannot resurrect a trashed draft.
async function updateRecord(id,update){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('campaigns','readwrite'),store=tx.objectStore('campaigns'),req=store.get(id);let result,failure;req.onsuccess=()=>{try{result=update(req.result);if(result)store.put(result);}catch(error){failure=error;tx.abort();}};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(failure||tx.error);tx.onabort=()=>reject(failure||tx.error);});}
export const listCampaigns=async()=>(await transact('readonly',s=>s.getAll())).filter(c=>!c.deletedAt);
export const listDeletedCampaigns=async()=>(await transact('readonly',s=>s.getAll())).filter(c=>c.deletedAt).sort((a,b)=>b.deletedAt-a.deletedAt);
export const saveCampaign=campaign=>updateRecord(campaign.id,current=>{if(current?.deletedAt)throw new Error('Diese Kreation liegt im Papierkorb.');const next=structuredClone(campaign);delete next.deletedAt;return next;});
export const trashCampaign=id=>updateRecord(id,current=>current?{...current,deletedAt:Date.now()}:undefined);
export const restoreCampaign=id=>updateRecord(id,current=>{if(!current)return;const next={...current,updatedAt:Date.now()};delete next.deletedAt;return next;});
export const removeCampaign=id=>transact('readwrite',s=>s.delete(id));
