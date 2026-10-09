import type { CodeProfile } from "./profile";

export type CodeLang = "md" | "json" | "sql" | "ts" | "sh";
export type CodeFile = { name: string; lang: CodeLang; lines: string[] };

const quote = (s: string) => JSON.stringify(s ?? "");

/** Profilni "fayllar"ga aylantiradi — IDE ko'rinishida shular ochiladi. */
export function buildFiles(p: CodeProfile): CodeFile[] {
  const files: CodeFile[] = [];

  files.push({
    name: "about.md",
    lang: "md",
    lines: [`# ${p.name || "—"}`, p.role && `> ${p.role}`, "", ...p.summary, "", "<!-- CV: contact.sh ichida -->"].filter(
      (l): l is string => typeof l === "string",
    ),
  });

  if (p.experience.length > 0) {
    files.push({
      name: "experience.json",
      lang: "json",
      lines: [
        "[",
        ...p.experience.flatMap((e, i) => {
          const last = i === p.experience.length - 1;
          return [
            "  {",
            `    "role": ${quote(e.title)},`,
            `    "company": ${quote(e.org)},`,
            `    "period": ${quote(e.period)},`,
            `    "location": ${quote(e.location)},`,
            `    "summary": ${quote(e.description.replace(/\s+/g, " ").trim())}`,
            last ? "  }" : "  },",
          ];
        }),
        "]",
      ],
    });
  }

  if (p.education.length > 0) {
    files.push({
      name: "education.sql",
      lang: "sql",
      lines: [
        "-- ta'lim yo'li",
        "SELECT degree, institution, period",
        "FROM education",
        "ORDER BY started DESC;",
        "",
        ...p.education.flatMap((e) => [`-- ${e.period}`, `${e.title} @ ${e.org}${e.location ? ` (${e.location})` : ""}`, ""]),
      ],
    });
  }

  if (p.skills.length > 0) {
    files.push({
      name: "skills.ts",
      lang: "ts",
      lines: [
        "export const skills = [",
        ...p.skills.map((s) => `  ${quote(s)},`),
        "] as const;",
        "",
        `// jami: ${p.skills.length} ta`,
      ],
    });
  }

  if (p.projects.length > 0) {
    files.push({
      name: "projects.json",
      lang: "json",
      lines: [
        "[",
        ...p.projects.flatMap((pr, i) => [
          "  {",
          `    "name": ${quote(pr.title)},`,
          `    "stack": [${pr.tech.map(quote).join(", ")}],`,
          `    "url": ${quote(pr.demo || pr.href)}`,
          i === p.projects.length - 1 ? "  }" : "  },",
        ]),
        "]",
      ],
    });
  }

  files.push({
    name: "contact.sh",
    lang: "sh",
    lines: [
      "#!/bin/sh",
      "# bog'lanish uchun",
      "",
      ...p.socials.map((s) => `open ${s.url}   # ${s.label}`),
      p.cvUrl ? `curl -O ${p.cvUrl}   # CV (PDF)` : "# CV hali yuklanmagan",
    ],
  });

  return files;
}
