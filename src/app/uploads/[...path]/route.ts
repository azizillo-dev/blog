import { readFile } from "node:fs/promises";
import { resolveUploadPath } from "@/lib/uploads";

// Fayl nomlari tasodifiy va o'zgarmas → abadiy keshlash xavfsiz.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const file = resolveUploadPath((await params).path);
  if (!file || !file.endsWith(".webp")) return new Response("Not found", { status: 404 });
  try {
    return new Response(new Uint8Array(await readFile(file)), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
