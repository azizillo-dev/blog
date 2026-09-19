/**
 * Mavjud kontentda yozilmagan tillarni (odatda ru/en) manba tildan avtomatik tarjima qilib qo'shadi.
 * Qo'lda yozilgan tarjimalarga tegmaydi.
 *   npm run translate:missing
 */
import { PrismaClient } from "@prisma/client";
import { LOCALES } from "@/lib/constants";
import { autoTranslate } from "@/features/admin/translate";

const db = new PrismaClient();

type Spec = { model: string; tr: string; fk: string; fields: string[]; blockFields?: string[] };

const SPECS: Spec[] = [
  { model: "post", tr: "postTranslation", fk: "postId", fields: ["title", "excerpt", "blocks"], blockFields: ["blocks"] },
  { model: "page", tr: "pageTranslation", fk: "pageId", fields: ["title", "blocks"], blockFields: ["blocks"] },
  { model: "section", tr: "sectionTranslation", fk: "sectionId", fields: ["title", "description"] },
  { model: "certificate", tr: "certificateTranslation", fk: "certificateId", fields: ["title", "description"] },
  { model: "project", tr: "projectTranslation", fk: "projectId", fields: ["title", "description"] },
  { model: "resumeEntry", tr: "resumeEntryTranslation", fk: "entryId", fields: ["title", "description"] },
];

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDb = db as any;
  for (const s of SPECS) {
    const items = await anyDb[s.model].findMany({ include: { translations: true } });
    for (const item of items) {
      if (item.translations.length === 0 || item.translations.length >= LOCALES.length) continue;
      const rows = item.translations.map((t: Record<string, string>) => ({
        locale: t.locale,
        ...Object.fromEntries(s.fields.map((f) => [f, t[f] ?? ""])),
      }));
      const { rows: out, translated, failed } = await autoTranslate(rows, s.fields, { blockFields: s.blockFields });
      for (const row of out.filter((r) => translated.includes(r.locale))) {
        await anyDb[s.tr].create({ data: { ...row, [s.fk]: item.id } });
      }
      const name = item.slug ?? item.key ?? item.organization ?? rows[0].title;
      console.log(`${failed.length ? "✘" : "✔"} ${s.model} "${name}": +${translated.join(",") || "-"}${failed.length ? ` (xato: ${failed.join(",")})` : ""}`);
    }
  }
}

main()
  .catch((e) => {
    console.error("✘", e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
