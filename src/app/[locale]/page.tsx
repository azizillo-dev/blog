import Link from "next/link";
import { toLocale, getDictionary } from "@/i18n";
import { HOME_POSTS } from "@/lib/constants";
import { routes } from "@/lib/routes";
import { countPublishedPosts, listPublishedPosts } from "@/features/posts/queries";
import { getSectionByKind } from "@/features/sections/queries";
import { Container } from "@/components/layout/Container";
import { PageHeading } from "@/components/content/PageHeading";
import { PostGrid } from "@/components/content/PostCard";
import { FeaturedPosts } from "@/components/content/FeaturedPosts";

export const revalidate = 3600;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const dict = getDictionary(locale);
  const blog = await getSectionByKind("BLOG", locale);
  const [posts, total] = blog
    ? await Promise.all([listPublishedPosts({ locale, sectionId: blog.id, take: HOME_POSTS }), countPublishedPosts(blog.id)])
    : [[], 0];

  return (
    <Container>
      <PageHeading title={dict.home.recent} subtitle={blog?.description || undefined} icon={<span aria-hidden>✦</span>} />
      <FeaturedPosts posts={posts} locale={locale} dict={dict} />
      {posts.length === 0 && <PostGrid posts={[]} locale={locale} dict={dict} />}
      {total > HOME_POSTS && (
        <div className="mt-12 text-center">
          <Link
            href={routes.posts(locale)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 font-semibold shadow-card transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            {dict.home.readMore} <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </Container>
  );
}
