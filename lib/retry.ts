export type RetryOpts = {
  attempts?: number
  backoffMs?: number
  onAttempt?: (i: number, err: unknown) => void
  signal?: AbortSignal
}

export async function fetchWithRetry(input: RequestInfo | URL, init: RequestInit = {}, opts: RetryOpts = {}) {
  const { attempts = 3, backoffMs = 300, onAttempt, signal } = opts
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(input, { ...init, signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res
    } catch (err) {
      lastErr = err
      onAttempt?.(i + 1, err)
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, backoffMs * Math.pow(2, i)))
    }
  }
  throw lastErr
}
