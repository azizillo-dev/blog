"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { RESUME_KINDS } from "@/lib/constants";
import { bool, readLocalized, str, toActionError, type ActionState } from "@/features/admin/form";
import { revalidateSite } from "@/features/admin/revalidate";

const entrySchema = z
  .object({
    kind: z.enum(RESUME_KINDS),
    organization: z.string().min(1, "tashkilot nomini kiriting").max(200),
    logo: z.string().max(2000),
    location: z.string().max(200),
    url: z.union([z.literal(""), z.string().url("to'g'ri URL kiriting").max(500)]),
    startDate: z.coerce.date({ message: "boshlanish sanasi kerak" }),
    endDate: z.coerce.date().nullable(),
    order: z.coerce.number().int().min(0).max(9999),
  })
  .refine((d) => !d.endDate || d.endDate >= d.startDate, { message: "tugash sanasi boshlanishdan oldin bo'lmasin", path: ["endDate"] });

export async function saveResumeEntryAction(id: string | null, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const translations = readLocalized(fd, ["title", "description"], "title");
    if (translations.length === 0) return { error: "Kamida bitta tilda lavozim/yo'nalish kiriting." };
    const current = bool(fd, "current");
    const data = entrySchema.parse({
      kind: str(fd, "kind"),
      organization: str(fd, "organization"),
      logo: str(fd, "logo"),
      location: str(fd, "location"),
      url: str(fd, "url"),
      // <input type="month"> → "2024-03"
      startDate: str(fd, "startDate") ? `${str(fd, "startDate")}-01` : undefined,
      endDate: current || !str(fd, "endDate") ? null : `${str(fd, "endDate")}-01`,
      order: str(fd, "order") || 0,
    });

    if (id) {
      await db.resumeEntry.update({ where: { id }, data: { ...data, translations: { deleteMany: {}, create: translations } } });
    } else {
      await db.resumeEntry.create({ data: { ...data, translations: { create: translations } } });
    }
    revalidateSite();
    return { ok: true, message: id ? "Saqlandi ✔" : "Qo'shildi ✔" };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteResumeEntryAction(id: string) {
  await requireAdmin();
  await db.resumeEntry.delete({ where: { id } });
  revalidateSite();
}
