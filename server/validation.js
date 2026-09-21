import {validateCampaign,validURL,FORMATS,sideNames} from '../studio/src/core.js';
import {defaults,SALES,SHIPPING} from '../konto/src/model.js';
export class HTTPError extends Error{constructor(status,message){super(message);this.status=status;}}
export function text(value,max=1000){if(typeof value!=='string'||value.length>max)throw new HTTPError(400,'Bitte prüfe die eingegebenen Texte.');return value.trim();}
export function profile(input){return {company:text(input.company,150),name:text(input.name,100),website:text(input.website||'',300),street:text(input.street||'',150),postalCode:text(input.postalCode||'',20),city:text(input.city||'',100),country:text(input.country||'Deutschland',80),billingEmail:text(input.billingEmail||'',254),vatId:text(input.vatId||'',40)};}
export function payload(input){
 let project;try{project=validateCampaign(input.project);}catch(e){throw new HTTPError(400,e.message);}
 const data=input.meta||{},meta=defaults();
 for(const key of ['audience','region','companySize','roles','exclusions','targetURL','launchDate','notes'])meta[key]=text(data[key]||'',key==='notes'?3000:1000);
 if(meta.targetURL&&!validURL(meta.targetURL))throw new HTTPError(400,'Bitte einen gültigen Ziel-Link eintragen.');
 if(meta.launchDate&&!/^\d{4}-\d{2}-\d{2}$/.test(meta.launchDate))throw new HTTPError(400,'Bitte ein gültiges Datum wählen.');
 meta.formatRequest=data.formatRequest||'a5';if(!['a5','selfmailer','special',...FORMATS.map(f=>f.id)].includes(meta.formatRequest))throw new HTTPError(400,'Ungültiges Wunschformat.');
 if(data.planning){meta.planning={package:text(data.planning.package||'',80)};for(const key of ['budget','credits','contribution']){const n=Number(data.planning[key]);if(!Number.isFinite(n)||n<0||n>100000000)throw new HTTPError(400,'Ungültige Planungswerte.');meta.planning[key]=n;}}
 meta.designService=data.designService===true;meta.leadSource=data.leadSource||'upload';meta.goal=data.goal||'appointment';
 if(!['upload','research'].includes(meta.leadSource)||!['appointment','demo','offer','event','purchase'].includes(meta.goal))throw new HTTPError(400,'Ungültige Auswahl.');
 meta.quantity=Number(data.quantity??250);meta.cost=Number(data.cost??0);
 if(!Number.isInteger(meta.quantity)||meta.quantity<1||meta.quantity>100000||!Number.isFinite(meta.cost)||meta.cost<0||meta.cost>10000000)throw new HTTPError(400,'Bitte Menge und Kosten prüfen.');
 for(const r of project.recipients){const o=data.outcomes?.[r.id];if(!o)continue;const contribution=Number(o.contribution||0);if(!Number.isFinite(contribution)||contribution<0||contribution>100000000||!Object.hasOwn(SALES,o.sales)||!Object.hasOwn(SHIPPING,o.shipping))throw new HTTPError(400,'Ungültiger Kontaktstatus.');const wonAt=text(o.wonAt||'',10);if(wonAt&&!/^\d{4}-\d{2}-\d{2}$/.test(wonAt))throw new HTTPError(400,'Ungültiges Abschlussdatum.');meta.outcomes[r.id]={sales:o.sales,shipping:o.shipping,contribution,wonAt,note:text(o.note||'',1000),nextStep:text(o.nextStep||'',300)};}
 for(const key of ['designId','audienceId'])meta[key]=text(data[key]||'',100);
 for(const key of ['designRevision','audienceRevision'])meta[key]=Math.max(0,Math.floor(Number(data[key])||0));
 delete project.service;return {project,meta};
}
export function requestIssues(project,meta,company){
 const issues=[];if(!company.company||!company.name)issues.push('Unternehmen und Ansprechpartner ergänzen.');
 if(!meta.audience)issues.push('Wunschkunden beschreiben.');
 if(meta.leadSource==='research'&&!meta.region)issues.push('Region für die Lead-Recherche ergänzen.');
 if(meta.leadSource==='upload'&&!project.recipients.length)issues.push('Kontaktliste hochladen oder Lead-Recherche wählen.');
 if(!meta.designService&&sideNames(project).some(side=>project.sides[side].background.kind==='blank'&&!project.sides[side].fields.length))issues.push('Beide Kartenseiten gestalten oder Gestaltung anfragen.');
 if(project.sample&&meta.leadSource==='upload')issues.push('Die fiktiven Beispielkontakte durch eigene Kontakte ersetzen oder Lead-Recherche wählen.');
 return issues;
}
