import Link from "next/link";
import type { Locale } from "@/lib/constants";
import type { ProjectView } from "@/features/projects/queries";
import { routes } from "@/lib/routes";
import { Cover } from "./Cover";
import { TechList } from "./TechList";

type Props = { project: ProjectView; locale: Locale; index: number };

/** Butun karta — batafsil sahifaga havola. Balandlik qat'iy: sarlavha 2 qator, tavsif 3 qator. */
export function ProjectCard({ project, locale, index }: Props) {
  return (
    <Link
      href={routes.project(locale, project.slug)}
      style={{ "--i": index } as React.CSSProperties}
      className="reveal group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-card transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-accent/40"
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
        <h2 className="line-clamp-2 min-h-[2.75em] text-xl font-bold leading-snug tracking-tight transition-colors group-hover:text-accent">
          {project.title}
        </h2>
        <p className="mt-2 line-clamp-3 min-h-[4.875em] whitespace-pre-line leading-relaxed text-muted">{project.description}</p>
        <div className="mt-auto min-h-[3.5rem] content-start pt-5">
          <TechList items={project.technologies} max={6} />
        </div>
      </div>
    </Link>
  );
}
