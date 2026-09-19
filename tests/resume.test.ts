import { describe, expect, it } from "vitest";
import { formatDuration, formatPeriod, monthsBetween } from "@/features/resume/period";

const labels = { present: "Hozirgacha", years: "{n} yil", months: "{n} oy" };

describe("resume period", () => {
  it("counts months inclusively", () => {
    expect(monthsBetween(new Date("2024-03-01"), new Date("2024-05-01"))).toBe(3);
    expect(monthsBetween(new Date("2024-03-01"), new Date("2024-03-01"))).toBe(1);
    expect(monthsBetween(new Date("2020-09-01"), new Date("2024-06-01"))).toBe(46);
  });

  it("formats duration", () => {
    expect(formatDuration(19, labels)).toBe("1 yil 7 oy");
    expect(formatDuration(24, labels)).toBe("2 yil");
    expect(formatDuration(5, labels)).toBe("5 oy");
  });

  it("formats open-ended period", () => {
    const text = formatPeriod(new Date("2024-03-01"), null, "en", labels, new Date("2025-09-15"));
    expect(text).toContain("Hozirgacha");
    expect(text).toContain("1 yil 7 oy");
  });
});
