import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { MAX_UPLOAD_BYTES, isAllowedImage, isPdf, saveImage, savePdf } from "@/lib/uploads";

export async function POST(req: Request) {
  if (!(await getSession("admin"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
  const pdf = isPdf(file.type);
  if (!pdf && !isAllowedImage(file.type)) {
    return NextResponse.json({ error: "Faqat rasm (jpg, png, webp, avif, gif) yoki PDF" }, { status: 415 });
  }
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Fayl 10 MB dan katta" }, { status: 413 });

  try {
    return NextResponse.json({ url: pdf ? await savePdf(file) : await saveImage(file) });
  } catch (error) {
    console.error("[upload]", error);
    // Endpoint faqat admin uchun — sababni ko'rsatish diagnostikani osonlashtiradi.
    const reason = error instanceof Error ? error.message.slice(0, 200) : "unknown";
    return NextResponse.json({ error: `Faylni qayta ishlab bo'lmadi: ${reason}` }, { status: 422 });
  }
}
