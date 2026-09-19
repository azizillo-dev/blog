import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, toLocale } from "@/i18n";
import { getSectionBySlug } from "@/features/sections/queries";
import { listPublishedPosts } from "@/features/posts/queries";
import { Container } from "@/components/layout/Container";
import { PageHeading } from "@/components/content/PageHeading";
import { PostGrid } from "@/components/content/PostCard";

export const revalidate = 3600;

export const generateStaticParams = async () => [];

type Params = { params: Promise<{ locale: string; slug: string }> };

async function load({ params }: Params) {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  const section = await getSectionBySlug(slug, locale);
  return { locale, section: section?.kind === "CUSTOM" ? section : null };
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const { section } = await load(props);
  return section ? { title: section.title, description: section.description } : {};
}

export default async function SectionPage(props: Params) {
  const { locale, section } = await load(props);
  if (!section) notFound();
  const dict = getDictionary(locale);
  const posts = await listPublishedPosts({ locale, sectionId: section.id });

  return (
    <Container>
      <PageHeading title={section.title} subtitle={section.description || undefined} />
      <PostGrid posts={posts} locale={locale} dict={dict} />
    </Container>
  );
}
