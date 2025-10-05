import HealthStat from "@/components/common/HealthStat"
import Link from "next/link"

export const metadata = { title: "Demo Hub - NASA LifeLens" }

async function getHealth() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const r = await fetch(`${baseUrl}/api/health`, { cache: "no-store" })
    if (!r.ok) return null
    return r.json()
  } catch {
    return null
  }
}

export default async function DemoPage() {
  const health = await getHealth()

  return (
    <main id="main" className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-heading text-h1 text-gray-900">Demo Hub</h1>
      <p className="text-body text-gray-700">Quick paths for judges & reviewers.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/aria?q=spaceflight%20bone%20loss"
          className="rounded-lg bg-white shadow-md p-6 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300 transition-shadow"
        >
          <h2 className="font-heading text-h2 text-gray-900 mb-2">Ask ARIA</h2>
          <p className="text-body text-gray-700">"spaceflight bone loss"</p>
        </Link>

        <Link
          href="/evidence/bone-loss?organism=Human"
          className="rounded-lg bg-white shadow-md p-6 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300 transition-shadow"
        >
          <h2 className="font-heading text-h2 text-gray-900 mb-2">Browse Evidence</h2>
          <p className="text-body text-gray-700">Bone loss • Human</p>
        </Link>

        <Link
          href="/graph?topic=bone%20loss&contradictionsOnly=true"
          className="rounded-lg bg-white shadow-md p-6 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300 transition-shadow"
        >
          <h2 className="font-heading text-h2 text-gray-900 mb-2">View Contradictions Graph</h2>
          <p className="text-body text-gray-700">Pruned to contradictions</p>
        </Link>

        <Link
          href="/gaps?topic=bone"
          className="rounded-lg bg-white shadow-md p-6 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300 transition-shadow"
        >
          <h2 className="font-heading text-h2 text-gray-900 mb-2">Explore Gaps</h2>
          <p className="text-body text-gray-700">Open research gaps</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HealthStat label="Health endpoint" value={health ? health.ok : null} />
        <HealthStat label="Env: Supabase URL" value={health?.checks?.env?.SUPABASE_URL} />
        <HealthStat label="Env: Groq API Key" value={health?.checks?.env?.GROQ_API_KEY} />
      </div>

      <div>
        <Link
          href="/go-no-go"
          className="inline-block rounded border-2 border-primary-600 text-primary-600 px-4 py-2 text-body hover:bg-primary-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-300 transition-colors"
        >
          Run Go/No-Go Checklist →
        </Link>
      </div>
    </main>
  )
}
