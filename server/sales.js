import {createHash} from 'node:crypto';
import {HTTPError,text} from './validation.js';
import {validURL} from '../studio/src/core.js';
import {SALES_CASES,loomURL} from '../mailings/config.js';
const statuses={new:'Neu',contacted:'Kontaktiert',qualified:'Pilot planen',closed:'Abgeschlossen',archived:'Archiviert'};
export function salesService(db){
 return {
 async create(input){
  if(input.website_extra)throw new HTTPError(400,'Die Anfrage konnte nicht gespeichert werden.');
  const id=text(input.id||'',100);if(!/^[a-f0-9-]{36}$/i.test(id))throw new HTTPError(400,'Bitte die Seite neu laden.');
  const value={name:text(input.name||'',100),company:text(input.company||'',150),email:text(input.email||'',254).toLowerCase(),website:text(input.website||'',300),useCase:text(input.useCase||'',30),quantity:Number(input.quantity||0),message:text(input.message||'',2000),sourceCompany:text(input.sourceCompany||'',100),loom:loomURL(input.loom||''),source:'mailings'};
  if(!value.name||!value.company||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))throw new HTTPError(400,'Bitte Name, Unternehmen und eine gültige E-Mail-Adresse angeben.');
  if(!Object.hasOwn(SALES_CASES,value.useCase)||!Number.isInteger(value.quantity)||value.quantity<0||value.quantity>100000)throw new HTTPError(400,'Bitte Ziel und Kontaktzahl prüfen.');
  if(value.website&&(!validURL(value.website)||new URL(value.website).username||new URL(value.website).password))throw new HTTPError(400,'Bitte eine gültige Website eintragen.');
  const digest=createHash('sha256').update(JSON.stringify(value)).digest('hex');
  await db.tx(async q=>{await q("INSERT INTO sales_inquiries(id,payload,digest,created_at,status,note,revision) VALUES($1,$2,$3,$4,'new','',1) ON CONFLICT(id) DO NOTHING",[id,JSON.stringify(value),digest,Date.now()]);const existing=(await q('SELECT digest FROM sales_inquiries WHERE id=$1',[id])).rows[0];if(existing.digest!==digest)throw new HTTPError(409,'Diese Anfrage wurde bereits gespeichert. Lade die Seite für eine neue Anfrage neu.');});
  return {ok:true,id};
 },
 async list(){const rows=(await db.query('SELECT * FROM sales_inquiries ORDER BY created_at DESC LIMIT 200')).rows;return {items:rows.map(r=>({...JSON.parse(r.payload),id:r.id,createdAt:Number(r.created_at),status:r.status,note:r.note,revision:Number(r.revision)}))};},
 async update(id,input){const status=text(input.status||'',20),note=text(input.note||'',3000);if(!Object.hasOwn(statuses,status))throw new HTTPError(400,'Ungültiger Status.');const result=await db.query('UPDATE sales_inquiries SET status=$1,note=$2,revision=revision+1 WHERE id=$3 AND revision=$4 RETURNING id,revision',[status,note,id,Number(input.revision)||0]);if(!result.rows.length)throw new HTTPError(409,'Die Anfrage wurde geändert. Bitte aktualisieren.');return {ok:true};}
 };
}
