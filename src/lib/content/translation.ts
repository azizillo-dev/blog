import type { Locale } from "@/lib/constants";

const FALLBACK: Locale[] = ["uz", "en", "ru"];

/** Joriy tildagi tarjimani, bo'lmasa fallback tartibi bo'yicha birinchi mavjudini qaytaradi. */
export function pickTranslation<T extends { locale: string }>(items: T[], locale: Locale): T | undefined {
  for (const l of [locale, ...FALLBACK]) {
    const found = items.find((i) => i.locale === l);
    if (found) return found;
  }
  return items[0];
}
