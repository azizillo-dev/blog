import type { CodeProfile } from "./profile";

export type OutLine = { text: string; tone?: "muted" | "accent" | "error" | "link"; href?: string; /** qatorni o'ramasdan ko'rsatish (neofetch ustunlari) */ pre?: boolean };
export type CommandResult = { lines: OutLine[]; action?: { type: "clear" } | { type: "theme" } | { type: "plain" } | { type: "open"; href: string } };

export const COMMANDS = [
  "help",
  "whoami",
  "about",
  "skills",
  "experience",
  "education",
  "projects",
  "blog",
  "contact",
  "cv",
  "leetcode",
  "neofetch",
  "theme",
  "ui",
  "sudo",
  "clear",
] as const;
export type CommandName = (typeof COMMANDS)[number];

/** Tugmalar qatorida ko'rsatiladigan buyruqlar (mehmon yozmasa ham bo'ladi). */
export const QUICK_COMMANDS: CommandName[] = ["whoami", "skills", "experience", "projects", "cv", "neofetch"];

export type CommandLabels = {
  helpTitle: string;
  empty: string;
  emptyCv: string;
  allHint: string;
  unknown: string;
  sudo: string;
  loadingCv: string;
  themeSwitched: string;
  switchingUi: string;
  all: string;
  allPosts: string;
  solved: string;
  ranking: string;
};

export const UZ_LABELS: CommandLabels = {
  helpTitle: "Mavjud buyruqlar:",
  empty: "Hali kiritilmagan.",
  emptyCv: "CV hali yuklanmagan.",
  allHint: "to'liq ro'yxat: skills --all",
  unknown: "bunday buyruq yo'q. \"help\" deb yozing.",
  sudo: "sudoers faylida yo'q. Bu hodisa qayd etildi.",
  loadingCv: "CV yuklanmoqda…",
  themeSwitched: "rejim almashtirildi",
  switchingUi: "oddiy ko'rinishga o'tilmoqda…",
  all: "Hammasi →",
  allPosts: "Barcha postlar →",
  solved: "yechilgan masalalar",
  ranking: "reyting",
};

const p = (text: string, tone?: OutLine["tone"]): OutLine => ({ text, tone });
const link = (text: string, href: string): OutLine => ({ text, href, tone: "link" });

const HELP: [string, string][] = [
  ["whoami", "qisqacha tanishuv"],
  ["about", "men haqimda to'liq matn"],
  ["skills", "ko'nikmalar ro'yxati"],
  ["experience", "ish tajribasi"],
  ["education", "ta'lim"],
  ["projects", "loyihalar va havolalar"],
  ["blog", "so'nggi postlar"],
  ["contact", "ijtimoiy tarmoqlar"],
  ["cv", "CV (PDF) yuklab olish"],
  ["leetcode", "LeetCode statistikasi"],
  ["neofetch", "profil kartasi"],
  ["theme", "qorong'i / yorug' rejim"],
  ["ui", "oddiy ko'rinishga o'tish"],
  ["clear", "ekranni tozalash"],
];

