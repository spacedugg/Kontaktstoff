import {checks,sideNames} from '../../studio/src/core.js';
export const BUILD_STEPS=['Layout','Design','Personalisierung','Freigeben'];
export function hasDesign(project){return sideNames(project).every(s=>project.sides[s].background.kind!=='blank'||project.sides[s].fields.length>0);}
export function campaignReadiness(project,meta){
 const errors=[],warnings=[];
 if(!meta.designService){for(const issue of checks(project)){if(issue.level==='error'&&!(meta.leadSource==='research'&&issue.text==='Noch keine Empfänger vorhanden.'))errors.push(issue.text);else if(issue.level==='warning')warnings.push(issue.text);}}
 if(meta.leadSource==='research'){if(!meta.audience?.trim())errors.push('Beschreibe deine gewünschte Zielgruppe.');if(!meta.region?.trim())errors.push('Ergänze die Region für die Recherche.');}
 else{
  if(!project.recipients.length)errors.push('Lade deine Empfängerliste hoch.');
  if(project.sample)errors.push('Ersetze die Beispielkontakte durch deine eigene Empfängerliste.');
  const missing=project.recipients.filter(r=>!r.street?.trim()||!r.postal_code?.trim()||!r.city?.trim()||!r.country?.trim());
  if(missing.length)errors.push(`${missing.length} Kontakte haben noch keine vollständige Postanschrift (Straße, PLZ, Ort, Land).`);
  const seen=new Set();let duplicates=0;for(const r of project.recipients){const key=[r.company,r.first_name,r.last_name,r.street,r.postal_code,r.city].map(v=>String(v||'').trim().toLowerCase()).join('|');if(seen.has(key))duplicates++;seen.add(key);}if(duplicates)warnings.push(`${duplicates} mögliche doppelte Empfänger. Prüfe deine Liste vor dem Versand.`);
 }
 return {errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
}
