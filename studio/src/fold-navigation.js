// Tilt within the current reading orientation. Turning the paper over is an
// explicit horizontal-axis action because the printed spreads are head-to-head.
export function tiltFold(state,dx,dy){
 const base=Math.round(state.x/180)*180;
 return {x:base+Math.max(-35,Math.min(35,state.x-base+dx)),y:Math.max(-55,Math.min(55,state.y+dy))};
}
export const turnFold=x=>Math.round(x/180)*180+180;
