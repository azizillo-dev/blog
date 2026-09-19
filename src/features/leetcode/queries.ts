import "server-only";
import { parseLeetcodeResponse, type LeetcodeStats } from "./stats";

const QUERY = `query userStats($username: String!) {
  matchedUser(username: $username) {
    profile { ranking }
    submitStatsGlobal { acSubmissionNum { difficulty count } }
  }
  allQuestionsCount { difficulty count }
}`;

/** 1 soat keshlanadi; LeetCode ishlamasa sahifa yiqilmaydi — null qaytadi. */
export async function getLeetcodeStats(username: string): Promise<LeetcodeStats | null> {
  if (!username) return null;
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
      body: JSON.stringify({ query: QUERY, variables: { username } }),
      next: { revalidate: 3600, tags: ["leetcode"] },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const stats = parseLeetcodeResponse(username, json);
    if (!stats) console.warn("[leetcode] user not found or bad response:", JSON.stringify(json).slice(0, 200));
    return stats;
  } catch (error) {
    console.warn("[leetcode] stats unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}
