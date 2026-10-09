"use client";

import { useEffect, useState } from "react";
import type { SceneData } from "@/features/secret/schema";

type Props = { data: SceneData<"QUIZ">; onReady: () => void };

/** Savol-javob: to'g'ri javobdan keyin keyingisi, oxirida sovg'a-xabar. */
export function QuizScene({ data, onReady }: Props) {
  const [step, setStep] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const finished = step >= data.questions.length;

  useEffect(() => {
    if (finished) onReady();
  }, [finished, onReady]);

  if (finished) {
    return (
      <div className="animate-pop-in mx-auto max-w-md px-4 text-center">
        <p className="text-4xl" aria-hidden>🎉</p>
        <p className="mt-4 whitespace-pre-line text-xl font-semibold leading-relaxed">{data.reward}</p>
      </div>
    );
  }

  const q = data.questions[step];
  const answer = (i: number) => {
    if (i === q.answer) {
      setWrong(null);
      setStep((s) => s + 1);
    } else {
      setWrong(i);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4">
      <p className="text-center text-sm text-muted">
        {step + 1} / {data.questions.length}
      </p>
      <h2 className="mt-2 text-center text-2xl font-bold leading-snug">{q.question}</h2>
      <div className="mt-6 grid gap-2.5">
        {q.options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={() => answer(i)}
            className={`rounded-2xl border px-4 py-3 text-left font-medium transition-colors ${
              wrong === i ? "animate-pop-in border-red-500/60 bg-red-500/10 text-red-500" : "border-border bg-surface hover:border-accent/50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {wrong !== null && <p className="mt-3 text-center text-sm text-muted">Yana bir urinib ko&apos;ring 🙂</p>}
    </div>
  );
}
