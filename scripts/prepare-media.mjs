// Copies the hand-picked source photos into src/assets (resized, EXIF-rotated)
// and encodes the hero video clips. Re-run after changing the lists below.
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const FB = 'source/facebook/photos';
const MAPS = 'source/google-maps/photos';
const pad = (n) => String(n).padStart(3, '0');
const hnr = (n) => `${FB}/haunted-night-run-2025/haunted-night-run-2025-${pad(n)}.jpg`;
const tl = (n) => `${FB}/photos-timeline/photos-timeline-${pad(n)}.jpg`;
const mob = (n) => `${FB}/mobile-uploads/mobile-uploads-${pad(n)}.jpg`;

// [output name, source file]
const photos = [
  // Haunted Night Run 2025 (Oct 31, 2025)
  ['hnr25-group', hnr(71)],
  ['hnr25-dino', hnr(4)],
  ['hnr25-crew', hnr(11)],
  ['hnr25-witches', hnr(21)],
  ['hnr25-alien', hnr(26)],
  ['hnr25-skeletons', hnr(35)],
  ['hnr25-queen', hnr(38)],
  ['hnr25-bakeria', hnr(43)],
  ['hnr25-capes', hnr(44)],
  ['hnr25-medals-crew', hnr(49)],
  ['hnr25-jump', hnr(58)],
  ['hnr25-team', hnr(62)],
  ['hnr25-kids', hnr(34)],
  ['hnr25-crowd', hnr(60)],
  ['hnr25-pumpkin', hnr(25)],
  ['hnr25-finishers', hnr(19)],
  ['hnr25-medals', mob(29)],
  // Heart and Sole (Feb 14, 2026)
  ['hs26-medals', mob(53)],
  ['hs26-poster', tl(104)],
  // Roefan Birthday Run (May 23, 2026)
  ['roe26-medal', tl(24)],
  // Cielo's Happy Pace (Aug 29, 2026)
  ['cielo26-poster', tl(214)],
  ['cielo26-runners-1', tl(146)],
  ['cielo26-runners-2', tl(148)],
  ['cielo26-runners-3', tl(151)],
  ['cielo26-runners-4', tl(152)],
  ['cielo26-family', tl(153)],
  ['cielo26-bibs', tl(156)],
  ['cielo26-duo', tl(164)],
  ['cielo26-friends', tl(237)],
  ['cielo26-group-1', tl(242)],
  ['cielo26-group-2', tl(243)],
  ['cielo26-smile', tl(244)],
  ['cielo26-squad', tl(53)],
  ['cielo26-dad', tl(52)],
  ['cielo26-night', tl(59)],
  ['cielo26-crew', tl(60)],
  ['cielo26-shirts', mob(42)],
  // Community / general
  ['night-runner', mob(56)],
  ['runner-lights', mob(57)],
  ['zumba', mob(58)],
  ['pickleball-group', `${MAPS}/maps-photo-02.jpg`],
  ['foam-party', `${MAPS}/maps-photo-15.jpg`],
  ['night-group', `${MAPS}/maps-photo-19.jpg`],
  ['zumba-night', `${MAPS}/review-photo-03.jpg`],
  // Upcoming
  ['pit-senyor-poster', tl(270)],
];

const outDir = 'src/assets/photos';
fs.mkdirSync(outDir, { recursive: true });
for (const [name, src] of photos) {
  const out = path.join(outDir, `${name}.jpg`);
  await sharp(src).rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true }).toFile(out);
}
fs.copyFileSync('source/brand/logo-circle.webp', 'src/assets/logo-circle.webp');
fs.copyFileSync('source/google-site/images/events-haunted-night-run-2026-poster.jpg', path.join(outDir, 'hnr26-poster.jpg'));
console.log('photos:', photos.length + 1);

// Hero clips: [name, source, start seconds, duration]
const V = 'source/facebook/videos';
const clips = [
  ['hero-start', `${V}/liloan-community-run-2026_gun-start.mp4`, 12, 9],
  ['hero-bridge', `${V}/heart-and-sole-2026_recap-part-1.mp4`, 8, 9],
  ['hero-costumes', `${V}/haunted-night-run-2025_thank-you.mp4`, 17, 9],
];
const vDir = 'public/video';
fs.mkdirSync(vDir, { recursive: true });
for (const [name, src, ss, t] of clips) {
  const base = ['-v', 'error', '-y', '-ss', String(ss), '-t', String(t), '-i', src, '-an', '-vf', 'scale=540:-2,fps=30'];
  execFileSync(ffmpeg, [...base, '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'slow', '-movflags', '+faststart', `${vDir}/${name}.mp4`]);
  execFileSync(ffmpeg, ['-v', 'error', '-y', '-ss', String(ss + 1), '-i', src, '-frames:v', '1', '-vf', 'scale=540:-2', '-q:v', '4', `${vDir}/${name}.jpg`]);
  console.log(name, (fs.statSync(`${vDir}/${name}.mp4`).size / 1e6).toFixed(2), 'MB');
}
