"use client";

import { useEffect, useRef, useState } from "react";
import type { CodeProfile } from "@/features/about/profile";
import { QUICK_COMMANDS, completeCommand, runCommand, type CommandLabels, type OutLine } from "@/features/about/commands";
import { cn } from "@/lib/utils";

type Entry = { prompt?: string; lines: OutLine[] };

type Props = {
  profile: CodeProfile;
  labels: CommandLabels;
  hint: string;
  onTheme: () => void;
  onPlain: () => void;
};

const TONE = {
  muted: "text-[#637777]",
  accent: "text-[#addb67]",
  error: "text-[#f07178]",
  link: "text-[#82aaff] underline underline-offset-2 hover:opacity-80",
} as const;

/** Haqiqiy ishlaydigan mini-terminal: buyruq → javob. Tarix ↑/↓, to'ldirish Tab bilan. */
export function Terminal({ profile, labels, hint, onTheme, onPlain }: Props) {
  const [entries, setEntries] = useState<Entry[]>([{ lines: runCommand("whoami", profile, labels).lines }]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [entries]);

  const execute = (raw: string) => {
    const input = raw.trim();
    if (!input) return;
    const result = runCommand(input, profile, labels);
    setHistory((h) => [input, ...h]);
    setCursor(-1);
    setValue("");

    if (result.action?.type === "clear") {
      setEntries([]);
      return;
    }
    setEntries((list) => [...list, { prompt: input, lines: result.lines }]);
    if (result.action?.type === "theme") onTheme();
    if (result.action?.type === "plain") onPlain();
    if (result.action?.type === "open") window.open(result.action.href, "_blank", "noopener");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") return execute(value);
    if (e.key === "Tab") {
      e.preventDefault();
      const completed = completeCommand(value);
      if (completed) setValue(completed);
      return;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      if (history.length === 0) return;
      e.preventDefault();
      const next = e.key === "ArrowUp" ? Math.min(cursor + 1, history.length - 1) : Math.max(cursor - 1, -1);
      setCursor(next);
      setValue(next === -1 ? "" : history[next]);
    }
  };

  return (
    <div className="border-t border-white/10 bg-[#0b1020] font-mono text-[13px] text-[#d6deeb]">
      <div className="flex flex-wrap gap-1.5 border-b border-white/10 px-3 py-2">
        {QUICK_COMMANDS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => execute(c)}
            className="rounded-md border border-white/10 px-2 py-1 text-xs text-[#82aaff] transition-colors hover:bg-white/5"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="max-h-80 overflow-y-auto px-3 py-3 sm:px-5">
        {entries.map((entry, i) => (
          <div key={i} className="mb-2">
            {entry.prompt && (
              <p className="text-[#637777]">
                <span className="text-[#addb67]">$</span> {entry.prompt}
              </p>
            )}
            {entry.lines.map((line, k) =>
              line.href ? (
                <a key={k} href={line.href} target={line.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cn("block", TONE.link)}>
                  {line.text}
                </a>
              ) : (
                <p key={k} className={cn("whitespace-pre-wrap break-words", line.tone && TONE[line.tone])}>
                  {line.text || " "}
                </p>
              ),
            )}
          </div>
        ))}
        <div ref={bottomRef} />

        <label className="flex items-center gap-2">
          <span className="text-[#addb67]" aria-hidden>$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            aria-label="terminal"
            placeholder={hint}
            className="w-full bg-transparent caret-[#addb67] outline-none placeholder:text-[#3c4b63]"
          />
        </label>
      </div>
    </div>
  );
}
