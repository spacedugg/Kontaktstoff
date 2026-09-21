import {mkdir} from 'node:fs/promises';
import path from 'node:path';
const schema=[

 'CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, profile TEXT NOT NULL, created_at BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS library (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), kind TEXT NOT NULL, payload TEXT NOT NULL, revision INTEGER NOT NULL, updated_at BIGINT NOT NULL, deleted_at BIGINT)',
 'CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), source_kind TEXT NOT NULL, source_id TEXT NOT NULL, recipient_index INTEGER NOT NULL, title TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, fingerprint TEXT NOT NULL, version INTEGER NOT NULL, revision INTEGER NOT NULL, status TEXT NOT NULL, expires_at BIGINT NOT NULL, updated_at BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS review_versions (review_id TEXT NOT NULL REFERENCES reviews(id), version INTEGER NOT NULL, payload TEXT NOT NULL, created_at BIGINT NOT NULL, PRIMARY KEY(review_id,version))',
 'CREATE TABLE IF NOT EXISTS review_link_secrets (review_id TEXT PRIMARY KEY REFERENCES reviews(id), sealed TEXT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS review_trash (review_id TEXT PRIMARY KEY REFERENCES reviews(id), previous_status TEXT NOT NULL, deleted_at BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS review_events (id TEXT PRIMARY KEY, review_id TEXT NOT NULL REFERENCES reviews(id), payload TEXT NOT NULL, created_at BIGINT NOT NULL)',
 'CREATE INDEX IF NOT EXISTS library_owner ON library(user_id,kind)',
 'CREATE INDEX IF NOT EXISTS reviews_owner ON reviews(user_id)',
 'CREATE INDEX IF NOT EXISTS review_events_parent ON review_events(review_id)',
 'CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), csrf TEXT NOT NULL, expires BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS campaigns (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), payload TEXT NOT NULL, revision INTEGER NOT NULL, updated_at BIGINT NOT NULL, deleted_at BIGINT)',
 'CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES users(id), payload TEXT NOT NULL, created_at BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS links (token TEXT PRIMARY KEY, campaign_id TEXT NOT NULL, recipient_id TEXT NOT NULL, target TEXT NOT NULL, UNIQUE(campaign_id, recipient_id))',
 'CREATE TABLE IF NOT EXISTS visits (id TEXT PRIMARY KEY, token TEXT NOT NULL REFERENCES links(token), created_at BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS email_verifications (user_id TEXT PRIMARY KEY REFERENCES users(id), verified_at BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS account_tokens (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), kind TEXT NOT NULL, expires BIGINT NOT NULL)',
 "CREATE TABLE IF NOT EXISTS request_workflow (request_id TEXT PRIMARY KEY REFERENCES requests(id), status TEXT NOT NULL, note TEXT NOT NULL, revision INTEGER NOT NULL, updated_at BIGINT NOT NULL, updated_by TEXT NOT NULL REFERENCES users(id))",
 'CREATE TABLE IF NOT EXISTS request_notifications (request_id TEXT PRIMARY KEY REFERENCES requests(id), sent_at BIGINT NOT NULL)',
 'CREATE INDEX IF NOT EXISTS campaigns_owner ON campaigns(user_id)',
 'CREATE INDEX IF NOT EXISTS visits_token ON visits(token)',
 'CREATE INDEX IF NOT EXISTS requests_owner ON requests(user_id)'
];
export async function connectDB({url=process.env.DATABASE_URL,file=process.env.SQLITE_PATH||'.data/kontaktstoff.sqlite'}={}){
 let db;
 if(url){const {Pool}=await import('pg');const pool=new Pool({connectionString:url,max:5,connectionTimeoutMillis:10000,idleTimeoutMillis:30000,allowExitOnIdle:true});pool.on('error',()=>console.error('Kontaktstoff: Datenbankverbindung unterbrochen.'));db={query:(sql,args=[])=>pool.query(sql,args),async tx(fn){const client=await pool.connect();try{await client.query('BEGIN');const value=await fn((sql,args=[])=>client.query(sql,args));await client.query('COMMIT');return value;}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}},close:()=>pool.end()};}
 else{
  if(process.env.VERCEL||process.env.NODE_ENV==='production')throw Error('DATABASE_URL fehlt. Kein flüchtiger Dateispeicher in Produktion.');
  if(file!==':memory:')await mkdir(path.dirname(file),{recursive:true,mode:0o700});
  const {DatabaseSync}=await import('node:sqlite');const sqlite=new DatabaseSync(file);sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  const query=async(sql,args=[])=>{const bindings=[];const statement=sqlite.prepare(sql.replace(/\$(\d+)/g,(_,n)=>{bindings.push(args[Number(n)-1]);return '?';}));if(/^\s*(SELECT|WITH)/i.test(sql)||/RETURNING/i.test(sql)){const rows=statement.all(...bindings);return {rows,rowCount:rows.length};}const result=statement.run(...bindings);return {rows:[],rowCount:Number(result.changes)};};
  let pending=Promise.resolve();const serial=fn=>{const next=pending.then(fn);pending=next.catch(()=>{});return next;};
  db={query:(...args)=>serial(()=>query(...args)),tx:fn=>serial(async()=>{sqlite.exec('BEGIN IMMEDIATE');try{const value=await fn(query);sqlite.exec('COMMIT');return value;}catch(e){sqlite.exec('ROLLBACK');throw e;}}),close:async()=>{await pending;sqlite.close();}};
 }
 await db.tx(async q=>{if(url)await q('SELECT pg_advisory_xact_lock(74290123)');for(const sql of schema)await q(sql);});return db;
}
