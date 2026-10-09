import type { Metadata } from "next";
import { getDictionary, toLocale } from "@/i18n";
import { db } from "@/lib/db";
import { getPage } from "@/features/pages/queries";
import { listResumeEntries } from "@/features/resume/queries";
import { getSettings } from "@/features/settings/queries";
import { getVisibleSocialLinks } from "@/features/socials/queries";
import { getLeetcodeStats } from "@/features/leetcode/queries";
import { parseTechnologies } from "@/features/projects/technologies";
import { Container } from "@/components/layout/Container";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { ResumeSection } from "@/components/content/ResumeSection";
import { TechList } from "@/components/content/TechList";
import { BootGate } from "@/components/about/BootGate";
import { CosmicHero } from "@/components/about/CosmicHero";

export const revalidate = 3600;

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const page = await getPage("about", locale);
  return { title: page?.title || getDictionary(locale).nav.about };
}

/** "Blog" menyusi: koinot fonidagi tanishuv + matn, tajriba, ta'lim, ko'nikmalar. */
export default async function AboutPage({ params }: Params) {
  const locale = toLocale((await params).locale);
  const dict = getDictionary(locale);
  const t = dict.about;

  const [page, entries, settings, socials, projects, posts, certificates] = await Promise.all([
    getPage("about", locale),
    listResumeEntries(locale),
    getSettings(),
    getVisibleSocialLinks(),
    db.project.count({ where: { visible: true } }),
    db.post.count({ where: { published: true } }),
    db.certificate.count(),
  ]);
  const leetcode = settings.leetcodeUsername ? await getLeetcodeStats(settings.leetcodeUsername) : null;

  const skills = parseTechnologies(settings.skills);
  const experience = entries.filter((e) => e.kind === "EXPERIENCE");
  const education = entries.filter((e) => e.kind === "EDUCATION");

  const stats = [
    { label: t.skills, value: String(skills.length) },
    { label: dict.nav.projects, value: String(projects) },
    { label: dict.home.all, value: String(posts) },
    leetcode ? { label: "LeetCode", value: String(leetcode.solved.All) } : { label: dict.nav.certificates, value: String(certificates) },
  ].filter((s) => s.value !== "0");

  return (
    <BootGate lines={dict.codespace.boot} skipLabel={dict.codespace.skip}>
      <Container size="default" className="pt-6">
        <CosmicHero
          name={page?.title || settings.authorName || settings.siteTitle}
          role={experience[0]?.title || education[0]?.title || ""}
          avatar={page?.image ?? ""}
          stack={skills}
          cv={{ url: page?.fileUrl ?? "", label: t.cv }}
          socials={socials.map((s) => ({ label: s.label, url: s.url, platform: s.platform }))}
          stats={stats}
        />
      </Container>

      <Container size="prose">
        {(page?.blocks.length ?? 0) > 0 && <BlockRenderer blocks={page!.blocks} className="animate-fade-up mt-12" />}
        <ResumeSection title={t.experience} entries={experience} locale={locale} t={t} />
        <ResumeSection title={t.education} entries={education} locale={locale} t={t} />
        {skills.length > 0 && (
          <section className="reveal mt-14">
            <h2 className="mb-5 text-2xl font-extrabold tracking-tight">{t.skills}</h2>
            <TechList items={skills} className="gap-2 [&>li]:px-3 [&>li]:py-1.5 [&>li]:text-sm" />
          </section>
        )}
      </Container>
    </BootGate>
  );
}
