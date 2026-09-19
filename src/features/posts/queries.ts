import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/constants";
import { pickTranslation } from "@/lib/content/translation";
import { parseBlocks, readingMinutes, type Block } from "@/lib/content/blocks";

export type PostCardView = {
  id: string;
  slug: string;
  kind: string;
  coverImage: string;
  publishedAt: Date;
  title: string;
  excerpt: string;
  minutes: number;
};

export type PostView = PostCardView & { blocks: Block[]; sectionTitle: string; sectionSlug: string };

const include = { translations: true, section: { include: { translations: true } } } satisfies Prisma.PostInclude;
type PostRow = Prisma.PostGetPayload<{ include: typeof include }>;

function toView(row: PostRow, locale: Locale): PostView {
  const t = pickTranslation(row.translations, locale);
  const blocks = parseBlocks(t?.blocks);
  return {
    id: row.id,
    slug: row.slug,
    kind: row.section.kind,
    coverImage: row.coverImage,
    publishedAt: row.publishedAt,
    title: t?.title ?? row.slug,
    excerpt: t?.excerpt ?? "",
    minutes: readingMinutes(blocks),
    blocks,
    sectionTitle: pickTranslation(row.section.translations, locale)?.title ?? row.section.slug,
    sectionSlug: row.section.slug,
  };
}

type ListOptions = { locale: Locale; sectionId?: string; take?: number; skip?: number };

const publishedIn = (sectionId?: string) => ({ published: true, sectionId }) satisfies Prisma.PostWhereInput;

export async function listPublishedPosts({ locale, sectionId, take, skip }: ListOptions): Promise<PostCardView[]> {
  const rows = await db.post.findMany({ where: publishedIn(sectionId), orderBy: { publishedAt: "desc" }, include, take, skip });
  return rows.map((r) => toView(r, locale));
}

export const countPublishedPosts = (sectionId?: string) => db.post.count({ where: publishedIn(sectionId) });

export const getPublishedPost = cache(async (slug: string, locale: Locale): Promise<PostView | null> => {
  const row = await db.post.findFirst({ where: { slug, published: true }, include });
  return row ? toView(row, locale) : null;
});
