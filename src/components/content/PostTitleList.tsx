import Link from "next/link";
import type { Locale } from "@/lib/constants";
import type { Dictionary } from "@/i18n";
import type { PostCardView } from "@/features/posts/queries";
import { routes } from "@/lib/routes";
import { formatDate } from "@/lib/utils";

type Props = { posts: PostCardView[]; locale: Locale; dict: Dictionary };

/**
 * Faqat sarlavhalar: raqam · nom · sana. Rasm va matn — post sahifasida.
 * JS yo'q: animatsiya CSS (transform/opacity), hover ham CSS.
 */
export function PostTitleList({ posts, locale, dict }: Props) {
  if (posts.length === 0) return <p className="py-16 text-center text-muted">{dict.home.empty}</p>;

  return (
    <ol className="overflow-hidden rounded-3xl border border-border/70 bg-surface/75 shadow-card backdrop-blur-sm">
      {posts.map((post, i) => (
        <li
          key={post.id}
          // uzun ro'yxatda kechikish cheksiz o'smasin
          style={{ "--i": Math.min(i, 12) } as React.CSSProperties}
          className="animate-fade-up border-b border-border/60 last:border-0"
        >
          <Link
            href={routes.post(locale, post.slug, post.kind)}
            className="group flex items-center gap-4 px-4 py-4 transition-colors duration-200 hover:bg-surface-2/70 sm:gap-6 sm:px-7 sm:py-5"
          >
            <span className="w-7 shrink-0 font-mono text-sm tabular-nums text-muted sm:w-9">{String(i + 1).padStart(2, "0")}</span>

            <span className="min-w-0 flex-1">
              <span className="block break-words text-base font-semibold leading-snug transition-[color,transform] duration-200 group-hover:translate-x-1 group-hover:text-accent sm:text-lg">
                {post.title}
              </span>
              {/* telefonda sana sarlavha ostida */}
              <time dateTime={post.publishedAt.toISOString()} className="mt-1 block text-xs text-muted sm:hidden">
                {formatDate(post.publishedAt, locale)}
              </time>
            </span>

            <time dateTime={post.publishedAt.toISOString()} className="hidden shrink-0 text-sm tabular-nums text-muted sm:block">
              {formatDate(post.publishedAt, locale)}
            </time>
            <span
              aria-hidden
              className="shrink-0 text-muted transition-[transform,color] duration-200 group-hover:translate-x-1 group-hover:text-accent"
            >
              →
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
