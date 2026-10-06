import "server-only";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/constants";
import { pickTranslation } from "@/lib/content/translation";
import { parseTechnologies } from "./technologies";

export type ProjectView = {
  id: string;
  slug: string;
  image: string;
  title: string;
  description: string;
  technologies: string[];
  demoUrl: string;
  sourceUrl: string;
};

type Row = {
  id: string;
  slug: string | null;
  image: string;
  technologies: string;
  demoUrl: string;
  sourceUrl: string;
  translations: { locale: string; title: string; description: string }[];
};

function toView(p: Row, locale: Locale): ProjectView {
  const t = pickTranslation(p.translations, locale);
  return {
    id: p.id,
    slug: p.slug ?? p.id, // slug hali yaratilmagan bo'lsa id ishlatiladi
    image: p.image,
    title: t?.title ?? "",
    description: t?.description ?? "",
    technologies: parseTechnologies(p.technologies),
    demoUrl: p.demoUrl,
    sourceUrl: p.sourceUrl,
  };
}

export async function listProjects(locale: Locale): Promise<ProjectView[]> {
  const rows = await db.project.findMany({
    where: { visible: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { translations: true },
  });
  return rows.map((p) => toView(p, locale));
}

export async function getProject(slug: string, locale: Locale): Promise<ProjectView | null> {
  const row = await db.project.findFirst({
    where: { visible: true, OR: [{ slug }, { id: slug }] },
    include: { translations: true },
  });
  return row ? toView(row, locale) : null;
}
