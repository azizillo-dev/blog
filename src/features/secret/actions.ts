"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { hashSecret } from "@/lib/auth/password";
import { bool, str, toActionError, type ActionState } from "@/features/admin/form";
import { SCENE_KINDS, validateSceneData, type SceneKind } from "./schema";
import { SECRET_KEY } from "./queries";

const settingsSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9][a-z0-9-]{1,60}$/, "faqat kichik harf, raqam va '-' (kamida 2 belgi)"),
  title: z.string().trim().max(120),
  intro: z.string().trim().max(600),
  nextLabel: z.string().trim().max(40),
  visible: z.boolean(),
});

// Boshqa sahifalar bilan to'qnashmasin
const RESERVED = ["blog", "posts", "projects", "certificates", "private", "admin", "api", "it", "s", "about", "uploads", "uz", "ru", "en"];

export async function saveSecretSettingsAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const data = settingsSchema.parse({
      slug: str(fd, "slug").toLowerCase(),
      title: str(fd, "title"),
      intro: str(fd, "intro"),
      nextLabel: str(fd, "nextLabel") || "Keyingisi",
      visible: bool(fd, "visible"),
    });
    if (RESERVED.includes(data.slug)) return { error: `"${data.slug}" band — boshqa manzil tanlang.` };

    const page = await db.secretPage.upsert({ where: { key: SECRET_KEY }, create: { key: SECRET_KEY, ...data }, update: data });

    // Parol: bo'sh qoldirilsa o'zgarmaydi; "-" yozilsa olib tashlanadi
    const password = str(fd, "password");
    if (password === "-") {
      await db.secretPage.update({ where: { id: page.id }, data: { passwordHash: "" } });
    } else if (password) {
      await db.secretPage.update({ where: { id: page.id }, data: { passwordHash: await hashSecret(password) } });
    }

    revalidatePath("/", "layout");
    return { ok: true, message: "Saqlandi ✔" };
  } catch (error) {
    return toActionError(error);
  }
}

const sceneSchema = z.object({
  id: z.string().optional(),
  kind: z.enum(SCENE_KINDS),
  visible: z.boolean(),
  data: z.string(),
});

/** Sahnalar ro'yxati butunlay almashtiriladi (editor JSON yuboradi). */
export async function saveScenesAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const scenes = z.array(sceneSchema).max(30).parse(JSON.parse(str(fd, "scenes") || "[]"));
    const page = await db.secretPage.upsert({ where: { key: SECRET_KEY }, create: { key: SECRET_KEY }, update: {} });

    await db.$transaction([
      db.secretScene.deleteMany({ where: { pageId: page.id } }),
      db.secretScene.createMany({
        data: scenes.map((s, order) => ({
          pageId: page.id,
          kind: s.kind,
          order,
          visible: s.visible,
          data: validateSceneData(s.kind as SceneKind, s.data),
        })),
      }),
    ]);

    revalidatePath("/", "layout");
    return { ok: true, message: `Saqlandi ✔ (${scenes.length} ta sahna)` };
  } catch (error) {
    return toActionError(error);
  }
}

export async function clearVisitsAction() {
  await requireAdmin();
  const page = await db.secretPage.findUnique({ where: { key: SECRET_KEY } });
  if (page) await db.secretVisit.deleteMany({ where: { pageId: page.id } });
}
