import { describe, expect, it } from "vitest";
import { parseLeetcodeResponse } from "@/features/leetcode/stats";

describe("leetcode", () => {
  it("parses stats", () => {
    const stats = parseLeetcodeResponse("me", {
      data: {
        matchedUser: {
          profile: { ranking: 1234 },
          submitStatsGlobal: {
            acSubmissionNum: [
              { difficulty: "All", count: 10 },
              { difficulty: "Easy", count: 6 },
              { difficulty: "Medium", count: 3 },
              { difficulty: "Hard", count: 1 },
            ],
          },
        },
        allQuestionsCount: [
          { difficulty: "All", count: 3000 },
          { difficulty: "Easy", count: 800 },
        ],
      },
    });
    expect(stats?.solved).toEqual({ All: 10, Easy: 6, Medium: 3, Hard: 1 });
    expect(stats?.total.Easy).toBe(800);
    expect(stats?.total.Hard).toBe(0);
    expect(stats?.ranking).toBe(1234);
  });

  it("returns null for unknown user", () => {
    expect(parseLeetcodeResponse("x", { data: { matchedUser: null, allQuestionsCount: [] } })).toBeNull();
    expect(parseLeetcodeResponse("x", {})).toBeNull();
  });
});
