import {proposalService} from './proposals.js';
import {salesService} from './sales.js';
import {ADMIN_ID,ADMIN_EMAIL,validAdminHash,adminLogin} from './admin-auth.js';
import {libraryService} from './library.js';
import {randomBytes,randomUUID,createHash,scrypt as rawScrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {HTTPError,text,profile,payload,requestIssues} from './validation.js';
import {createMailer} from './mail.js';
import {accountServices} from './account-services.js';
import {validURL} from '../studio/src/core.js';
const scrypt=promisify(rawScrypt),hash=v=>createHash('sha256').update(v).digest('hex');
const send=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
const packed=row=>({...JSON.parse(row.payload),id:row.id,revision:Number(row.revision),updatedAt:Number(row.updated_at)});
function jsonObject(value){if(!value||typeof value!=='object'||Array.isArray(value))throw new HTTPError(400,'Bitte ein gültiges JSON-Objekt senden.');return value;}
async function body(req){if(!String(req.headers['content-type']||'').startsWith('application/json'))throw new HTTPError(415,'JSON erwartet.');if(req.body!==undefined){let parsed;try{parsed=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{throw new HTTPError(400,'Ungültige Anfrage.');}if(Buffer.byteLength(JSON.stringify(parsed))>4*1024*1024)throw new HTTPError(413,'Das Projekt überschreitet 4 MB. Bitte Bilder verkleinern.');return jsonObject(parsed);}let data='',bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>4*1024*1024)throw new HTTPError(413,'Das Projekt ist zu groß für die Kontospeicherung (max. 4 MB). Bitte Bilder verkleinern oder lokal als Projekt sichern.');data+=chunk;}try{return jsonObject(JSON.parse(data));}catch{throw new HTTPError(400,'Ungültige Anfrage.');}}
export function createAPI(db,{origin=process.env.PUBLIC_ORIGIN||'http://127.0.0.1:4177',mailer=createMailer(),operatorEmails=process.env.OPERATOR_EMAILS||'',notificationTo=process.env.REQUEST_NOTIFICATION_TO||'',adminPasswordHash=process.env.ADMIN_PASSWORD_HASH||'',reviewLinkKey=process.env.REVIEW_LINK_KEY||''}={}){
 origin=new URL(origin).origin;const cookieName=origin.startsWith('https:')?'__Host-kontaktstoff':'kontaktstoff_session';
 const services=accountServices(db,{origin,mailer,operatorEmails,notificationTo,adminUserId:validAdminHash(adminPasswordHash)?ADMIN_ID:''});
 const cookie=(res,token,maxAge=604800)=>res.setHeader('Set-Cookie',`${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${origin.startsWith('https:')?'; Secure':''}`);
 async function limited(key,max=15){const now=Date.now(),result=await db.query('INSERT INTO rate_limits(key,count,expires) VALUES($1,1,$2) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires < $3 THEN 1 ELSE rate_limits.count+1 END, expires=CASE WHEN rate_limits.expires < $3 THEN $2 ELSE rate_limits.expires END RETURNING count',[key,now+900000,now]);if(Number(result.rows[0].count)>max)throw new HTTPError(429,'Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.');}
 async function session(req){const token=String(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);if(!token)return null;const result=await db.query('SELECT users.id,users.email,users.profile,users.password,sessions.csrf FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token=$1 AND sessions.expires>$2',[hash(token),Date.now()]);const user=result.rows[0];if(user?.id===ADMIN_ID&&(!validAdminHash(adminPasswordHash)||user.password!==adminPasswordHash))return null;return user||null;}
 async function issueSession(user,res){const token=randomBytes(32).toString('base64url'),csrf=randomBytes(24).toString('base64url');await db.query('INSERT INTO sessions(token,user_id,csrf,expires) VALUES($1,$2,$3,$4)',[hash(token),user.id,csrf,Date.now()+604800000]);cookie(res,token);return {user:await services.publicUser(user),csrf};}
 const load=async(q,id,user)=>{const result=await q('SELECT * FROM campaigns WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL',[id,user]);if(!result.rows[0])throw new HTTPError(404,'Kampagne nicht gefunden.');return result.rows[0];};
 const sales=salesService(db),proposals=proposalService(db);
 const libraries=libraryService(db,{origin,limited,reviewLinkKey});
 return async function handle(req,res){
  const url=new URL(req.url,origin),pathname=url.pathname.replace(/\/$/,'');
  if(!pathname.startsWith('/api/')&&!pathname.startsWith('/r/'))return false;
  try{
   if(pathname.startsWith('/r/')){
    if(!['GET','HEAD'].includes(req.method))throw new HTTPError(405,'Methode nicht erlaubt.');
    const token=pathname.slice(3);const result=await db.query('SELECT links.*,campaigns.payload FROM links JOIN campaigns ON campaigns.id=links.campaign_id WHERE links.token=$1 AND campaigns.deleted_at IS NULL',[token]);const link=result.rows[0];
    if(!link||!JSON.parse(link.payload).project.recipients.some(r=>r.id===link.recipient_id))throw new HTTPError(404,'Dieser Kampagnen-Link ist nicht mehr verfügbar.');
    // Count requests, not people. HEAD and common automated previews do not count.
    if(req.method==='GET'&&!/bot|crawler|spider|preview|slack|facebookexternalhit/i.test(req.headers['user-agent']||''))await db.query('INSERT INTO visits(id,token,created_at) VALUES($1,$2,$3)',[randomUUID(),token,Date.now()]);
    res.writeHead(302,{Location:link.target,'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow'});res.end();return true;
   }
   if(pathname==='/api/health'){send(res,200,{available:true,storage:process.env.DATABASE_URL?'postgres':'local',origin,email:mailer.configured});return true;}
   if(!['GET','HEAD'].includes(req.method)&&req.headers.origin!==origin)throw new HTTPError(403,'Die Anfrage muss aus deinem Kontaktstoff-Arbeitsplatz kommen.');
   if(pathname==='/api/sales-inquiries'&&req.method==='POST'){
    const address=process.env.VERCEL?String(req.headers['x-forwarded-for']||'').split(',')[0]:req.socket?.remoteAddress||'local';
    await limited('sales-ip:'+hash(address),8);const input=await body(req);await limited('sales-email:'+hash(String(input.email||'').trim().toLowerCase()),4);
    if(input.proposalSlug){const p=await proposals.public(text(input.proposalSlug,100));input.sourceCompany=p.proposal.company;input.loom=p.proposal.loom;}
    send(res,201,await sales.create(input));return true;
   }
   if(pathname==='/api/auth/admin'&&req.method==='POST'){
    const address=process.env.VERCEL?String(req.headers['x-forwarded-for']||'').split(',')[0]:req.socket?.remoteAddress||'local';
    await limited('admin-ip:'+hash(address),10);await limited('admin-total',100);
    const input=await body(req);send(res,200,await issueSession(await adminLogin(db,input.password,adminPasswordHash),res));return true;
   }
   if(['/api/auth/forgot','/api/auth/reset','/api/auth/verify'].includes(pathname)&&req.method==='POST'){
    const input=await body(req),address=process.env.VERCEL?String(req.headers['x-forwarded-for']||'').split(',')[0]:req.socket?.remoteAddress||'local';await limited('recovery-ip:'+hash(address),30);
    if(pathname.endsWith('/forgot')){
     if(!mailer.configured)throw new HTTPError(503,'Passwort-Wiederherstellung per E-Mail ist noch nicht eingerichtet.');
     const email=text(input.email||'',254).toLowerCase();await limited('recovery-email:'+hash(email),3);
     const found=(await db.query('SELECT * FROM users WHERE email=$1',[email])).rows[0];
     if(found&&found.id!==ADMIN_ID)try{await services.sendToken(found,'reset');}catch{}
     send(res,200,{ok:true,message:'Falls ein Konto mit dieser Adresse besteht, erhältst du einen Link zum Zurücksetzen.'});return true;
    }
    const kind=pathname.endsWith('/reset')?'reset':'verify';const result=await services.consume(input,kind);if(kind==='reset')cookie(res,'',0);send(res,200,result);return true;
   }
   if(['/api/auth/register','/api/auth/login'].includes(pathname)&&req.method==='POST'){
    const input=await body(req),email=text(input.email,254).toLowerCase(),password=input.password;if(typeof password!=='string'||password.length>128)throw new HTTPError(400,'Bitte ein gültiges Passwort eingeben.');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new HTTPError(400,'Bitte eine gültige E-Mail-Adresse eingeben.');
    // Account and network limits are persisted across process restarts.
    const address=process.env.VERCEL?String(req.headers['x-forwarded-for']||'').split(',')[0]:req.socket?.remoteAddress||'local';await limited('auth-email:'+hash(email));await limited('auth-ip:'+hash(address),60);
    if(email===ADMIN_EMAIL)throw new HTTPError(403,'Bitte den internen Zugang unter /admin verwenden.');
    if(pathname.endsWith('register')){
     if(password.length<12)throw new HTTPError(400,'Das Passwort braucht mindestens 12 Zeichen.');const company=profile(input.profile||{});if(!company.company||!company.name)throw new HTTPError(400,'Unternehmen und Ansprechpartner fehlen.');
     const salt=randomBytes(16).toString('hex'),digest=(await scrypt(password,salt,64)).toString('hex'),user={id:randomUUID(),email,profile:JSON.stringify(company)};
     try{await db.query('INSERT INTO users(id,email,password,profile,created_at) VALUES($1,$2,$3,$4,$5)',[user.id,email,salt+':'+digest,user.profile,Date.now()]);}catch(e){if(String(e.message).match(/unique|duplicate/i))throw new HTTPError(409,'Mit dieser E-Mail besteht bereits ein Konto. Bitte anmelden.');throw e;}
     const result=await issueSession(user,res);if(mailer.configured)try{await services.sendToken(user,'verify');result.verificationSent=true;}catch{result.verificationSent=false;}send(res,201,result);return true;
    }
    const result=await db.query('SELECT * FROM users WHERE email=$1',[email]),user=result.rows[0];const [salt,expected]=(user?.password||'00000000000000000000000000000000:'+''.padEnd(128,'0')).split(':');const actual=await scrypt(password,salt,64);
    if(!user||!timingSafeEqual(actual,Buffer.from(expected,'hex')))throw new HTTPError(401,'E-Mail oder Passwort stimmt nicht.');send(res,200,await issueSession(user,res));return true;
   }
   if(pathname==='/api/proposal'&&req.method==='GET'){send(res,200,await proposals.public(text(url.searchParams.get('slug')||'',100)));return true;}
   if(pathname==='/api/review'){send(res,200,await libraries.public(req,req.method==='GET'?{}:await body(req)));return true;}
   const user=await session(req);
   if(pathname==='/api/auth/me'&&req.method==='GET'){send(res,200,user?{user:await services.publicUser(user),csrf:user.csrf}:{user:null});return true;}
   if(!user)throw new HTTPError(401,'Bitte melde dich an, um deine Kampagne im Konto zu speichern.');
   if(!['GET','HEAD'].includes(req.method)&&req.headers['x-csrf-token']!==user.csrf)throw new HTTPError(403,'Die Sitzung wurde erneuert. Bitte lade die Seite neu.');
   if(pathname.startsWith('/api/library/')||pathname==='/api/compose'||pathname==='/api/reviews'||pathname.startsWith('/api/reviews/')){send(res,200,await libraries.owner(pathname,req.method,['GET','HEAD'].includes(req.method)?{}:await body(req),user));return true;}
   if(pathname==='/api/auth/send-verification'&&req.method==='POST'){await limited('verify:'+user.id,3);if(!await services.verified(user))await services.sendToken(user,'verify');send(res,200,{ok:true});return true;}
   if(pathname==='/api/operator/proposals'||pathname.startsWith('/api/operator/proposals/')){
    await services.requireOperator(user);
    if(pathname.endsWith('/generate')&&req.method==='POST'){await limited('proposal-generate:'+user.id,20);send(res,200,await proposals.generate(await body(req)));return true;}
    if(pathname==='/api/operator/proposals'){if(req.method==='GET'){send(res,200,await proposals.list());return true;}if(req.method==='POST'){send(res,201,await proposals.save(null,await body(req)));return true;}}
    const m=pathname.match(/^\/api\/operator\/proposals\/([a-f0-9-]{36})(\/disable)?$/i);
    if(m){if(req.method==='GET'&&!m[2]){send(res,200,await proposals.get(m[1]));return true;}if(req.method==='PUT'&&!m[2]){send(res,200,await proposals.save(m[1],await body(req)));return true;}if(req.method==='POST'&&m[2]){send(res,200,await proposals.disable(m[1],await body(req)));return true;}}
    throw new HTTPError(405,'Methode nicht erlaubt.');
   }
   if(pathname==='/api/operator/sales'||pathname.startsWith('/api/operator/sales/')){
    await services.requireOperator(user);if(pathname==='/api/operator/sales'&&req.method==='GET'){send(res,200,await sales.list());return true;}
    const m=pathname.match(/^\/api\/operator\/sales\/([a-f0-9-]{36})$/i);if(m&&req.method==='PUT'){send(res,200,await sales.update(m[1],await body(req)));return true;}
    throw new HTTPError(405,'Methode nicht erlaubt.');
   }
   if(pathname==='/api/operator/requests'||pathname.startsWith('/api/operator/requests/')){
    await services.requireOperator(user);const match=pathname.match(/^\/api\/operator\/requests(?:\/([a-zA-Z0-9-]+))?(?:\/(notify))?$/);if(!match)throw new HTTPError(404,'Anfrage nicht gefunden.');const [,id,action]=match;
    if(req.method==='GET'&&!action){send(res,200,await services.inbox(id));return true;}
    if(req.method==='PUT'&&id&&!action){send(res,200,await services.updateRequest(id,await body(req),user));return true;}
    if(req.method==='POST'&&id&&action==='notify'){await services.inbox(id);await limited('notify:'+user.id,15);send(res,200,await services.notifyRequest(id));return true;}
    throw new HTTPError(405,'Methode nicht erlaubt.');
   }
   if(pathname==='/api/auth/logout'&&req.method==='POST'){await db.query('DELETE FROM sessions WHERE user_id=$1 AND csrf=$2',[user.id,user.csrf]);cookie(res,'',0);send(res,200,{ok:true});return true;}
   if(pathname==='/api/profile'&&req.method==='PUT'){const value=profile(await body(req));if(!value.company||!value.name)throw new HTTPError(400,'Unternehmen und Ansprechpartner fehlen.');await db.query('UPDATE users SET profile=$1 WHERE id=$2',[JSON.stringify(value),user.id]);send(res,200,{profile:value});return true;}
   if(pathname==='/api/campaigns'&&req.method==='GET'){const result=await db.query('SELECT * FROM campaigns WHERE user_id=$1 AND deleted_at IS NULL ORDER BY updated_at DESC',[user.id]);send(res,200,{campaigns:result.rows.map(packed)});return true;}
   if(pathname==='/api/campaigns'&&req.method==='POST'){
    const value=payload(await body(req)),id=randomUUID();value.project.id=id;value.project.updatedAt=Date.now();await db.query('INSERT INTO campaigns(id,user_id,payload,revision,updated_at) VALUES($1,$2,$3,1,$4)',[id,user.id,JSON.stringify(value),Date.now()]);send(res,201,{...value,id,revision:1});return true;
   }
   const match=pathname.match(/^\/api\/campaigns\/([-a-zA-Z0-9_]+)(?:\/(request|tracking|stats))?$/);
   if(match){const [,id,action]=match;
    if(!action&&req.method==='GET'){send(res,200,packed(await load(db.query,id,user.id)));return true;}
    if(!action&&req.method==='DELETE'){await db.tx(async q=>{await load(q,id,user.id);await q('UPDATE campaigns SET deleted_at=$1 WHERE id=$2 AND user_id=$3',[Date.now(),id,user.id]);});send(res,200,{ok:true});return true;}
    if(!action&&req.method==='PUT'){
     const input=await body(req),value=payload(input);value.project.id=id;
     const saved=await db.tx(async q=>{const before=await load(q,id,user.id);value.meta.status=JSON.parse(before.payload).meta.status||'draft';const result=await q('UPDATE campaigns SET payload=$1, revision=revision+1, updated_at=$2 WHERE id=$3 AND user_id=$4 AND revision=$5 RETURNING *',[JSON.stringify(value),Date.now(),id,user.id,Number(input.revision)||0]);if(!result.rows.length)throw new HTTPError(409,'Diese Kampagne wurde in einem anderen Fenster geändert. Bitte neu laden; dein lokaler Entwurf bleibt erhalten.');return packed(result.rows[0]);});send(res,200,saved);return true;
    }
    if(action==='request'&&req.method==='POST'){
     const input=await body(req),key=text(input.key,100);if(!/^[a-zA-Z0-9-]{20,100}$/.test(key))throw new HTTPError(400,'Ungültige Anfragekennung.');
     const result=await db.tx(async q=>{const c=await load(q,id,user.id),value=JSON.parse(c.payload),previous=await q('SELECT id,created_at FROM requests WHERE id=$1 AND user_id=$2 AND campaign_id=$3',[key,user.id,id]);if(previous.rows[0])return previous.rows[0];
      if(Number(input.revision)!==Number(c.revision))throw new HTTPError(409,'Dein Entwurf wurde geändert. Prüfe bitte den aktuellen Stand.');
      if(value.meta.builder&&input.confirmed!==true)throw new HTTPError(400,'Bitte bestätige, dass du den aktuellen Stand geprüft hast.');
      const issues=requestIssues(value.project,value.meta,JSON.parse(user.profile));if(issues.length)throw new HTTPError(400,issues.join(' '));
      const at=Date.now();await q('INSERT INTO requests(id,campaign_id,user_id,payload,created_at) VALUES($1,$2,$3,$4,$5)',[key,id,user.id,JSON.stringify({...value,profile:JSON.parse(user.profile),email:user.email,revision:Number(c.revision),...(value.meta.builder?{submission:{checkedAt:at,checkedBy:user.id,scope:'design-and-data-review'}}:{})}),at]);
      value.meta.status='requested';const updated=await q('UPDATE campaigns SET payload=$1,revision=revision+1,updated_at=$2 WHERE id=$3 AND revision=$4 RETURNING id',[JSON.stringify(value),at,id,Number(c.revision)]);if(!updated.rows.length)throw new HTTPError(409,'Der Entwurf wurde geändert. Bitte erneut prüfen.');return {id:key,created_at:at};});send(res,201,{...result,...await services.notifyRequest(result.id)});return true;
    }
    if(action==='stats'&&req.method==='GET'){await load(db.query,id,user.id);const visits=await db.query('SELECT links.recipient_id, COUNT(visits.id) AS count, MIN(visits.created_at) AS first_visit FROM links LEFT JOIN visits ON visits.token=links.token WHERE links.campaign_id=$1 GROUP BY links.recipient_id',[id]);const requests=await db.query('SELECT requests.id,requests.created_at,request_workflow.status FROM requests LEFT JOIN request_workflow ON request_workflow.request_id=requests.id WHERE requests.campaign_id=$1 AND requests.user_id=$2 ORDER BY requests.created_at DESC',[id,user.id]);const daily=await db.query('SELECT CAST(visits.created_at / 86400000 AS BIGINT) AS day, COUNT(visits.id) AS count FROM visits JOIN links ON links.token=visits.token WHERE links.campaign_id=$1 AND visits.created_at>=$2 GROUP BY CAST(visits.created_at / 86400000 AS BIGINT) ORDER BY day',[id,Date.now()-30*86400000]);const tracked=await db.query('SELECT recipient_id FROM links WHERE campaign_id=$1',[id]);send(res,200,{visits:visits.rows,requests:requests.rows,scanDays:daily.rows,trackedRecipientIds:tracked.rows.map(r=>r.recipient_id),measuredAt:Date.now()});return true;}
    if(action==='tracking'&&req.method==='POST'){
     const input=await body(req);const result=await db.tx(async q=>{const c=await load(q,id,user.id);if(Number(input.revision)!==Number(c.revision))throw new HTTPError(409,'Bitte den aktuellen Kampagnenstand laden.');const value=JSON.parse(c.payload);if(!value.project.recipients.length)throw new HTTPError(400,'Füge zuerst deine Kontakte hinzu.');
      for(const r of value.project.recipients){const existing=(await q('SELECT * FROM links WHERE campaign_id=$1 AND recipient_id=$2',[id,r.id])).rows[0];const tracked=existing?origin+'/r/'+existing.token:null;const linkKey=Object.values(value.project.sides).some(s=>s.fields.some(f=>f.type==='qr'&&f.text.includes('{{cart_url}}')))?'cart_url':'chatbot_url';let target=r[linkKey]||value.meta.targetURL;
       if(target===tracked)target=existing.target;
       if(!validURL(target)||target.length>2000||new URL(target).username||new URL(target).password||new URL(target).origin===origin&&new URL(target).pathname.startsWith('/r/'))throw new HTTPError(400,`Bitte einen direkten Ziel-Link für ${r.company} hinterlegen.`);
       const token=existing?.token||randomBytes(18).toString('base64url');await q('INSERT INTO links(token,campaign_id,recipient_id,target) VALUES($1,$2,$3,$4) ON CONFLICT(campaign_id,recipient_id) DO UPDATE SET target=$4',[token,id,r.id,target]);r[linkKey]=origin+'/r/'+token;
      }
      const updated=await q('UPDATE campaigns SET payload=$1,revision=revision+1,updated_at=$2 WHERE id=$3 AND revision=$4 RETURNING *',[JSON.stringify(value),Date.now(),id,Number(input.revision)]);if(!updated.rows.length)throw new HTTPError(409,'Bitte neu laden.');return packed(updated.rows[0]);});send(res,200,result);return true;
    }
   }
   throw new HTTPError(404,'Dieser Bereich wurde nicht gefunden.');
  }catch(e){if(e.status)send(res,e.status,{error:e.message});else{console.error('Kontaktstoff API:',e.code||'internal_error');send(res,500,{error:'Das Speichern hat nicht geklappt. Bitte versuche es erneut.'});}return true;}
 };
}
