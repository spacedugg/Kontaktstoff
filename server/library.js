import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {HTTPError,text,payload} from './validation.js';
import {createCampaign,validateCampaign,sideNames} from '../studio/src/core.js';
const hash=v=>createHash('sha256').update(v).digest('hex');
const pack=r=>({...JSON.parse(r.payload),id:r.id,revision:Number(r.revision),updatedAt:Number(r.updated_at)});
const fail=(status,message)=>{throw new HTTPError(status,message);};
function libraryInput(kind,input){
 if(kind==='designs'){let project;try{project=validateCampaign(input.project);}catch(e){fail(400,e.message);}return {name:project.name,project};}
 const name=text(input.name||'',120);if(!name)fail(400,'Bitte einen Namen für die Zielgruppe eingeben.');
 const c=createCampaign(true);c.recipients=input.recipients;try{validateCampaign(c);}catch(e){fail(400,e.message);}
 return {name,description:text(input.description||'',1000),recipients:c.recipients,source:'csv'};
}
function proof(project,index=0){
 // Share only the chosen preview, never the complete mailing list or service metadata.
 const r=project.recipients[index]||{id:'preview',first_name:'Anna',last_name:'Beispiel',company:'Beispielunternehmen',salutation:'Hallo Anna,',chatbot_url:'https://example.org/',cart_url:'https://example.org/'};
 const keys=new Set(sideNames(project).map(side=>project.sides[side]).flatMap(s=>s.fields.flatMap(f=>[...f.text.matchAll(/\{\{\s*([\w-]+)\s*\}\}/g)].map(m=>m[1]))));
 for(const s of sideNames(project).map(side=>project.sides[side]))for(const f of s.fields)if(f.variantKey)keys.add(f.variantKey);
 const recipient={id:'preview'};for(const key of keys)if(typeof r[key]==='string')recipient[key]=r[key];
 const sides=structuredClone(project.sides);if(sideNames(project).length===1)sides.back={background:{kind:'blank',color:'#ffffff'},fields:[]};for(const s of Object.values(sides))for(const f of s.fields)if(f.variants){f.data=f.variants[r[f.variantKey]]||f.data;delete f.variants;delete f.variantKey;}
 return {version:1,id:'proof',name:project.name,format:project.format,updatedAt:0,sample:project.sample===true,sides,recipients:[recipient]};
}
export function libraryService(db,{origin,limited}){
 async function source(q,kind,id,user){
  if(!['designs','campaigns'].includes(kind))fail(400,'Ungültige Designquelle.');
  const sql=kind==='campaigns'?'SELECT * FROM campaigns WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL':"SELECT * FROM library WHERE id=$1 AND user_id=$2 AND kind='designs' AND deleted_at IS NULL";
  const row=(await q(sql,[id,user])).rows[0];if(!row)fail(404,'Design nicht gefunden.');return row;
 }
 async function review(q,id,user){const r=(await q('SELECT * FROM reviews WHERE id=$1 AND user_id=$2',[id,user])).rows[0];if(!r)fail(404,'Freigabe nicht gefunden.');return r;}
 async function reviewResult(q,r,owner=false){
  const version=Number(r.version),versions=(await q('SELECT version,payload,created_at FROM review_versions WHERE review_id=$1 ORDER BY version DESC',[r.id])).rows;
  const events=(await q('SELECT payload FROM review_events WHERE review_id=$1 ORDER BY created_at,id',[r.id])).rows.map(e=>JSON.parse(e.payload));
  const current=versions.find(v=>Number(v.version)===version);let stale=false;
  if(owner){try{const s=await source(q,r.source_kind,r.source_id,r.user_id);stale=hash(JSON.stringify(proof(JSON.parse(s.payload).project,Number(r.recipient_index))))!==r.fingerprint;}catch{stale=true;}}
  return {id:r.id,title:r.title,status:r.status,version,revision:Number(r.revision),project:JSON.parse(current.payload),events,versions:versions.map(v=>({version:Number(v.version),createdAt:Number(v.created_at)})),...(owner?{sourceKind:r.source_kind,sourceId:r.source_id,stale,expiresAt:Number(r.expires_at)}:{})};
 }
 return {
 async public(req,input){
  const token=String(req.headers.authorization||'').replace(/^Bearer /,'');if(!/^[\w-]{43}$/.test(token))fail(404,'Dieser Freigabelink ist nicht verfügbar.');
  const hashed=hash(token);
  if(req.method!=='GET')await limited('proof:'+hashed,60);
  return db.tx(async q=>{
   const r=(await q('SELECT * FROM reviews WHERE token_hash=$1',[hashed])).rows[0];
   if(!r||r.status==='revoked'||Number(r.expires_at)<Date.now())fail(404,'Dieser Freigabelink ist abgelaufen oder wurde deaktiviert.');
   if(req.method==='GET')return reviewResult(q,r);
   if(req.method!=='POST')fail(405,'Methode nicht erlaubt.');
   if(Number(input.version)!==Number(r.version)||Number(input.revision)!==Number(r.revision))fail(409,'Es gibt einen neueren Stand. Bitte lade die Ansicht neu.');
   if(r.status==='approved')fail(409,'Diese Version ist bereits freigegeben. Für Änderungen bitte eine neue Version anfordern.');
   const name=text(input.name||'',100);if(!name)fail(400,'Bitte deinen Namen ergänzen.');
   const event={id:randomUUID(),version:Number(r.version),name,at:Date.now(),type:input.type};
   if(input.type==='comment'){
    event.text=text(input.text||'',2000);if(!event.text)fail(400,'Bitte deinen Änderungswunsch eintragen.');
    if(input.side!==null&&input.side!==undefined){const project=JSON.parse((await q('SELECT payload FROM review_versions WHERE review_id=$1 AND version=$2',[r.id,r.version])).rows[0].payload);if(!sideNames(project).includes(input.side))fail(400,'Ungültige Kartenseite.');event.side=input.side;for(const key of ['x','y']){if(!Number.isFinite(input[key])||input[key]<0||input[key]>1)fail(400,'Ungültige Markierung.');event[key]=input[key];}}
   }else if(input.type==='approve'){
    if(input.confirm!==true)fail(400,'Bitte die Designfreigabe bestätigen.');
    const unresolved=(await q('SELECT payload FROM review_events WHERE review_id=$1',[r.id])).rows.map(e=>JSON.parse(e.payload));const closed=new Set(unresolved.filter(e=>e.type==='resolve').map(e=>e.commentId));
    if(unresolved.some(e=>e.version===Number(r.version)&&e.type==='comment'&&!closed.has(e.id)))fail(409,'Es sind noch Änderungswünsche offen. Bitte zuerst abstimmen.');
    event.text='Design dieser Version freigegeben.';
   }else fail(400,'Ungültige Aktion.');
   const status=input.type==='approve'?'approved':'changes';
   const changed=await q('UPDATE reviews SET status=$1,revision=revision+1,updated_at=$2 WHERE id=$3 AND revision=$4 RETURNING *',[status,event.at,r.id,r.revision]);if(!changed.rows.length)fail(409,'Die Freigabe wurde inzwischen geändert. Bitte neu laden.');
   await q('INSERT INTO review_events(id,review_id,payload,created_at) VALUES($1,$2,$3,$4)',[event.id,r.id,JSON.stringify(event),event.at]);
   return reviewResult(q,changed.rows[0]);
  });
 },
 async owner(path,method,input,user){
  const lib=path.match(/^\/api\/library\/(audiences|designs)(?:\/([\w-]+))?$/);
  if(lib){const [,kind,id]=lib;
   if(method==='GET'&&!id)return {items:(await db.query('SELECT * FROM library WHERE user_id=$1 AND kind=$2 AND deleted_at IS NULL ORDER BY updated_at DESC',[user.id,kind])).rows.map(pack)};
   if(method==='POST'&&!id){const value=libraryInput(kind,input),id=randomUUID();if(value.project)value.project.id=id;const at=Date.now();await db.query('INSERT INTO library(id,user_id,kind,payload,revision,updated_at) VALUES($1,$2,$3,$4,1,$5)',[id,user.id,kind,JSON.stringify(value),at]);return {...value,id,revision:1,updatedAt:at};}
   return db.tx(async q=>{const row=(await q('SELECT * FROM library WHERE id=$1 AND user_id=$2 AND kind=$3 AND deleted_at IS NULL',[id,user.id,kind])).rows[0];if(!row)fail(404,'Eintrag nicht gefunden.');
    if(method==='GET')return pack(row);
    if(Number(input.revision)!==Number(row.revision))fail(409,'Der Eintrag wurde geändert. Bitte neu laden.');
    if(method==='DELETE'){await q('UPDATE library SET deleted_at=$1 WHERE id=$2',[Date.now(),id]);return {ok:true};}
    if(method!=='PUT')fail(405,'Methode nicht erlaubt.');const value=libraryInput(kind,input);if(value.project)value.project.id=id;const updated=await q('UPDATE library SET payload=$1,revision=revision+1,updated_at=$2 WHERE id=$3 AND revision=$4 RETURNING *',[JSON.stringify(value),Date.now(),id,row.revision]);if(!updated.rows.length)fail(409,'Bitte neu laden.');return pack(updated.rows[0]);
   });
  }
  if(path==='/api/compose'&&method==='POST')return db.tx(async q=>{
   // A named draft may start without either resource. Supplied IDs must still belong to this account.
   const d=input.designId?(await q("SELECT * FROM library WHERE id=$1 AND user_id=$2 AND kind='designs' AND deleted_at IS NULL",[input.designId,user.id])).rows[0]:null;
   const a=input.audienceId?(await q("SELECT * FROM library WHERE id=$1 AND user_id=$2 AND kind='audiences' AND deleted_at IS NULL",[input.audienceId,user.id])).rows[0]:null;
   if((input.designId&&!d)||(input.audienceId&&!a))fail(404,'Bitte ein Design oder eine Zielgruppe aus deinem Konto auswählen.');
   if((d&&Number(input.designRevision)!==Number(d.revision))||(a&&Number(input.audienceRevision)!==Number(a.revision)))fail(409,'Design oder Zielgruppe wurde geändert. Bitte neu laden.');
   const project=d?JSON.parse(d.payload).project:createCampaign(true),audience=a?JSON.parse(a.payload):null;
   project.id=randomUUID();project.name=text(input.name||'',120);if(!project.name)fail(400,'Bitte einen Kampagnennamen eingeben.');
   // Template preview contacts never become actual recipients when the audience is deferred.
   project.recipients=audience?.recipients||[];project.sample=false;project.updatedAt=Date.now();
   if(project.onboarding)project.onboarding.active=false;
   const value=payload({project,meta:{...input.meta,audience:audience?.name||'',leadSource:'upload',quantity:project.recipients.length||250,designId:d?.id||'',audienceId:a?.id||'',designRevision:Number(d?.revision)||0,audienceRevision:Number(a?.revision)||0}});
   await q('INSERT INTO campaigns(id,user_id,payload,revision,updated_at) VALUES($1,$2,$3,1,$4)',[project.id,user.id,JSON.stringify(value),Date.now()]);return {...value,id:project.id,revision:1};
  });
  if(path==='/api/reviews'&&method==='GET'){const rows=(await db.query('SELECT * FROM reviews WHERE user_id=$1 ORDER BY updated_at DESC',[user.id])).rows;const items=[];for(const r of rows)items.push(await reviewResult(db.query,r,true));return {items};}
  if(path==='/api/reviews'&&method==='POST')return db.tx(async q=>{
   const s=await source(q,input.sourceKind,input.sourceId,user.id);if(Number(input.sourceRevision)!==Number(s.revision))fail(409,'Das Design wurde geändert. Bitte neu laden.');
   const index=Number(input.recipientIndex||0),project=JSON.parse(s.payload).project;if(!Number.isInteger(index)||index<0||index>=Math.max(1,project.recipients.length))fail(400,'Ungültiger Vorschaukontakt.');
   if(sideNames(project).some(side=>!project.sides[side].fields.length&&project.sides[side].background.kind==='blank'))fail(400,'Bitte zuerst die Designseiten gestalten.');
   const snapshot=proof(project,index),at=Date.now(),id=randomUUID(),token=randomBytes(32).toString('base64url');
   await q("INSERT INTO reviews(id,user_id,source_kind,source_id,recipient_index,title,token_hash,fingerprint,version,revision,status,expires_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,1,1,'open',$9,$10)",[id,user.id,input.sourceKind,input.sourceId,index,project.name,hash(token),hash(JSON.stringify(snapshot)),at+90*86400000,at]);
   await q('INSERT INTO review_versions(review_id,version,payload,created_at) VALUES($1,1,$2,$3)',[id,JSON.stringify(snapshot),at]);
   return {...await reviewResult(q,await review(q,id,user.id),true),url:origin+'/freigabe/#token='+token};
  });
  const match=path.match(/^\/api\/reviews\/([\w-]+)(?:\/(publish|revoke|link|resolve))?$/);
  if(match){const [,id,action]=match;return db.tx(async q=>{
   const r=await review(q,id,user.id);if(method==='GET'&&!action)return reviewResult(q,r,true);
   if(method!=='POST')fail(405,'Methode nicht erlaubt.');if(Number(input.revision)!==Number(r.revision))fail(409,'Die Freigabe wurde geändert. Bitte neu laden.');let extra={};const at=Date.now();
   if(action==='publish'){
    if(r.status==='revoked')fail(409,'Bitte zuerst einen neuen Freigabelink erstellen.');
    const s=await source(q,r.source_kind,r.source_id,user.id);if(Number(input.sourceRevision)!==Number(s.revision))fail(409,'Bitte das aktuelle Design laden.');const snapshot=proof(JSON.parse(s.payload).project,Number(r.recipient_index)),version=Number(r.version)+1;
    await q('INSERT INTO review_versions(review_id,version,payload,created_at) VALUES($1,$2,$3,$4)',[id,version,JSON.stringify(snapshot),at]);
    const changed=await q("UPDATE reviews SET version=$1,revision=revision+1,status='open',fingerprint=$2,updated_at=$3 WHERE id=$4 AND revision=$5 RETURNING id",[version,hash(JSON.stringify(snapshot)),at,id,r.revision]);if(!changed.rows.length)fail(409,'Bitte neu laden.');
   }else if(action==='resolve'){
    const found=(await q('SELECT payload FROM review_events WHERE id=$1 AND review_id=$2',[text(input.commentId||'',100),id])).rows[0],comment=found&&JSON.parse(found.payload);if(!comment||comment.type!=='comment'||comment.version!==Number(r.version)||r.status==='approved'||r.status==='revoked')fail(400,'Dieser Kommentar kann nicht geändert werden.');
    const event={id:randomUUID(),type:'resolve',commentId:comment.id,name:'Kontaktstoff-Team',version:Number(r.version),at,text:'Änderungswunsch erledigt.'};await q('INSERT INTO review_events(id,review_id,payload,created_at) VALUES($1,$2,$3,$4)',[event.id,id,JSON.stringify(event),at]);
    const changed=await q('UPDATE reviews SET revision=revision+1,updated_at=$1 WHERE id=$2 AND revision=$3 RETURNING id',[at,id,r.revision]);if(!changed.rows.length)fail(409,'Bitte neu laden.');
   }else if(action==='revoke'||action==='link'){
    const token=action==='link'?randomBytes(32).toString('base64url'):null;
    const changed=await q('UPDATE reviews SET token_hash=$1,status=$2,revision=revision+1,expires_at=$3,updated_at=$4 WHERE id=$5 AND revision=$6 RETURNING id',[token?hash(token):r.token_hash,action==='revoke'?'revoked':r.status==='revoked'?'open':r.status,at+90*86400000,at,id,r.revision]);if(!changed.rows.length)fail(409,'Bitte neu laden.');if(token)extra.url=origin+'/freigabe/#token='+token;
   }else fail(404,'Aktion nicht gefunden.');
   return {...await reviewResult(q,await review(q,id,user.id),true),...extra};
  });}
  fail(404,'Bereich nicht gefunden.');
 }
 };
}
