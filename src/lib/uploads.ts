import "server-only";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { AwsClient } from "aws4fetch";
import sharp from "sharp";

export const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_WIDTH = 1920;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

export function isAllowedImage(type: string) {
  return ALLOWED.has(type);
}

/* ---------- Saqlash joyi: Cloudflare R2 (prod) yoki lokal disk (dev) ---------- */

type R2Config = { client: AwsClient; endpoint: string; publicUrl: string };

let r2: R2Config | null | undefined;

function getR2(): R2Config | null {
  if (r2 !== undefined) return r2;
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;
  r2 =
    R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET && R2_PUBLIC_URL
      ? {
          client: new AwsClient({ accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, service: "s3", region: "auto" }),
          endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}`,
          publicUrl: R2_PUBLIC_URL.replace(/\/$/, ""),
        }
      : null;
  return r2;
}

/** Faylni `key` (masalan "2026/09/abc.webp") bo'yicha saqlaydi va ommaviy URL qaytaradi. */
export async function putObject(key: string, body: Uint8Array<ArrayBuffer>, contentType: string): Promise<string> {
  const remote = getR2();
  if (remote) {
    const put = () =>
      remote.client.fetch(`${remote.endpoint}/${key}`, {
        method: "PUT",
        body,
        headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" },
      });
    // Vaqtinchalik tarmoq/5xx xatosida bir marta qayta urinamiz.
    let res = await put().catch(() => null);
    if (!res || res.status >= 500) res = await put();
    if (!res.ok) throw new Error(`R2 upload failed: HTTP ${res.status} ${(await res.text()).slice(0, 150)}`);
    return `${remote.publicUrl}/${key}`;
  }
  if (process.env.VERCEL) throw new Error("R2 is not configured (Vercel diski doimiy emas)");

  const file = path.join(UPLOAD_DIR, ...key.split("/"));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
  return `/uploads/${key}`;
}

/** Rasmni WebP ga siqib (max 1920px) saqlaydi: → https://media.../2026/09/abc.webp yoki /uploads/2026/09/abc.webp */
export async function saveImage(file: File): Promise<string> {
  const now = new Date();
  const key = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${randomBytes(8).toString("hex")}.webp`;

  const output = await sharp(Buffer.from(await file.arrayBuffer()), { animated: file.type === "image/gif" })
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  return putObject(key, new Uint8Array(output), "image/webp");
}

/** URL yo'lidan diskdagi faylga; direktoriyadan tashqariga chiqishga yo'l qo'yilmaydi. */
export function resolveUploadPath(segments: string[]): string | null {
  const full = path.resolve(UPLOAD_DIR, ...segments);
  return full.startsWith(UPLOAD_DIR + path.sep) ? full : null;
}
