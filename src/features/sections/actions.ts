"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { NAV_PLACEMENTS } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { readLocalized, str, toActionError, type ActionState } from "@/features/admin/form";
import { revalidateSite } from "@/features/admin/revalidate";

const sectionSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "faqat a-z, 0-9 va '-'").max(60),
  inNav: z.enum(NAV_PLACEMENTS),
  order: z.coerce.number().int().min(0).max(9999),
});

export async function saveSectionAction(id: string | null, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const translations = readLocalized(fd, ["title", "description"], "title");
    if (translations.length === 0) return { error: "Kamida bitta tilda nom kiriting." };
    const data = sectionSchema.parse({
      slug: str(fd, "slug") || slugify(translations[0].title),
      inNav: str(fd, "inNav"),
      order: str(fd, "order") || 0,
    });

    if (id) {
      await db.section.update({ where: { id }, data: { ...data, translations: { deleteMany: {}, create: translations } } });
    } else {
      // Admin faqat CUSTOM bo'lim yarata oladi; BLOG/IT/PRIVATE — tizim bo'limlari (seed).
      await db.section.create({ data: { ...data, kind: "CUSTOM", translations: { create: translations } } });
    }
    revalidateSite();
    return { ok: true, message: id ? "Saqlandi ✔" : "Bo'lim qo'shildi ✔" };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteSectionAction(id: string) {
  await requireAdmin();
  await db.section.deleteMany({ where: { id, kind: "CUSTOM" } });
  revalidateSite();
}
