import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";

/**
 * Tashrifni yozadi. Xom IP saqlanmaydi: u AUTH_SECRET bilan birga xeshlanadi, shuning uchun
 * "necha xil odam kirgan"ni sanash mumkin, lekin bazadan IP ni tiklab bo'lmaydi.
 */
export async function recordVisit(pageId: string, headers: Headers) {
  const ip = headers.get("x-vercel-forwarded-for") || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = createHash("sha256").update(`${process.env.AUTH_SECRET ?? ""}:${ip}`).digest("hex").slice(0, 32);

  // Bitta odam sahifani qayta ochsa, 30 daqiqa ichida takror yozilmaydi
  const recent = await db.secretVisit.findFirst({
    where: { pageId, ipHash, createdAt: { gte: new Date(Date.now() - 30 * 60_000) } },
    select: { id: true },
  });
  if (recent) return;

  await db.secretVisit.create({
    data: {
      pageId,
      ipHash,
      country: headers.get("x-vercel-ip-country") ?? "",
      city: decodeURIComponent(headers.get("x-vercel-ip-city") ?? ""),
      device: deviceFrom(headers.get("user-agent") ?? ""),
      referrer: (headers.get("referer") ?? "").slice(0, 200),
    },
  });
}

/** Uzun user-agent o'rniga qisqa tavsif: "iPhone · Safari" */
function deviceFrom(ua: string): string {
  const os = /iPhone|iPad/.test(ua) ? "iPhone" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "";
  return [os, browser].filter(Boolean).join(" · ");
}
