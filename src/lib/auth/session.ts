import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE } from "@/lib/constants";
import { signToken, verifyToken, type SessionRole } from "./token";

const MAX_AGE: Record<SessionRole, number> = {
  admin: 60 * 60 * 24 * 7,
  private: 60 * 60 * 24 * 30,
};

const cookieName = (role: SessionRole) => COOKIE[role];

export async function createSession(role: SessionRole, subject: string) {
  const token = await signToken({ sub: subject, role }, MAX_AGE[role]);
  (await cookies()).set(cookieName(role), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE[role],
  });
}

export async function getSession(role: SessionRole) {
  const token = (await cookies()).get(cookieName(role))?.value;
  return verifyToken(token, role);
}

export async function destroySession(role: SessionRole) {
  (await cookies()).delete(cookieName(role));
}

/** Server action / sahifa boshida chaqiriladi. Sessiya bo'lmasa login sahifasiga. */
export async function requireAdmin() {
  const session = await getSession("admin");
  if (!session) redirect("/admin/login");
  return session;
}
