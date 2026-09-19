/**
 * assets/avatar-cutout.png (fonsiz portret) → dumaloq favicon:
 *   src/app/icon.png (512), src/app/apple-icon.png (180), src/app/favicon.ico (16/32/48)
 * Fon — osmon rang gradient (qora soch/kostyum aniq ajraladi; tab yorug'/qorong'i bo'lsa ham ko'rinadi).
 *   node scripts/make-icons.mjs
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const SIZE = 512;
// Portretdan yuz va yelka boshi (asl rasm 456×488 px) — kichik tab o'lchamida ham yuz aniq ko'rinsin
const CROP = { left: 100, top: 45, width: 260, height: 260 };

const background = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#bae6fd"/><stop offset="1" stop-color="#38bdf8"/>
  </linearGradient></defs>
  <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}" fill="url(#g)"/>
</svg>`);
const circleMask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}"/></svg>`,
);

const portrait = await sharp("assets/avatar-cutout.png").extract(CROP).resize(SIZE, SIZE).png().toBuffer();

const icon = await sharp(background)
  .composite([
    { input: portrait, blend: "over" },
    { input: circleMask, blend: "dest-in" }, // hammasini doira ichida qoldiradi
  ])
  .png()
  .toBuffer();

const png = (size) => sharp(icon).resize(size, size).png().toBuffer();

// ICO: 6 bayt sarlavha + har rasm uchun 16 bayt katalog + PNG ma'lumotlari
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + 16 * images.length;
const entries = images.map((img, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i], 0);
  e.writeUInt8(sizes[i], 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  return e;
});

await writeFile("src/app/favicon.ico", Buffer.concat([header, ...entries, ...images]));
await writeFile("src/app/icon.png", icon);
await writeFile("src/app/apple-icon.png", await png(180));
console.log("✔ icon.png, apple-icon.png, favicon.ico");
