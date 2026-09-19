import { verifySecret } from "./password";

/** .env dagi hash `\$` bilan ekranlangan bo'lishi mumkin (dotenv-expand uchun) — asl ko'rinishga qaytaramiz. */
const unescapeHash = (hash: string) => hash.replace(/\\\$/g, "$");

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !hash) return false;
  // Email mos kelmasa ham bcrypt ishlaydi — javob vaqti bo'yicha farqlab bo'lmasin.
  const passwordOk = await verifySecret(password, unescapeHash(hash));
  return passwordOk && email.trim().toLowerCase() === adminEmail;
}
