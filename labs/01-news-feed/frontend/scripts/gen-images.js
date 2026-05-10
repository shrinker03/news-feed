/**
 * One-time setup: downloads 20 images from picsum, generates WebP + JPEG at
 * 3 widths (400 / 800 / 1200px) → 120 files in public/images/.
 *
 * Usage: node scripts/gen-images.js
 *
 * WebP is the point of stage 3 — this script creates the assets that let
 * the browser pick the smallest format+size it actually needs.
 */

const sharp = require('sharp');
const fs    = require('fs');
const path  = require('path');

const OUT  = path.resolve(__dirname, '../public/images');
const N    = 20;
const SIZES = [400, 800, 1200];

fs.mkdirSync(OUT, { recursive: true });

async function download(seed) {
  // picsum serves deterministic JPEGs by seed; download at full size, resize locally
  const url = `https://picsum.photos/seed/${seed * 10}/1200/800`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`picsum ${seed}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function generate(n) {
  process.stdout.write(`  photo-${n} `);
  const buf = await download(n);

  for (const w of SIZES) {
    const h = Math.round(w * 2 / 3); // 3:2 ratio
    await sharp(buf).resize(w, h).webp({ quality: 80 }).toFile(path.join(OUT, `photo-${n}_${w}.webp`));
    await sharp(buf).resize(w, h).jpeg({ quality: 82 }).toFile(path.join(OUT, `photo-${n}_${w}.jpg`));
    process.stdout.write('.');
  }
  console.log(' done');
}

(async () => {
  console.log(`Generating ${N} photos × ${SIZES.length} sizes × 2 formats = ${N * SIZES.length * 2} files\n`);
  for (let i = 1; i <= N; i++) {
    await generate(i);
    await new Promise(r => setTimeout(r, 150)); // be polite to picsum
  }
  console.log('\nImages saved to public/images/');
})().catch(err => { console.error(err); process.exit(1); });
