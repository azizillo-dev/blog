import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, toLocale } from "@/i18n";
import { getPublishedPost } from "@/features/posts/queries";
import { PostArticle } from "@/components/content/PostArticle";
import { routes } from "@/lib/routes";

export const revalidate = 3600;

// Bo'sh ro'yxat: postlar birinchi so'rovda render qilinib keshlanadi (ISR), build DB'ga bog'lanmaydi.
export const generateStaticParams = async () => [];

type Params = { params: Promise<{ locale: string; slug: string }> };

async function load({ params }: Params) {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  const post = await getPublishedPost(slug, locale);
  // Private postlar bu yo'l orqali hech qachon ko'rsatilmaydi.
  return { locale, post: post && post.kind !== "PRIVATE" ? post : null };
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const { post } = await load(props);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: post.coverImage ? [post.coverImage] : [] },
  };
}

export default async function PostPage(props: Params) {
  const { locale, post } = await load(props);
  if (!post) notFound();
  const backHref = routes.section(locale, post.sectionSlug, post.kind);
  return <PostArticle post={post} locale={locale} dict={getDictionary(locale)} backHref={backHref} />;
}
