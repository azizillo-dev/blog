import Link from "next/link";
import type { Locale } from "@/lib/constants";
import type { Dictionary } from "@/i18n";
import type { PostView } from "@/features/posts/queries";
import { Container } from "@/components/layout/Container";
import { ArrowLeftIcon } from "@/components/icons";
import { BlockRenderer } from "./BlockRenderer";
import { Cover } from "./Cover";
import { PostMeta } from "./PostMeta";

type Props = { post: PostView; locale: Locale; dict: Dictionary; backHref: string };

export function PostArticle({ post, locale, dict, backHref }: Props) {
  return (
    <article className="pb-10">
      <Container size="prose" className="animate-fade-up pt-8 sm:pt-12">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-fg">
          <ArrowLeftIcon /> {dict.post.back}
        </Link>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-accent">{post.sectionTitle}</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-muted">{post.excerpt}</p>}
        <PostMeta date={post.publishedAt} minutes={post.minutes} locale={locale} dict={dict} className="mt-5 text-sm text-muted" />
      </Container>

      {post.coverImage && (
        <Container size="default" className="animate-fade-up mt-8 [--i:2]">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border shadow-card">
            <Cover src={post.coverImage} alt={post.title} priority sizes="(min-width: 896px) 896px, 100vw" />
          </div>
        </Container>
      )}

      <Container size="prose" className="mt-10">
        <BlockRenderer blocks={post.blocks} />
      </Container>
    </article>
  );
}
