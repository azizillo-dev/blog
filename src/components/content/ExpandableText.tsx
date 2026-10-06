"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  /** Yig'ilgan holatda ko'rinadigan qatorlar soni */
  lines?: number;
  labels: { expand: string; collapse: string };
  className?: string;
};

/**
 * Matnni `lines` qatorga qisqartiradi va kerak bo'lsa "Batafsil" tugmasini ko'rsatadi.
 * Tugma faqat matn haqiqatan sig'masa chiqadi (balandlik o'lchanadi), shuning uchun
 * qisqa tavsifli kartalarda ortiqcha element paydo bo'lmaydi.
 */
export function ExpandableText({ text, lines = 4, labels, className }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight - el.clientHeight > 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, lines]);

  return (
    <div className={className}>
      <p
        ref={ref}
        style={open ? undefined : ({ WebkitLineClamp: lines } as React.CSSProperties)}
        className={cn("whitespace-pre-line leading-relaxed text-muted", !open && "overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical]")}
      >
        {text}
      </p>
      {(overflows || open) && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-1.5 text-sm font-semibold text-accent transition-opacity hover:opacity-80"
        >
          {open ? labels.collapse : labels.expand}
        </button>
      )}
    </div>
  );
}
