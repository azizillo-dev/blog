import Image from "next/image";
import type { Locale } from "@/lib/constants";
import type { Dictionary } from "@/i18n";
import type { ResumeEntryView } from "@/features/resume/queries";
import { formatPeriod } from "@/features/resume/period";

type Props = { title: string; entries: ResumeEntryView[]; locale: Locale; t: Dictionary["about"] };

/** LinkedIn uslubidagi vaqt chizig'i: logo, lavozim, tashkilot, muddat, joy, tavsif. */
export function ResumeSection({ title, entries, locale, t }: Props) {
  if (entries.length === 0) return null;
  return (
    <section className="reveal mt-14">
      <h2 className="mb-5 text-2xl font-extrabold tracking-tight">{title}</h2>
      <ol className="overflow-hidden rounded-3xl border border-border bg-surface">
        {entries.map((e) => (
          <li key={e.id} className="flex gap-3.5 border-b border-border p-4 last:border-0 sm:gap-4 sm:p-6">
            <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface-2 text-lg font-extrabold text-muted sm:size-14">
              {e.logo ? <Image src={e.logo} alt={e.organization} fill sizes="56px" className="object-cover" /> : e.organization.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="break-words font-bold leading-snug">{e.title}</h3>
              <p className="mt-0.5 break-words text-sm">
                {e.url ? (
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent hover:underline">
                    {e.organization}
                  </a>
                ) : (
                  e.organization
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted sm:text-sm">{formatPeriod(e.startDate, e.endDate, locale, t)}</p>
              {e.location && <p className="text-xs text-muted sm:text-sm">{e.location}</p>}
              {e.description && <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-muted sm:text-[15px]">{e.description}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
