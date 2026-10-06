import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, toLocale } from "@/i18n";
import { getProject } from "@/features/projects/queries";
import { routes } from "@/lib/routes";
import { Container } from "@/components/layout/Container";
import { Cover } from "@/components/content/Cover";
import { DetailHeader } from "@/components/content/DetailHeader";
import { TechList } from "@/components/content/TechList";
import { ExternalIcon, SocialIcon } from "@/components/icons";

export const revalidate = 3600;
export const generateStaticParams = async () => [];

type Params = { params: Promise<{ locale: string; slug: string }> };

const linkClass =
  "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-[transform,background-color] active:scale-95";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProject(slug, toLocale(locale));
  return project ? { title: project.title, description: project.description.slice(0, 160) } : {};
}

export default async function ProjectPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  const dict = getDictionary(locale);
  const t = dict.projects;
  const project = await getProject(slug, locale);
  if (!project) notFound();

  return (
    <article className="pb-10">
      <Container size="prose" className="animate-fade-up pt-8 sm:pt-12">
        <DetailHeader backHref={routes.projects(locale)} homeHref={routes.home(locale)} dict={dict} />
        <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{project.title}</h1>

        {project.image && (
          <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl border border-border shadow-card sm:rounded-3xl">
            <Cover src={project.image} alt={project.title} priority sizes="(min-width: 704px) 672px, 100vw" />
          </div>
        )}

        {project.description && <p className="mt-8 whitespace-pre-line leading-relaxed">{project.description}</p>}

        {project.technologies.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">{t.stack}</h2>
            <TechList items={project.technologies} className="gap-2 [&>li]:px-3 [&>li]:py-1.5 [&>li]:text-sm" />
          </section>
        )}

        {(project.demoUrl || project.sourceUrl) && (
          <div className="mt-8 flex flex-wrap gap-2">
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} bg-accent text-accent-fg`}>
                {t.demo} <ExternalIcon />
              </a>
            )}
            {project.sourceUrl && (
              <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} border border-border hover:bg-surface-2`}>
                <SocialIcon platform={project.sourceUrl.includes("github.com") ? "github" : "website"} size={16} /> {t.source}
              </a>
            )}
          </div>
        )}
      </Container>
    </article>
  );
}
