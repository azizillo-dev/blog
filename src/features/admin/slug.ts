import "server-only";
import { slugify } from "@/lib/utils";

type Finder = (slug: string) => Promise<{ id: string } | null>;

/**
 * Nomdan band bo'lmagan slug yasaydi: "Mentor AI" → "mentor-ai", band bo'lsa "mentor-ai-2".
 * `currentId` — tahrirlanayotgan yozuv (o'z slugi band hisoblanmasin).
 */
export async function uniqueSlug(title: string, find: Finder, currentId?: string | null): Promise<string> {
  const base = slugify(title) || "item";
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const found = await find(candidate);
    if (!found || found.id === currentId) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}
