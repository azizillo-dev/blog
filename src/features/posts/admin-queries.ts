import "server-only";
import { db } from "@/lib/db";
import { pickTranslation } from "@/lib/content/translation";

export async function listPostsForAdmin(sectionId?: string) {
  const rows = await db.post.findMany({
    where: { sectionId },
    orderBy: { publishedAt: "desc" },
    include: { translations: { select: { locale: true, title: true } }, section: { select: { slug: true } } },
  });
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    published: p.published,
    publishedAt: p.publishedAt,
    section: p.section.slug,
    title: pickTranslation(p.translations, "uz")?.title ?? p.slug,
    locales: p.translations.map((t) => t.locale),
  }));
}

export const getPostForEdit = (id: string) =>
  db.post.findUnique({ where: { id }, include: { translations: true, section: { select: { kind: true } } } });

export async function listSectionOptions() {
  const rows = await db.section.findMany({ orderBy: { order: "asc" }, include: { translations: true } });
  return rows.map((s) => ({ id: s.id, label: `${pickTranslation(s.translations, "uz")?.title ?? s.slug} (${s.kind})` }));
}
