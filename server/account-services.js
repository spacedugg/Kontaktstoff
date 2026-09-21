import {randomBytes,createHash,scrypt as rawScrypt} from 'node:crypto';
import {promisify} from 'node:util';
import {HTTPError,text} from './validation.js';
const scrypt=promisify(rawScrypt),hash=value=>createHash('sha256').update(value).digest('hex');
export const REQUEST_STATES={new:'Neu',reviewing:'In Prüfung',quoted:'Angebot erstellt',production:'In Umsetzung',completed:'Abgeschlossen',cancelled:'Abgesagt'};
export function accountServices(db,{origin,mailer,operatorEmails='',notificationTo=''}) {
 const operators=new Set(operatorEmails.split(',').map(e=>e.trim().toLowerCase()).filter(Boolean));
 async function verified(user){return Boolean((await db.query('SELECT user_id FROM email_verifications WHERE user_id=$1',[user.id])).rows.length);}
 async function operator(user){return operators.has(user.email)&&await verified(user);}
 async function publicUser(user){return {id:user.id,email:user.email,profile:JSON.parse(user.profile),emailVerified:await verified(user),operator:await operator(user)};}
 async function requireOperator(user){if(!await operator(user))throw new HTTPError(403,'Dieser Bereich ist nur für das Kontaktstoff-Team freigegeben.');}
 async function sendToken(user,kind){
  if(!mailer.configured)throw new HTTPError(503,'E-Mail-Versand ist noch nicht eingerichtet. Bitte wende dich an Kontaktstoff.');
  const token=randomBytes(32).toString('base64url'),digest=hash(token);
  await db.query('INSERT INTO account_tokens(token,user_id,kind,expires) VALUES($1,$2,$3,$4)',[digest,user.id,kind,Date.now()+(kind==='reset'?1800000:86400000)]);
  // Fragments keep the secret out of HTTP access logs and referrer headers.
  const link=`${origin}/konto/#${kind}=${token}`;
  try{await mailer.send({to:user.email,id:'account-'+digest,subject:kind==='reset'?'Dein neues Passwort · Kontaktstoff':'Bestätige deine E-Mail · Kontaktstoff',text:kind==='reset'?`Du möchtest dein Passwort zurücksetzen? Öffne diesen Link innerhalb von 30 Minuten:\n\n${link}\n\nFalls du das nicht angefordert hast, ignoriere diese E-Mail.`:`Bestätige deine E-Mail-Adresse für dein Kontaktstoff-Konto:\n\n${link}\n\nDer Link ist 24 Stunden gültig. Falls du das Konto nicht angelegt hast, ignoriere diese E-Mail.`});}
  catch{await db.query('DELETE FROM account_tokens WHERE token=$1',[digest]);throw new HTTPError(503,'Die E-Mail konnte gerade nicht versendet werden. Bitte später erneut versuchen.');}
 }
 async function consume(input,kind){
  const token=text(input.token||'',100);if(!/^[\w-]{43}$/.test(token))throw new HTTPError(400,'Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.');
  let encoded;
  if(kind==='reset'){const password=input.password;if(typeof password!=='string'||password.length<12||password.length>128)throw new HTTPError(400,'Das Passwort braucht 12 bis 128 Zeichen.');const salt=randomBytes(16).toString('hex');encoded=salt+':'+(await scrypt(password,salt,64)).toString('hex');}
  return db.tx(async q=>{
   const result=await q('DELETE FROM account_tokens WHERE token=$1 AND kind=$2 AND expires>$3 RETURNING user_id',[hash(token),kind,Date.now()]);
   const id=result.rows[0]?.user_id;if(!id)throw new HTTPError(400,'Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.');
   if(kind==='reset'){await q('UPDATE users SET password=$1 WHERE id=$2',[encoded,id]);await q('DELETE FROM sessions WHERE user_id=$1',[id]);}
   await q('INSERT INTO email_verifications(user_id,verified_at) VALUES($1,$2) ON CONFLICT(user_id) DO NOTHING',[id,Date.now()]);
   await q('DELETE FROM account_tokens WHERE user_id=$1 AND kind=$2',[id,kind]);
   return {ok:true};
  });
 }
 async function notifyRequest(id){
  if(!mailer.configured||!notificationTo)return {notification:'not_configured'};
  if((await db.query('SELECT request_id FROM request_notifications WHERE request_id=$1',[id])).rows.length)return {notification:'sent'};
  try{
   await mailer.send({to:notificationTo,id:'request-'+id,subject:'Neue Kampagnenanfrage · Kontaktstoff',text:`Eine neue Kampagnenanfrage wartet auf euch.\n\nIm geschützten Kundenbereich ansehen:\n${origin}/konto/?tab=inbox&requestId=${encodeURIComponent(id)}\n\nAnfrage: ${id}`});
   await db.query('INSERT INTO request_notifications(request_id,sent_at) VALUES($1,$2) ON CONFLICT(request_id) DO NOTHING',[id,Date.now()]);return {notification:'sent'};
  }catch{return {notification:'pending'};}
 }
 async function inbox(id){
  if(id){const row=(await db.query('SELECT requests.*, request_workflow.status, request_workflow.note, request_workflow.revision AS workflow_revision FROM requests LEFT JOIN request_workflow ON request_workflow.request_id=requests.id WHERE requests.id=$1',[id])).rows[0];if(!row)throw new HTTPError(404,'Anfrage nicht gefunden.');return {...JSON.parse(row.payload),id:row.id,createdAt:Number(row.created_at),status:row.status||'new',note:row.note||'',workflowRevision:Number(row.workflow_revision||0)};}
  const rows=(await db.query('SELECT requests.*,request_workflow.status,request_notifications.sent_at FROM requests LEFT JOIN request_workflow ON request_workflow.request_id=requests.id LEFT JOIN request_notifications ON request_notifications.request_id=requests.id ORDER BY requests.created_at DESC LIMIT 100')).rows;
  return {requests:rows.map(r=>{const v=JSON.parse(r.payload);return {id:r.id,createdAt:Number(r.created_at),company:v.profile.company,name:v.profile.name,email:v.email,campaign:v.project.name,quantity:v.meta.quantity,status:r.status||'new',notified:Boolean(r.sent_at)};})};
 }
 async function updateRequest(id,input,user){
  const status=text(input.status||'',30),note=text(input.note||'',3000);if(!Object.hasOwn(REQUEST_STATES,status))throw new HTTPError(400,'Ungültiger Status.');
  await db.tx(async q=>{if(!(await q('SELECT id FROM requests WHERE id=$1',[id])).rows.length)throw new HTTPError(404,'Anfrage nicht gefunden.');
   await q("INSERT INTO request_workflow(request_id,status,note,revision,updated_at,updated_by) VALUES($1,'new','',0,$2,$3) ON CONFLICT(request_id) DO NOTHING",[id,Date.now(),user.id]);
   const result=await q('UPDATE request_workflow SET status=$1,note=$2,revision=revision+1,updated_at=$3,updated_by=$4 WHERE request_id=$5 AND revision=$6 RETURNING request_id',[status,note,Date.now(),user.id,id,Number(input.workflowRevision)]);if(!result.rows.length)throw new HTTPError(409,'Die Anfrage wurde zwischenzeitlich geändert. Bitte neu laden.');
  });return inbox(id);
 }
 return {publicUser,verified,requireOperator,sendToken,consume,notifyRequest,inbox,updateRequest};
}
