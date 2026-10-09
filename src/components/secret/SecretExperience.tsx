"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SceneView } from "@/features/secret/queries";
import type { SceneData } from "@/features/secret/schema";
import { StoryScene } from "./scenes/StoryScene";
import { WallScene } from "./scenes/WallScene";
import { GiftScene } from "./scenes/GiftScene";
import { ScratchScene } from "./scenes/ScratchScene";
import { GalleryScene } from "./scenes/GalleryScene";
import { HeartsScene } from "./scenes/HeartsScene";
import { QuizScene } from "./scenes/QuizScene";

export type SceneProps<K extends keyof typeof renderers = never> = {
  data: SceneData;
  /** Sahna "tugadi" — pastda "Keyingisi" tugmasi paydo bo'ladi. */
  onReady: () => void;
  _k?: K;
};

const renderers = {
  STORY: StoryScene,
  WALL: WallScene,
  GIFT: GiftScene,
  SCRATCH: ScratchScene,
  GALLERY: GalleryScene,
  HEARTS: HeartsScene,
  QUIZ: QuizScene,
} as const;

type Props = { title: string; intro: string; nextLabel: string; scenes: SceneView[] };

/** Sahnalarni birin-ketin ko'rsatadi: har sahna tugagach "Keyingisi" tugmasi chiqadi. */
export function SecretExperience({ title, intro, nextLabel, scenes }: Props) {
  const [index, setIndex] = useState(-1); // -1 — kirish ekrani
  const [ready, setReady] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const onReady = useCallback(() => setReady(true), []);
  const go = (next: number) => {
    setReady(false);
    setIndex(next);
  };

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [index]);

  const scene = scenes[index];
  const Scene = scene ? renderers[scene.kind] : null;
  const last = index === scenes.length - 1;

  return (
    <div ref={topRef} className="flex min-h-[70vh] flex-col items-center justify-center py-10">
      {index === -1 ? (
        <div className="animate-fade-up text-center">
          {title && <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>}
          {intro && <p className="mx-auto mt-4 max-w-md whitespace-pre-line leading-relaxed text-muted">{intro}</p>}
          <button type="button" onClick={() => go(0)} className="btn-soft mt-8">
            {nextLabel} <span aria-hidden>→</span>
          </button>
        </div>
      ) : scene && Scene ? (
        <div key={scene.id} className="animate-fade-up w-full">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- har sahna o'z data turini kutadi */}
          <Scene data={scene.data as any} onReady={onReady} />
          <div className="mt-10 flex flex-col items-center gap-3">
            {ready && !last && (
              <button type="button" onClick={() => go(index + 1)} className="btn-soft animate-pop-in">
                {nextLabel} <span aria-hidden>→</span>
              </button>
            )}
            {ready && last && (
              <button type="button" onClick={() => go(-1)} className="text-sm font-semibold text-muted transition-colors hover:text-fg">
                ↺ Boshidan
              </button>
            )}
            <div className="flex gap-1.5" aria-hidden>
              {scenes.map((s, i) => (
                <span key={s.id} className={`size-1.5 rounded-full transition-colors ${i <= index ? "bg-accent" : "bg-border"}`} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