/** Buyruqni bajaradi. Sof funksiya — UI holatini o'zgartirish `action` orqali qaytariladi. */
export function runCommand(input: string, profile: CodeProfile, t: CommandLabels = UZ_LABELS): CommandResult {
  const [name = "", ...args] = input.trim().split(/\s+/);
  const cmd = name.toLowerCase();
  const flags = args.map((a) => a.toLowerCase());

  switch (cmd) {
    case "":
      return { lines: [] };

    case "help":
      return { lines: [p(t.helpTitle, "accent"), ...HELP.map(([c, d]) => p(`  ${c.padEnd(12)} ${d}`, "muted"))] };

    case "whoami":
      return {
        lines: [
          p(profile.name || "—", "accent"),
          profile.role ? p(profile.role, "muted") : p("", "muted"),
          ...(profile.summary[0] ? [p(""), p(profile.summary[0])] : []),
        ],
      };

    case "about":
      return { lines: profile.summary.length ? profile.summary.map((l) => p(l)) : [p(t.empty, "muted")] };

    case "skills":
      if (profile.skills.length === 0) return { lines: [p(t.empty, "muted")] };
      return {
        lines: flags.includes("--all")
          ? profile.skills.map((s) => p(`  • ${s}`))
          : [p(profile.skills.join("  ·  ")), p(`${profile.skills.length} · ${t.allHint}`, "muted")],
      };

    case "experience":
      if (profile.experience.length === 0) return { lines: [p(t.empty, "muted")] };
      return {
        lines: profile.experience.flatMap((e) => [
          p(`${e.title} @ ${e.org}`, "accent"),
          p(`  ${e.period}${e.location ? ` · ${e.location}` : ""}`, "muted"),
          ...(e.description ? [p(`  ${e.description.replace(/\s+/g, " ").trim()}`)] : []),
          p(""),
        ]),
      };

    case "education":
      if (profile.education.length === 0) return { lines: [p(t.empty, "muted")] };
      return {
        lines: profile.education.flatMap((e) => [p(`${e.title} @ ${e.org}`, "accent"), p(`  ${e.period}`, "muted"), p("")]),
      };

    case "projects":
      if (profile.projects.length === 0) return { lines: [p(t.empty, "muted")] };
      return {
        lines: [
          ...profile.projects.flatMap((pr) => [
            link(`${pr.title} ↗`, pr.href),
            p(`  ${pr.tech.slice(0, 6).join(", ")}`, "muted"),
          ]),
          p(""),
          link(t.all, profile.links.projects),
        ],
      };

    case "blog":
      if (profile.posts.length === 0) return { lines: [p(t.empty, "muted")] };
      return {
        lines: [...profile.posts.map((post) => link(`${post.date}  ${post.title}`, post.href)), p(""), link(t.allPosts, profile.links.posts)],
      };

    case "contact":
      if (profile.socials.length === 0) return { lines: [p(t.empty, "muted")] };
      return { lines: profile.socials.map((s) => link(`${s.label}: ${s.url}`, s.url)) };

    case "cv":
      return profile.cvUrl
        ? { lines: [p(t.loadingCv, "muted")], action: { type: "open", href: profile.cvUrl } }
        : { lines: [p(t.emptyCv, "error")] };

    case "leetcode":
      return profile.leetcode
        ? {
            lines: [
              p(`@${profile.leetcode.username}`, "accent"),
              p(`  ${t.solved}: ${profile.leetcode.solved}`),
              p(`  ${t.ranking}: #${profile.leetcode.ranking.toLocaleString("en-US")}`),
            ],
          }
        : { lines: [p(t.empty, "muted")] };

    case "neofetch":
      return { lines: neofetch(profile) };

    case "theme":
      return { lines: [p(t.themeSwitched, "muted")], action: { type: "theme" } };

    case "ui":
      return { lines: [p(t.switchingUi, "muted")], action: { type: "plain" } };

    case "sudo":
      return { lines: [p(`${profile.name}: ${t.sudo}`, "error")] };

    case "clear":
      return { lines: [], action: { type: "clear" } };

    default:
      return { lines: [p(`${cmd}: ${t.unknown}`, "error")] };
  }
}

const LOGO = ["   ╭───────╮", "   │  ◉ ◉  │", "   │   ▾   │", "   ╰───────╯", "   </ dev >"];

function neofetch(profile: CodeProfile): OutLine[] {
  const cut = (s: string, n = 34) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const info: string[] = [
    `${profile.name}`,
    "─".repeat(Math.max(8, profile.name.length)),
    profile.role && `role:     ${profile.role}`,
    profile.education[0] && `edu:      ${cut(profile.education[0].org)}`,
    profile.skills.length > 0 && `stack:    ${cut(profile.skills.slice(0, 4).join(", "))}`,
    `posts:    ${profile.counts.posts}`,
    `projects: ${profile.counts.projects}`,
    `certs:    ${profile.counts.certificates}`,
    profile.leetcode && `leetcode: ${profile.leetcode.solved} ta masala`,
  ].filter((x): x is string => Boolean(x));

  const rows = Math.max(LOGO.length, info.length);
  return Array.from({ length: rows }, (_, i) => ({
    text: `${(LOGO[i] ?? "").padEnd(14)}${info[i] ?? ""}`,
    pre: true,
  }));
}

/** Tab bilan to'ldirish uchun. */
export function completeCommand(prefix: string): string | null {
  const matches = COMMANDS.filter((c) => c.startsWith(prefix.toLowerCase()));
  return matches.length === 1 ? matches[0] : null;
}
