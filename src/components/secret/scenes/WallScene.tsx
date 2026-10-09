"use client";

import { useEffect } from "react";
import type { SceneData } from "@/features/secret/schema";

type Props = { data: SceneData<"WALL">; onReady: () => void };

const TILTS = ["-2.5deg", "1.5deg", "-1deg", "2deg", "-1.8deg", "1deg"];

/** Devorga yopishtirilgan qog'ozlar: har biri o'z burchagi bilan, navbatma-navbat paydo bo'ladi. */
export function WallScene({ data, onReady }: Props) {
  const notes = data.notes.filter((n) => n.text);
  useEffect(onReady, [onReady]);

  return (
    <div className="wall-bg mx-auto w-full max-w-3xl rounded-3xl border border-border p-4 sm:p-8">
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {notes.map((note, i) => (
          <figure
            key={i}
            style={{ "--i": i, rotate: TILTS[i % TILTS.length] } as React.CSSProperties}
            className="animate-fade-up mb-4 break-inside-avoid rounded-xl bg-[#fdf6e3] p-4 text-[#3b3328] shadow-card"
          >
            <blockquote className="whitespace-pre-line font-[family-name:var(--font-hand,inherit)] text-lg leading-snug">{note.text}</blockquote>
            {note.author && <figcaption className="mt-3 text-right text-sm opacity-70">— {note.author}</figcaption>}
          </figure>
        ))}
      </div>
    </div>
  );
}
