"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { validateBlocksJson } from "@/lib/content/blocks";
import { bool, readLocalized, str, toActionError, type ActionState } from "@/features/admin/form";
import { autoTranslate, translationNote } from "@/features/admin/translate";
import { revalidateSite } from "@/features/admin/revalidate";

export async function savePageAction(key: string, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const input = readLocalized(fd, ["title", "blocks"], "title").map((t) => ({ ...t, blocks: validateBlocksJson(t.blocks) }));
    if (input.length === 0) return { error: "Kamida bitta tilda sarlavha kiriting." };
    const image = str(fd, "image");
    const { rows: translations, translated, failed } = await autoTranslate(input, ["title", "blocks"], {
      overwrite: bool(fd, "retranslate"),
      blockFields: ["blocks"],
    });

    await db.page.upsert({
      where: { key },
      create: { key, image, translations: { create: translations } },
      update: { image, translations: { deleteMany: {}, create: translations } },
    });
    revalidateSite();
    return { ok: true, message: "Saqlandi ✔" + translationNote(translated, failed) };
  } catch (error) {
    return toActionError(error);
  }
}
