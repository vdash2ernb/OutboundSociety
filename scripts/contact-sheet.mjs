// Builds numbered contact sheets (thumbnail grids) for picking photos.
// Usage: node scripts/contact-sheet.mjs <folder> <outPrefix> [cols=8] [thumb=190]
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [dir, outPrefix, colsArg, thumbArg] = process.argv.slice(2);
const cols = Number(colsArg || 8);
const size = Number(thumbArg || 190);
const perSheet = cols * 6;
const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();

for (let s = 0; s * perSheet < files.length; s++) {
  const batch = files.slice(s * perSheet, (s + 1) * perSheet);
  const rows = Math.ceil(batch.length / cols);
  const tiles = await Promise.all(
    batch.map(async (f, i) => {
      const img = await sharp(path.join(dir, f)).rotate().resize(size, size, { fit: 'cover' }).toBuffer();
      const n = s * perSheet + i + 1;
      const label = Buffer.from(
        `<svg width="${size}" height="${size}"><rect width="44" height="24" fill="black"/><text x="4" y="18" font-size="18" font-family="Arial" fill="#ff0">${n}</text></svg>`
      );
      return {
        input: await sharp(img).composite([{ input: label, top: 0, left: 0 }]).toBuffer(),
        left: (i % cols) * (size + 4),
        top: Math.floor(i / cols) * (size + 4),
      };
    })
  );
  const out = `${outPrefix}-${s + 1}.jpg`;
  await sharp({
    create: { width: cols * (size + 4), height: rows * (size + 4), channels: 3, background: '#222' },
  })
    .composite(tiles)
    .jpeg({ quality: 70 })
    .toFile(out);
  console.log(out, batch.length);
}
