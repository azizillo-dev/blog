import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { LOCALES } from "@/lib/constants";
import { routes } from "@/lib/routes";

const SITE = process.env.SITE_URL || "http://localhost:3000";

export const revalidate = 3600;

/** Ommaviy sahifalar va postlar (private'siz), har uch tilda. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, sections] = await Promise.all([
    db.post.findMany({
      where: { published: true, section: { kind: { not: "PRIVATE" } } },
      select: { slug: true, updatedAt: true, section: { select: { kind: true } } },
    }),
    db.section.findMany({ where: { kind: { in: ["IT", "CUSTOM"] } }, select: { slug: true, kind: true } }),
  ]);

  return LOCALES.flatMap((l) => [
    ...[routes.home(l), routes.about(l), routes.posts(l), routes.projects(l), routes.certificates(l)].map((p) => ({ url: SITE + p })),
    ...sections.map((s) => ({ url: SITE + routes.section(l, s.slug, s.kind) })),
    ...posts.map((p) => ({ url: SITE + routes.post(l, p.slug, p.section.kind), lastModified: p.updatedAt })),
  ]);
}
