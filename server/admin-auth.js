import {scrypt as rawScrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {HTTPError} from './validation.js';
const scrypt=promisify(rawScrypt);
export const ADMIN_ID='kontaktstoff-internal-admin';
export const ADMIN_EMAIL='internal-admin@kontaktstoff.invalid';
export const validAdminHash=value=>typeof value==='string'&&/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(value);
export async function adminLogin(db,password,encoded){
 if(!validAdminHash(encoded))throw new HTTPError(503,'Der Admin-Zugang ist noch nicht eingerichtet.');
 if(typeof password!=='string'||!password.length||password.length>128)throw new HTTPError(401,'Das Passwort stimmt nicht.');
 const [salt,digest]=encoded.split(':'),actual=await scrypt(password,salt,64);
 if(!timingSafeEqual(actual,Buffer.from(digest,'hex')))throw new HTTPError(401,'Das Passwort stimmt nicht.');
 return db.tx(async q=>{
  await q('INSERT INTO users(id,email,password,profile,created_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING',[ADMIN_ID,ADMIN_EMAIL,encoded,JSON.stringify({company:'Kontaktstoff',name:'Kontaktstoff-Team',country:'Deutschland'}),Date.now()]);
  let user=(await q('SELECT * FROM users WHERE id=$1',[ADMIN_ID])).rows[0];
  if(user.password!==encoded){await q('DELETE FROM sessions WHERE user_id=$1',[ADMIN_ID]);await q('UPDATE users SET password=$1 WHERE id=$2',[encoded,ADMIN_ID]);user={...user,password:encoded};}
  return user;
 });
}
