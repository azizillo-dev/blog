import "server-only";
import type { Locale } from "@/lib/constants";

/**
 * Bepul Google Translate endpointi (kalitsiz). Bir so'rovda bir nechta matn; markdown (`**`, `[..](..)`, `` ` ``)
 * saqlanadi. Xato bo'lsa null qaytaradi — chaqiruvchi tarjimasiz davom etadi (sayt uz'ga fallback qiladi).
 */
const ENDPOINT = "https://translate.googleapis.com/translate_a/t?client=gtx&format=text";
const MAX_CHARS = 4500; // bitta so'rovga

async function request(texts: string[], from: Locale, to: Locale): Promise<string[] | null> {
  const body = new URLSearchParams();
  texts.forEach((t) => body.append("q", t));
  try {
    const res = await fetch(`${ENDPOINT}&sl=${from}&tl=${to}`, { method: "POST", body, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    // Bitta matn → "string" yoki ["string"], ko'p matn → ["a", "b"] (ba'zan [["a","uz"], ...])
    const list = Array.isArray(data) ? data : [data];
    const out = list.map((item) => (Array.isArray(item) ? item[0] : item));
    return out.length === texts.length && out.every((s) => typeof s === "string") ? (out as string[]) : null;
  } catch {
    return null;
  }
}

/** Matnlar ro'yxatini tarjima qiladi (bo'shlari o'zgarmaydi). Biror qism muvaffaqiyatsiz bo'lsa — null. */
export async function translateMany(texts: string[], from: Locale, to: Locale): Promise<string[] | null> {
  const result = [...texts];
  const todo = texts.map((t, i) => ({ t, i })).filter(({ t }) => t.trim());

  const batches: (typeof todo)[] = [];
  let current: typeof todo = [];
  let size = 0;
  for (const item of todo) {
    if (current.length && size + item.t.length > MAX_CHARS) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(item);
    size += item.t.length;
  }
  if (current.length) batches.push(current);

  for (const batch of batches) {
    const translated = await request(batch.map((b) => b.t), from, to);
    if (!translated) return null;
    batch.forEach((b, k) => (result[b.i] = translated[k]));
  }
  return result;
}
