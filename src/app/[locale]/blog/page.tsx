import type { Metadata } from "next";
import { getDictionary, toLocale } from "@/i18n";
import { getPage } from "@/features/pages/queries";
import { listResumeEntries } from "@/features/resume/queries";
import { getSettings } from "@/features/settings/queries";
import { parseTechnologies } from "@/features/projects/technologies";
import { Container } from "@/components/layout/Container";
import { AboutIntro } from "@/components/content/AboutIntro";
import { ResumeSection } from "@/components/content/ResumeSection";
import { TechList } from "@/components/content/TechList";

export const revalidate = 3600;

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const page = await getPage("about", locale);
  return { title: page?.title || getDictionary(locale).nav.about };
}

/** "Blog" menyusi: muallif haqida — matn/rasmlar, tajriba, ta'lim, ko'nikmalar. */
export default async function AboutPage({ params }: Params) {
  const locale = toLocale((await params).locale);
  const t = getDictionary(locale).about;
  const [page, entries, settings] = await Promise.all([getPage("about", locale), listResumeEntries(locale), getSettings()]);
  const skills = parseTechnologies(settings.skills);

  return (
    <Container size="prose">
      <AboutIntro title={page?.title ?? ""} image={page?.image ?? ""} blocks={page?.blocks ?? []} />
      <ResumeSection title={t.experience} entries={entries.filter((e) => e.kind === "EXPERIENCE")} locale={locale} t={t} />
      <ResumeSection title={t.education} entries={entries.filter((e) => e.kind === "EDUCATION")} locale={locale} t={t} />
      {skills.length > 0 && (
        <section className="reveal mt-14">
          <h2 className="mb-5 text-2xl font-extrabold tracking-tight">{t.skills}</h2>
          <TechList items={skills} className="gap-2 [&>li]:px-3 [&>li]:py-1.5 [&>li]:text-sm" />
        </section>
      )}
    </Container>
  );
}
