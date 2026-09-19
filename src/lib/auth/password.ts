import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";

export const hashSecret = (plain: string) => bcrypt.hash(plain, 10);

export const verifySecret = (plain: string, hash: string) => bcrypt.compare(plain, hash);

/** 6 xonali tasdiqlash kodi. */
export function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

// Chalkash belgilar (0/O, 1/l/I) chiqarib tashlangan.
const PASSWORD_ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generatePassword(length = 12): string {
  let out = "";
  for (let i = 0; i < length; i++) out += PASSWORD_ALPHABET[randomInt(0, PASSWORD_ALPHABET.length)];
  return out;
}
