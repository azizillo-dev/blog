import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getDictionary, toLocale } from "@/i18n";
import { getPublishedPost } from "@/features/posts/queries";
import { getPrivateViewer } from "@/features/private/viewer";
import { routes } from "@/lib/routes";
import { PostArticle } from "@/components/content/PostArticle";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false } };

export default async function PrivatePostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  const privateHome = routes.section(locale, "private", "PRIVATE");

  if (!(await getPrivateViewer())) redirect(privateHome);

  const post = await getPublishedPost(slug, locale);
  if (!post || post.kind !== "PRIVATE") notFound();

  return <PostArticle post={post} locale={locale} dict={getDictionary(locale)} backHref={privateHome} />;
}
