"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { validateBlocksJson } from "@/lib/content/blocks";
import { readLocalized, str, toActionError, type ActionState } from "@/features/admin/form";
import { revalidateSite } from "@/features/admin/revalidate";

export async function savePageAction(key: string, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const translations = readLocalized(fd, ["title", "blocks"], "title").map((t) => ({ ...t, blocks: validateBlocksJson(t.blocks) }));
    if (translations.length === 0) return { error: "Kamida bitta tilda sarlavha kiriting." };
    const image = str(fd, "image");

    await db.page.upsert({
      where: { key },
      create: { key, image, translations: { create: translations } },
      update: { image, translations: { deleteMany: {}, create: translations } },
    });
    revalidateSite();
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
