import type { Metadata } from "next";
import { getDictionary, toLocale } from "@/i18n";
import { db } from "@/lib/db";
import { routes } from "@/lib/routes";
import { formatDate } from "@/lib/utils";
import type { Locale } from "@/lib/constants";
import { getPage } from "@/features/pages/queries";
import { listResumeEntries } from "@/features/resume/queries";
import { getSettings } from "@/features/settings/queries";
import { listProjects } from "@/features/projects/queries";
import { listPublishedPosts } from "@/features/posts/queries";
import { getSectionByKind } from "@/features/sections/queries";
import { getVisibleSocialLinks } from "@/features/socials/queries";
import { getLeetcodeStats } from "@/features/leetcode/queries";
import { parseTechnologies } from "@/features/projects/technologies";
import { formatPeriod } from "@/features/resume/period";
import { blocksToPlainText } from "@/lib/content/blocks";
import type { CodeProfile } from "@/features/about/profile";
import { Container } from "@/components/layout/Container";
import { AboutIntro } from "@/components/content/AboutIntro";
import { ResumeSection } from "@/components/content/ResumeSection";
import { TechList } from "@/components/content/TechList";
import { CodeSpace } from "@/components/about/CodeSpace";

export const revalidate = 3600;

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const page = await getPage("about", locale);
  return { title: page?.title || getDictionary(locale).nav.about };
}

/** "Blog" menyusi: muallif haqida — ikki ko'rinishda (code space / oddiy). */
export default async function AboutPage({ params }: Params) {
  const locale = toLocale((await params).locale);
  const dict = getDictionary(locale);
  const t = dict.about;

  const [page, entries, settings, projects, blog, socials, certificates] = await Promise.all([
    getPage("about", locale),
    listResumeEntries(locale),
    getSettings(),
    listProjects(locale),
    getSectionByKind("BLOG", locale),
    getVisibleSocialLinks(),
    db.certificate.count(),
  ]);
  const posts = blog ? await listPublishedPosts({ locale, sectionId: blog.id, take: 5 }) : [];
  const leetcode = settings.leetcodeUsername ? await getLeetcodeStats(settings.leetcodeUsername) : null;

  const skills = parseTechnologies(settings.skills);
  const experience = entries.filter((e) => e.kind === "EXPERIENCE");
  const education = entries.filter((e) => e.kind === "EDUCATION");

  const profile: CodeProfile = {
    name: page?.title || settings.authorName || settings.siteTitle,
    role: experience[0]?.title || education[0]?.title || "",
    avatar: page?.image ?? "",
    summary: blocksToPlainText(page?.blocks ?? [])
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 12),
    experience: experience.map((e) => toEntry(e, locale, t)),
    education: education.map((e) => toEntry(e, locale, t)),
    skills,
    projects: projects.map((p) => ({
      title: p.title,
      tech: p.technologies,
      href: routes.project(locale, p.slug),
      demo: p.demoUrl,
      source: p.sourceUrl,
    })),
    posts: posts.map((p) => ({ title: p.title, href: routes.post(locale, p.slug, p.kind), date: formatDate(p.publishedAt, locale) })),
    socials: socials.map((s) => ({ label: s.label, url: s.url })),
    cvUrl: page?.fileUrl ?? "",
    leetcode: leetcode ? { solved: leetcode.solved.All, ranking: leetcode.ranking ?? 0, username: leetcode.username } : null,
    links: { posts: routes.posts(locale), projects: routes.projects(locale), certificates: routes.certificates(locale) },
    counts: { posts: posts.length, projects: projects.length, certificates },
  };

  const classic = (
    <>
      <AboutIntro title={page?.title ?? ""} image={page?.image ?? ""} blocks={page?.blocks ?? []} cv={{ url: page?.fileUrl ?? "", label: t.cv }} />
      <ResumeSection title={t.experience} entries={experience} locale={locale} t={t} />
      <ResumeSection title={t.education} entries={education} locale={locale} t={t} />
      {skills.length > 0 && (
        <section className="reveal mt-14">
          <h2 className="mb-5 text-2xl font-extrabold tracking-tight">{t.skills}</h2>
          <TechList items={skills} className="gap-2 [&>li]:px-3 [&>li]:py-1.5 [&>li]:text-sm" />
        </section>
      )}
    </>
  );

  return (
    <Container size="prose">
      <CodeSpace
        profile={profile}
        labels={{
          boot: dict.codespace.boot,
          skip: dict.codespace.skip,
          plainView: dict.codespace.plainView,
          codeView: dict.codespace.codeView,
          hint: dict.codespace.hint,
          commands: dict.codespace.labels,
        }}
        classic={classic}
      />
    </Container>
  );
}

type ResumeRow = { title: string; organization: string; location: string; startDate: Date; endDate: Date | null };

function toEntry(e: ResumeRow, locale: Locale, t: { present: string; years: string; months: string }) {
  return {
    title: e.title,
    org: e.organization,
    period: formatPeriod(e.startDate, e.endDate, locale, t),
    location: e.location,
    description: "description" in e ? String((e as { description?: string }).description ?? "") : "",
  };
}
