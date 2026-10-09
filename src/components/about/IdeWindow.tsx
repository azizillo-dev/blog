"use client";

import { useState } from "react";
import type { CodeFile } from "@/features/about/files";
import { CodeView } from "./CodeView";
import { cn } from "@/lib/utils";

type Props = { files: CodeFile[]; name: string; children?: React.ReactNode };

const ICON: Record<string, string> = { md: "📄", json: "🧾", sql: "🗄", ts: "🟦", sh: "⌘" };

/** Kod muharriri ko'rinishi: sarlavha paneli, fayllar ro'yxati, tablar va "kod". */
export function IdeWindow({ files, name, children }: Props) {
  const [active, setActive] = useState(0);
  const file = files[active];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#011627] shadow-card sm:rounded-3xl">
      {/* sarlavha paneli */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <p className="ml-2 truncate font-mono text-xs text-[#637777]">{name} — {file?.name}</p>
      </div>

      {/* minmax(0,1fr) — ustun kontent kengligiga qarab cho'zilmasin (tablar va uzun qatorlar) */}
      <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[11rem_minmax(0,1fr)]">
        {/* fayllar */}
        <nav aria-label="Fayllar" className="border-b border-white/10 sm:border-b-0 sm:border-r">
          <p className="px-3 pt-3 font-mono text-[11px] uppercase tracking-wider text-[#4b5a70]">Explorer</p>
          <ul className="flex gap-1 overflow-x-auto p-2 sm:block sm:space-y-0.5 sm:overflow-visible">
            {files.map((f, i) => (
              <li key={f.name}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "w-full whitespace-nowrap rounded-md px-2.5 py-1.5 text-left font-mono text-xs transition-colors",
                    i === active ? "bg-white/10 text-[#d6deeb]" : "text-[#8b9bb4] hover:bg-white/5",
                  )}
                >
                  <span aria-hidden className="mr-1.5">{ICON[f.lang]}</span>
                  {f.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* tahrirlagich */}
        <div className="min-w-0">
          <div className="flex overflow-x-auto border-b border-white/10">
            {files.map((f, i) => (
              <button
                key={f.name}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "whitespace-nowrap border-r border-white/10 px-3 py-2 font-mono text-xs transition-colors",
                  i === active ? "bg-[#011627] text-[#d6deeb]" : "bg-white/[0.03] text-[#637777] hover:text-[#8b9bb4]",
                )}
              >
                {f.name}
              </button>
            ))}
          </div>
          {file && <CodeView file={file} />}
        </div>
      </div>

      {children}
    </div>
  );
}
