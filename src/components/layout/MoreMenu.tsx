"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { COOKIE, LOCALES, type Locale } from "@/lib/constants";
import { swapLocale } from "@/lib/routes";
import { ChevronDownIcon, LockIcon } from "@/components/icons";
import { useDismiss } from "@/components/ui/useDismiss";
import { cn } from "@/lib/utils";

export type MoreItem = { href: string; label: string; locked?: boolean };

type Props = { label: string; items: MoreItem[]; locale: Locale; languageLabel: string };

function rememberLocale(l: Locale) {
  document.cookie = `${COOKIE.locale}=${l};path=/;max-age=31536000;samesite=lax`;
  document.documentElement.lang = l;
}

export function MoreMenu({ label, items, locale, languageLabel }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const close = useCallback(() => setOpen(false), []);

  useDismiss(ref, open, close);
  useEffect(close, [pathname, close]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn("flex items-center gap-1 rounded-xl px-2.5 py-2 transition-colors hover:bg-surface-2 sm:px-3", open && "bg-surface-2")}
      >
        {label}
        <ChevronDownIcon className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="menu"
          className="animate-pop-in absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-2xl border border-border bg-surface p-1.5 shadow-card"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              role="menuitem"
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-2.5 font-medium transition-colors hover:bg-surface-2",
                pathname === item.href && "text-accent",
              )}
            >
              {item.label}
              {item.locked && <LockIcon size={16} className="text-muted" />}
            </Link>
          ))}

          <div className="mx-2 my-1.5 h-px bg-border" />
          <div role="group" aria-label={languageLabel} className="flex gap-1 p-1">
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={swapLocale(pathname, l)}
                onClick={() => rememberLocale(l)}
                aria-current={l === locale ? "true" : undefined}
                className={cn(
                  "flex-1 rounded-lg py-1.5 text-center text-sm font-bold uppercase transition-colors",
                  l === locale ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
