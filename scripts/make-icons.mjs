/**
 * src/app/icon.svg dan favicon.ico (16/32/48, PNG-in-ICO) va apple-icon.png (180) yasaydi.
 *   node scripts/make-icons.mjs
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const svg = await readFile("src/app/icon.svg");
const png = (size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();

// ICO: 6 bayt sarlavha + har rasm uchun 16 bayt katalog yozuvi + PNG ma'lumotlari
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2); // turi: icon
header.writeUInt16LE(images.length, 4);

let offset = 6 + 16 * images.length;
const entries = images.map((img, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i], 0);
  e.writeUInt8(sizes[i], 1);
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  return e;
});

await writeFile("src/app/favicon.ico", Buffer.concat([header, ...entries, ...images]));
await writeFile("src/app/apple-icon.png", await png(180));
await writeFile("test-results/icon-preview.png", await png(256));
console.log("✔ favicon.ico, apple-icon.png");
