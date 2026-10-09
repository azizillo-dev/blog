"use client";

import { useState } from "react";
import type { SceneData } from "@/features/secret/schema";

type Props = { data: SceneData<"GIFT">; onReady: () => void };

/** Quti bosiladi → qopqoq uchadi, quti so'nadi → havo shari yozuvi bilan ko'tariladi. */
export function GiftScene({ data, onReady }: Props) {
  const [open, setOpen] = useState(false);

  const openBox = () => {
    if (open) return;
    setOpen(true);
    setTimeout(onReady, 1700); // shar ko'tarilib bo'lgach "Keyingisi" chiqsin
  };

  return (
    <div className="relative mx-auto grid min-h-[30rem] w-full max-w-md place-items-center px-4">
      {/* Quti — ochilgach so'nadi va shar uchun joy bo'shatadi */}
      <button
        type="button"
        onClick={openBox}
        disabled={open}
        aria-label="Qutini ochish"
        className={`group absolute transition-[opacity,transform] duration-700 ease-[var(--ease-out)] ${
          open ? "pointer-events-none scale-90 opacity-0" : "opacity-100"
        }`}
      >
        <span className="relative block">
          {/* qopqoq */}
          <span
            className={`absolute -top-5 left-1/2 h-6 w-40 -translate-x-1/2 rounded-md bg-accent shadow-card transition-transform duration-700 ease-[var(--ease-out)] ${
              open ? "-translate-y-20 rotate-[20deg]" : "group-hover:-translate-y-1"
            }`}
          />
          {/* quti va lenta */}
          <span className="block size-36 rounded-2xl bg-accent/85 shadow-card" />
          <span className="absolute inset-y-0 left-1/2 w-5 -translate-x-1/2 bg-accent-fg/70" />
        </span>
        <span className="mt-5 block text-sm text-muted">Qutini bosing</span>
      </button>

      {/* Shar + unga bog'langan yozuv */}
      {open && (
        <div className="balloon-rise flex flex-col items-center">
          <div className="relative grid size-24 place-items-center rounded-[50%_50%_50%_50%/55%_55%_45%_45%] bg-gradient-to-b from-rose-400 to-rose-600 text-sm font-bold text-white shadow-card">
            {data.balloonText}
            <span className="absolute -bottom-1 size-3 rotate-45 bg-rose-600" />
          </div>
          <span className="h-14 w-px bg-fg/30" />
          <div className="max-w-xs rounded-2xl border border-border bg-surface px-5 py-4 text-center shadow-card">
            <p className="whitespace-pre-line leading-relaxed">{data.message}</p>
            {data.signature && <p className="mt-2 text-sm text-muted">— {data.signature}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
