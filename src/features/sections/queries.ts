import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/constants";
import { pickTranslation } from "@/lib/content/translation";

export type SectionView = {
  id: string;
  slug: string;
  kind: string;
  inNav: string;
  title: string;
  description: string;
};

const withTranslations = { translations: true } as const;

export const getSections = cache(async (locale: Locale): Promise<SectionView[]> => {
  const rows = await db.section.findMany({ orderBy: { order: "asc" }, include: withTranslations });
  return rows.map((s) => {
    const t = pickTranslation(s.translations, locale);
    return { id: s.id, slug: s.slug, kind: s.kind, inNav: s.inNav, title: t?.title ?? s.slug, description: t?.description ?? "" };
  });
});

export async function getSectionBySlug(slug: string, locale: Locale) {
  return (await getSections(locale)).find((s) => s.slug === slug) ?? null;
}

export async function getSectionByKind(kind: string, locale: Locale) {
  return (await getSections(locale)).find((s) => s.kind === kind) ?? null;
}
