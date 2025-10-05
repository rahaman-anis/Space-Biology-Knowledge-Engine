// Minimal in-memory sliding window per-IP+path. Good enough for serverless demo.
// If no IP is available, falls back to a per-session key via a header.
type Key = string
const BUCKET = new Map<Key, number[]>()

export type RateRule = { windowMs: number; max: number }
export const chatRule: RateRule = { windowMs: 60_000, max: 8 } // 8 requests / minute

function prune(times: number[], now: number, win: number) {
  while (times.length && now - times[0] > win) times.shift()
}

export function allow(key: Key, rule: RateRule = chatRule) {
  const now = Date.now()
  const arr = BUCKET.get(key) ?? []
  prune(arr, now, rule.windowMs)
  if (arr.length >= rule.max) return { ok: false, remaining: 0, resetMs: rule.windowMs - (now - arr[0]) }
  arr.push(now)
  BUCKET.set(key, arr)
  return { ok: true, remaining: rule.max - arr.length, resetMs: rule.windowMs - (now - arr[0]) }
}

export function keyFromRequest(req: Request) {
  // Trust vercel's x-forwarded-for; otherwise use a coarse user key
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim()
  const ua = req.headers.get("user-agent") || "ua"
  return ip ? `ip:${ip}` : `ua:${ua}` // avoids total lockout if IP is missing
}
