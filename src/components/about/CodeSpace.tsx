"use client";

import { useEffect, useState } from "react";
import type { CodeProfile } from "@/features/about/profile";
import { buildFiles } from "@/features/about/files";
import type { CommandLabels } from "@/features/about/commands";
import { applyTheme, currentTheme } from "@/lib/theme-client";
import { BootScreen } from "./BootScreen";
import { IdeWindow } from "./IdeWindow";
import { Terminal } from "./Terminal";

export type CodeSpaceLabels = {
  boot: string[];
  skip: string;
  plainView: string;
  codeView: string;
  hint: string;
  commands: CommandLabels;
};

type Props = { profile: CodeProfile; labels: CodeSpaceLabels; classic: React.ReactNode };

const VIEW_KEY = "about-view"; // "plain" | "code"
const BOOT_KEY = "about-booted";

/**
 * About sahifasining ikki ko'rinishi: "code space" (IDE + terminal) va oddiy.
 * `classic` — serverda render qilingan oddiy ko'rinish: DOM'da qoladi, shuning uchun
 * qidiruv tizimlari va skrinrider matnni baribir o'qiydi.
 */
export function CodeSpace({ profile, labels, classic }: Props) {
  const [ready, setReady] = useState(false); // brauzer tanlovini o'qigunicha hech narsa almashtirmaymiz
  const [plain, setPlain] = useState(false);
  const [booting, setBooting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    const wantPlain = saved === "plain";
    setPlain(wantPlain);
    setBooting(!wantPlain && sessionStorage.getItem(BOOT_KEY) !== "1");
    setReady(true);
  }, []);

  const choose = (next: "plain" | "code") => {
    setPlain(next === "plain");
    localStorage.setItem(VIEW_KEY, next);
  };

  const finishBoot = () => {
    sessionStorage.setItem(BOOT_KEY, "1");
    setBooting(false);
  };

  // Server bilan bir xil bo'lishi uchun: tanlov o'qilmaguncha oddiy ko'rinish turadi
  if (!ready || plain) {
    return (
      <>
        <div className="flex justify-end pt-6">
          <ViewToggle label={labels.codeView} onClick={() => choose("code")} />
        </div>
        {classic}
      </>
    );
  }

  return (
    <>
      {booting && <BootScreen lines={labels.boot} skipLabel={labels.skip} onDone={finishBoot} />}

      <div className="py-8 sm:py-12">
        <div className="mb-3 flex justify-end">
          <ViewToggle label={labels.plainView} onClick={() => choose("plain")} />
        </div>

        <IdeWindow files={buildFiles(profile)} name={profile.name}>
          <Terminal
            profile={profile}
            labels={labels.commands}
            hint={labels.hint}
            onTheme={() => applyTheme(currentTheme() === "dark" ? "light" : "dark")}
            onPlain={() => choose("plain")}
          />
        </IdeWindow>
      </div>

      {/* Oddiy ko'rinish DOM'da qoladi (SEO va skrinriderlar uchun), lekin ko'rinmaydi */}
      <div hidden>{classic}</div>
    </>
  );
}

function ViewToggle({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-fg"
    >
      {label}
    </button>
  );
}
