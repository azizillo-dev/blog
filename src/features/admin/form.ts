import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { LOCALES, type Locale } from "@/lib/constants";

/** useActionState uchun umumiy natija. */
export type ActionState = { ok?: boolean; error?: string; message?: string };

export const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";

/**
 * `title.uz`, `title.ru`, ... ko'rinishidagi maydonlarni tarjimalar ro'yxatiga yig'adi.
 * `required` maydoni bo'sh bo'lgan til tashlab yuboriladi.
 */
export function readLocalized<F extends string>(fd: FormData, fields: readonly F[], required: F) {
  return LOCALES.flatMap((locale) => {
    const row = Object.fromEntries(fields.map((f) => [f, str(fd, `${f}.${locale}`)])) as Record<F, string>;
    return row[required] ? [{ locale, ...row } as { locale: Locale } & Record<F, string>] : [];
  });
}

/** Xatoni foydalanuvchiga tushunarli matnga aylantiradi. */
export function toActionError(error: unknown): ActionState {
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    return { error: `${issue.path.join(".") || "Maydon"}: ${issue.message}` };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return { error: "Bu qiymat (slug/email) allaqachon band." };
  }
  if (error instanceof SyntaxError) return { error: "Kontent (bloklar) formati noto'g'ri." };
  console.error("[admin action]", error);
  return { error: "Kutilmagan xatolik. Qayta urinib ko'ring." };
}
