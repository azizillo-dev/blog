"use client";

import { useEffect, useState } from "react";
import { BootScreen } from "./BootScreen";

type Props = { lines: string[]; skipLabel: string; children: React.ReactNode };

const SEEN_KEY = "about-boot-seen";

/**
 * Yuklanish ekrani brauzer sessiyasida bir marta ko'rsatiladi: boshqa bo'limga o'tib qaytilsa
 * qayta chiqmaydi, brauzer yopilib qayta ochilsa — yana chiqadi.
 */
export function BootGate({ lines, skipLabel, children }: Props) {
  // null — hali bilmaymiz (sessionStorage faqat brauzerda o'qiladi)
  const [booting, setBooting] = useState<boolean | null>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // yashirin rejim va h.k. — har ehtimolga qarshi ko'rsatmaymiz
      seen = true;
    }
    setBooting(!seen);
  }, []);

  const finish = () => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setBooting(false);
  };

  return (
    <>
      {booting && <BootScreen lines={lines} skipLabel={skipLabel} onDone={finish} />}
      {/* Kontent doim DOM'da — qidiruv tizimlari va skrinriderlar uchun */}
      <div className={booting === false ? "animate-fade-up" : "invisible"}>{children}</div>
    </>
  );
}
