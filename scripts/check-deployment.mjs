import {access,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
// A public-only build must never replace the shared production website again.
for(const file of ['admin/index.html','admin/app.js','konto/index.html','konto/app.js','studio/index.html','studio/app.js','freigabe/index.html','freigabe/app.js','assets/selfmailer-3d.css','assets/review-comment.css','mailings/index.html','clients/app.js','branchen/index.html','ratgeber/index.html','wissen/index.html','kontakt.html','vergleich.html'])await access('dist/'+file);
for(const file of ['index.html','app.js','style.css','robots.txt','sitemap.xml'])assert.deepEqual(await readFile('dist/'+file),await readFile(file),'Public website changed during build: '+file);
await access('api/index.js');
const config=JSON.parse(await readFile('vercel.json','utf8'));
assert.equal(config.outputDirectory,'dist');
assert.ok(config.rewrites.some(r=>r.source==='/api/:path*'&&r.destination==='/api/index?route=:path*'),'API rewrite missing');
assert.ok(config.rewrites.some(r=>r.source==='/r/:token'),'Tracking redirect missing');
console.log('Deployment checked: current website, admin, workspace, editor, customer reviews, API and tracking routes included.');
