// Keep angles continuous across complete turns so pointer and keyboard gestures
// never hit an artificial stop or jump when crossing 180/360 degrees.
export function rotateFold(state,dx,dy){return {x:state.x+dx,y:state.y+dy};}
export const turnFold=x=>Math.round(x/180)*180+180;
