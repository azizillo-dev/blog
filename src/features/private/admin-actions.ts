"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { toLocale } from "@/i18n";
import { generatePassword, hashSecret } from "@/lib/auth/password";
import { sendMail } from "@/lib/mail/send";
import { accessGrantedMail, accessRejectedMail } from "@/lib/mail/templates";
import { routes } from "@/lib/routes";
import type { ActionState } from "@/features/admin/form";

const PATH = "/admin/requests";

const loginUrl = (locale: string) => `${process.env.SITE_URL || "http://localhost:3000"}${routes.privateLogin(toLocale(locale))}`;

/** Yangi parol yaratib emailga yuboradi. Xat ketmasa — DB o'zgarmaydi (admin qayta urinadi). */
async function issuePassword(email: string, locale: string) {
  const password = generatePassword();
  const passwordHash = await hashSecret(password);
  await sendMail(accessGrantedMail(email, password, loginUrl(locale), toLocale(locale)));
  await db.privateUser.upsert({ where: { email }, create: { email, passwordHash }, update: { passwordHash, active: true } });
}

export async function approveRequestAction(id: string): Promise<ActionState> {
  await requireAdmin();
  const request = await db.accessRequest.findUnique({ where: { id } });
  if (!request || request.status !== "PENDING") return { error: "So'rov topilmadi yoki allaqachon ko'rib chiqilgan." };
  try {
    await issuePassword(request.email, request.locale);
  } catch (error) {
    console.error("[private] approve mail failed", error);
    return { error: "Email yuborilmadi. SMTP sozlamalarini tekshiring." };
  }
  await db.accessRequest.update({ where: { id }, data: { status: "APPROVED" } });
  revalidatePath(PATH);
  return { ok: true, message: `Ruxsat berildi, parol ${request.email} ga yuborildi ✔` };
}

export async function rejectRequestAction(id: string): Promise<ActionState> {
  await requireAdmin();
  const request = await db.accessRequest.update({ where: { id }, data: { status: "REJECTED" } });
  await sendMail(accessRejectedMail(request.email, toLocale(request.locale))).catch((e) => console.error("[private] reject mail", e));
  revalidatePath(PATH);
  return { ok: true, message: "Rad etildi" };
}

export async function deleteRequestAction(id: string) {
  await requireAdmin();
  await db.accessRequest.delete({ where: { id } });
  revalidatePath(PATH);
}

export async function togglePrivateUserAction(id: string) {
  await requireAdmin();
  const user = await db.privateUser.findUniqueOrThrow({ where: { id } });
  await db.privateUser.update({ where: { id }, data: { active: !user.active } });
  revalidatePath(PATH);
}

export async function resetPrivatePasswordAction(id: string): Promise<ActionState> {
  await requireAdmin();
  const user = await db.privateUser.findUniqueOrThrow({ where: { id } });
  const lastRequest = await db.accessRequest.findFirst({ where: { email: user.email }, orderBy: { createdAt: "desc" } });
  try {
    await issuePassword(user.email, lastRequest?.locale ?? "uz");
  } catch {
    return { error: "Email yuborilmadi." };
  }
  revalidatePath(PATH);
  return { ok: true, message: "Yangi parol yuborildi ✔" };
}

export async function deletePrivateUserAction(id: string) {
  await requireAdmin();
  await db.privateUser.delete({ where: { id } });
  revalidatePath(PATH);
}
