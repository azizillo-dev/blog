"use client";

import { useEffect, useState } from "react";
import type { SceneData } from "@/features/secret/schema";

type Props = { data: SceneData<"STORY">; onReady: () => void };

/** Bitta gap ko'rinadi; bosilsa keyingisi. Oxirgisida "Keyingisi" tugmasi ochiladi. */
export function StoryScene({ data, onReady }: Props) {
  const lines = data.lines.filter(Boolean);
  const [i, setI] = useState(0);
  const last = i >= lines.length - 1;

  useEffect(() => {
    if (last) onReady();
  }, [last, onReady]);

  return (
    <button
      type="button"
      onClick={() => setI((v) => Math.min(v + 1, lines.length - 1))}
      className="mx-auto block w-full max-w-xl cursor-pointer px-4 text-center"
      aria-label="Keyingi gap"
    >
      <p key={i} className="animate-fade-up text-2xl font-semibold leading-snug sm:text-3xl">
        {lines[i]}
      </p>
      {!last && <span className="mt-8 inline-block text-sm text-muted">bosing…</span>}
    </button>
  );
}
