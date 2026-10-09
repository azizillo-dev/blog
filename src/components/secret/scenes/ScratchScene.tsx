"use client";

import { useEffect, useRef, useState } from "react";
import type { SceneData } from "@/features/secret/schema";

type Props = { data: SceneData<"SCRATCH">; onReady: () => void };

const REVEAL_AT = 0.45; // shuncha qismi qirilsa, qolgani o'zi ochiladi

/** Ustidagi "folga" barmoq (yoki sichqoncha) bilan qiriladi — ostidan yozuv chiqadi. */
export function ScratchScene({ data, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#9aa3b2");
    gradient.addColorStop(1, "#6b7280");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "destination-out";

    let drawing = false;
    const scratch = (e: PointerEvent) => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.arc(e.clientX - rect.left, e.clientY - rect.top, 26, 0, Math.PI * 2);
      ctx.fill();
    };
    const start = (e: PointerEvent) => {
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      scratch(e);
    };
    const stop = () => {
      drawing = false;
      // Qancha qirilganini sanaymiz (har 4-pikselni tekshiramiz — yengil bo'lsin)
      const { data: px } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let clear = 0;
      for (let i = 3; i < px.length; i += 16) if (px[i] === 0) clear++;
      if (clear / (px.length / 16) > REVEAL_AT) setRevealed(true);
    };

    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", scratch);
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointerleave", stop);
    return () => {
      canvas.removeEventListener("pointerdown", start);
      canvas.removeEventListener("pointermove", scratch);
      canvas.removeEventListener("pointerup", stop);
      canvas.removeEventListener("pointerleave", stop);
    };
  }, []);

  useEffect(() => {
    if (revealed) onReady();
  }, [revealed, onReady]);

  return (
    <div className="mx-auto w-full max-w-md px-4 text-center">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        <p className="grid min-h-48 place-items-center whitespace-pre-line p-6 text-lg font-semibold leading-relaxed">{data.hidden}</p>
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 size-full touch-none transition-opacity duration-700 ${revealed ? "pointer-events-none opacity-0" : ""}`}
        />
      </div>
      <p className="mt-3 text-sm text-muted">{revealed ? "" : data.hint}</p>
    </div>
  );
}
