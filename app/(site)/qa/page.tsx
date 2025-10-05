"use client"
import { useEffect, useState } from "react"
import CheckCard, { type QaStatus } from "@/components/qa/CheckCard"
import {
  checkHealth,
  checkVersion,
  checkEndpoints,
  checkEnvLeaks,
  smokeSupabase,
  smokeChat,
  testRateLimit,
  checkSecurityHeaders,
} from "@/lib/qa/checks"

type Row = { title: string; run: () => Promise<{ status: QaStatus; note?: string }> }

export default function QaPage() {
  const [rows, setRows] = useState<Array<{ title: string; status: QaStatus; note?: string }>>([])
  const [busy, setBusy] = useState(false)
  const checks: Row[] = [
    { title: "Health endpoint", run: checkHealth },
    { title: "Version endpoint", run: checkVersion },
    { title: "Internal endpoints reachable", run: checkEndpoints },
    { title: "Env leak audit (NEXT_PUBLIC_*)", run: checkEnvLeaks },
    { title: "Supabase RPC smoke (/api/search-passages)", run: smokeSupabase },
    { title: "Chat synthesis smoke (/api/chat)", run: smokeChat },
    { title: "Rate limit on /api/chat", run: testRateLimit },
    { title: "Security headers (CSP/XFO/HSTS)", run: checkSecurityHeaders },
  ]

  async function runAll() {
    setBusy(true)
    const out: Array<{ title: string; status: QaStatus; note?: string }> = []
    for (const c of checks) {
      try {
        out.push({ title: c.title, ...(await c.run()) })
      } catch (e: any) {
        out.push({ title: c.title, status: "fail", note: e?.message ?? "error" })
      }
    }
    setRows(out)
    setBusy(false)
  }

  useEffect(() => {
    runAll()
  }, [])

  const passCount = rows.filter((r) => r.status === "pass").length
  const failCount = rows.filter((r) => r.status === "fail").length
  const warnCount = rows.filter((r) => r.status === "warn").length

  return (
    <main id="main" className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-gray-900">QA Runner</h1>
          <p className="text-body text-gray-700">Automated checks for preview readiness.</p>
        </div>
        <button
          onClick={runAll}
          disabled={busy}
          className="rounded bg-primary-600 text-white px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary-300 disabled:opacity-50"
        >
          {busy ? "Running…" : "Re-run checks"}
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-body text-gray-900">Summary</div>
        <div className="text-caption text-gray-700">
          PASS {passCount} • WARN {warnCount} • FAIL {failCount}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {rows.map((r, i) => (
          <CheckCard key={i} title={r.title} status={r.status} note={r.note} />
        ))}
      </div>

      <div className="text-caption text-gray-700">
        Notes: some tests are best-effort (e.g., rate limit). This page doesn't run a11y audits or visual diffs.
      </div>
    </main>
  )
}
