"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySecret } from "@/lib/auth/password";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { str } from "@/features/admin/form";
import { SECRET_KEY } from "./queries";

const COOKIE_NAME = "secret_pass";

/** Parolni tekshiradi va to'g'ri bo'lsa 30 kunlik cookie qo'yadi (parolning o'zi emas — kiritilgan matn). */
export async function unlockSecretAction(slug: string, _: { error?: string }, fd: FormData): Promise<{ error?: string }> {
  if (!rateLimit(`secret:${await clientIp()}`, 10, 10 * 60_000)) return { error: "Urinishlar ko'p. Keyinroq urinib ko'ring." };

  const password = str(fd, "password");
  const page = await db.secretPage.findFirst({ where: { key: SECRET_KEY, slug }, select: { passwordHash: true } });
  if (!page?.passwordHash || !(await verifySecret(password, page.passwordHash))) return { error: "Parol noto'g'ri." };

  (await cookies()).set(COOKIE_NAME, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  return {};
}
