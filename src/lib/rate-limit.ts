/**
 * Xotiradagi oddiy "fixed window" limiter. Bitta server instansiyasi uchun yetarli.
 * Ko'p instansiyali deploy uchun Redis bilan almashtiring.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) sweep(now);
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

function sweep(now: number) {
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}

export function resetRateLimits() {
  buckets.clear();
}
