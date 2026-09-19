import Link from "next/link";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/constants";
import { deleteProjectAction, saveProjectAction } from "@/features/projects/actions";
import { PageTitle } from "@/components/admin/PageTitle";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { Card } from "@/components/ui/form";

export default async function AdminProjectsPage() {
  const projects = await db.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { translations: true },
  });

  return (
    <>
      <PageTitle
        title="Loyihalar"
        action={
          <Link href="/uz/projects" target="_blank" className="rounded-xl border border-border px-3 py-1.5 text-sm font-semibold hover:bg-surface-2">
            Ko&apos;rish ↗
          </Link>
        }
      />
      <div className="space-y-4">
        {projects.length === 0 && <p className="rounded-2xl border border-border bg-surface p-6 text-center text-muted">Hozircha yo&apos;q</p>}
        {projects.map((p) => (
          <details key={p.id} className="group rounded-2xl border border-border bg-surface">
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-3">
              <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image && <img src={p.image} alt="" className="size-full object-cover" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{p.translations.find((t) => t.locale === "uz")?.title ?? p.translations[0]?.title}</span>
                <span className="block truncate text-xs text-muted">{p.technologies || "—"}</span>
              </span>
              {!p.visible && <span className="text-xs font-semibold text-amber-500">Yashirin</span>}
              <span className="text-muted transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="space-y-4 border-t border-border p-5">
              <ProjectForm
                action={saveProjectAction.bind(null, p.id)}
                submitLabel="Saqlash"
                values={{ ...p, translations: Object.fromEntries(p.translations.map((t) => [t.locale as Locale, t])) }}
              />
              <div className="border-t border-border pt-4">
                <ConfirmForm action={deleteProjectAction.bind(null, p.id)} label="O'chirish" confirm="Loyiha o'chirilsinmi?" />
              </div>
            </div>
          </details>
        ))}
      </div>

      <Card className="mt-8">
        <h2 className="mb-4 text-lg font-bold">Yangi loyiha</h2>
        <ProjectForm
          action={saveProjectAction.bind(null, null)}
          submitLabel="Qo'shish"
          values={{ image: "", technologies: "", demoUrl: "", sourceUrl: "", order: projects.length, visible: true, translations: {} }}
        />
      </Card>
    </>
  );
}
