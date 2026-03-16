/**
 * Liest ein PNG mit weißem Hintergrund und speichert es mit transparentem Hintergrund.
 * Nutzung: node scripts/signature-transparent.js <eingabe.png> [ausgabe.png]
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2];
const outputPath = process.argv[3] || path.join(process.cwd(), 'public', 'unterschrift', 'unterschrift.png');

if (!inputPath || !fs.existsSync(inputPath)) {
  console.error('Eingabedatei fehlt oder existiert nicht:', inputPath);
  process.exit(1);
}

const outDir = path.dirname(outputPath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const threshold = 250; // Pixel mit R,G,B > 250 gelten als „weiß“

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0; // transparent
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  console.log('Gespeichert:', outputPath);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
