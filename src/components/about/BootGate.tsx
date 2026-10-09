"use client";

import { useState } from "react";
import { BootScreen } from "./BootScreen";

type Props = { lines: string[]; skipLabel: string; children: React.ReactNode };

/**
 * Sahifa ochilganda yuklanish ekranini ko'rsatadi. Har safar — boshqa bo'limga o'tib qaytilsa ham,
 * chunki komponent qaytadan ulanadi (hech qayerda eslab qolinmaydi).
 */
export function BootGate({ lines, skipLabel, children }: Props) {
  const [booting, setBooting] = useState(true);

  return (
    <>
      {booting && <BootScreen lines={lines} skipLabel={skipLabel} onDone={() => setBooting(false)} />}
      {/* Kontent doim DOM'da — qidiruv tizimlari va skrinriderlar uchun */}
      <div className={booting ? "invisible" : "animate-fade-up"}>{children}</div>
    </>
  );
}
