import Link from "next/link";
import type { Locale } from "@/lib/constants";
import type { Dictionary } from "@/i18n";
import type { PostCardView } from "@/features/posts/queries";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Cover } from "./Cover";
import { PostMeta } from "./PostMeta";

type Props = { posts: PostCardView[]; locale: Locale; dict: Dictionary };

/**
 * Bosh sahifadagi katta kartalar (rasm ustida matn).
 * Mobil: gorizontal scroll-snap karusel (JS'siz, native inertsiya). Desktop: 2×2 grid.
 */
export function FeaturedPosts({ posts, locale, dict }: Props) {
  if (posts.length === 0) return null;
  const single = posts.length === 1;
  return (
    <div
      className={cn(
        "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:gap-5 md:overflow-visible md:px-0",
        single ? "md:grid-cols-1" : "md:grid-cols-2",
      )}
    >
      {posts.map((post, i) => (
        <Link
          key={post.id}
          href={routes.post(locale, post.slug, post.kind)}
          style={{ "--i": i } as React.CSSProperties}
          className={cn(
            "animate-fade-up group relative isolate aspect-[4/5] shrink-0 snap-center overflow-hidden rounded-3xl border border-border bg-surface-2 shadow-card sm:w-[60%] md:aspect-[16/11] md:w-auto",
            single ? "w-full" : "w-[82%]",
          )}
        >
          <Cover
            src={post.coverImage}
            alt={post.title}
            priority={i < 2}
            sizes="(min-width: 768px) 440px, 82vw"
            className="-z-10 transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="flex h-full flex-col justify-end p-5 text-white sm:p-6">
            <PostMeta date={post.publishedAt} minutes={post.minutes} locale={locale} dict={dict} className="text-xs text-white/75 sm:text-sm" />
            <h2 className="mt-1 break-words text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{post.title}</h2>
            {post.excerpt && <p className="mt-2 line-clamp-2 max-w-lg text-white/80">{post.excerpt}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}
