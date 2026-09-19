import type { Metadata } from "next";
import { getDictionary, toLocale } from "@/i18n";
import { getSectionByKind } from "@/features/sections/queries";
import { listPublishedPosts } from "@/features/posts/queries";
import { getPrivateViewer } from "@/features/private/viewer";
import { privateLogoutAction } from "@/features/private/actions";
import { Container } from "@/components/layout/Container";
import { PageHeading } from "@/components/content/PageHeading";
import { PostGrid } from "@/components/content/PostCard";
import { PrivateGate } from "@/components/private/PrivateGate";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return { title: getDictionary(toLocale((await params).locale)).private.title, robots: { index: false } };
}

export default async function PrivatePage({ params }: Params) {
  const locale = toLocale((await params).locale);
  const dict = getDictionary(locale);
  const viewer = await getPrivateViewer();

  if (!viewer) {
    return (
      <Container className="py-12 sm:py-20">
        <PrivateGate locale={locale} t={dict.private} />
      </Container>
    );
  }

  const section = await getSectionByKind("PRIVATE", locale);
  const posts = section ? await listPublishedPosts({ locale, sectionId: section.id }) : [];

  return (
    <Container>
      <PageHeading title={section?.title || dict.private.title} subtitle={section?.description || viewer} />
      <form action={privateLogoutAction.bind(null, locale)} className="-mt-6 mb-10 text-center">
        <button className="text-sm font-semibold text-muted underline-offset-4 hover:text-fg hover:underline">{dict.private.logout}</button>
      </form>
      <PostGrid posts={posts} locale={locale} dict={dict} />
    </Container>
  );
}
