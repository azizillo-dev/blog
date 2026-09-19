"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { bool, readLocalized, str, toActionError, type ActionState } from "@/features/admin/form";
import { revalidateSite } from "@/features/admin/revalidate";
import { parseTechnologies } from "./technologies";

const optionalUrl = z.union([z.literal(""), z.string().url("to'g'ri URL kiriting").max(500)]);

const projectSchema = z.object({
  image: z.string().max(2000),
  technologies: z.string().max(500),
  demoUrl: optionalUrl,
  sourceUrl: optionalUrl,
  order: z.coerce.number().int().min(0).max(9999),
  visible: z.boolean(),
});

export async function saveProjectAction(id: string | null, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const translations = readLocalized(fd, ["title", "description"], "title");
    if (translations.length === 0) return { error: "Kamida bitta tilda nom kiriting." };
    const data = projectSchema.parse({
      image: str(fd, "image"),
      technologies: parseTechnologies(str(fd, "technologies")).join(", "),
      demoUrl: str(fd, "demoUrl"),
      sourceUrl: str(fd, "sourceUrl"),
      order: str(fd, "order") || 0,
      visible: bool(fd, "visible"),
    });

    if (id) {
      await db.project.update({ where: { id }, data: { ...data, translations: { deleteMany: {}, create: translations } } });
    } else {
      await db.project.create({ data: { ...data, translations: { create: translations } } });
    }
    revalidateSite();
    return { ok: true, message: id ? "Saqlandi ✔" : "Loyiha qo'shildi ✔" };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteProjectAction(id: string) {
  await requireAdmin();
  await db.project.delete({ where: { id } });
  revalidateSite();
}
