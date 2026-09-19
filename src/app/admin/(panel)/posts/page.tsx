import Link from "next/link";
import { listPostsForAdmin } from "@/features/posts/admin-queries";
import { PageTitle } from "@/components/admin/PageTitle";
import { formatDate } from "@/lib/utils";

export default async function AdminPostsPage() {
  const posts = await listPostsForAdmin();

  return (
    <>
      <PageTitle
        title="Postlar"
        action={<Link href="/admin/posts/new" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg">+ Yangi post</Link>}
      />
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {posts.length === 0 && <p className="p-6 text-center text-muted">Postlar yo&apos;q</p>}
        <ul className="divide-y divide-border">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/posts/${p.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-surface-2">
                <span className="min-w-0 flex-1 truncate font-semibold">{p.title}</span>
                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold text-muted">{p.section}</span>
                <span className="text-xs uppercase text-muted">{p.locales.join(" · ")}</span>
                <span className={p.published ? "text-xs font-semibold text-emerald-500" : "text-xs font-semibold text-amber-500"}>
                  {p.published ? "Chop etilgan" : "Qoralama"}
                </span>
                <span className="w-24 text-right text-xs text-muted">{formatDate(p.publishedAt, "uz")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
