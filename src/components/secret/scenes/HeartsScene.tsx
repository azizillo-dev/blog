"use client";

import { useEffect, useRef, useState } from "react";
import type { SceneData } from "@/features/secret/schema";

type Props = { data: SceneData<"HEARTS">; onReady: () => void };
type Heart = { id: number; x: number; y: number; drift: number; size: number };

/** Ekranga bosilsa yuraklar uchadi; kerakli songa yetilsa yashirin xabar ochiladi. */
export function HeartsScene({ data, onReady }: Props) {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [count, setCount] = useState(0);
  const nextId = useRef(0);
  const done = count >= data.target;

  useEffect(() => {
    if (done) onReady();
  }, [done, onReady]);

  const pop = (e: React.PointerEvent<HTMLDivElement>) => {
    if (done) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const heart: Heart = {
      id: nextId.current++,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      drift: Math.round((Math.random() - 0.5) * 120),
      size: 18 + Math.round(Math.random() * 22),
    };
    setHearts((h) => [...h.slice(-40), heart]);
    setCount((c) => c + 1);
    setTimeout(() => setHearts((h) => h.filter((x) => x.id !== heart.id)), 2200);
  };

  return (
    <div
      onPointerDown={pop}
      className="relative mx-auto grid min-h-[22rem] w-full max-w-md touch-none select-none place-items-center overflow-hidden rounded-3xl border border-border bg-surface px-6 text-center shadow-card"
    >
      {hearts.map((h) => (
        <span
          key={h.id}
          style={{ left: h.x, top: h.y, fontSize: h.size, "--drift": `${h.drift}px` } as React.CSSProperties}
          className="heart-float pointer-events-none absolute"
          aria-hidden
        >
          ❤️
        </span>
      ))}

      {done ? (
        <p className="animate-pop-in whitespace-pre-line text-xl font-semibold leading-relaxed">{data.message}</p>
      ) : (
        <div>
          <p className="text-lg font-semibold">Ekranga bosaver 💗</p>
          <p className="mt-2 text-sm text-muted">
            {count} / {data.target}
          </p>
        </div>
      )}
    </div>
  );
}
