// Aggregate page requests by day. No visitor records or device identifiers.
export const proposalDay=(time=Date.now())=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(time));
export async function startProposalMeasurement(db,id,now=Date.now()){
 await db.query('INSERT INTO proposal_measurement(proposal_id,started_at) SELECT id,$1 FROM sales_proposals WHERE id=$2 AND published IS NOT NULL ON CONFLICT(proposal_id) DO NOTHING',[now,id]);
}
export async function recordProposalView(db,slug,now=Date.now()){
 await db.query('INSERT INTO proposal_page_views(proposal_id,day,count) SELECT id,$1,1 FROM sales_proposals WHERE slug=$2 AND published IS NOT NULL ON CONFLICT(proposal_id,day) DO UPDATE SET count=proposal_page_views.count+1',[proposalDay(now),slug]);
}
export async function proposalMetrics(db,id,now=Date.now()){
 const rows=(await db.query(`SELECT m.proposal_id,m.started_at,COALESCE(SUM(v.count),0) AS total,COALESCE(SUM(CASE WHEN v.day=$1 THEN v.count ELSE 0 END),0) AS today,MAX(v.day) AS last_day FROM proposal_measurement m LEFT JOIN proposal_page_views v ON v.proposal_id=m.proposal_id ${id?'WHERE m.proposal_id=$2':''} GROUP BY m.proposal_id,m.started_at`,id?[proposalDay(now),id]:[proposalDay(now)])).rows;
 return Object.fromEntries(rows.map(r=>[r.proposal_id,{total:Number(r.total),today:Number(r.today),startedAt:Number(r.started_at),lastDay:r.last_day||null}]));
}
