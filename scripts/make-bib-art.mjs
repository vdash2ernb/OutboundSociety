// Draws the static artwork for the Virtual Santa Run e-bib (everything except the runner's
// own text, which Google Slides adds on top: see apps-script/ebib/Code.js → createTemplate_).
// Output: public/ebib/santa-run-2026-bib.jpg (2880×1620, a 4× render of the 720×405 pt slide).
//   node scripts/make-bib-art.mjs
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const W = 720, H = 405, SCALE = 4;
const STUB = 576; // x of the perforation; right of it is the tear-off stub
const HEAD = 96; // header band height
const NAME_Y = 318; // top of the name band

const MAROON = '#6e0f1b', MAROON_D = '#3c050b', PAPER = '#fbf7ef', INK = '#1d0407';
const logo = readFileSync(new URL('../public/icon-512.png', import.meta.url)).toString('base64');

// Guilloche rosette behind the number: layered sine-modulated rings
function rosette(cx, cy, rx, ry, rings, petals) {
  let d = '';
  for (let k = 0; k < rings; k++) {
    const s = 0.45 + (k / rings) * 0.55;
    const phase = (k * Math.PI) / rings;
    let p = '';
    for (let i = 0; i <= 720; i++) {
      const t = (i / 720) * Math.PI * 2;
      const r = 1 + 0.045 * Math.sin(petals * t + phase);
      const x = cx + Math.cos(t) * rx * s * r;
      const y = cy + Math.sin(t) * ry * s * r;
      p += (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
    }
    d += p + 'Z';
  }
  return d;
}

// Fine wave lines across the stub (like security print)
function waves(x0, x1, y0, y1, gap, amp, freq) {
  let d = '';
  for (let y = y0; y <= y1; y += gap) {
    for (let x = x0; x <= x1; x += 1) {
      const yy = y + Math.sin((x / freq) * Math.PI * 2 + y * 0.15) * amp;
      d += (x === x0 ? 'M' : 'L') + x.toFixed(1) + ' ' + yy.toFixed(2);
    }
  }
  return d;
}

function snowflake(cx, cy, r) {
  let d = '';
  for (let a = 0; a < 6; a++) {
    const t = (a * Math.PI) / 3;
    const ex = cx + Math.cos(t) * r, ey = cy + Math.sin(t) * r;
    d += `M${cx} ${cy}L${ex.toFixed(2)} ${ey.toFixed(2)}`;
    for (const f of [0.55, 0.78]) {
      const bx = cx + Math.cos(t) * r * f, by = cy + Math.sin(t) * r * f;
      for (const s of [-1, 1]) {
        const tt = t + s * 0.7;
        d += `M${bx.toFixed(2)} ${by.toFixed(2)}L${(bx + Math.cos(tt) * r * 0.28).toFixed(2)} ${(by + Math.sin(tt) * r * 0.28).toFixed(2)}`;
      }
    }
  }
  return d;
}

function star(cx, cy, R, r, n = 5) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 ? r : R;
    const t = (i * Math.PI) / n - Math.PI / 2;
    d += (i ? 'L' : 'M') + (cx + Math.cos(t) * rad).toFixed(2) + ' ' + (cy + Math.sin(t) * rad).toFixed(2);
  }
  return d + 'Z';
}

// Safety-pin hole: punched hole with a reinforcing ring
const pin = (x, y) => `
  <circle cx="${x}" cy="${y}" r="7.2" fill="none" stroke="url(#gold)" stroke-width="1.2"/>
  <circle cx="${x}" cy="${y + 0.6}" r="4" fill="#000" opacity="0.18"/>
  <circle cx="${x}" cy="${y}" r="3.6" fill="#2b2624"/>
  <circle cx="${x - 1}" cy="${y - 1}" r="1.2" fill="#fff" opacity="0.12"/>`;

const numberCx = STUB / 2, numberCy = (HEAD + NAME_Y) / 2 + 2;
const stubCx = (STUB + W) / 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W * SCALE}" height="${H * SCALE}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="head" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#861525"/><stop offset="0.55" stop-color="${MAROON}"/><stop offset="1" stop-color="${MAROON_D}"/>
  </linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#a8792f"/><stop offset="0.3" stop-color="#e9cf8a"/><stop offset="0.5" stop-color="#fff1c4"/>
    <stop offset="0.7" stop-color="#d8b464"/><stop offset="1" stop-color="#9c6d27"/>
  </linearGradient>
  <radialGradient id="goldSeal" cx="0.38" cy="0.32" r="0.8">
    <stop offset="0" stop-color="#fff3c9"/><stop offset="0.45" stop-color="#ddb965"/><stop offset="1" stop-color="#8f6222"/>
  </radialGradient>
  <radialGradient id="paperShade" cx="0.42" cy="0.5" r="0.75">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/><stop offset="1" stop-color="#e9dfcf" stop-opacity="0.55"/>
  </radialGradient>
  <pattern id="pinstripe" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="6" height="6" fill="none"/><line x1="0" y1="0" x2="0" y2="6" stroke="#fff" stroke-opacity="0.045" stroke-width="1.4"/>
  </pattern>
  <pattern id="cane" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
    <rect width="14" height="14" fill="#fbf7ef"/><rect width="7" height="14" fill="#b3141f"/>
  </pattern>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="7" result="n"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.2  0 0 0 0.09 0"/>
  </filter>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>
  <clipPath id="logoClip"><circle cx="54" cy="48" r="31"/></clipPath>
