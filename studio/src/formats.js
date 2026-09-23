const postpal=(file)=>'https://app.getpostpal.com/storage/'+encodeURIComponent(file+'.zip');
export const FORMATS=[
 {id:'selfmailer-dl-4',name:'DIN lang · Selfmailer · 4 Seiten',width:210,height:198,pages:2,panels:4,closedWidth:210,closedHeight:99,foldY:99,bleed:3,template:'https://mailingstore.de/wp-content/uploads/2021/02/Selfmailer_Datenblatt_DIN_lang_4_Seiter-1.pdf'},
 {id:'a5-landscape',name:'DIN A5 · Querformat',width:210,height:148,pages:2},
 {id:'a6-landscape',name:'DIN A6',width:148,height:105,pages:2,bleed:3,template:postpal('DIN A6')},
 {id:'din-lang',name:'DIN lang',width:210,height:98,pages:2,bleed:3,template:postpal('DIN Lang')},
 {id:'din-maxi',name:'DIN Maxi',width:235,height:125,pages:2,bleed:3,template:postpal('DIN Maxi')},
 {id:'a4-single',name:'DIN A4 Brief · einseitig',width:210,height:297,pages:1,bleed:3,template:postpal('DIN A4_einseitig')},
 {id:'a4-double',name:'DIN A4 Brief · beidseitig',width:210,height:297,pages:2,bleed:3,template:postpal('DIN A4_beidseitig')},
 {id:'din-lang-envelope',name:'DIN lang · im Umschlag',width:210,height:98,pages:2,bleed:3,template:postpal('DIN Lang kuvertiert')}
];
export const sideNames=c=>FORMATS.find(f=>f.id===c.format)?.pages===1?['front']:['front','back'];
export const isSelfmailer=c=>c.format==='selfmailer-dl-4';
export const sideLabel=(c,side)=>isSelfmailer(c)?(side==='front'?'Außenseite':'Innenseite'):(side==='front'?'Vorderseite':'Rückseite');
export const formatCaption=c=>isSelfmailer(c)?'Geschlossen 210 × 99 mm · offen 210 × 198 mm':FORMATS.find(f=>f.id===c.format)?.name;
export const POSTAL_ZONES=[{id:'franking',name:'Frankierung freihalten',x:136,y:0,w:74,h:40},{id:'address',name:'Anschrift · 80 × 44 mm',x:130,y:40,w:80,h:44},{id:'coding',name:'Codierzone freihalten',x:60,y:84,w:150,h:15}];
