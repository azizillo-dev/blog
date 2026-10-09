"use client";

import { useEffect, useRef, useState } from "react";

type Props = { lines: string[]; skipLabel: string; onDone: () => void };

const STEP_MS = 560; // har bir qadam orasidagi vaqt
const TAIL_MS = 700; // oxirgi qadamdan keyin ekran yopilguncha
const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/** Terminal uslubidagi yuklanish ekrani. Harakat kamaytirilgan bo'lsa — darhol o'tkazib yuboriladi. */
export function BootScreen({ lines, skipLabel, onDone }: Props) {
  const [shown, setShown] = useState(0);
  const [frame, setFrame] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done.current();
      return;
    }
    const steps = lines.map((_, i) => setTimeout(() => setShown(i + 1), (i + 1) * STEP_MS));
    const spinner = setInterval(() => setFrame((f) => f + 1), 90);
    const finish = setTimeout(() => done.current(), lines.length * STEP_MS + TAIL_MS);
    return () => {
      [...steps, finish].forEach(clearTimeout);
      clearInterval(spinner);
    };
  }, [lines]);

  const percent = Math.round((shown / Math.max(1, lines.length)) * 100);
  const running = shown < lines.length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0b0d] px-6 font-mono text-sm text-[#b9f5c9]">
      <div className="w-full max-w-md">
        {lines.slice(0, shown).map((line, i) => (
          <p key={i} className="animate-fade-up">
            <span className="text-[#5b8c6e]">{i === 0 ? "$" : "✔"}</span> {line}
          </p>
        ))}

        {running && (
          <p className="text-[#5b8c6e]">
            <span aria-hidden>{SPINNER[frame % SPINNER.length]}</span> {lines[shown]?.replace(/…$/, "")}
            <span className="animate-pulse">…</span>
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[#b9f5c9] transition-[width] duration-500 ease-out" style={{ width: `${percent}%` }} />
          </div>
          <span className="w-10 text-right text-xs text-[#5b8c6e]">{percent}%</span>
        </div>
      </div>

      <button type="button" onClick={() => done.current()} className="mt-8 text-xs text-white/40 underline-offset-4 hover:underline">
        {skipLabel}
      </button>
    </div>
  );
}
