/**
 * JWT imzolash/tekshirish. Edge-mos (middleware'da ham ishlaydi): faqat `jose`.
 */
import { SignJWT, jwtVerify } from "jose";

export type SessionRole = "admin" | "private";
export type SessionPayload = { sub: string; role: SessionRole };

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters");
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: SessionPayload, maxAgeSeconds: number): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(secretKey());
}

export async function verifyToken(token: string | undefined, role: SessionRole): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (payload.role !== role || typeof payload.sub !== "string") return null;
    return { sub: payload.sub, role };
  } catch {
    return null;
  }
}
