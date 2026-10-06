/**
 * Loyiha va sertifikatlarga slug yozadi (nomdan). Mavjud sluglarga tegmaydi.
 *   npm run slugs:backfill
 */
import { PrismaClient } from "@prisma/client";
import { slugify } from "@/lib/utils";

const db = new PrismaClient();

async function fill(model: "project" | "certificate") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = (db as any)[model];
  const rows = await table.findMany({ where: { slug: null }, include: { translations: true } });
  const taken = new Set<string>((await table.findMany({ where: { NOT: { slug: null } }, select: { slug: true } })).map((r: { slug: string }) => r.slug));

  for (const row of rows) {
    const title = row.translations.find((t: { locale: string }) => t.locale === "uz")?.title ?? row.translations[0]?.title ?? row.id;
    const base = slugify(title) || model;
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    taken.add(slug);
    await table.update({ where: { id: row.id }, data: { slug } });
    console.log(`✔ ${model}: ${title} → ${slug}`);
  }
}

Promise.all([fill("project"), fill("certificate")])
  .catch((e) => {
    console.error("✘", e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
