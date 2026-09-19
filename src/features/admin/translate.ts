import "server-only";
import { LOCALES, type Locale } from "@/lib/constants";
import type { Block } from "@/lib/content/blocks";
import { translateMany } from "@/lib/translate";

/** Blokdagi tarjima qilinadigan matnlar (kod, URL, rasm manzili — tarjima qilinmaydi). */
function blockTexts(blocks: Block[]): string[] {
  return blocks.flatMap((b) => {
    switch (b.type) {
      case "heading":
      case "paragraph":
        return [b.text];
      case "quote":
        return [b.text];
      case "image":
        return [b.alt, b.caption ?? ""];
      case "gallery":
        return b.images.map((img) => img.alt);
      default:
        return [];
    }
  });
}

function applyBlockTexts(blocks: Block[], texts: string[]): Block[] {
  let i = 0;
  const next = () => texts[i++];
  return blocks.map((b) => {
    switch (b.type) {
      case "heading":
      case "paragraph":
      case "quote":
        return { ...b, text: next() };
      case "image": {
        const alt = next();
        const caption = next();
        return { ...b, alt, caption: b.caption === undefined ? undefined : caption };
      }
      case "gallery":
        return { ...b, images: b.images.map((img) => ({ ...img, alt: next() })) };
      default:
        return b;
    }
  });
}

type Row<F extends string> = { locale: Locale } & Record<F, string>;

/**
 * Formadan o'qilgan tarjimalarni to'ldiradi: yozilmagan tillar manba tildan (avval uz) avtomatik tarjima qilinadi.
 * `overwrite` — qo'lda yozilgan boshqa tillarni ham manbadan qayta tarjima qiladi.
 * `blockFields` — JSON bloklar saqlanadigan maydonlar (ichidagi matnlar tarjima qilinadi).
 * Tarjima xizmati ishlamasa — o'sha til shunchaki qo'shilmaydi (sayt manba tilga fallback qiladi).
 */
export async function autoTranslate<F extends string>(
  rows: Row<F>[],
  fields: readonly F[],
  { overwrite = false, blockFields = [] as readonly F[] } = {},
): Promise<{ rows: Row<F>[]; translated: Locale[]; failed: Locale[] }> {
  const source = rows.find((r) => r.locale === "uz") ?? rows[0];
  if (!source) return { rows, translated: [], failed: [] };

  const targets = LOCALES.filter((l) => l !== source.locale && (overwrite || !rows.some((r) => r.locale === l)));
  const textFields = fields.filter((f) => !blockFields.includes(f));

  // Manbadagi barcha matnlar tekis ro'yxatga: avval oddiy maydonlar, keyin har blok maydonining matnlari
  const parsedBlocks = blockFields.map((f) => JSON.parse(source[f] || "[]") as Block[]);
  const flat = [...textFields.map((f) => source[f]), ...parsedBlocks.flatMap(blockTexts)];

  const results = await Promise.all(targets.map((to) => translateMany(flat, source.locale, to)));

  const out = rows.filter((r) => r === source || !targets.includes(r.locale));
  const translated: Locale[] = [];
  const failed: Locale[] = [];
  targets.forEach((to, t) => {
    const texts = results[t];
    if (!texts) {
      failed.push(to);
      const kept = rows.find((r) => r.locale === to); // qayta tarjima muvaffaqiyatsiz — eskisini saqlaymiz
      if (kept) out.push(kept);
      return;
    }
    const row = { locale: to } as Row<F>;
    let i = 0;
    for (const f of textFields) (row as Record<F, string>)[f] = texts[i++];
    blockFields.forEach((f, k) => {
      const count = blockTexts(parsedBlocks[k]).length;
      (row as Record<F, string>)[f] = JSON.stringify(applyBlockTexts(parsedBlocks[k], texts.slice(i, i + count)));
      i += count;
    });
    out.push(row);
    translated.push(to);
  });

  return { rows: out, translated, failed };
}

/** Saqlash xabari uchun: "Saqlandi ✔ (tarjima: ru, en)" */
export function translationNote(translated: Locale[], failed: Locale[]): string {
  const parts = [];
  if (translated.length) parts.push(`avtomatik tarjima: ${translated.join(", ")}`);
  if (failed.length) parts.push(`tarjima bo'lmadi: ${failed.join(", ")} — keyinroq qayta saqlang`);
  return parts.length ? ` (${parts.join("; ")})` : "";
}
