import Link from "next/link";
import { db } from "@/lib/db";
import type { Locale, ResumeKind } from "@/lib/constants";
import { deleteResumeEntryAction, saveResumeEntryAction } from "@/features/resume/actions";
import { PageTitle } from "@/components/admin/PageTitle";
import { ResumeForm, type ResumeFormValues } from "@/components/admin/ResumeForm";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { Card } from "@/components/ui/form";

const monthInput = (d: Date | null) => (d ? d.toISOString().slice(0, 7) : "");

const GROUPS: { kind: ResumeKind; title: string }[] = [
  { kind: "EXPERIENCE", title: "Ish tajribasi" },
  { kind: "EDUCATION", title: "Ta'lim" },
];

export default async function AdminResumePage() {
  const entries = await db.resumeEntry.findMany({
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
    include: { translations: true },
  });

  const toValues = (e: (typeof entries)[number]): ResumeFormValues => ({
    kind: e.kind as ResumeKind,
    organization: e.organization,
    logo: e.logo,
    location: e.location,
    url: e.url,
    startDate: monthInput(e.startDate),
    endDate: monthInput(e.endDate),
    order: e.order,
    translations: Object.fromEntries(e.translations.map((t) => [t.locale as Locale, t])),
  });

  return (
    <>
      <PageTitle
        title="Blog: Tajriba va ta'lim"
        action={
          <Link href="/uz/blog" target="_blank" className="rounded-xl border border-border px-3 py-1.5 text-sm font-semibold hover:bg-surface-2">
            Ko&apos;rish ↗
          </Link>
        }
      />
      <p className="mb-6 text-sm text-muted">
        LinkedIn kabi: &quot;Blog&quot; sahifasida matndan keyin chiqadi. Ko&apos;nikmalar ro&apos;yxati — <Link href="/admin/settings" className="text-accent hover:underline">Sozlamalar</Link>da.
      </p>

      {GROUPS.map(({ kind, title }) => {
        const list = entries.filter((e) => e.kind === kind);
        return (
          <section key={kind} className="mb-8">
            <h2 className="mb-3 text-lg font-bold">{title} ({list.length})</h2>
            <div className="space-y-3">
              {list.length === 0 && <p className="rounded-2xl border border-border bg-surface p-5 text-center text-sm text-muted">Hozircha yo&apos;q</p>}
              {list.map((e) => (
                <details key={e.id} className="group rounded-2xl border border-border bg-surface">
                  <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-3">
                    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-2 font-bold text-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {e.logo ? <img src={e.logo} alt="" className="size-full object-cover" /> : e.organization.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{e.translations.find((t) => t.locale === "uz")?.title ?? e.translations[0]?.title}</span>
                      <span className="block truncate text-xs text-muted">
                        {e.organization} · {monthInput(e.startDate)} — {monthInput(e.endDate) || "hozirgacha"}
                      </span>
                    </span>
                    <span className="text-muted transition-transform group-open:rotate-180">▾</span>
                  </summary>
                  <div className="space-y-4 border-t border-border p-5">
                    <ResumeForm action={saveResumeEntryAction.bind(null, e.id)} values={toValues(e)} submitLabel="Saqlash" />
                    <div className="border-t border-border pt-4">
                      <ConfirmForm action={deleteResumeEntryAction.bind(null, e.id)} label="O'chirish" confirm="Yozuv o'chirilsinmi?" />
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        );
      })}

      <Card>
        <h2 className="mb-4 text-lg font-bold">Yangi yozuv</h2>
        <ResumeForm
          action={saveResumeEntryAction.bind(null, null)}
          submitLabel="Qo'shish"
          values={{ kind: "EXPERIENCE", organization: "", logo: "", location: "", url: "", startDate: "", endDate: "", order: 0, translations: {} }}
        />
      </Card>
    </>
  );
}
