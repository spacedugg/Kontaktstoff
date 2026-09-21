import {createCampaign,uid} from './core.js';
import {reputationArt,brandLogoLight,brandLogoDark} from './bewertungspush-art.js';
export function createBewertungspush(){
 const c=createCampaign(true),ink='#0f172a',blue='#4285f4',muted='#52647c';
 const t=(text,x,y,w,h,fontSize=12,color=ink,weight='400')=>({id:uid(),type:'text',text,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true});
 const s=(x,y,w,h,color)=>({...t('',x,y,w,h),type:'shape',background:color});
 const image=(data,x,y,w,h)=>({...t('',x,y,w,h),type:'image',data,fit:'contain'});
 c.name='BewertungsPush · Echte Erfahrungen zählen';c.templateId='bewertungspush';c.sample=true;c.onboarding={active:false,step:5,personalizationSkipped:false};
 c.brief={sender:'BewertungsPush',audience:'Inhaber und Geschäftsführungen von Hotels, Restaurants und Werkstätten',goal:'website',offer:'Verdächtige Google-Bewertungen prüfen lassen. Zahlung nur bei erfolgreicher Löschung.'};
 c.recipients=[
  {first_name:'Hannah',last_name:'Seidel',company:'Hotel Lindenhof',segment:'Hotels',salutation:'Guten Tag Frau Seidel,',personal_note:'Sie kümmern sich um Ihre Gäste. Umso ärgerlicher, wenn eine negative Bewertung auftaucht – und sich der beschriebene Aufenthalt gar nicht zuordnen lässt.'},
  {first_name:'Marco',last_name:'Berg',company:'Restaurant Abendrot',segment:'Restaurants',salutation:'Guten Tag Herr Berg,',personal_note:'Sie geben jeden Tag alles für Ihre Gäste. Was, wenn eine negative Bewertung einen Restaurantbesuch beschreibt, der so gar nicht stattgefunden hat?'},
  {first_name:'Julia',last_name:'Kern',company:'Werkstatt Kern',segment:'Werkstätten',salutation:'Guten Tag Frau Kern,',personal_note:'Ihre Kunden vertrauen Ihnen ihr Auto an. Umso ärgerlicher, wenn eine negative Bewertung auftaucht – und sich der beschriebene Auftrag gar nicht zuordnen lässt.'}
 ].map((r,i)=>({...r,id:uid(),industry:r.segment,website:'',street:'',postal_code:'',city:'',country:'Deutschland',chatbot_url:'https://bewertungspush.de/suche?utm_source=kontaktstoff&utm_medium=direct_mail&utm_campaign=profilcheck_pilot&utm_content=beispiel_'+(i+1)}));
 c.sides.front={background:{kind:'blank',color:'#0b1020'},fields:[
  image(reputationArt,128,18,81,101),
  image(brandLogoLight,12,11,70,11.48),
  t('FÜR {{company}}',12,34,126,9,9,'#b7d6ff','700'),
  t('Ihr guter Ruf',12,48,121,18,33,'#ffffff','700'),
  t('verdient echte\nBewertungen.',12,68,121,34,32,'#76adff','700'),
  t('Verdächtige Google-Bewertungen prüfen lassen.\nNur bei erfolgreicher Löschung zahlen.',12,109,177,15,11.5,'#e0e9f7'),
  s(0,128,210,20,'#eaf2ff'),
  t('Für {{first_name}} {{last_name}}',12,134,98,8,10,ink,'700'),
  t('SO FUNKTIONIERT’S →',145,134,54,8,9,ink,'700')
 ]};
 c.sides.back={background:{kind:'blank',color:'#fffefa'},fields:[
  t('PERSÖNLICH FÜR {{company}}',12,12,118,9,8.5,muted,'700'),
  image(brandLogoDark,146,10,52,8.52),
  t('{{salutation}}',12,30,127,12,19,ink,'700'),
  t('{{personal_note}}',12,48,123,29,12,ink),
  t('Wir prüfen die ausgewählten Bewertungen auf Verstöße gegen Googles Richtlinien und beantragen gegebenenfalls die Entfernung.',12,81,123,22,11.5,ink),
  t('Sie zahlen nur, wenn Google löscht.',12,108,125,10,13,ink,'700'),
  t('Freundliche Grüße\nIhr Team von BewertungsPush',12,121,123,13,10.5,muted),
  s(146,31,52,103,'#eaf2ff'),
  t('Jetzt Bewertungen\nprüfen lassen',151,38,43,17,13,ink,'700'),
  {...t('{{chatbot_url}}',154,60,36,36),type:'qr',background:'#ffffff'},
  t('Scannen. Profil finden.\nBewertungen auswählen.',151,101,43,14,9,ink),
  t('bewertungspush.de/suche',150,122,45,7,8.2,'#225ebf','700'),
  s(12,135,186,2,'#e0e7ef'),
  t('Keine Vorkasse. Über die Löschung entscheidet Google.',12,139,186,5,8,muted)
 ]};return c;
}