</defs>

<!-- paper -->
<rect width="${W}" height="${H}" fill="${PAPER}"/>
<rect width="${W}" height="${H}" fill="url(#paperShade)"/>

<!-- stub tint + security waves -->
<rect x="${STUB}" y="${HEAD}" width="${W - STUB}" height="${H - HEAD}" fill="#f3eadb"/>
<path d="${waves(STUB + 4, W - 4, HEAD + 8, H - 16, 5, 1.3, 38)}" fill="none" stroke="#d9c6a8" stroke-width="0.35" opacity="0.8"/>

<!-- guilloche behind the number -->
<path d="${rosette(numberCx, numberCy, 262, 104, 26, 24)}" fill="none" stroke="#e4d3ba" stroke-width="0.35"/>
<path d="${rosette(numberCx, numberCy, 262, 104, 13, 12)}" fill="none" stroke="#e9c3ba" stroke-width="0.3" opacity="0.8"/>

<!-- header band -->
<rect width="${W}" height="${HEAD}" fill="url(#head)"/>
<rect width="${W}" height="${HEAD}" fill="url(#pinstripe)"/>
<g stroke="#fff" stroke-linecap="round" fill="none" opacity="0.13" stroke-width="0.9">
  <path d="${snowflake(455, 30, 13)}"/><path d="${snowflake(505, 64, 8)}"/><path d="${snowflake(540, 22, 6)}"/>
  <path d="${snowflake(410, 72, 5)}"/>
</g>
<rect y="${HEAD}" width="${W}" height="2.2" fill="url(#gold)"/>
<rect y="${HEAD + 2.2}" width="${W}" height="0.8" fill="${MAROON_D}" opacity="0.35"/>

<!-- logo medallion -->
<circle cx="54" cy="48" r="35" fill="none" stroke="url(#gold)" stroke-width="2"/>
<circle cx="54" cy="48" r="32" fill="#efe9df"/>
<image x="23" y="17" width="62" height="62" clip-path="url(#logoClip)" xlink:href="data:image/png;base64,${logo}"/>

<!-- stub header: distance medallion ring -->
<circle cx="${stubCx}" cy="45" r="33" fill="none" stroke="url(#gold)" stroke-width="1.3"/>
<circle cx="${stubCx}" cy="45" r="29.5" fill="#14532d"/>
<circle cx="${stubCx}" cy="45" r="27" fill="none" stroke="#e9cf8a" stroke-width="0.5" stroke-dasharray="1.2 1.6" opacity="0.8"/>

<!-- name band rules -->
<rect x="34" y="${NAME_Y}" width="${STUB - 68}" height="0.9" fill="${MAROON}" opacity="0.55"/>
<rect x="34" y="${NAME_Y + 2.6}" width="${STUB - 68}" height="0.4" fill="${MAROON}" opacity="0.35"/>

<!-- gold seal on the stub -->
<g transform="translate(${stubCx} 352)">
  <path d="${star(0, 0, 25, 21.5, 18)}" fill="url(#goldSeal)"/>
  <circle r="17.5" fill="none" stroke="#7a5219" stroke-width="0.6" opacity="0.7"/>
  <path d="${star(0, 0, 7.5, 3.2)}" fill="${MAROON}"/>
</g>

<!-- perforation -->
<line x1="${STUB}" y1="0" x2="${STUB}" y2="${H}" stroke="#000" stroke-opacity="0.08" stroke-width="2.2"/>
<line x1="${STUB}" y1="3" x2="${STUB}" y2="${H}" stroke="${PAPER}" stroke-width="1.4" stroke-dasharray="2.4 3.2" opacity="0.9"/>
<line x1="${STUB}" y1="${HEAD + 3}" x2="${STUB}" y2="${H - 13}" stroke="#8c7a63" stroke-width="1" stroke-dasharray="2.4 3.2"/>
<circle cx="${STUB}" cy="0" r="5.5" fill="#d9cfc0"/><circle cx="${STUB}" cy="${H}" r="5.5" fill="#d9cfc0"/>

<!-- candy-cane edge -->
<rect y="${H - 13}" width="${W}" height="13" fill="url(#cane)"/>
<rect y="${H - 14.2}" width="${W}" height="1.4" fill="url(#gold)"/>

<!-- safety-pin holes -->
${pin(18, 116)}${pin(STUB - 18, 116)}${pin(18, H - 32)}${pin(STUB - 18, H - 32)}

<!-- paper grain over everything -->
<rect width="${W}" height="${H}" filter="url(#grain)"/>
</svg>`;

mkdirSync(new URL('../public/ebib/', import.meta.url), { recursive: true });
const out = new URL('../public/ebib/santa-run-2026-bib.jpg', import.meta.url);
await sharp(Buffer.from(svg)).jpeg({ quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true }).toFile(fileURLToPath(out));
console.log('wrote', fileURLToPath(out));
