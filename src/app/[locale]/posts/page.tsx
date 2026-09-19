import type { Metadata } from "next";
import { getDictionary, toLocale } from "@/i18n";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { paginate } from "@/lib/pagination";
import { routes } from "@/lib/routes";
import { countPublishedPosts, listPublishedPosts } from "@/features/posts/queries";
import { getSectionByKind } from "@/features/sections/queries";
import { Container } from "@/components/layout/Container";
import { PageHeading } from "@/components/content/PageHeading";
import { PostGrid } from "@/components/content/PostCard";
import { Pagination } from "@/components/content/Pagination";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getDictionary(toLocale((await params).locale)).home.all };
}

export default async function AllPostsPage({ params, searchParams }: Props) {
  const locale = toLocale((await params).locale);
  const dict = getDictionary(locale);
  const blog = await getSectionByKind("BLOG", locale);
  const total = blog ? await countPublishedPosts(blog.id) : 0;
  const { page, totalPages, skip, take } = paginate((await searchParams).page, total, POSTS_PER_PAGE);
  const posts = blog ? await listPublishedPosts({ locale, sectionId: blog.id, skip, take }) : [];

  return (
    <Container>
      <PageHeading title={dict.home.all} />
      <PostGrid posts={posts} locale={locale} dict={dict} priorityCount={2} />
      <Pagination page={page} totalPages={totalPages} href={(p) => routes.posts(locale, p)} t={dict.pagination} />
    </Container>
  );
}
