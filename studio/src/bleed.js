// Only extend artwork at the outside trim edges, never at an internal fold.
export function bleedRect(rect,format,bleed=3){
 const x=rect.x<=.01?Math.min(rect.x,-bleed):rect.x;
 const y=rect.y<=.01?Math.min(rect.y,-bleed):rect.y;
 const right=rect.x+rect.w>=format.width-.01?Math.max(rect.x+rect.w,format.width+bleed):rect.x+rect.w;
 const bottom=rect.y+rect.h>=format.height-.01?Math.max(rect.y+rect.h,format.height+bleed):rect.y+rect.h;
 return{x,y,w:right-x,h:bottom-y};
}
export function imageFrame(field,format){
 return field.fit==='cover'||field.fit==='stretch'?bleedRect(field,format):field;
}
