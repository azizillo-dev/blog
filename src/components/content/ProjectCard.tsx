import type { Dictionary } from "@/i18n";
import type { ProjectView } from "@/features/projects/queries";
import { ExternalIcon, SocialIcon } from "@/components/icons";
import { Cover } from "./Cover";
import { TechList } from "./TechList";

type Props = { project: ProjectView; t: Dictionary["projects"]; index: number };

const linkClass =
  "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-[transform,background-color] active:scale-95";

export function ProjectCard({ project, t, index }: Props) {
  return (
    <article
      style={{ "--i": index } as React.CSSProperties}
      className="reveal group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-card"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        <Cover
          src={project.image}
          alt={project.title}
          sizes="(min-width: 640px) 50vw, 100vw"
          priority={index < 2}
          className="transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h2 className="text-xl font-bold leading-snug tracking-tight">{project.title}</h2>
        {project.description && <p className="mt-2 whitespace-pre-line leading-relaxed text-muted">{project.description}</p>}
        <TechList items={project.technologies} className="mt-4" />
        {(project.demoUrl || project.sourceUrl) && (
          <div className="mt-auto flex flex-wrap gap-2 pt-5">
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
      </div>
    </article>
  );
}
