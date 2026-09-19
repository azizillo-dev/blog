"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";
import { applyTheme, currentTheme, type Theme } from "@/lib/theme-client";
import { adminLogoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Bosh sahifa" },
  { href: "/admin/posts", label: "Postlar" },
  { href: "/admin/sections", label: "Bo'limlar" },
  { href: "/admin/certificates", label: "Sertifikatlar" },
  { href: "/admin/about", label: "Blog: Men haqimda" },
  { href: "/admin/resume", label: "Blog: Tajriba va ta'lim" },
  { href: "/admin/projects", label: "Loyihalar" },
  { href: "/admin/socials", label: "Ijtimoiy tarmoqlar" },
  { href: "/admin/requests", label: "Private so'rovlar" },
  { href: "/admin/settings", label: "Sozlamalar" },
];

export function AdminNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => setTheme(currentTheme()), []);

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <aside className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md lg:h-dvh lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-2 px-4 py-3 lg:px-5 lg:py-5">
        <Link href="/" className="font-extrabold tracking-tight">← Sayt</Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Theme"
            onClick={(e) => {
              const next = theme === "dark" ? "light" : "dark";
              setTheme(next);
              applyTheme(next, e.currentTarget);
            }}
            className="grid size-9 place-items-center rounded-lg hover:bg-surface-2"
          >
            {theme === "dark" ? <MoonIcon size={18} /> : <SunIcon size={18} />}
          </button>
          <form action={adminLogoutAction}>
            <button className="rounded-lg px-2.5 py-2 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-fg">Chiqish</button>
          </form>
        </div>
      </div>
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex shrink-0 items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
              isActive(l.href) ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            {l.label}
            {l.href === "/admin/requests" && pendingCount > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-fg">{pendingCount}</span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
