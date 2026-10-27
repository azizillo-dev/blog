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
import { HomeShowcase } from "@/components/content/HomeShowcase";
import { ProjectCard } from "@/components/content/ProjectCard";
import { CertificateCard } from "@/components/content/CertificateCard";
import { getSettings } from "@/features/settings/queries";
import { listProjects } from "@/features/projects/queries";
import { listCertificates } from "@/features/certificates/queries";

export const revalidate = 3600;

const FEATURED = 2;
const HOME_PROJECTS = 4;
const HOME_CERTIFICATES = 6;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const dict = getDictionary(locale);
  const blog = await getSectionByKind("BLOG", locale);
  const [[posts, total], settings] = await Promise.all([
    blog
      ? Promise.all([listPublishedPosts({ locale, sectionId: blog.id, take: HOME_POSTS }), countPublishedPosts(blog.id)])
      : Promise.resolve([[], 0] as const),
    getSettings(),
  ]);
  // Admin → Sozlamalar → "Bosh sahifa" da yoqilgan bloklar
  const [projects, certificates] = await Promise.all([
    settings.homeProjects === "1" ? listProjects(locale) : Promise.resolve([]),
    settings.homeCertificates === "1" ? listCertificates(locale) : Promise.resolve([]),
  ]);

  return (
    <Container>
      <PageHeading title={dict.home.recent} subtitle={blog?.description || undefined} icon={<span aria-hidden>✦</span>} />
      {/* Faqat 2 tasi gorizontal karusel (mobil); qolganlari ostida vertikal ro'yxat */}
      <FeaturedPosts posts={posts.slice(0, FEATURED)} locale={locale} dict={dict} />
      {posts.length > FEATURED && (
        <div className="mt-12">
          <PostGrid posts={posts.slice(FEATURED)} locale={locale} dict={dict} />
        </div>
      )}
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

      {/* Skroll qilganda chiqib keladi: kartalarda .reveal (scroll-driven animatsiya, JS yo'q) */}
      {projects.length > 0 && (
        <HomeShowcase title={dict.projects.title} href={routes.projects(locale)} seeAll={dict.home.seeAll}>
          <div className="grid auto-rows-fr items-stretch gap-6 sm:grid-cols-2 sm:gap-8">
            {projects.slice(0, HOME_PROJECTS).map((p, i) => (
              <ProjectCard key={p.id} project={p} locale={locale} index={i} />
            ))}
          </div>
        </HomeShowcase>
      )}

      {certificates.length > 0 && (
        <HomeShowcase title={dict.certificates.title} href={routes.certificates(locale)} seeAll={dict.home.seeAll}>
          <div className="grid auto-rows-fr items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.slice(0, HOME_CERTIFICATES).map((c, i) => (
              <CertificateCard key={c.id} certificate={c} locale={locale} t={dict.certificates} index={i} />
            ))}
          </div>
        </HomeShowcase>
      )}
    </Container>
  );
}
