import {createCampaign,uid} from './core.js';

// Four editable DIN-lang panels; the upper outside panel reserves the postal zones.
export function createKontaktstoffOutreach(){
 const c=createCampaign(true),ink='#203b32',lime='#deff4f',paper='#f7f6ef',muted='#526b60';
 const t=(text,x,y,w,h,fontSize=12,color=ink,weight='400',role='')=>({id:uid(),type:'text',text,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true,...(role?{brandRole:role}:{})});
 const s=(x,y,w,h,background)=>({...t('',x,y,w,h),type:'shape',background});
 const brand=(x,y,color=ink)=>t('kontaktstoff.',x,y,92,11,23,color,'700','brand');
 c.name='Kontaktstoff · Outreach für Growth- & Vertriebsanbieter';c.templateId='kontaktstoff-outreach';c.sample=false;c.format='selfmailer-dl-4';c.selfmailer={version:1,design:'kontaktstoff-outreach-2026'};c.onboarding={active:false,step:5,personalizationSkipped:false};
 c.brief={sender:'Kontaktstoff · Nic Iburg',audience:'Inhabergeführte Anbieter für Neukundengewinnung, Sales-Beratung und B2B-Growth mit individuell erklärungsbedürftigem Angebot',goal:'appointment',offer:'Ein persönlicher Mailing-Entwurf im eigenen Markenauftritt und ein 15-minütiges Gespräch über einen kleinen Outreach-Test.'};
 c.sides={front:{background:{kind:'blank',color:'#ffffff'},fields:[
  brand(10,11),t('EINE IDEE FÜR',10,34,105,6,9,muted,'700'),t('{{company}}',10,44,107,17,18,ink,'700'),t('Persönlich vorbereitet von Nic.',10,66,107,7,10,muted),t('kontaktstoff.com',10,77,105,5,9,ink),
  {...t('{{company}}\n{{first_name}} {{last_name}}\n{{street}}\n{{postal_code}} {{city}}',134,45,70,33,10,'#111111'),postalAddress:true},
  s(0,99,210,99,ink),brand(11,108,'#ffffff'),t('FÜR {{company}}',11,124,185,7,9,lime,'700'),
  t('Gute Angebote.\nVerdienen mehr\nals ein Postfach.',11,139,135,39,31,'#ffffff','700','headline'),
  t('Euer Outreach. Ein neuer Kontaktpunkt.',11,185,151,7,10,lime,'700'),
  s(159,138,39,39,'#536b51'),s(155,143,39,39,paper),s(151,148,39,39,lime),
  t('ECHTE\nPOST.',155,153,31,18,20,ink,'700'),t('PERSÖNLICH.\nFÜR EUCH.',155,175,31,8,7,ink,'700'),t('AUFKLAPPEN →',164,189,36,4,7,'#ffffff','700')
 ]},back:{background:{kind:'blank',color:paper},fields:[
  brand(11,9),s(144,0,66,99,ink),
  t('{{salutation}}',11,29,122,11,21,ink,'700'),
  t('{{personal_note}}',11,44,122,38,12,ink,'400','body'),t('Nic · Kontaktstoff',11,87,122,7,11,ink,'700','signature'),
  t('EIN ANDERER\nEINSTIEG.',152,12,50,22,20,lime,'700'),
  t('01  Passende Unternehmen',152,42,50,10,10,'#ffffff','700'),t('02  Persönliche Ansprache',152,59,50,10,10,'#ffffff','700'),t('03  Ein konkretes Gespräch',152,76,50,10,10,'#ffffff','700'),
  s(0,99,210,99,'#ffffff'),s(11,108,118,2,lime),
  t('Euer Entwurf ist\nschon vorbereitet.',11,118,123,22,25,ink,'700','cta'),
  t('Scanne den Code und schau dir an, wie eure eigene Mailing-Kampagne aussehen könnte.',11,145,120,17,12,ink),
  t('Passt der Ansatz? Lass uns 15 Minuten auf eure Zielgruppe und einen ersten Test schauen.',11,166,120,17,12,ink),
  t('Design. Personalisierung. Druck & Versand.',11,188,123,5,8,muted,'700'),
  s(145,111,54,75,ink),s(151,118,42,42,'#ffffff'),{...t('{{chatbot_url}}',155,122,34,34),type:'qr',background:'#ffffff'},
  t('EUER BEISPIEL\nANSEHEN →',151,166,42,13,11,lime,'700'),t('kontaktstoff.com',145,188,54,5,8,ink)
 ]}};
 return c;
}
