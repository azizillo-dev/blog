import { describe, expect, it } from "vitest";
import { buildFiles } from "@/features/about/files";
import { highlightLine } from "@/features/about/highlight";
import { completeCommand, runCommand } from "@/features/about/commands";
import type { CodeProfile } from "@/features/about/profile";

const profile: CodeProfile = {
  name: "Azizillo Nabiyev",
  role: "Backend developer",
  avatar: "",
  summary: ["Men TATU talabasiman.", "Backend yozaman."],
  experience: [{ title: "Intern", org: "Acme", period: "2025 — hozir", location: "Toshkent", description: "Servislar\n  yozdim." }],
  education: [{ title: "Bakalavr", org: "TATU", period: "2025 — 2029", location: "Toshkent" }],
  skills: ["TypeScript", "Go"],
  projects: [{ title: "Mentor AI", tech: ["Flutter", "FastAPI"], href: "/uz/projects/mentor-ai", demo: "https://m.ai", source: "" }],
  posts: [{ title: "TATU", href: "/uz/blog/tatu", date: "19-sen" }],
  socials: [{ label: "GitHub", url: "https://github.com/x" }],
  cvUrl: "https://cdn/cv.pdf",
  leetcode: { solved: 120, ranking: 50000, username: "azizillo" },
  links: { posts: "/uz/posts", projects: "/uz/projects", certificates: "/uz/certificates" },
  counts: { posts: 4, projects: 3, certificates: 5 },
};

describe("code space files", () => {
  it("builds one file per section with valid JSON payloads", () => {
    const files = buildFiles(profile);
    expect(files.map((f) => f.name)).toEqual(["about.md", "experience.json", "education.sql", "skills.ts", "projects.json", "contact.sh"]);

    const json = (name: string) => JSON.parse(files.find((f) => f.name === name)!.lines.join("\n"));
    expect(json("experience.json")[0]).toMatchObject({ role: "Intern", company: "Acme" });
    // Ko'p qatorli tavsif bitta qatorga siqiladi — JSON buzilmasin
    expect(json("experience.json")[0].summary).toBe("Servislar yozdim.");
    expect(json("projects.json")[0]).toMatchObject({ name: "Mentor AI", stack: ["Flutter", "FastAPI"] });
  });

  it("skips empty sections but always keeps about.md and contact.sh", () => {
    const empty = { ...profile, experience: [], education: [], skills: [], projects: [] };
    expect(buildFiles(empty).map((f) => f.name)).toEqual(["about.md", "contact.sh"]);
  });
});

describe("highlight", () => {
  it("marks json keys, strings and numbers apart", () => {
    const tones = highlightLine('  "role": "Intern", 42', "json").filter((t) => t.text.trim());
    expect(tones.map((t) => [t.text, t.tone])).toEqual([
      ['"role"', "key"],
      [":", "punct"],
      ['"Intern"', "string"],
      [",", "punct"],
      ["42", "number"],
    ]);
  });

  it("marks comments and keywords", () => {
    expect(highlightLine("SELECT degree -- izoh", "sql").map((t) => t.tone)).toContain("keyword");
    expect(highlightLine("SELECT degree -- izoh", "sql").at(-1)).toEqual({ text: "-- izoh", tone: "comment" });
    expect(highlightLine("# sarlavha", "md")).toEqual([{ text: "# sarlavha", tone: "keyword" }]);
  });
});

describe("terminal commands", () => {
  it("answers the basics from profile data", () => {
    expect(runCommand("whoami", profile).lines[0].text).toBe("Azizillo Nabiyev");
    expect(runCommand("skills", profile).lines[0].text).toContain("TypeScript");
    expect(runCommand("skills --all", profile).lines).toHaveLength(2);
    expect(runCommand("leetcode", profile).lines[1].text).toContain("120");
  });

  it("returns actions instead of touching the UI", () => {
    expect(runCommand("clear", profile).action).toEqual({ type: "clear" });
    expect(runCommand("theme", profile).action).toEqual({ type: "theme" });
    expect(runCommand("cv", profile).action).toEqual({ type: "open", href: "https://cdn/cv.pdf" });
    expect(runCommand("cv", { ...profile, cvUrl: "" }).action).toBeUndefined();
  });

  it("explains unknown commands and completes known ones", () => {
    expect(runCommand("dir", profile).lines[0]).toMatchObject({ tone: "error" });
    expect(completeCommand("exp")).toBe("experience");
    expect(completeCommand("c")).toBeNull(); // contact, cv, clear — bittasi emas
  });

  it("handles an empty profile without crashing", () => {
    const blank: CodeProfile = { ...profile, summary: [], skills: [], projects: [], posts: [], socials: [], leetcode: null };
    for (const cmd of ["whoami", "about", "skills", "projects", "blog", "contact", "leetcode", "neofetch"]) {
      expect(() => runCommand(cmd, blank)).not.toThrow();
    }
  });
});
