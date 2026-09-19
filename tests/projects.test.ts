import { describe, expect, it } from "vitest";
import { parseTechnologies } from "@/features/projects/technologies";

describe("projects", () => {
  it("parses technologies: trims, drops empty and case-insensitive duplicates", () => {
    expect(parseTechnologies(" Next.js, Go ,, next.js ,PostgreSQL ")).toEqual(["Next.js", "Go", "PostgreSQL"]);
    expect(parseTechnologies("")).toEqual([]);
  });

  it("limits to 20 items", () => {
    expect(parseTechnologies(Array.from({ length: 30 }, (_, i) => `t${i}`).join(","))).toHaveLength(20);
  });
});
