const postpal=(file)=>'https://app.getpostpal.com/storage/'+encodeURIComponent(file+'.zip');
export const FORMATS=[
 {id:'a5-landscape',name:'DIN A5 · Querformat',width:210,height:148,pages:2},
 {id:'a6-landscape',name:'DIN A6',width:148,height:105,pages:2,bleed:3,template:postpal('DIN A6')},
 {id:'din-lang',name:'DIN lang',width:210,height:98,pages:2,bleed:3,template:postpal('DIN Lang')},
 {id:'din-maxi',name:'DIN Maxi',width:235,height:125,pages:2,bleed:3,template:postpal('DIN Maxi')},
 {id:'a4-single',name:'DIN A4 Brief · einseitig',width:210,height:297,pages:1,bleed:3,template:postpal('DIN A4_einseitig')},
 {id:'a4-double',name:'DIN A4 Brief · beidseitig',width:210,height:297,pages:2,bleed:3,template:postpal('DIN A4_beidseitig')},
 {id:'din-lang-envelope',name:'DIN lang · im Umschlag',width:210,height:98,pages:2,bleed:3,template:postpal('DIN Lang kuvertiert')}
];
export const sideNames=c=>FORMATS.find(f=>f.id===c.format)?.pages===1?['front']:['front','back'];
