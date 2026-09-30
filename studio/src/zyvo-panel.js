// The wider DIN-lang artwork must fill the taller PFS cover without letterboxing.
export function fillZyvoCover(source){
 const c=structuredClone(source);
 if(c.format!=='selfmailer-maxi-4'||c.selfmailer?.design!=='zyvo-lifestyle-comeback')return c;
 for(const f of c.sides.front.fields)if(f.type==='image'&&f.brandRole==='artwork'&&f.y>=125&&f.w>=230)f.fit='cover';
 return c;
}
