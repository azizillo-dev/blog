"use client";

import { useState } from "react";
import type { SceneData } from "@/features/secret/schema";

type Props = { data: SceneData<"GIFT">; onReady: () => void };

/** Quti bosiladi → qopqoq uchadi → havo shari ko'tariladi → shardagi yozuv ochiladi. */
export function GiftScene({ data, onReady }: Props) {
  const [open, setOpen] = useState(false);

  const openBox = () => {
    if (open) return;
    setOpen(true);
    setTimeout(onReady, 1600); // shar ko'tarilib bo'lgach "Keyingisi" chiqsin
  };

  return (
    <div className="relative mx-auto flex h-[26rem] w-full max-w-md items-end justify-center overflow-hidden">
      {open && (
        <div className="balloon-rise absolute bottom-24 flex flex-col items-center">
          <div className="relative grid size-28 place-items-center rounded-[50%_50%_50%_50%/55%_55%_45%_45%] bg-gradient-to-b from-rose-400 to-rose-600 text-sm font-bold text-white shadow-card">
            {data.balloonText}
            <span className="absolute -bottom-1 size-3 rotate-45 bg-rose-600" />
          </div>
          <span className="h-16 w-px bg-fg/30" />
          <div className="max-w-xs rounded-2xl border border-border bg-surface px-4 py-3 text-center shadow-card">
            <p className="whitespace-pre-line text-sm leading-relaxed">{data.message}</p>
            {data.signature && <p className="mt-2 text-xs text-muted">— {data.signature}</p>}
          </div>
        </div>
      )}

      <button type="button" onClick={openBox} disabled={open} className="group relative mb-6 block" aria-label="Qutini ochish">
        {/* qopqoq */}
        <span
          className={`absolute left-1/2 top-0 h-6 w-36 -translate-x-1/2 rounded-md bg-accent transition-transform duration-700 ease-[var(--ease-out)] ${
            open ? "-translate-y-24 rotate-[18deg]" : "group-hover:-translate-y-1"
          }`}
        />
        {/* quti */}
        <span className="mt-6 block size-32 rounded-xl bg-accent/80 shadow-card" />
        {/* lenta */}
        <span className="absolute bottom-0 left-1/2 h-32 w-5 -translate-x-1/2 bg-accent-fg/80" />
        {!open && <span className="mt-4 block text-sm text-muted">Qutini bosing</span>}
      </button>
    </div>
  );
}
