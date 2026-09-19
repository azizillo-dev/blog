import type { Metadata } from "next";
import { getDictionary, toLocale } from "@/i18n";
import { getSectionByKind } from "@/features/sections/queries";
import { listPublishedPosts } from "@/features/posts/queries";
import { getSettings } from "@/features/settings/queries";
import { getLeetcodeStats } from "@/features/leetcode/queries";
import { Container } from "@/components/layout/Container";
import { PageHeading } from "@/components/content/PageHeading";
import { PostGrid } from "@/components/content/PostCard";
import { LeetcodeCard } from "@/components/content/LeetcodeCard";

export const revalidate = 3600;

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const section = await getSectionByKind("IT", locale);
  return { title: section?.title || getDictionary(locale).it.title };
}

export default async function ItPage({ params }: Params) {
  const locale = toLocale((await params).locale);
  const dict = getDictionary(locale);
  const [section, settings] = await Promise.all([getSectionByKind("IT", locale), getSettings()]);
  const [posts, stats] = await Promise.all([
    section ? listPublishedPosts({ locale, sectionId: section.id }) : [],
    getLeetcodeStats(settings.leetcodeUsername),
  ]);

  return (
    <Container>
      <PageHeading title={section?.title || dict.it.title} subtitle={section?.description || dict.it.subtitle} />
      {stats ? (
        <div className="mb-16">
          <LeetcodeCard stats={stats} dict={dict} />
        </div>
      ) : (
        settings.leetcodeUsername && <p className="mb-12 text-center text-sm text-muted">{dict.it.unavailable}</p>
      )}
      <PostGrid posts={posts} locale={locale} dict={dict} />
    </Container>
  );
}
