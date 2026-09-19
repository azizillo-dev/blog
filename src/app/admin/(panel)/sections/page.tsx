import Link from "next/link";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/constants";
import { deleteSectionAction, saveSectionAction } from "@/features/sections/actions";
import { PageTitle } from "@/components/admin/PageTitle";
import { SectionForm } from "@/components/admin/SectionForm";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { Card } from "@/components/ui/form";

const KIND_LABEL: Record<string, string> = { BLOG: "Blog", IT: "IT", PRIVATE: "Private", CUSTOM: "Qo'shimcha" };

export default async function AdminSectionsPage() {
  const sections = await db.section.findMany({
    orderBy: { order: "asc" },
    include: { translations: true, _count: { select: { posts: true } } },
  });

  return (
    <>
      <PageTitle title="Bo'limlar" />
      <p className="mb-6 text-sm text-muted">
        Blog, IT va Private — tizim bo&apos;limlari (o&apos;chirib bo&apos;lmaydi). Yangi bo&apos;limlar &quot;More&quot; menyusida yoki asosiy menyuda chiqadi.
      </p>

      <div className="space-y-4">
        {sections.map((s) => (
          <details key={s.id} className="group rounded-2xl border border-border bg-surface">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-5 py-4">
              <span className="font-semibold">{s.translations.find((t) => t.locale === "uz")?.title ?? s.slug}</span>
              <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-muted">{KIND_LABEL[s.kind]}</span>
              <span className="text-xs text-muted">{s._count.posts} post · {s.inNav}</span>
              <span className="ml-auto text-muted transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="space-y-4 border-t border-border p-5">
              <SectionForm
                action={saveSectionAction.bind(null, s.id)}
                submitLabel="Saqlash"
                values={{
                  slug: s.slug,
                  inNav: s.inNav,
                  order: s.order,
                  translations: Object.fromEntries(s.translations.map((t) => [t.locale as Locale, t])),
                }}
              />
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Link href={`/admin/posts/new?section=${s.id}`} className="rounded-xl border border-border px-3 py-1.5 text-sm font-semibold hover:bg-surface-2">
                  + Shu bo&apos;limga post
                </Link>
                {s.kind === "CUSTOM" && (
                  <ConfirmForm
                    action={deleteSectionAction.bind(null, s.id)}
                    label="Bo'limni o'chirish"
                    confirm={`Bo'lim va undagi ${s._count.posts} ta post o'chirilsinmi?`}
                  />
                )}
              </div>
            </div>
          </details>
        ))}
      </div>

      <Card className="mt-8">
        <h2 className="mb-4 text-lg font-bold">Yangi bo&apos;lim</h2>
        <SectionForm
          action={saveSectionAction.bind(null, null)}
          submitLabel="Qo'shish"
          values={{ slug: "", inNav: "MORE", order: (sections.at(-1)?.order ?? 0) + 10, translations: {} }}
        />
      </Card>
    </>
  );
}
