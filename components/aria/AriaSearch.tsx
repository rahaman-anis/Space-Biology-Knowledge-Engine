"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"

export function AriaSearch() {
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState<string | null>(null)
  const [citations, setCitations] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleAsk() {
    if (!query.trim()) return

    setLoading(true)
    setAnswer(null)
    setError(null)
    setCitations([])

    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query, k: 8 }),
      })
      const data = await res.json()

      if (!data.ok) throw new Error(data.error || "Unknown error")

      setAnswer(data.answer || "(no answer)")
      setCitations(data.citations || [])
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="relative mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="What's the biggest risk for a 9-month Mars transit?"
            className="w-full h-16 pl-14 pr-32 text-base rounded-xl border-2 border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-200 transition-all"
            disabled={loading}
          />
          <MessageCircle className="absolute left-5 top-5 w-6 h-6 text-gray-400" />
          <button
            onClick={handleAsk}
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Thinking…" : "Ask"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">Error: {error}</div>
        )}

        {answer && (
          <div className="space-y-4">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Answer</h3>
              <div className="whitespace-pre-wrap text-gray-700">{answer}</div>
            </div>

            {citations.length > 0 && (
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Citations</h3>
                <ul className="space-y-2 text-sm">
                  {citations.map((c) => (
                    <li key={c.i} className="text-gray-700">
                      <span className="font-mono font-semibold">[#{c.i}]</span> {c.pmcid ? `PMCID ${c.pmcid}` : "—"} |{" "}
                      {c.section || "All"} | score: {c.score?.toString().slice(0, 5) || "—"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
