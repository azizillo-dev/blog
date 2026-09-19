import Link from "next/link";
import type { Locale } from "@/lib/constants";
import type { Dictionary } from "@/i18n";
import { routes } from "@/lib/routes";
import type { SectionView } from "@/features/sections/queries";
import { Container } from "./Container";
import { MoreMenu, type MoreItem } from "./MoreMenu";

type Props = { locale: Locale; dict: Dictionary; siteTitle: string; sections: SectionView[] };

export function Header({ locale, dict, siteTitle, sections }: Props) {
  // BLOG bo'limi postlari bosh sahifada; "Blog" menyusi esa muallif haqida sahifasi.
  const main = [
    { key: "blog", href: routes.about(locale), label: dict.nav.blog },
    ...sections
      .filter((s) => s.inNav === "MAIN" && s.kind !== "BLOG")
      .map((s) => ({ key: s.id, href: routes.section(locale, s.slug, s.kind), label: s.title })),
  ];
  const more: MoreItem[] = [
    ...sections.filter((s) => s.inNav === "MORE").map((s) => ({
      href: routes.section(locale, s.slug, s.kind),
      label: s.title,
      locked: s.kind === "PRIVATE",
    })),
    { href: routes.certificates(locale), label: dict.nav.certificates },
    { href: routes.projects(locale), label: dict.nav.projects },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-bg/80 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <Container size="wide" className="flex h-16 items-center justify-between gap-3">
        <Link href={routes.home(locale)} className="shrink-0 whitespace-nowrap text-lg font-extrabold tracking-tight sm:text-xl">
          {siteTitle}
        </Link>
        <nav className="flex items-center gap-0.5 text-[15px] font-semibold sm:gap-1">
          {main.map((item) => (
            <Link key={item.key} href={item.href} className="rounded-xl px-2.5 py-2 transition-colors hover:bg-surface-2 sm:px-3">
              {item.label}
            </Link>
          ))}
          <MoreMenu label={dict.nav.more} items={more} locale={locale} languageLabel={dict.common.language} />
        </nav>
      </Container>
    </header>
  );
}
