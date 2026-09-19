import "server-only";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

/** Private bo'limga kirgan foydalanuvchi emaili; sessiya yo'q yoki foydalanuvchi bloklangan bo'lsa — null. */
export async function getPrivateViewer(): Promise<string | null> {
  const session = await getSession("private");
  if (!session) return null;
  const user = await db.privateUser.findUnique({ where: { email: session.sub }, select: { active: true } });
  return user?.active ? session.sub : null;
}
