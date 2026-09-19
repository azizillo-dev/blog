import "server-only";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/constants";
import { pickTranslation } from "@/lib/content/translation";
import { parseBlocks } from "@/lib/content/blocks";

export async function getPage(key: string, locale: Locale) {
  const page = await db.page.findUnique({ where: { key }, include: { translations: true } });
  if (!page) return null;
  const t = pickTranslation(page.translations, locale);
  return { image: page.image, title: t?.title ?? "", blocks: parseBlocks(t?.blocks) };
}
