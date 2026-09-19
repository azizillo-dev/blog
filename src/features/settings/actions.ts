"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { SETTING_KEYS } from "@/lib/constants";
import { str, toActionError, type ActionState } from "@/features/admin/form";
import { revalidateSite } from "@/features/admin/revalidate";

export async function saveSettingsAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    await db.$transaction(
      SETTING_KEYS.map((key) => {
        const value = str(fd, key).slice(0, 1000);
        return db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
      }),
    );
    revalidateTag("leetcode");
    revalidateSite();
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
