import Link from "next/link";
import { format, type Dictionary } from "@/i18n";
import { pageWindow } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type Props = { page: number; totalPages: number; href: (page: number) => string; t: Dictionary["pagination"] };

const item = "grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-semibold transition-colors";

export function Pagination({ page, totalPages, href, t }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label={format(t.page, { n: page, total: totalPages })} className="mt-14 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {page > 1 && (
          <Link href={href(page - 1)} rel="prev" className={cn(item, "border border-border bg-surface hover:bg-surface-2")}>
            ← <span className="ml-1 hidden sm:inline">{t.prev}</span>
          </Link>
        )}
        {pageWindow(page, totalPages).map((p, i) =>
          p === null ? (
            <span key={`gap-${i}`} className="px-1 text-muted">…</span>
          ) : (
            <Link
              key={p}
              href={href(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(item, p === page ? "bg-accent text-accent-fg" : "border border-border bg-surface hover:bg-surface-2")}
            >
              {p}
            </Link>
          ),
        )}
        {page < totalPages && (
          <Link href={href(page + 1)} rel="next" className={cn(item, "border border-border bg-surface hover:bg-surface-2")}>
            <span className="mr-1 hidden sm:inline">{t.next}</span> →
          </Link>
        )}
      </div>
      <p className="text-xs text-muted">{format(t.page, { n: page, total: totalPages })}</p>
    </nav>
  );
}
