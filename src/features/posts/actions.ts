"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { validateBlocksJson } from "@/lib/content/blocks";
import { slugify } from "@/lib/utils";
import { bool, readLocalized, str, toActionError, type ActionState } from "@/features/admin/form";
import { revalidateSite } from "@/features/admin/revalidate";
import { autoTranslate, translationNote } from "@/features/admin/translate";

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "faqat a-z, 0-9 va '-'").max(80);

const postSchema = z.object({
  slug: slugSchema,
  sectionId: z.string().min(1, "bo'lim tanlang"),
  coverImage: z.string().max(2000),
  published: z.boolean(),
  publishedAt: z.coerce.date(),
});

export async function savePostAction(id: string | null, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  let createdId: string | null = null;
  let note = "";
  try {
    const input = readLocalized(fd, ["title", "excerpt", "blocks"], "title").map((t) => ({
      ...t,
      blocks: validateBlocksJson(t.blocks),
    }));
    if (input.length === 0) return { error: "Kamida bitta tilda sarlavha kiriting." };

    const data = postSchema.parse({
      slug: str(fd, "slug") || slugify(input[0].title),
      sectionId: str(fd, "sectionId"),
      coverImage: str(fd, "coverImage"),
      published: bool(fd, "published"),
      publishedAt: str(fd, "publishedAt") || new Date(),
    });
    const { rows: translations, translated, failed } = await autoTranslate(input, ["title", "excerpt", "blocks"], {
      overwrite: bool(fd, "retranslate"),
      blockFields: ["blocks"],
    });
    note = translationNote(translated, failed);

    if (id) {
      await db.post.update({ where: { id }, data: { ...data, translations: { deleteMany: {}, create: translations } } });
    } else {
      createdId = (await db.post.create({ data: { ...data, translations: { create: translations } } })).id;
    }
    revalidateSite();
  } catch (error) {
    return toActionError(error);
  }
  if (createdId) redirect(`/admin/posts/${createdId}?saved=1`);
  return { ok: true, message: "Saqlandi ✔" + note };
}

export async function deletePostAction(id: string) {
  await requireAdmin();
  await db.post.delete({ where: { id } });
  revalidateSite();
  redirect("/admin/posts");
}
