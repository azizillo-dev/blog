"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/constants";
import { createSession, destroySession } from "@/lib/auth/session";
import { generateCode, hashSecret, verifySecret } from "@/lib/auth/password";
import { sendMail } from "@/lib/mail/send";
import { verificationCodeMail } from "@/lib/mail/templates";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { routes } from "@/lib/routes";
import { str } from "@/features/admin/form";

const CODE_TTL_MS = 10 * 60_000;
const MAX_CODE_ATTEMPTS = 5;
const HOUR = 60 * 60_000;

export type PrivateErrorKey = "invalid" | "code" | "credentials" | "tooMany" | "server";

export type GateState =
  | { step: "request"; error?: PrivateErrorKey }
  | { step: "code"; requestId: string; email: string; error?: PrivateErrorKey }
  | { step: "pending" };

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  message: z.string().trim().min(5).max(1000),
});

/** 1-qadam: email + xabar → tasdiqlash kodi emailga. */
export async function requestAccessAction(locale: Locale, _: GateState, fd: FormData): Promise<GateState> {
  const parsed = requestSchema.safeParse({ email: str(fd, "email"), message: str(fd, "message") });
  if (!parsed.success) return { step: "request", error: "invalid" };
  const { email, message } = parsed.data;

  const ip = await clientIp();
  if (!rateLimit(`access:ip:${ip}`, 5, HOUR) || !rateLimit(`access:email:${email}`, 3, HOUR)) {
    return { step: "request", error: "tooMany" };
  }

  const code = generateCode();
  const request = await db.accessRequest.create({
    data: { email, message, locale, codeHash: await hashSecret(code), codeExpiresAt: new Date(Date.now() + CODE_TTL_MS) },
  });

  try {
    await sendMail(verificationCodeMail(email, code, locale));
  } catch (error) {
    console.error("[private] code mail failed", error);
    await db.accessRequest.delete({ where: { id: request.id } });
    return { step: "request", error: "server" };
  }
  return { step: "code", requestId: request.id, email };
}

/** 2-qadam: kodni tekshirish → so'rov admin paneliga (PENDING). */
export async function verifyCodeAction(_: GateState, fd: FormData): Promise<GateState> {
  const requestId = str(fd, "requestId");
  const code = str(fd, "code").replace(/\s/g, "");
  const request = await db.accessRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "UNVERIFIED") return { step: "request", error: "code" };

  const back = (error: PrivateErrorKey): GateState => ({ step: "code", requestId, email: request.email, error });
  if (request.attempts >= MAX_CODE_ATTEMPTS) return { step: "request", error: "tooMany" };
  if (request.codeExpiresAt < new Date()) return { step: "request", error: "code" };

  await db.accessRequest.update({ where: { id: requestId }, data: { attempts: { increment: 1 } } });
  if (!/^\d{6}$/.test(code) || !(await verifySecret(code, request.codeHash))) return back("code");

  await db.accessRequest.update({ where: { id: requestId }, data: { status: "PENDING", codeHash: "" } });
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
