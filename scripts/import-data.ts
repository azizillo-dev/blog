/**
 * `export-data.ts` natijasini (yangi) DB'ga yozadi. Bo'sh DB kutiladi; `--force` bilan avval hammasi o'chiriladi.
 * R2_PUBLIC_URL berilgan bo'lsa, lokal "/uploads/..." havolalar "https://media.../..." ga almashtiriladi.
 *   npx tsx scripts/import-data.ts [fayl] [--force]
 */
import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";

const db = new PrismaClient();
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--")) ?? "data/export.json";
const force = args.includes("--force");
const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

async function load() {
  let json = await readFile(file, "utf8");
  // Oddiy maydonlarda ("/uploads/..") ham, bloklar JSON'i ichida (\"/uploads/..) ham.
  if (publicUrl) json = json.replace(/(\\?")\/uploads\//g, `$1${publicUrl}/`);
  return JSON.parse(json, (_, v) => (typeof v === "string" && ISO_DATE.test(v) ? new Date(v) : v));
}

type WithTr = { translations: object[] } & Record<string, unknown>;

// Tarjimalar ota yozuvning id'si bilan birga nested create orqali yoziladi.
const nested = (rows: WithTr[], fk: string) =>
  rows.map(({ translations, ...row }) => ({
    ...row,
    translations: { create: translations.map((t) => Object.fromEntries(Object.entries(t).filter(([k]) => k !== fk && k !== "id"))) },
  }));

async function main() {
  if ((await db.section.count()) > 0) {
    if (!force) throw new Error("DB bo'sh emas. Qayta yozish uchun --force qo'shing.");
    await db.$transaction([
      db.post.deleteMany(), db.section.deleteMany(), db.page.deleteMany(), db.certificate.deleteMany(),
      db.project.deleteMany(), db.resumeEntry.deleteMany(), db.socialLink.deleteMany(), db.setting.deleteMany(),
      db.accessRequest.deleteMany(), db.privateUser.deleteMany(),
    ]);
  }
  const d = await load();

  for (const s of nested(d.section, "sectionId")) await db.section.create({ data: s as never });
  for (const p of nested(d.post, "postId")) await db.post.create({ data: p as never });
  for (const p of nested(d.page, "pageId")) await db.page.create({ data: p as never });
  for (const c of nested(d.certificate, "certificateId")) await db.certificate.create({ data: c as never });
  for (const p of nested(d.project, "projectId")) await db.project.create({ data: p as never });
  for (const r of nested(d.resumeEntry, "entryId")) await db.resumeEntry.create({ data: r as never });
  await db.socialLink.createMany({ data: d.socialLink });
  await db.setting.createMany({ data: d.setting });
  await db.accessRequest.createMany({ data: d.accessRequest });
  await db.privateUser.createMany({ data: d.privateUser });

  console.log(`Import ✔ (${file})${publicUrl ? ` — rasmlar → ${publicUrl}` : ""}`);
}

main()
  .catch((e) => {
    console.error("✘", e.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
