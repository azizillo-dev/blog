import type { Metadata } from "next";
import { getDictionary, toLocale } from "@/i18n";
import { listProjects } from "@/features/projects/queries";
import { Container } from "@/components/layout/Container";
import { PageHeading } from "@/components/content/PageHeading";
import { ProjectCard } from "@/components/content/ProjectCard";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = getDictionary(toLocale((await params).locale)).projects;
  return { title: t.title, description: t.subtitle };
}

export default async function ProjectsPage({ params }: Params) {
  const locale = toLocale((await params).locale);
  const t = getDictionary(locale).projects;
  const projects = await listProjects(locale);

  return (
    <Container size="wide">
      <PageHeading title={t.title} subtitle={t.subtitle} />
      {projects.length === 0 && <p className="py-16 text-center text-muted">{t.empty}</p>}
      <div className={cn("grid gap-6 sm:gap-8", projects.length === 1 ? "mx-auto max-w-2xl" : "sm:grid-cols-2")}>
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} t={t} index={i} />
        ))}
      </div>
    </Container>
  );
}
