import {pushGraphicsState,popGraphicsState,concatTransformationMatrix,scale,drawObject,rectangle,fill,setFillingCmykColor} from 'pdf-lib';
import {isSelfmailer,isPFS,PFS_SEPARATOR} from './formats.js';

// Printer's selfmailer instruction: turn both complete sheets 180°, including
// postal elements. Bake it into the content, not viewer-only /Rotate metadata.
export function drawPrintArtwork(page,campaign,side,imageName){
 const width=page.getWidth(),height=page.getHeight(),mm=72/25.4;
 page.pushOperators(pushGraphicsState());
 if(isSelfmailer(campaign))page.pushOperators(concatTransformationMatrix(-1,0,0,-1,width,height));
 page.pushOperators(pushGraphicsState(),scale(width,height),drawObject(imageName),popGraphicsState());
 if(isPFS(campaign)&&side==='front'){
  const z=PFS_SEPARATOR;
  page.pushOperators(pushGraphicsState(),setFillingCmykColor(0,0,0,1),rectangle((z.x+3)*mm,height-(z.y+3+z.h)*mm,z.w*mm,z.h*mm),fill(),popGraphicsState());
 }
 page.pushOperators(popGraphicsState());
}
