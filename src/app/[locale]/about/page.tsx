import { permanentRedirect } from "next/navigation";
import { toLocale } from "@/i18n";
import { routes } from "@/lib/routes";

// Eski /about havolalari → "Blog" (muallif haqida) sahifasi.
export default async function AboutRedirect({ params }: { params: Promise<{ locale: string }> }) {
  permanentRedirect(routes.about(toLocale((await params).locale)));
}
