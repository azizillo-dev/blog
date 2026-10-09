import Image from "next/image";
import { DownloadIcon, SocialIcon } from "@/components/icons";

type Props = {
  name: string;
  role: string;
  avatar: string;
  stack: string[];
  cv: { url: string; label: string };
  socials: { label: string; url: string; platform: string }[];
  stats: { label: string; value: string }[];
};

/** Koinot fonidagi tanishuv: chapda rasm, o'ngda kod uslubidagi kartochka. Butunlay CSS — JS yo'q. */
export function CosmicHero({ name, role, avatar, stack, cv, socials, stats }: Props) {
  const codeLine = `const dev = { stack: ${JSON.stringify(stack.slice(0, 3))} }`;

  return (
    <section className="cosmos -mx-4 rounded-none px-4 py-14 text-white sm:-mx-6 sm:rounded-3xl sm:px-8 sm:py-16">
      {/* fon: yulduzlar */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="stars stars-sm" />
        <div className="stars stars-md" />
        <div className="stars stars-lg" />
        {/* sayyora */}
        <div className="absolute -right-16 top-10 size-40 rounded-full bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/10 blur-2xl sm:size-56" />
        <Rocket className="rocket top-[14%] hidden sm:block" style={{ "--dur": "26s", "--delay": "1.5s" } as React.CSSProperties} />
        <Rocket className="rocket top-[66%] scale-[0.6] opacity-70" style={{ "--dur": "38s", "--delay": "11s" } as React.CSSProperties} />
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10">
        {/* chap: rasm + orbita */}
        <div className="relative shrink-0">
          <div aria-hidden className="orbit absolute -inset-5 rounded-full border border-dashed border-white/20">
            <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-sky-300 shadow-[0_0_12px_3px_rgba(125,211,252,0.6)]" />
          </div>
          <div className="relative size-32 overflow-hidden rounded-full border-2 border-white/20 shadow-[0_0_40px_rgba(99,102,241,0.35)] sm:size-40">
            {avatar ? (
              <Image src={avatar} alt={name} fill priority sizes="160px" className="object-cover" />
            ) : (
              <div className="grid size-full place-items-center bg-white/5 font-mono text-3xl">{name.charAt(0)}</div>
            )}
          </div>
        </div>

        {/* o'ng: matn */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="font-mono text-xs text-sky-300/80">~/azizillo $ whoami</p>
          <h1 className="mt-2 break-words text-3xl font-extrabold tracking-tight sm:text-4xl">{name}</h1>
          {role && <p className="mt-1.5 text-white/70">{role}</p>}

          <p className="mt-4 overflow-hidden font-mono text-[11px] text-emerald-300/90 sm:text-xs">
            <span className="typeline">{codeLine}</span>
          </p>

          {stack.length > 0 && (
            <ul className="mt-5 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {stack.slice(0, 8).map((s) => (
                <li key={s} className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-white/80 backdrop-blur-sm">
                  {s}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {cv.url && (
              <a
                href={cv.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0a0f24] transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                <DownloadIcon /> {cv.label}
              </a>
            )}
            {socials.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <SocialIcon platform={s.platform} size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* pastdagi raqamlar */}
      {stats.length > 0 && (
        <dl className="relative mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center backdrop-blur-sm">
              <dt className="order-2 mt-1 text-[11px] uppercase tracking-wider text-white/50">{s.label}</dt>
              <dd className="order-1 font-mono text-2xl font-bold">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/** O'ngga uchayotgan raketa: dumi — olov izi, tanasi oq, oynasi moviy. */
function Rocket({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 40" width="110" height="36" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="rk-trail" x1="0" x2="1">
          <stop offset="0" stopColor="#f59e0b" stopOpacity="0" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="rk-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c7d2e5" />
        </linearGradient>
      </defs>

      {/* iz */}
      <path d="M0 20h34" stroke="url(#rk-trail)" strokeWidth="2.5" strokeLinecap="round" />
      {/* olov */}
      <path d="M36 20c6-7 10-7 14 0-4 7-8 7-14 0Z" fill="#fb923c" />
      <path d="M40 20c4-4 6-4 9 0-3 4-5 4-9 0Z" fill="#fde68a" />
      {/* qanotlar */}
      <path d="M62 14 54 6c-3 4-3 8-1 11Z" fill="#8b9bb4" />
      <path d="M62 26 54 34c-3-4-3-8-1-11Z" fill="#8b9bb4" />
      {/* tanasi */}
      <path d="M50 20c0-7 12-12 28-12 14 0 30 5 36 12-6 7-22 12-36 12-16 0-28-5-28-12Z" fill="url(#rk-body)" />
      {/* oyna */}
      <circle cx="92" cy="20" r="5" fill="#0ea5e9" />
      <circle cx="90" cy="18" r="1.6" fill="#bae6fd" />
      {/* chiziq */}
      <path d="M62 20h16" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
