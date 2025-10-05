import Checklist, { type Check } from "@/components/common/Checklist"

export const metadata = { title: "Go/No-Go Checklist - NASA LifeLens" }

async function getReport() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const r = await fetch(`${baseUrl}/api/go-no-go`, { cache: "no-store" })
  if (!r.ok) throw new Error("Failed to load report")
  return r.json()
}

export default async function GoNoGoPage() {
  const rep = await getReport()

  const env: Check[] = [
    {
      id: "SUPABASE_URL",
      label: "Supabase URL configured",
      ok: rep.env?.SUPABASE_URL?.ok,
      note: rep.env?.SUPABASE_URL?.note,
    },
    {
      id: "SUPABASE_ANON",
      label: "Supabase anon key configured",
      ok: rep.env?.SUPABASE_ANON_KEY?.ok,
      note: rep.env?.SUPABASE_ANON_KEY?.note,
    },
    {
      id: "GROQ",
      label: "Groq API key configured",
      ok: rep.env?.GROQ_API_KEY?.ok,
      note: rep.env?.GROQ_API_KEY?.note,
    },
  ]

  const endpoints: Check[] = [
    {
      id: "health",
      label: "Health endpoint reachable",
      ok: rep.endpoints?.["/api/health"]?.ok,
      note: rep.endpoints?.["/api/health"]?.note,
    },
    {
      id: "passages",
      label: "Search passages endpoint reachable",
      ok: rep.endpoints?.["/api/search-passages"]?.ok,
      note: rep.endpoints?.["/api/search-passages"]?.note,
    },
    {
      id: "chat",
      label: "Chat endpoint reachable",
      ok: rep.endpoints?.["/api/chat"]?.ok,
      note: rep.endpoints?.["/api/chat"]?.note,
    },
  ]

  const supabase: Check[] = [
    {
      id: "sb-connect",
      label: "Supabase connection (read-only)",
      ok: rep.supabase?.connect?.ok,
      note: rep.supabase?.connect?.note ?? (rep.supabase?.count != null ? `count=${rep.supabase.count}` : undefined),
    },
    {
      id: "sb-rpc",
      label: "RPC match_documents is callable",
      ok: rep.supabase?.rpc_match_documents?.ok,
      note: rep.supabase?.rpc_match_documents?.note,
    },
  ]

  const groq: Check[] = [
    {
      id: "groq-auth",
      label: "Groq API auth valid",
      ok: rep.groq?.auth?.ok,
      note: rep.groq?.auth?.note,
    },
  ]

  const e2e: Check[] = [
    {
      id: "e2e-chat",
      label: "End-to-end chat dry run",
      ok: rep.e2e_chat?.ok,
      note: rep.e2e_chat?.note,
    },
  ]

  const go = rep.overall === true

  return (
    <main id="main" className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-heading text-h1 text-gray-900">Go/No-Go Checklist</h1>
      <p className="text-body text-gray-700">Run before any stakeholder/demo session.</p>

      <div className={`rounded-lg border-2 ${go ? "border-success-600 bg-white" : "border-danger-600 bg-white"} p-4`}>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${go ? "bg-success-600" : "bg-danger-600"}`}
          >
            <span className="text-white font-bold">{go ? "✓" : "!"}</span>
          </span>
          <div className="font-heading text-h2 text-gray-900">
            {go ? "GO — Ready for demo" : "NO-GO — Fix issues below"}
          </div>
        </div>
        <p className="mt-2 text-caption text-gray-700">
          Completed in {rep.meta?.elapsedMs ?? "—"} ms • {rep.meta?.ts ?? ""}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Checklist title="Environment" items={env} />
        <Checklist title="Endpoints" items={endpoints} />
        <Checklist title="Supabase" items={supabase} />
        <Checklist title="Groq" items={groq} />
        <Checklist title="End-to-End" items={e2e} />
      </div>

      <div className="flex gap-2">
        <a
          href="/demo"
          className="inline-block rounded border-2 border-primary-600 text-primary-600 px-4 py-2 text-body hover:bg-primary-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-300 transition-colors"
        >
          Back to Demo Hub
        </a>
        <a
          href="/api/health"
          className="inline-block rounded px-4 py-2 text-body text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          Open /api/health
        </a>
        <a
          href="/api/version"
          className="inline-block rounded px-4 py-2 text-body text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          Open /api/version
        </a>
      </div>
    </main>
  )
}
