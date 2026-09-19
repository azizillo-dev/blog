import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { MAX_UPLOAD_BYTES, isAllowedImage, saveImage } from "@/lib/uploads";

export async function POST(req: Request) {
  if (!(await getSession("admin"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
  if (!isAllowedImage(file.type)) return NextResponse.json({ error: "Faqat rasm (jpg, png, webp, avif, gif)" }, { status: 415 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Fayl 10 MB dan katta" }, { status: 413 });

  try {
    return NextResponse.json({ url: await saveImage(file) });
  } catch (error) {
    console.error("[upload]", error);
    return NextResponse.json({ error: "Rasmni qayta ishlab bo'lmadi" }, { status: 422 });
  }
}
