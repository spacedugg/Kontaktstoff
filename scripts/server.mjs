import {connectDB} from '../server/db.js';
import {createAPI} from '../server/api.js';
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const api=createAPI(await connectDB(),{origin:process.env.PUBLIC_ORIGIN||`http://127.0.0.1:${process.env.PORT||4177}`});
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf','.json':'application/json','.pdf':'application/pdf','.wasm':'application/wasm'};
http.createServer(async(req,res)=>{
  if(await api(req,res))return;
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname.split('/').some(s=>s.startsWith('.'))||/^\/(server|api|node_modules)(\/|$)/.test(pathname))throw new Error('Private path');
    let target=path.resolve(root, '.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if (!target.startsWith(root+path.sep) && target!==root) throw new Error('Invalid path');
    if ((await stat(target)).isDirectory()) target=path.join(target,'index.html');
    res.writeHead(200, {'Content-Type':mime[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(await readFile(target));
  } catch { res.writeHead(404); res.end('Nicht gefunden'); }
}).listen(Number(process.env.PORT || 4177),'127.0.0.1',()=>console.log(`Kontaktstoff: http://127.0.0.1:${process.env.PORT||4177}/konto/`));
