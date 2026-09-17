import {buildClientPages} from './client-pages.mjs';
import { build } from 'esbuild';
import { copyFile, mkdir, cp, rm } from 'node:fs/promises';
await buildClientPages();
await build({entryPoints:['clients/main.js'],bundle:true,format:'esm',minify:true,outfile:'clients/app.js',legalComments:'inline',target:['es2022']});
await mkdir('studio/vendor', { recursive: true });
await build({ entryPoints: ['studio/src/app.js'], bundle: true, format: 'esm', minify: true, outfile: 'studio/app.js', legalComments: 'linked', target: ['es2022'] });
await build({entryPoints:['homepage/app.js'],bundle:true,format:'esm',minify:true,outfile:'app.js',legalComments:'inline',target:['es2022']});
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'studio/vendor/pdf.worker.min.mjs');
for (const directory of ['cmaps','standard_fonts','wasm']) await cp(`node_modules/pdfjs-dist/${directory}`, `studio/vendor/${directory}`, {recursive:true});
for (const [pkg, file] of [['pdfjs-dist','LICENSE'],['pdf-lib','LICENSE.md'],['qrcode','license'],['fflate','LICENSE']]) {
  try { await copyFile(`node_modules/${pkg}/${file}`, `studio/vendor/${pkg}-LICENSE.txt`); } catch {}
}
await rm('dist', {recursive:true, force:true});
await mkdir('dist/studio', {recursive:true});
for (const file of ['index.html','app.js','style.css','case-studies.json','assets','logo-ideen','fuer']) await cp(file, `dist/${file}`, {recursive:true});
await mkdir('dist/clients',{recursive:true});
for(const file of ['app.js','style.css'])await copyFile(`clients/${file}`,`dist/clients/${file}`);
for (const file of ['index.html','styles.css','app.js','app.js.LEGAL.txt','vendor']) await cp(`studio/${file}`, `dist/studio/${file}`, {recursive:true});
console.log('Studio gebaut: /studio/ · Statische Veröffentlichung unter dist/.');
