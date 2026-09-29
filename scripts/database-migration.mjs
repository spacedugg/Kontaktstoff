// Application-only PostgreSQL migration. No provider schemas, roles or secrets
// are copied. Connection strings are read from the environment, never logged.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import pg from 'pg';
import {schema,postgresOptions} from '../server/db.js';

export const tables=schema.flatMap(sql=>sql.match(/^CREATE TABLE IF NOT EXISTS (\w+)/)?.[1]||[]);
const identifier=name=>'"'+name.replaceAll('"','""')+'"';
const digest=value=>createHash('sha256').update(value).digest('hex');
export function rowsDigest(columns,rows){return digest(rows.map(row=>JSON.stringify(columns.map(c=>row[c]))).sort().join('\n'));}
export function validateBackup(backup){
 if(backup.format!=='kontaktstoff-postgres-v1'||backup.schemaHash!==digest(JSON.stringify(schema)))throw Error('Backup format or application schema does not match.');
 if(JSON.stringify(backup.tables.map(t=>t.name))!==JSON.stringify(tables))throw Error('Backup table list does not match.');
 for(const t of backup.tables){
  if(!Array.isArray(t.columns)||new Set(t.columns).size!==t.columns.length||t.columns.some(c=>!/^\w+$/.test(c)))throw Error('Invalid backup columns: '+t.name);
  if(t.rows.some(r=>JSON.stringify(Object.keys(r).sort())!==JSON.stringify([...t.columns].sort())))throw Error('Incomplete row: '+t.name);
  if(t.sha256!==rowsDigest(t.columns,t.rows))throw Error('Backup checksum mismatch: '+t.name);
 }
 return backup;
}
async function columns(q,table){return (await q('SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position',['public',table])).rows.map(r=>r.column_name);}
async function checkColumns(q,t){if(JSON.stringify(await columns(q,t.name))!==JSON.stringify(t.columns))throw Error('Column mismatch: '+t.name);}
async function checkRows(q,t){
 await checkColumns(q,t);
 const rows=(await q('SELECT * FROM public.'+identifier(t.name))).rows;
 if(rows.length!==t.rows.length||rowsDigest(t.columns,rows)!==t.sha256)throw Error('Data verification failed: '+t.name);
}
export async function exportBackup(client){
 const q=(...args)=>client.query(...args);
 await q('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 try{
  const existing=(await q("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rows.map(r=>r.tablename);
  if(existing.some(t=>!tables.includes(t))||tables.some(t=>!existing.includes(t)))throw Error('Source has unexpected or missing tables; inspect before migration.');
  const result={format:'kontaktstoff-postgres-v1',createdAt:new Date().toISOString(),schemaHash:digest(JSON.stringify(schema)),tables:[]};
  for(const name of tables){const cols=await columns(q,name),rows=(await q('SELECT * FROM public.'+identifier(name))).rows;result.tables.push({name,columns:cols,rows,sha256:rowsDigest(cols,rows)});}
  await q('COMMIT');return validateBackup(result);
 }catch(e){await q('ROLLBACK');throw e;}
}
export async function importBackup(client,backup){
 validateBackup(backup);const q=(...args)=>client.query(...args);
 await q('BEGIN');
 try{
  await q('SELECT pg_advisory_xact_lock(74290123)');
  for(const sql of schema)await q(sql);
  await q('LOCK TABLE '+tables.map(t=>'public.'+identifier(t)).join(',')+' IN ACCESS EXCLUSIVE MODE');
  for(const t of backup.tables){await checkColumns(q,t);if(Number((await q('SELECT count(*) AS n FROM public.'+identifier(t.name))).rows[0].n))throw Error('Target is not empty: '+t.name);}
  for(const t of backup.tables){
   const sql='INSERT INTO public.'+identifier(t.name)+' ('+t.columns.map(identifier).join(',')+') VALUES ('+t.columns.map((_,i)=>'$'+(i+1)).join(',')+')';
   for(const row of t.rows)await q(sql,t.columns.map(c=>row[c]));
   // The application authenticates on its own server. Supabase's public Data
   // API must never expose its users, customer data, sessions or review tokens.
   await q('ALTER TABLE public.'+identifier(t.name)+' ENABLE ROW LEVEL SECURITY');
   await q('REVOKE ALL ON public.'+identifier(t.name)+' FROM PUBLIC');
   for(const role of ['anon','authenticated'])if((await q('SELECT 1 FROM pg_roles WHERE rolname=$1',[role])).rows.length)await q('REVOKE ALL ON public.'+identifier(t.name)+' FROM '+identifier(role));
   await checkRows(q,t);
  }
  await q('COMMIT');
 }catch(e){await q('ROLLBACK');throw e;}
}
async function run(){
 const [action,file]=process.argv.slice(2);
 if(!['export','import','verify'].includes(action)||!file)throw Error('Usage: node scripts/database-migration.mjs export|import|verify BACKUP.json.gz');
 const url=process.env[action==='export'?'SOURCE_DATABASE_URL':'TARGET_DATABASE_URL'];
 if(!url)throw Error('Required migration connection variable missing.');
 if(!['localhost','127.0.0.1','::1'].includes(new URL(url).hostname)&&new URL(url).searchParams.get('sslmode')!=='verify-full')throw Error('Remote migration connections require sslmode=verify-full.');
 const client=new pg.Client({...postgresOptions(url),connectionTimeoutMillis:15000});
 try{
  await client.connect();let backup;
  if(action==='export'){
   backup=await exportBackup(client);
   await mkdir(path.dirname(path.resolve(file)),{recursive:true,mode:0o700});
   await writeFile(file,gzipSync(JSON.stringify(backup)),{mode:0o600,flag:'wx'});
  }else{
   backup=validateBackup(JSON.parse(gunzipSync(await readFile(file)).toString()));
   if(action==='import')await importBackup(client,backup);
   else{await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');for(const t of backup.tables)await checkRows((...args)=>client.query(...args),t);await client.query('COMMIT');}
  }
  console.log(JSON.stringify({action,ok:true,tables:backup.tables.map(t=>({name:t.name,count:t.rows.length}))}));
 }finally{await client.end();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)run().catch(e=>{console.error('Migration stopped:',e.code||e.message);process.exitCode=1;});
