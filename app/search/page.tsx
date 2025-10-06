"use client"
import { useState } from "react"
import type React from "react"

type Result =
  | { type: "passage"; pmcid: string; section: string; snippet: string; score: number }
  | { type: "document"; pmcid: string; title: string | null; year: string | null; score: number }

export default function SearchPage() {
  const [q, setQ] = useState("bone loss microgravity countermeasures")
  const [mode, setMode] = useState<"passages" | "documents">("passages")
  const [topK, setTopK] = useState(8)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Result[]>([])

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    setResults([])
    try {
      const res = await fetch("/api/aria/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, mode, topK }),
      })
      const json = await res.json()
      if (!json.ok) {
        setError(json.error || "Search failed")
        setLoading(false)
        return
      }
      setResults(json.results || [])
    } catch (err: any) {
      setError(String(err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Search</h1>

      <form onSubmit={runSearch} className="flex flex-col gap-3">
        <input
          className="border rounded px-3 py-2"
          placeholder="Ask a question or type keywords…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="radio" name="mode" checked={mode === "passages"} onChange={() => setMode("passages")} />
            Passages
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="mode" checked={mode === "documents"} onChange={() => setMode("documents")} />
            Documents
          </label>
          <label className="ml-auto flex items-center gap-2">
            Top K:
            <input
              type="number"
              min={1}
              max={20}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-16 border rounded px-2 py-1"
            />
          </label>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {!loading && results.length > 0 && (
        <section className="space-y-3">
          <div className="text-sm text-neutral-500">
            Showing {results.length} {mode}
          </div>
          <ul className="space-y-2">
            {results.map((r, idx) => (
              <li key={idx} className="border rounded p-3">
                {r.type === "passage" ? (
                  <>
                    <div className="text-xs text-neutral-500 mb-1">
                      {r.pmcid} • {r.section} • score {r.score.toFixed(3)}
                    </div>
                    <div className="text-sm">{r.snippet}</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium">{r.title || "(title missing)"}</div>
                    <div className="text-xs text-neutral-500">
                      {r.pmcid} • {r.year ?? "—"} • score {r.score.toFixed(3)}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="text-sm text-neutral-500">No results yet. Try a query and press Search.</div>
      )}
    </main>
  )
}
