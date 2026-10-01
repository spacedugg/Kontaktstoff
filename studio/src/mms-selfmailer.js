import {uid} from './core.js';

// Editable DIN-lang artwork. Brand palette checked against the MMS website.
export function styleMMS(c,original){
 const ink='#101010',paper='#faf9f6',lime='#e0ff00',purple='#6829cc';
 const t=(text,x,y,w,h,fontSize=12,color=ink,role='',weight='400')=>({id:uid(),type:'text',text,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true,...(role?{brandRole:role}:{})});
 const s=(x,y,w,h,background)=>({...t('',x,y,w,h),type:'shape',background});
 const wordmark=(x,y,color=ink)=>t('MONEY MAKING SPRINT',x,y,146,8,12,color,'brand','700');
 const headline=original.front.fields[5]?.text||'Gute Arbeit.\nAber wo bleibt\nder nächste Kunde?';
 const offer=original.back.fields[4]?.text||'Positionierung schärfen. Passende Kunden ansprechen. Gespräche in Aufträge verwandeln.';
 const signature=original.back.fields[6]?.text||'Jakob';
 const cta=original.back.fields[8]?.text||'Lass quatschen. ↗';
 const qr=original.back.fields.find(f=>f.type==='qr');
 c.selfmailer={...c.selfmailer,design:'mms-brand-2026'};
 c.sides={front:{background:{kind:'blank',color:paper},fields:[
  s(0,0,210,99,'#ffffff'),{...wordmark(10,10),w:110},s(10,25,37,2,lime),
  t('Gute Leistung.\nKlare Positionierung.\nNeue Gespräche.',10,37,107,25,19,ink,'','700'),
  t('Für {{company}}',10,72,105,8,10,purple,'','700'),
  t('money-making-sprint.de',10,80,105,4,8,ink),
  {...t('{{company}}\n{{first_name}} {{last_name}}\n{{street}}\n{{postal_code}} {{city}}',134,45,70,33,10,'#111111'),postalAddress:true},
  s(0,99,210,99,ink),s(174,99,36,99,purple),wordmark(11,108,'#ffffff'),
  s(11,122,85,10,lime),t('Hey {{first_name}},',14,123,79,8,13,ink,'','700'),
  t(headline,11,137,173,45,32,'#ffffff','headline','700'),
  t('Für {{company}}',11,186,137,7,10,lime,'','700'),
  t('AUFKLAPPEN →',172,187,33,6,8,'#ffffff','','700')
 ]},back:{background:{kind:'blank',color:paper},fields:[
  s(0,0,210,99,paper),wordmark(11,9),
  t('Können hast du.\nJetzt braucht es einen Plan.',11,24,125,22,23,ink,'','700'),
  t('{{personal_note}}',11,52,122,32,12,ink,'body'),
  t(signature,11,87,122,8,12,purple,'signature','700'),
  s(143,0,67,99,purple),
  t('DARAN ARBEITEN WIR',151,12,51,8,8,'#ffffff','','700'),
  t('01',151,28,12,8,12,lime,'','700'),t('Angebot\nschärfen.',168,28,34,16,13,'#ffffff','','700'),
  t('02',151,51,12,8,12,lime,'','700'),t('Wunschkunden\nansprechen.',168,51,34,16,12,'#ffffff','','700'),
  t('03',151,74,12,8,12,lime,'','700'),t('Gespräche\nführen.',168,74,34,16,13,'#ffffff','','700'),
  s(0,99,210,99,ink),s(11,109,118,2,purple),
  t(cta,11,119,121,20,29,lime,'cta','700'),
  t(offer,11,145,120,30,12,'#ffffff','offer'),
  t('Dein Business. Dein nächster Schritt.',11,185,121,8,10,'#ffffff','','700'),
  s(143,110,56,77,lime),s(149,116,44,44,'#ffffff'),
  {...t(qr?.text||'{{chatbot_url}}',153,120,36,36),type:'qr',background:'#ffffff'},
  t('SCAN →\nKENNENLERNGESPRÄCH',149,166,44,14,9,ink,'','700'),
  t('money-making-sprint.de/termin',143,191,56,5,6.5,'#ffffff')
 ]}};
 return c;
}
