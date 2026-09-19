import type { SocialLink } from "@prisma/client";
import type { Dictionary } from "@/i18n";
import { BRAND_COLOR, SocialIcon } from "@/components/icons";
import { Container } from "./Container";

type Props = { dict: Dictionary; links: SocialLink[]; author: string };

export function Footer({ dict, links, author }: Props) {
  return (
    <footer className="mt-24 border-t border-border py-14">
      <Container className="flex flex-col items-center gap-8 text-center">
        {links.length > 0 && (
          <>
            <h2 className="text-lg font-semibold">{dict.footer.follow}</h2>
            <ul className="flex max-w-md flex-wrap justify-center gap-3">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    title={link.label}
                    style={{ "--brand": BRAND_COLOR[link.platform] ?? "var(--accent)" } as React.CSSProperties}
                    className="group grid size-16 place-items-center rounded-2xl border border-border bg-surface text-muted transition-[transform,color,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  >
                    <SocialIcon platform={link.platform} size={24} />
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} {author}. {dict.footer.rights}
        </p>
      </Container>
    </footer>
  );
}
