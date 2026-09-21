import {createCampaign,uid} from './core.js';
import {reputationArt} from './bewertungspush-art.js';
export function createBewertungspush(){
 const c=createCampaign(true),ink='#111429',violet='#7777f6',light='#f4f4fc',muted='#596078';
 const t=(text,x,y,w,h,fontSize=12,color=ink,weight='400')=>({id:uid(),type:'text',text,x,y,w,h,fontSize,color,weight,align:'left',background:'transparent',autoFit:true});
 const s=(x,y,w,h,color)=>({...t('',x,y,w,h),type:'shape',background:color});
 c.name='BewertungsPush · Ihr guter Ruf';c.templateId='bewertungspush';c.sample=true;c.onboarding={active:false,step:5,personalizationSkipped:false};
 c.brief={sender:'BewertungsPush',audience:'Inhaber und Geschäftsführungen von Hotels, Restaurants und Werkstätten',goal:'website',offer:'Google-Profil finden und möglicherweise richtlinienwidrige Bewertungen zur Prüfung auswählen'};
 c.recipients=[
  {first_name:'Hannah',last_name:'Seidel',company:'Hotel Lindenhof',segment:'Hotels',salutation:'Guten Tag Frau Seidel,',personal_note:'Bevor jemand in Ihrem Hotel ein Zimmer bucht, liest er oft zuerst die Bewertungen. Umso ärgerlicher, wenn dort Beiträge stehen, die gar nicht auf einem echten Aufenthalt beruhen.'},
  {first_name:'Marco',last_name:'Berg',company:'Restaurant Abendrot',segment:'Restaurants',salutation:'Guten Tag Herr Berg,',personal_note:'Der erste Eindruck von Ihrem Restaurant entsteht oft schon vor der Tischreservierung. Beiträge ohne echte Gästeerfahrung können ein Bild zeichnen, das Ihrem Restaurant nicht gerecht wird.'},
  {first_name:'Julia',last_name:'Kern',company:'Werkstatt Kern',segment:'Werkstätten',salutation:'Guten Tag Frau Kern,',personal_note:'Wer sein Auto in Ihre Werkstatt bringt, möchte vorher Vertrauen gewinnen. Umso wichtiger, dass die Bewertungen auf echten Erfahrungen beruhen – und nicht auf erfundenen Werkstattbesuchen.'}
 ].map((r,i)=>({...r,id:uid(),industry:r.segment,website:'',street:'',postal_code:'',city:'',country:'Deutschland',chatbot_url:'https://bewertungspush.de/suche?utm_source=kontaktstoff&utm_medium=direct_mail&utm_campaign=profilcheck_pilot&utm_content=beispiel_'+(i+1)}));
 c.sides.front={background:{kind:'blank',color:ink},fields:[
  {...t('',112,4,98,114),type:'image',data:reputationArt,fit:'contain'},
  s(12,12,8,8,violet),t('↗',13,12,6,8,16,'#ffffff','700'),t('BewertungsPush',24,12,91,9,18,'#ffffff','700'),
  t('PERSÖNLICH FÜR {{company}}',12,36,115,9,8.5,'#b4b7e8','700'),
  t('Ihr guter Ruf.',12,52,122,18,35,'#ffffff','700'),t('Verdient einen\nfairen Auftritt.',12,72,124,33,32,'#a8a7ff','700'),
  t('Google-Bewertungen prüfen lassen.\nDamit echte Erfahrungen zählen.',12,111,155,15,12,'#e1e3f7'),
  s(0,133,210,15,light),t('Für {{first_name}} {{last_name}} · {{company}}',12,138,156,8,10,ink,'700'),t('UMDREHEN →',171,138,29,7,8,muted,'700')
 ]};
 c.sides.back={background:{kind:'blank',color:'#fffefa'},fields:[
  t('Eine persönliche Nachricht.',12,11,136,9,10,violet,'700'),t('BewertungsPush',148,11,51,9,12,ink,'700'),
  t('{{salutation}}',12,31,184,12,20,ink,'700'),
  t('{{personal_note}}',12,49,126,33,12.5,ink),
  t('Kommt Ihnen eine Bewertung verdächtig vor? Wir prüfen mögliche Richtlinienverstöße und melden entsprechende Beiträge bei Google.',12,86,126,23,11.5,ink),
  t('Freundliche Grüße\nIhr Team von BewertungsPush',12,116,125,14,11.5,ink,'700'),
  s(148,45,50,83,'#ececfe'),t('Ihr nächster Schritt',152,50,42,8,10,ink,'700'),
  {...t('{{chatbot_url}}',155,63,36,36),type:'qr',background:'#ffffff'},
  t('Profil finden &\nBewertungen auswählen',152,105,42,14,9.5,ink,'700'),
  s(12,135,186,2,'#e7e7f3'),t('Zahlung nur bei erfolgreicher Entfernung. Über eine Löschung entscheidet Google.',12,140,186,6,7.5,muted)
 ]};return c;
}
