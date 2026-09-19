import "server-only";
import { db } from "@/lib/db";
import type { Locale, ResumeKind } from "@/lib/constants";
import { pickTranslation } from "@/lib/content/translation";

export type ResumeEntryView = {
  id: string;
  kind: ResumeKind;
  organization: string;
  logo: string;
  location: string;
  url: string;
  startDate: Date;
  endDate: Date | null;
  title: string;
  description: string;
};

/** Tartib: `order`, keyin eng yangisi birinchi (hozirgi ish yuqorida). */
export async function listResumeEntries(locale: Locale): Promise<ResumeEntryView[]> {
  const rows = await db.resumeEntry.findMany({
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
    include: { translations: true },
  });
  return rows.map((r) => {
    const t = pickTranslation(r.translations, locale);
    return {
      id: r.id,
      kind: r.kind as ResumeKind,
      organization: r.organization,
      logo: r.logo,
      location: r.location,
      url: r.url,
      startDate: r.startDate,
      endDate: r.endDate,
      title: t?.title ?? "",
      description: t?.description ?? "",
    };
  });
}
