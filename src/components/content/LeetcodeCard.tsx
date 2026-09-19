import type { Dictionary } from "@/i18n";
import type { Difficulty, LeetcodeStats } from "@/features/leetcode/stats";
import { SocialIcon } from "@/components/icons";

const LEVELS: { key: Difficulty; label: keyof Dictionary["it"]; color: string }[] = [
  { key: "Easy", label: "easy", color: "#1cb8b8" },
  { key: "Medium", label: "medium", color: "#ffb800" },
  { key: "Hard", label: "hard", color: "#f63737" },
];

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function LeetcodeCard({ stats, dict }: { stats: LeetcodeStats; dict: Dictionary }) {
  const t = dict.it;
  const ratio = stats.total.All ? stats.solved.All / stats.total.All : 0;

  return (
    <a
      href={`https://leetcode.com/u/${encodeURIComponent(stats.username)}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="reveal group block rounded-3xl border border-border bg-surface p-6 shadow-card transition-transform duration-300 ease-[var(--ease-out)] hover:-translate-y-1 sm:p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <SocialIcon platform="leetcode" className="text-[#FFA116]" /> {t.leetcode}
        </h2>
        <span className="text-sm text-muted">@{stats.username}</span>
      </div>

      <div className="flex flex-col items-center gap-8 sm:flex-row">
        <div className="relative size-36 shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--surface-2)" strokeWidth="9" />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
            />
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <span className="text-3xl font-extrabold">{stats.solved.All}</span>
            <span className="text-xs text-muted">{t.solved}</span>
          </div>
        </div>

        <ul className="w-full space-y-4">
          {LEVELS.map(({ key, label, color }) => {
            const pct = stats.total[key] ? (stats.solved[key] / stats.total[key]) * 100 : 0;
            return (
              <li key={key}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-semibold" style={{ color }}>{t[label]}</span>
                  <span className="text-muted">
                    <b className="text-fg">{stats.solved[key]}</b> / {stats.total[key]}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="animate-grow-x h-full origin-left rounded-full" style={{ background: color, transform: `scaleX(${pct / 100})` }} />
                </div>
              </li>
            );
          })}
          {stats.ranking && (
            <li className="pt-1 text-sm text-muted">
              {t.ranking}: <b className="text-fg">#{stats.ranking.toLocaleString("en-US")}</b>
            </li>
          )}
        </ul>
      </div>
    </a>
  );
}
