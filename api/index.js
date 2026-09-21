import {connectDB} from '../server/db.js';
import {createAPI} from '../server/api.js';
let handler;
export default async function api(req,res){
 if(!process.env.DATABASE_URL||!process.env.PUBLIC_ORIGIN){res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Der Kundenbereich ist noch nicht mit der Server-Datenbank verbunden. Deine lokalen Designs bleiben im Studio verfügbar.',available:false}));return;}
 if(req.query?.route)req.url='/api/'+(Array.isArray(req.query.route)?req.query.route.join('/'):req.query.route);
 if(req.query?.redirect)req.url='/r/'+encodeURIComponent(req.query.redirect);
 try{handler ||= connectDB().then(db=>createAPI(db));if(!await(await handler)(req,res)){res.writeHead(404);res.end();}}catch{handler=null;res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Der Kundenbereich ist gerade nicht erreichbar. Bitte später erneut versuchen.'}));}
}
