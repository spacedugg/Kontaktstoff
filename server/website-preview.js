import https from 'node:https';
import {gunzipSync,inflateSync,brotliDecompressSync} from 'node:zlib';
import http from 'node:http';
import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
import {HTTPError} from './validation.js';
export function publicIPv4(ip){if(isIP(ip)!==4)return false;const [a,b]=ip.split('.').map(Number);return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0||b===2)||a===198&&(b===18||b===19||b===51)||a===203&&b===0||a===100&&b>=64&&b<=127);}
export function websiteURL(value){let u;try{u=new URL(/^https?:\/\//i.test(value)?value:'https://'+value);}catch{throw new HTTPError(400,'Bitte eine öffentliche Website eingeben.');}if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.port&&!['80','443'].includes(u.port)||u.hostname==='localhost'||!u.hostname.includes('.')||isIP(u.hostname)&&!publicIPv4(u.hostname))throw new HTTPError(400,'Bitte eine öffentliche Website ohne Zugangsdaten eingeben.');u.hash='';return u;}
// Resolve every redirect and pin the approved address to the connection (no DNS rebinding).
export async function safeWebsiteFetch(value,{maxBytes=8*1024*1024,timeout=10000,redirects=3}={}){
 const deadline=Date.now()+timeout;let u=websiteURL(value);
 for(let n=0;n<=redirects;n++){
  const remaining=deadline-Date.now();if(remaining<=0)throw new HTTPError(422,'Die Website antwortet zu langsam. Bitte manuell starten.');
  const records=await Promise.race([lookup(u.hostname,{family:4,all:true}),new Promise((_,reject)=>{const t=setTimeout(()=>reject(new Error('DNS timeout')),remaining);t.unref?.();})]);
  if(!records.length||records.some(r=>!publicIPv4(r.address)))throw new HTTPError(400,'Diese Adresse kann nicht als öffentliche Website gelesen werden.');
  const record=records[0];
  const response=await new Promise((resolve,reject)=>{
   const req=(u.protocol==='https:'?https:http).request(u,{method:'GET',agent:false,headers:{'User-Agent':'Kontaktstoff-WebsitePreview/1.0','Accept':'text/html,image/png,image/jpeg,image/webp','Accept-Encoding':'identity'},lookup:(_host,options,cb)=>options.all?cb(null,[record]):cb(null,record.address,4)},res=>{
    if([301,302,303,307,308].includes(res.statusCode)){res.resume();resolve({redirect:res.headers.location});return;}
    if(res.statusCode!==200){res.resume();reject(new HTTPError(422,'Die Website lässt sich nicht lesen. Du kannst den Vorschlag manuell erstellen.'));return;}
    let size=0;const chunks=[];res.on('data',chunk=>{size+=chunk.length;if(size>maxBytes){req.destroy(new HTTPError(422,'Die Datei ist zu groß. Bitte Inhalte manuell ergänzen.'));}else chunks.push(chunk);});res.on('end',()=>resolve({bytes:Buffer.concat(chunks),type:String(res.headers['content-type']||''),url:u.href,encoding:res.headers['content-encoding']}));res.on('error',reject);
   });const timer=setTimeout(()=>req.destroy(new HTTPError(422,'Die Website antwortet zu langsam. Bitte manuell starten.')),Math.max(1,deadline-Date.now()));req.on('close',()=>clearTimeout(timer));req.on('error',reject);req.end();
  });
  if(!('redirect' in response)){response.bytes=decodeResponse(response.bytes,response.encoding,maxBytes);return response;}if(!response.redirect)break;u=websiteURL(new URL(response.redirect,u).href);
 }
 throw new HTTPError(422,'Die Website leitet zu oft weiter. Bitte die endgültige Adresse verwenden.');
}
export function decodeResponse(bytes,encoding,limit){try{const fn={gzip:gunzipSync,deflate:inflateSync,br:brotliDecompressSync}[encoding];if(encoding&&encoding!=='identity'&&!fn)throw Error('encoding');return fn?fn(bytes,{maxOutputLength:limit}):bytes;}catch{throw new HTTPError(422,'Die Website konnte nicht vollständig gelesen werden. Bitte manuell starten.');}}
const decode=v=>String(v||'').replace(/&#(x[\da-f]+|\d+);/gi,(_,n)=>{const c=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return c>0&&c<=0x10ffff?String.fromCodePoint(c):'';}).replace(/&(amp|quot|apos|lt|gt|nbsp);/g,(_,n)=>({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '}[n]));
const plain=v=>decode(v.replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
function attrs(tag){const out={};for(const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g))out[m[1].toLowerCase()]=decode(m[2]??m[3]??m[4]);return out;}
export function extractWebsite(html,url){
 const meta={};for(const m of html.matchAll(/<meta\b[^>]*>/gi)){const a=attrs(m[0]);if(a.property||a.name)meta[(a.property||a.name).toLowerCase()]=a.content||'';}
 const title=plain(meta['og:title']||html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').slice(0,180),description=plain(meta.description||meta['og:description']||'').slice(0,500),headline=plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'').slice(0,180);
 const siteName=/^(?:https?:|www\.)/i.test(meta['og:site_name']||'')?'':meta['og:site_name'];
 const name=plain(siteName||title.split(/\s[|–—]\s/)[0]||new URL(url).hostname.replace(/^www\./,'')).slice(0,100);
 const asset=v=>{try{const u=new URL(v,url);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}};
 let logo='';for(const m of html.matchAll(/<img\b[^>]*>/gi)){const a=attrs(m[0]);if(/logo/i.test((a.alt||'')+' '+(a.class||'')+' '+(a.src||''))&&a.src){logo=asset(a.src);break;}}
 const color=/^#[\da-f]{6}$/i.test(meta['theme-color']||'')?meta['theme-color']:'';
 return {name,title,description,headline,color,logo,image:asset(meta['og:image']||''),url};
}
export function rasterData(bytes,type){let mime='';if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))mime='image/png';else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)mime='image/jpeg';else if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')mime='image/webp';if(!mime||!type.startsWith('image/'))return '';return 'data:'+mime+';base64,'+bytes.toString('base64');}
export async function readWebsite(value){
 let response;try{response=await safeWebsiteFetch(value);}catch(e){if(e.status)throw e;throw new HTTPError(422,'Die Website konnte nicht gelesen werden. Bitte manuell starten.');}
 if(!response.type.includes('text/html'))throw new HTTPError(422,'Bitte eine Website statt einer Datei eingeben.');
 const data=extractWebsite(response.bytes.toString('utf8'),response.url);const warnings=[];
 for(const [key,src] of [['logo',data.logo],['photo',data.image]]){data[key]='';if(src)try{const r=await safeWebsiteFetch(src,{maxBytes:450000,timeout:5000});data[key]=rasterData(r.bytes,r.type);}catch{};}
 if(!data.logo)warnings.push('Logo nicht automatisch übernommen. Du kannst ein PNG, JPG oder WebP hochladen.');if(!data.description)warnings.push('Kein Angebotstext erkannt. Bitte Angebot und Zielgruppe ergänzen.');
 return {...data,warnings};
}
