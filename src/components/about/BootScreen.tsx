"use client";

import { useEffect, useRef, useState } from "react";

type Props = { lines: string[]; skipLabel: string; onDone: () => void };

const STEP_MS = 320;

/** Terminal uslubidagi yuklanish ekrani. Harakat kamaytirilgan bo'lsa — darhol o'tkazib yuboriladi. */
export function BootScreen({ lines, skipLabel, onDone }: Props) {
  const [shown, setShown] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done.current();
      return;
    }
    const timers = lines.map((_, i) => setTimeout(() => setShown(i + 1), (i + 1) * STEP_MS));
    const finish = setTimeout(() => done.current(), lines.length * STEP_MS + 450);
    return () => [...timers, finish].forEach(clearTimeout);
  }, [lines]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0b0d] px-6 font-mono text-sm text-[#b9f5c9]">
      <div className="w-full max-w-md">
        {lines.slice(0, shown).map((line, i) => (
          <p key={i} className="animate-fade-up">
            <span className="text-[#5b8c6e]">{i === 0 ? "$" : "✔"}</span> {line}
          </p>
        ))}
        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-[#b9f5c9] transition-[width] duration-300 ease-out"
            style={{ width: `${Math.round((shown / Math.max(1, lines.length)) * 100)}%` }}
          />
        </div>
      </div>
      <button type="button" onClick={() => done.current()} className="mt-8 text-xs text-white/40 underline-offset-4 hover:underline">
        {skipLabel}
      </button>
    </div>
  );
}
