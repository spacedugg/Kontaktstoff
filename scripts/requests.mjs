// Operator-only local command. No public admin endpoint or automatic messages.
import {connectDB} from '../server/db.js';
const db=await connectDB();
try{const rows=(await db.query('SELECT id,created_at,payload FROM requests ORDER BY created_at DESC')).rows;for(const row of rows){const {profile,email,project,meta}=JSON.parse(row.payload);console.log(JSON.stringify({id:row.id,date:new Date(Number(row.created_at)).toISOString(),company:profile.company,contact:profile.name,email,campaign:project.name,quantity:meta.quantity,format:meta.formatRequest,leadSource:meta.leadSource,designService:meta.designService,audience:meta.audience}));}if(!rows.length)console.log('Keine Kampagnenanfragen vorhanden.');}finally{await db.close();}
