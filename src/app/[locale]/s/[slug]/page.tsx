import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, toLocale } from "@/i18n";
import { getSectionBySlug } from "@/features/sections/queries";
import { listPublishedPosts } from "@/features/posts/queries";
import { Container } from "@/components/layout/Container";
import { PageHeading } from "@/components/content/PageHeading";
import { PostGrid } from "@/components/content/PostCard";
import { PostTitleList } from "@/components/content/PostTitleList";

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

  if (section.layout !== "LIST") {
    return (
      <Container>
        <PageHeading title={section.title} subtitle={section.description || undefined} />
        <PostGrid posts={posts} locale={locale} dict={dict} />
      </Container>
    );
  }

  return (
    <div className="relative isolate">
      {section.image && (
        // Fon ekranga "qadalgan": skroll paytida qayta chizilmaydi (alohida GPU qatlami)
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 transform-gpu overflow-hidden">
          {/* Kichik o'lchamda yuklanadi — baribir xiralashadi, trafik tejaladi */}
          <Image src={section.image} alt="" fill priority sizes="640px" quality={50} className="scale-110 object-cover blur-2xl" />
          {/* Matn o'qilishi uchun: yorug' rejimda och, qorong'ida to'q parda */}
          <div className="absolute inset-0 bg-bg/55" />
        </div>
      )}

      <Container size="default" className="pb-10">
        <PageHeading title={section.title} subtitle={section.description || undefined} />
        <PostTitleList posts={posts} locale={locale} dict={dict} />
      </Container>
    </div>
  );
}
