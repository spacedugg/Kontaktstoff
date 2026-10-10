// Export the deterministic SVG compositions to compact browser-ready WebP.
// Invoke with NODE_PATH pointing to an environment containing sharp.
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const specs = JSON.parse(fs.readFileSync(path.join(__dirname, 'card-planes.json')));
(async () => {
  for (const spec of specs) {
    const name = path.basename(spec.output, '.webp');
    await sharp(path.join(__dirname, 'generated', name + '.svg'))
      .webp({ quality: 92, alphaQuality: 100 })
      .toFile(path.join(__dirname, '../../web/public', spec.output));
    console.log(name);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
