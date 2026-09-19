import "server-only";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/constants";
import { pickTranslation } from "@/lib/content/translation";
import { parseTechnologies } from "./technologies";

export type ProjectView = {
  id: string;
  image: string;
  title: string;
  description: string;
  technologies: string[];
  demoUrl: string;
  sourceUrl: string;
};

export async function listProjects(locale: Locale): Promise<ProjectView[]> {
  const rows = await db.project.findMany({
    where: { visible: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { translations: true },
  });
  return rows.map((p) => {
    const t = pickTranslation(p.translations, locale);
    return {
      id: p.id,
      image: p.image,
      title: t?.title ?? "",
      description: t?.description ?? "",
      technologies: parseTechnologies(p.technologies),
      demoUrl: p.demoUrl,
      sourceUrl: p.sourceUrl,
    };
  });
}
