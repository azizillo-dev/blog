import { z } from "zod";

const imageSrc = z.string().trim().min(1).max(2000);

export const IMAGE_LAYOUTS = ["full", "wide", "center", "left", "right"] as const;

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: z.string().max(300), level: z.union([z.literal(2), z.literal(3)]) }),
  z.object({ type: z.literal("paragraph"), text: z.string().max(20_000) }),
  z.object({
    type: z.literal("image"),
    src: imageSrc,
    alt: z.string().max(300).default(""),
    caption: z.string().max(500).optional(),
    layout: z.enum(IMAGE_LAYOUTS).default("center"),
  }),
  z.object({
    type: z.literal("gallery"),
    images: z.array(z.object({ src: imageSrc, alt: z.string().max(300).default("") })).min(1).max(12),
  }),
  z.object({ type: z.literal("quote"), text: z.string().max(5000), cite: z.string().max(200).optional() }),
  z.object({ type: z.literal("code"), code: z.string().max(50_000), lang: z.string().max(30).optional() }),
  z.object({ type: z.literal("divider") }),
  z.object({ type: z.literal("embed"), url: z.string().url().max(500) }),
]);

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];

/** DB'dagi JSON satrdan xavfsiz o'qish: yaroqsiz bloklar tashlab yuboriladi. */
export function parseBlocks(json: string | null | undefined): Block[] {
  if (!json) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const parsed = blockSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

/** Admin formadan kelgan JSON — qat'iy tekshiruv (xato bo'lsa throw). */
export function validateBlocksJson(json: string): string {
  const blocks = z.array(blockSchema).max(500).parse(JSON.parse(json || "[]"));
  return JSON.stringify(blocks);
}

export function blocksToPlainText(blocks: Block[]): string {
  return blocks
    .map((b) => (b.type === "paragraph" || b.type === "heading" || b.type === "quote" ? b.text : b.type === "code" ? b.code : ""))
    .join(" ");
}

export function readingMinutes(blocks: Block[]): number {
  const words = blocksToPlainText(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** YouTube havolasidan embed URL (boshqa xostlar rad etiladi). */
export function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "m.youtube.com") {
      id = u.pathname.startsWith("/embed/") ? u.pathname.split("/")[2] : u.searchParams.get("v");
    }
    return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}
