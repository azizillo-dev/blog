import Link from "next/link";
import type { Locale } from "@/lib/constants";
import type { Dictionary } from "@/i18n";
import type { PostCardView } from "@/features/posts/queries";
import { routes } from "@/lib/routes";
import { Cover } from "./Cover";
import { PostMeta } from "./PostMeta";

type Props = { post: PostCardView; locale: Locale; dict: Dictionary; index?: number; priority?: boolean };

export function PostCard({ post, locale, dict, index = 0, priority }: Props) {
  return (
    <Link href={routes.post(locale, post.slug, post.kind)} className="reveal group block min-w-0" style={{ "--i": index } as React.CSSProperties}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border bg-surface-2 shadow-card">
        <Cover
          src={post.coverImage}
          alt={post.title}
          priority={priority}
          sizes="(min-width: 768px) 420px, 100vw"
          className="transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04]"
        />
      </div>
      <div className="px-1 pt-4">
        <PostMeta date={post.publishedAt} minutes={post.minutes} locale={locale} dict={dict} />
        <h3 className="mt-1.5 break-words text-xl font-bold leading-snug tracking-tight transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-2 leading-relaxed text-muted">{post.excerpt}</p>}
      </div>
    </Link>
  );
}

type GridProps = { posts: PostCardView[]; locale: Locale; dict: Dictionary; priorityCount?: number };

export function PostGrid({ posts, locale, dict, priorityCount = 0 }: GridProps) {
  if (posts.length === 0) return <p className="py-16 text-center text-muted">{dict.home.empty}</p>;
  return (
    <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
      {posts.map((post, i) => (
        <PostCard key={post.id} post={post} locale={locale} dict={dict} index={i} priority={i < priorityCount} />
      ))}
    </div>
  );
}
