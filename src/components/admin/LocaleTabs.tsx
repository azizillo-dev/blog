"use client";

import { useState } from "react";
import { LOCALES, type Locale } from "@/lib/constants";
import { cn } from "@/lib/utils";

const LABEL: Record<Locale, string> = { uz: "O'zbekcha", ru: "Русский", en: "English" };

/**
 * Har bir til uchun panel. Barcha panellar DOM'da qoladi (faqat yashiriladi),
 * shuning uchun bitta forma hamma tillarni birga yuboradi.
 */
export function LocaleTabs({ children }: { children: (locale: Locale) => React.ReactNode }) {
  const [active, setActive] = useState<Locale>("uz");
  return (
    <div>
      <div role="tablist" className="mb-4 inline-flex rounded-xl border border-border bg-bg p-1">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={active === l}
            onClick={() => setActive(l)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors",
              active === l ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg",
            )}
          >
            {LABEL[l]}
          </button>
        ))}
      </div>
      <div className="mb-4 space-y-2 rounded-xl bg-accent-soft/60 p-3 text-sm">
        <p className="text-muted">
          Faqat <b className="text-fg">o&apos;zbekcha</b> yozing — bo&apos;sh qolgan RU/EN saqlashda avtomatik tarjima qilinadi.
        </p>
        <label className="flex cursor-pointer items-start gap-2">
          <input type="checkbox" name="retranslate" className="mt-0.5 size-4 accent-[var(--accent)]" />
          <span>O&apos;zbekchani o&apos;zgartirdim — RU va EN&apos;ni qayta tarjima qilish (ular ustidan yoziladi)</span>
        </label>
      </div>
      {LOCALES.map((l) => (
        <div key={l} role="tabpanel" hidden={active !== l} className="space-y-4">
          {children(l)}
        </div>
      ))}
    </div>
  );
}
