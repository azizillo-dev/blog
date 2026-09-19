import type { Locale } from "@/lib/constants";
import { format } from "@/i18n";

type Labels = { present: string; years: string; months: string };

const INTL: Record<Locale, string> = { uz: "uz-Latn-UZ", ru: "ru-RU", en: "en-US" };

/** Oylar farqi (ikkala oy ham hisobga olinadi): 2024-03 → 2024-05 = 3 oy. */
export function monthsBetween(start: Date, end: Date): number {
  return Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1);
}

export function formatDuration(totalMonths: number, labels: Labels): string {
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  return [y && format(labels.years, { n: y }), m && format(labels.months, { n: m })].filter(Boolean).join(" ");
}

/** "Mar 2024 — Hozirgacha · 1 yil 7 oy" */
export function formatPeriod(start: Date, end: Date | null, locale: Locale, labels: Labels, now = new Date()): string {
  const month = new Intl.DateTimeFormat(INTL[locale], { month: "short", year: "numeric" });
  const range = `${month.format(start)} — ${end ? month.format(end) : labels.present}`;
  return `${range} · ${formatDuration(monthsBetween(start, end ?? now), labels)}`;
}
