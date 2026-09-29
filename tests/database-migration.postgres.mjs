// Run against an isolated local PostgreSQL cluster only. Creates and drops two
// uniquely named test databases; never accepts a remote database URL.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {schema} from '../server/db.js';
import {exportBackup,importBackup,validateBackup,rowsDigest} from '../scripts/database-migration.mjs';
const port=Number(process.env.MIGRATION_TEST_PORT||55438);
const config={host:'127.0.0.1',port,user:process.env.USER,database:'postgres'};
const admin=new pg.Client(config);await admin.connect();
const suffix=randomUUID().replaceAll('-',''),names=['source_'+suffix,'target_'+suffix];
let source,target;
try{
 for(const role of ['anon','authenticated'])await admin.query('CREATE ROLE '+role+' NOLOGIN');
 for(const n of names)await admin.query('CREATE DATABASE "'+n+'"');
 source=new pg.Client({...config,database:names[0]});target=new pg.Client({...config,database:names[1]});await source.connect();await target.connect();
 for(const sql of schema)await source.query(sql);
 await source.query("INSERT INTO users VALUES('user1','test@example.invalid','hash','{}',123)");
 await source.query("INSERT INTO library VALUES('design1','user1','designs',$1,3,456,NULL)",[JSON.stringify({project:{name:'FÜR Anna',image:'data:image/png;base64,example'}})]);
 await source.query("INSERT INTO reviews VALUES('review1','user1','designs','design1',0,'Test','tokenhash','fingerprint',1,2,'open',9999999999999,456)");
 await source.query("INSERT INTO review_versions VALUES('review1',1,$1,456)",[JSON.stringify({name:'Version 1',nested:{text:'30 €'}})]);
 await source.query("INSERT INTO review_link_secrets VALUES('review1','sealed-secret')");
 await source.query("INSERT INTO review_events VALUES('comment1','review1',$1,456)",[JSON.stringify({text:'Logo ändern',x:.2,y:.3})]);
 const backup=await exportBackup(source);
 const broken=structuredClone(backup);broken.tables.find(t=>t.name==='users').rows[0].email='changed';
 assert.throws(()=>validateBackup(broken),/checksum/);
 // Force a mid-import FK failure; even the earlier inserts/DDL must roll back.
 const invalid=structuredClone(backup),library=invalid.tables.find(t=>t.name==='library');library.rows[0].user_id='missing';library.sha256=rowsDigest(library.columns,library.rows);
 await assert.rejects(()=>importBackup(target,invalid),/foreign key/);
 assert.equal((await target.query("SELECT count(*) n FROM pg_tables WHERE schemaname='public'")).rows[0].n,'0');
 await importBackup(target,backup);
 const restored=await exportBackup(target);
 assert.deepEqual(restored.tables,backup.tables);
 assert.ok((await target.query("SELECT relrowsecurity FROM pg_class JOIN pg_namespace ns ON ns.oid=relnamespace WHERE ns.nspname='public' AND relkind='r'")).rows.every(r=>r.relrowsecurity));
 await target.query('SET ROLE anon');
 await assert.rejects(()=>target.query('SELECT * FROM users'),/permission denied/);
 await target.query('RESET ROLE');
 await assert.rejects(()=>importBackup(target,backup),/not empty/);
 assert.deepEqual((await exportBackup(target)).tables,backup.tables);
 console.log('PASS: exact restore, private tables, corrupt archive rejection, atomic rollback, nonempty-target protection.');
}finally{
 await source?.end();await target?.end();
 for(const n of names)await admin.query('DROP DATABASE IF EXISTS "'+n+'"');
 for(const role of ['anon','authenticated'])await admin.query('DROP ROLE IF EXISTS '+role);
 await admin.end();
}
