const postpal=(file)=>'https://app.getpostpal.com/storage/'+encodeURIComponent(file+'.zip');
export const PFS_FORMAT_ID='selfmailer-maxi-4';
export const FORMATS=[
 {id:PFS_FORMAT_ID,name:'Standard Maxi · Selfmailer · 4 Seiten',width:235,height:250,pages:2,panels:4,closedWidth:235,closedHeight:125,foldY:125,bleed:3,safe:3,download:'/assets/print/kontaktstoff-pfs-maxi-vorlagen.zip',template:'/assets/print/pfs_template_selfmailer_4-seiter.pdf'},
 {id:'selfmailer-dl-4',name:'DIN lang · Selfmailer · 4 Seiten',width:210,height:198,pages:2,panels:4,closedWidth:210,closedHeight:99,foldY:99,bleed:3,download:'/assets/print/kontaktstoff-din-lang-vorlagen.zip',template:'https://mailingstore.de/wp-content/uploads/2021/02/Selfmailer_Datenblatt_DIN_lang_4_Seiter-1.pdf'},
 {id:'a5-landscape',name:'DIN A5 · Querformat',width:210,height:148,pages:2},
 {id:'a6-landscape',name:'DIN A6',width:148,height:105,pages:2,bleed:3,template:postpal('DIN A6')},
 {id:'din-lang',name:'DIN lang',width:210,height:98,pages:2,bleed:3,template:postpal('DIN Lang')},
 {id:'din-maxi',name:'DIN Maxi',width:235,height:125,pages:2,bleed:3,template:postpal('DIN Maxi')},
 {id:'a4-single',name:'DIN A4 Brief · einseitig',width:210,height:297,pages:1,bleed:3,template:postpal('DIN A4_einseitig')},
 {id:'a4-double',name:'DIN A4 Brief · beidseitig',width:210,height:297,pages:2,bleed:3,template:postpal('DIN A4_beidseitig')},
 {id:'din-lang-envelope',name:'DIN lang · im Umschlag',width:210,height:98,pages:2,bleed:3,template:postpal('DIN Lang kuvertiert')}
];
export const sideNames=c=>FORMATS.find(f=>f.id===c.format)?.pages===1?['front']:['front','back'];
export const isPFS=c=>c.format===PFS_FORMAT_ID;
export const isSelfmailer=c=>['selfmailer-dl-4',PFS_FORMAT_ID].includes(c.format);
export const sideLabel=(c,side)=>isSelfmailer(c)?(side==='front'?'Außenseite':'Innenseite'):(side==='front'?'Vorderseite':'Rückseite');
export const formatCaption=c=>isSelfmailer(c)?`Geschlossen ${FORMATS.find(f=>f.id===c.format).closedWidth} × ${FORMATS.find(f=>f.id===c.format).closedHeight} mm · offen ${FORMATS.find(f=>f.id===c.format).width} × ${FORMATS.find(f=>f.id===c.format).height} mm`:FORMATS.find(f=>f.id===c.format)?.name;
export const POSTAL_ZONES=[{id:'franking',name:'Frankierung freihalten',x:136,y:0,w:74,h:40},{id:'address',name:'Anschrift · 80 × 44 mm',x:130,y:40,w:80,h:44},{id:'coding',name:'Codierzone freihalten',x:60,y:84,w:150,h:15}];

// Coordinates are trim-relative. Postal dimensions stay in millimetres when resizing artwork.
export const PFS_SEPARATOR={x:156.6368,y:60,w:1.2,h:50};
export const PFS_ZONES=[
 {id:'franking',name:'Frankierzone · 74 × 40 mm',x:161,y:0,w:74,h:40},
 {id:'address',name:'Lettershop-Personalisierung · freihalten',x:151.6368,y:60,w:83.3632,h:50},
 {id:'separator',name:'Trennstrich · 5 mm Ruhezone',x:151.6368,y:55,w:11.2,h:60},
 {id:'coding',name:'Codierzone · 150 × 15 mm',x:85,y:110,w:150,h:15}
];
export const postalZones=c=>isPFS(c)?PFS_ZONES:POSTAL_ZONES;
export const pfsAddress=r=>[r.postal_salutation||'',r.postal_name||[r.first_name,r.last_name].filter(Boolean).join(' ')||r.company||'',r.street||'',[r.postal_code,r.city].filter(Boolean).join(' ')];
