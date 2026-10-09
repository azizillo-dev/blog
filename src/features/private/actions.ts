"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/constants";
import { createSession, destroySession } from "@/lib/auth/session";
import { verifySecret } from "@/lib/auth/password";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { routes } from "@/lib/routes";
import { str } from "@/features/admin/form";

const HOUR = 60 * 60_000;

export type PrivateErrorKey = "invalid" | "credentials" | "tooMany" | "server";

export type GateState = { step: "request"; error?: PrivateErrorKey } | { step: "pending" };

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  message: z.string().trim().min(5).max(1000),
});

/**
 * Email + xabar → so'rov to'g'ridan-to'g'ri admin paneliga tushadi (PENDING).
 * Email tasdiqlash yo'q: admin ruxsat berganda parol o'sha manzilga yuboriladi.
 */
export async function requestAccessAction(locale: Locale, _: GateState, fd: FormData): Promise<GateState> {
  const parsed = requestSchema.safeParse({ email: str(fd, "email"), message: str(fd, "message") });
  if (!parsed.success) return { step: "request", error: "invalid" };
  const { email, message } = parsed.data;

  const ip = await clientIp();
  if (!rateLimit(`access:ip:${ip}`, 5, HOUR) || !rateLimit(`access:email:${email}`, 3, HOUR)) {
    return { step: "request", error: "tooMany" };
  }

  try {
    await db.accessRequest.create({ data: { email, message, locale, status: "PENDING" } });
  } catch (error) {
    console.error("[private] request failed", error);
    return { step: "request", error: "server" };
  }
  return { step: "pending" };
}

export type LoginState = { error?: PrivateErrorKey };

export async function privateLoginAction(locale: Locale, _: LoginState, fd: FormData): Promise<LoginState> {
  const email = str(fd, "email").toLowerCase();
  if (!rateLimit(`private-login:${await clientIp()}`, 10, 15 * 60_000)) return { error: "tooMany" };

  const user = await db.privateUser.findUnique({ where: { email } });
  const ok = user?.active && (await verifySecret(str(fd, "password"), user.passwordHash));
  if (!ok) return { error: "credentials" };

  await createSession("private", email);
  redirect(routes.section(locale, "private", "PRIVATE"));
}

export async function privateLogoutAction(locale: Locale) {
  await destroySession("private");
  redirect(routes.section(locale, "private", "PRIVATE"));
}
