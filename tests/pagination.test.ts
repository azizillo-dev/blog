import { describe, expect, it } from "vitest";
import { pageWindow, paginate } from "@/lib/pagination";

describe("pagination", () => {
  it("clamps page and computes skip", () => {
    expect(paginate("2", 25, 10)).toEqual({ page: 2, totalPages: 3, skip: 10, take: 10 });
    expect(paginate("99", 25, 10).page).toBe(3);
    expect(paginate("abc", 25, 10).page).toBe(1);
    expect(paginate("-5", 25, 10).page).toBe(1);
    expect(paginate(undefined, 0, 10)).toEqual({ page: 1, totalPages: 1, skip: 0, take: 10 });
  });

  it("builds a compact page window", () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(5, 12)).toEqual([1, null, 4, 5, 6, null, 12]);
    expect(pageWindow(1, 12)).toEqual([1, 2, null, 12]);
  });
});
