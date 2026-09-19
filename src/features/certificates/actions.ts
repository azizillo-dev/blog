"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { bool, readLocalized, str, toActionError, type ActionState } from "@/features/admin/form";
import { autoTranslate, translationNote } from "@/features/admin/translate";
import { revalidateSite } from "@/features/admin/revalidate";

const certificateSchema = z.object({
  image: z.string().min(1, "rasm kerak").max(2000),
  issuer: z.string().min(1, "beruvchini kiriting").max(200),
  issuedAt: z.coerce.date(),
  url: z.union([z.literal(""), z.string().url("to'g'ri URL kiriting")]),
  order: z.coerce.number().int().min(0).max(9999),
});

export async function saveCertificateAction(id: string | null, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const input = readLocalized(fd, ["title", "description"], "title");
    if (input.length === 0) return { error: "Kamida bitta tilda nom kiriting." };
    const data = certificateSchema.parse({
      image: str(fd, "image"),
      issuer: str(fd, "issuer"),
      issuedAt: str(fd, "issuedAt"),
      url: str(fd, "url"),
      order: str(fd, "order") || 0,
    });
    const { rows: translations, translated, failed } = await autoTranslate(input, ["title", "description"], {
      overwrite: bool(fd, "retranslate"),
    });

    if (id) {
      await db.certificate.update({ where: { id }, data: { ...data, translations: { deleteMany: {}, create: translations } } });
    } else {
      await db.certificate.create({ data: { ...data, translations: { create: translations } } });
    }
    revalidateSite();
    return { ok: true, message: (id ? "Saqlandi ✔" : "Sertifikat qo'shildi ✔") + translationNote(translated, failed) };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteCertificateAction(id: string) {
  await requireAdmin();
  await db.certificate.delete({ where: { id } });
  revalidateSite();
}
