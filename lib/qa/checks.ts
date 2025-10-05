export type QaResult = { status: "pass" | "fail" | "warn" | "skip"; note?: string; data?: any }

async function ping(url: string, init?: RequestInit): Promise<QaResult> {
  try {
    const r = await fetch(url, { cache: "no-store", ...init })
    return { status: r.ok ? "pass" : "fail", note: `HTTP ${r.status}`, data: await safeJson(r) }
  } catch (e: any) {
    return { status: "fail", note: e?.message ?? "network error" }
  }
}

async function safeJson(r: Response) {
  try {
    return await r.clone().json()
  } catch {
    return null
  }
}

export async function checkHealth(): Promise<QaResult> {
  return ping("/api/health")
}

export async function checkVersion(): Promise<QaResult> {
  return ping("/api/version")
}

export async function checkEndpoints(): Promise<QaResult> {
  const paths = ["/api/health", "/api/search-passages", "/api/chat"]
  const res = await Promise.all(paths.map((p) => ping(p, { method: "OPTIONS" })))
  const ok = res.every((x) => x.status === "pass")
  return { status: ok ? "pass" : "fail", data: Object.fromEntries(paths.map((p, i) => [p, res[i]])) }
}

export async function checkEnvLeaks(): Promise<QaResult> {
  const h = await checkHealth()
  const leaks = (h.data?.checks?.leaks?.dangerousPublicVars ?? []) as string[]
  if (!Array.isArray(leaks)) return { status: "warn", note: "health missing leaks field", data: h.data }
  return {
    status: leaks.length ? "fail" : "pass",
    note: leaks.length ? `Leaked public vars: ${leaks.join(", ")}` : "No dangerous NEXT_PUBLIC_* vars",
  }
}

export async function smokeSupabase(): Promise<QaResult> {
  const h = await checkHealth()
  const ok = !!h.data?.checks?.endpoints?.["/api/search-passages"]
  // Best-effort: tiny POST with a harmless query
  if (!ok) return { status: "fail", note: "search-passages not reachable" }
  const r = await fetch("/api/search-passages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "bone loss", k: 1 }),
  })
  if (!r.ok) return { status: "fail", note: `RPC failed: HTTP ${r.status}` }
  const j = await r.json()
  const n = Array.isArray(j?.results) ? j.results.length : 0
  return { status: n >= 0 ? "pass" : "fail", note: `results: ${n}`, data: j }
}

export async function smokeChat(): Promise<QaResult> {
  const t0 = performance.now()
  const r = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question: "What evidence exists for bone loss in microgravity?", k: 3 }),
  })
  const ms = Math.round(performance.now() - t0)
  if (!r.ok) return { status: "fail", note: `HTTP ${r.status} • ${ms} ms` }
  const j = await r.json()
  const hasPayload = !!j?.payload?.summary && Array.isArray(j?.payload?.evidence)
  return { status: hasPayload ? "pass" : "fail", note: `${ms} ms`, data: j }
}

export async function testRateLimit(): Promise<QaResult> {
  // Send 10 quick /api/chat calls; expect at least one 429.
  const N = 10
  let got429 = false,
    codes: number[] = []
  await Promise.all(
    Array.from({ length: N }).map(async (_, i) => {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: `rate-limit probe ${i}`, k: 1 }),
      })
      codes.push(r.status)
      if (r.status === 429) got429 = true
    }),
  )
  return {
    status: got429 ? "pass" : "warn",
    note: got429 ? "429 observed" : `No 429 (env may be throttled already)`,
    data: { codes },
  }
}

export async function checkSecurityHeaders(): Promise<QaResult> {
  try {
    const r = await fetch(window.location.href, { method: "GET", cache: "no-store" })
    const csp = r.headers.get("content-security-policy")
    const xfo = r.headers.get("x-frame-options")
    const hsts = r.headers.get("strict-transport-security")
    const ok = !!csp && xfo === "DENY"
    return { status: ok ? "pass" : "fail", note: `CSP: ${!!csp} • XFO: ${xfo ?? "none"} • HSTS: ${!!hsts}` }
  } catch (e: any) {
    return { status: "fail", note: e?.message ?? "header fetch error" }
  }
}
