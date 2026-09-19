export type Difficulty = "Easy" | "Medium" | "Hard";

export type LeetcodeStats = {
  username: string;
  ranking: number | null;
  solved: Record<Difficulty | "All", number>;
  total: Record<Difficulty | "All", number>;
};

type Count = { difficulty: string; count: number };

type Response = {
  data?: {
    matchedUser: { profile: { ranking: number | null }; submitStatsGlobal: { acSubmissionNum: Count[] } } | null;
    allQuestionsCount: Count[];
  };
};

const toRecord = (items: Count[]) => {
  const out = { All: 0, Easy: 0, Medium: 0, Hard: 0 };
  for (const { difficulty, count } of items) if (difficulty in out) out[difficulty as keyof typeof out] = count;
  return out;
};

/** LeetCode GraphQL javobini xavfsiz ko'rinishga o'tkazadi. Foydalanuvchi topilmasa — null. */
export function parseLeetcodeResponse(username: string, json: Response): LeetcodeStats | null {
  const user = json.data?.matchedUser;
  if (!user) return null;
  return {
    username,
    ranking: user.profile?.ranking ?? null,
    solved: toRecord(user.submitStatsGlobal.acSubmissionNum),
    total: toRecord(json.data?.allQuestionsCount ?? []),
  };
}
