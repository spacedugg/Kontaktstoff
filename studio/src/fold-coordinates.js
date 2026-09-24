// Perspective-correct coordinates, shared by picking and regression tests.
export function pointOnQuad(points,x,y){
 const [p0,p1,p2,p3]=points,dx1=p1.x-p2.x,dx2=p3.x-p2.x,dx3=p0.x-p1.x+p2.x-p3.x,dy1=p1.y-p2.y,dy2=p3.y-p2.y,dy3=p0.y-p1.y+p2.y-p3.y;
 const den=dx1*dy2-dx2*dy1;if(Math.abs(den)<1e-6)return null;
 const g=(dx3*dy2-dx2*dy3)/den,h=(dx1*dy3-dx3*dy1)/den,a=p1.x-p0.x+g*p1.x,b=p3.x-p0.x+h*p3.x,d=p1.y-p0.y+g*p1.y,e=p3.y-p0.y+h*p3.y;
 const A=a-x*g,B=b-x*h,D=d-y*g,E=e-y*h,X=x-p0.x,Y=y-p0.y,det=A*E-B*D;if(Math.abs(det)<1e-6)return null;
 const u=(X*E-B*Y)/det,v=(A*Y-X*D)/det;return u>=-.01&&u<=1.01&&v>=-.01&&v<=1.01?{x:Math.max(0,Math.min(1,u)),y:Math.max(0,Math.min(1,v))}:null;
}
export function faceToSpread(face,p){return {side:['cover','postal'].includes(face)?'front':'back',x:p.x,y:(p.y+(['cover','inside-bottom'].includes(face)?1:0))/2};}
export function spreadToFace(p){return {face:p.side==='front'?(p.y>=.5?'cover':'postal'):(p.y>=.5?'inside-bottom':'inside-top'),x:p.x,y:p.y*2-(p.y>=.5?1:0)};}
