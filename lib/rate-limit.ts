/**
 * Best-effort in-process rate limiting.
 *
 * NOTE: this is per-instance state. On serverless (Vercel) each warm instance
 * keeps its own buckets, so this is a safety net against casual abuse rather
 * than a hard global limit. Move to Upstash/Redis if you need a real quota.
 */

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Stop the map growing without bound on a long-running instance.
const MAX_TRACKED_KEYS = 10_000

export type RateLimitResult = {
  ok: boolean
  remaining: number
  /** Seconds until the window resets. */
  retryAfter: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()

  if (buckets.size > MAX_TRACKED_KEYS) {
    buckets.forEach((bucket, existingKey) => {
      if (bucket.resetAt <= now) buckets.delete(existingKey)
    })
  }

  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  bucket.count += 1

  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  return {
    ok: true,
    remaining: limit - bucket.count,
    retryAfter: 0,
  }
}

/** Best-effort client IP from proxy headers set by Vercel / most hosts. */
export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip")?.trim() || "unknown"
}