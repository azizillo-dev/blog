"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth/session";
import { verifyAdminCredentials } from "@/lib/auth/admin";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { str, type ActionState } from "@/features/admin/form";

export async function adminLoginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!rateLimit(`admin-login:${await clientIp()}`, 5, 15 * 60_000)) {
    return { error: "Urinishlar ko'p. 15 daqiqadan so'ng qayta urining." };
  }
  const email = str(fd, "email");
  if (!(await verifyAdminCredentials(email, str(fd, "password")))) {
    return { error: "Email yoki parol noto'g'ri." };
  }
  await createSession("admin", email.toLowerCase());
  redirect("/admin");
}

export async function adminLogoutAction() {
  await destroySession("admin");
  redirect("/");
}
