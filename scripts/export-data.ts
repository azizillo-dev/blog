/**
 * Butun DB'ni JSON'ga eksport qiladi (DB provayderini almashtirishdan oldin zaxira).
 *   npx tsx scripts/export-data.ts [fayl]   → default: data/export.json
 */
import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const db = new PrismaClient();
const out = process.argv[2] ?? "data/export.json";

async function main() {
  const data = {
    section: await db.section.findMany({ include: { translations: true } }),
    post: await db.post.findMany({ include: { translations: true } }),
    page: await db.page.findMany({ include: { translations: true } }),
    certificate: await db.certificate.findMany({ include: { translations: true } }),
    project: await db.project.findMany({ include: { translations: true } }),
    resumeEntry: await db.resumeEntry.findMany({ include: { translations: true } }),
    socialLink: await db.socialLink.findMany(),
    setting: await db.setting.findMany(),
    accessRequest: await db.accessRequest.findMany(),
    privateUser: await db.privateUser.findMany(),
  };
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(data, null, 2), "utf8");
  console.log(`Eksport ✔ → ${out}`, Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])));
}

main().finally(() => db.$disconnect());
