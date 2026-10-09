import "server-only";
import { db } from "@/lib/db";
import { parseSceneData, isEmptyScene, type SceneData, type SceneKind } from "./schema";

export const SECRET_KEY = "secret";

export type SceneView = { id: string; kind: SceneKind; data: SceneData };

export type SecretPageView = {
  id: string;
  slug: string;
  title: string;
  intro: string;
  nextLabel: string;
  visible: boolean;
  hasPassword: boolean;
  scenes: SceneView[];
};

/** Sahifa yo'q bo'lsa birinchi murojaatda yaratiladi (admin darhol tahrirlay olsin). */
export async function getSecretPage(): Promise<SecretPageView> {
  const page = await db.secretPage.upsert({
    where: { key: SECRET_KEY },
    create: { key: SECRET_KEY },
    update: {},
    include: { scenes: { orderBy: { order: "asc" } } },
  });

  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    intro: page.intro,
    nextLabel: page.nextLabel || "Keyingisi",
    visible: page.visible,
    hasPassword: page.passwordHash.length > 0,
    scenes: page.scenes.map((s) => ({ id: s.id, kind: s.kind as SceneKind, data: parseSceneData(s.kind as SceneKind, s.data) })),
  };
}

/** Saytda ko'rsatish uchun: yashirilgan va bo'sh sahnalar tashlab yuboriladi. */
export async function getSecretPageBySlug(slug: string): Promise<SecretPageView | null> {
  const page = await db.secretPage.findFirst({ where: { slug, visible: true }, include: { scenes: { orderBy: { order: "asc" } } } });
  if (!page) return null;

  const scenes = page.scenes
    .filter((s) => s.visible)
    .map((s) => ({ id: s.id, kind: s.kind as SceneKind, data: parseSceneData(s.kind as SceneKind, s.data) }))
    .filter((s) => !isEmptyScene(s.kind, s.data));

  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    intro: page.intro,
    nextLabel: page.nextLabel || "Keyingisi",
    visible: page.visible,
    hasPassword: page.passwordHash.length > 0,
    scenes,
  };
}

export type VisitStats = {
  total: number;
  unique: number;
  today: number;
  recent: { at: Date; place: string; device: string; referrer: string }[];
};

export async function getVisitStats(pageId: string): Promise<VisitStats> {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);

  const [total, unique, today, recent] = await Promise.all([
    db.secretVisit.count({ where: { pageId } }),
    db.secretVisit.findMany({ where: { pageId }, distinct: ["ipHash"], select: { id: true } }),
    db.secretVisit.count({ where: { pageId, createdAt: { gte: midnight } } }),
    db.secretVisit.findMany({ where: { pageId }, orderBy: { createdAt: "desc" }, take: 25 }),
  ]);

  return {
    total,
    unique: unique.length,
    today,
    recent: recent.map((v) => ({
      at: v.createdAt,
      place: [v.city, v.country].filter(Boolean).join(", ") || "—",
      device: v.device || "—",
      referrer: v.referrer,
    })),
  };
}
