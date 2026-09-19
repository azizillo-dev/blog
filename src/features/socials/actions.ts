"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import { bool, str, toActionError, type ActionState } from "@/features/admin/form";
import { revalidateSite } from "@/features/admin/revalidate";

const socialSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  label: z.string().min(1, "nom kiriting").max(60),
  url: z.string().max(500).refine((v) => /^(https?:\/\/|mailto:)/i.test(v), "http(s):// yoki mailto: bilan boshlansin"),
  order: z.coerce.number().int().min(0).max(9999),
  visible: z.boolean(),
});

export async function saveSocialAction(id: string | null, _: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const data = socialSchema.parse({
      platform: str(fd, "platform"),
      label: str(fd, "label"),
      url: str(fd, "url"),
      order: str(fd, "order") || 0,
      visible: bool(fd, "visible"),
    });
    if (id) await db.socialLink.update({ where: { id }, data });
    else await db.socialLink.create({ data });
    revalidateSite();
    return { ok: true, message: id ? "Saqlandi ✔" : "Qo'shildi ✔" };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteSocialAction(id: string) {
  await requireAdmin();
  await db.socialLink.delete({ where: { id } });
  revalidateSite();
}
