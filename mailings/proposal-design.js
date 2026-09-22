import {createBrandTemplate,applyBrandText,recolorBrand,PREVIEW_PERSON} from '../studio/src/brand-templates.js';
import {createMoneyMakingCampaign} from '../studio/src/money-making-campaign.js';
export function proposalPerson(d){return {...PREVIEW_PERSON,first_name:d.recipientName||'Anna',company:d.recipientCompany||'Studio Nordlicht',salutation:'Hallo '+(d.recipientName||'Anna')+',',personal_note:d.cardBody,chatbot_url:d.target};}
export function proposalProject(d){
 if(d.layout==='money-making-sprint'){
 const p=createMoneyMakingCampaign(),f=p.sides.front.fields,b=p.sides.back.fields;f[1].text=d.company.toUpperCase();f[5].text=d.cardHeadline;f[8].text='VON '+(d.sender||d.company).toUpperCase();b[0].text=d.company.toUpperCase();b[4].text=d.offer;b[6].text=d.sender||d.company;b[8].text=d.cardCta;b[9].text=new URL(d.target).hostname;for(const s of Object.values(p.sides))for(const field of s.fields){if(field.color==='#7338ea')field.color=d.color;if(field.background==='#7338ea')field.background=d.color;}return p;
 }
 const p=createBrandTemplate(d.layout);recolorBrand(p,d.color);for(const [role,value]of Object.entries({brand:d.company,headline:d.cardHeadline,body:d.cardBody,cta:d.cardCta,signature:d.sender||'Dein Team von '+d.company}))applyBrandText(p,role,value);
 for(const side of Object.values(p.sides))for(const f of side.fields){if(f.brandRole==='photo'){if(d.photo)f.data=d.photo;else{f.type='shape';f.background=d.color;}}if(f.brandRole==='brand'&&d.logo){f.type='image';f.data=d.logo;f.fit='contain';f.w=Math.min(f.w,70);}}
 return p;
}
