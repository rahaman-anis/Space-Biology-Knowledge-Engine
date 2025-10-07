"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import { ExplanationBox } from "./ExplanationBox"
import { SearchFilters } from "./SearchFilters"
import { EvidenceAccordion } from "./EvidenceAccordion"
import { searchPassages } from "@/lib/aria/client"
import type { EvidenceRow, SectionType, Confidence } from "@/lib/aria/schema"

const searchExamplesDefault = [
  "microgravity bone loss RANKL",
  "ISS T-cell dysfunction latent virus",
  "hindlimb unloading mitochondrial dysfunction ARED discussion",
]

export function SearchPane() {
  const [query, setQuery] = useState("")
  const [mode, setMode] = useState<"passages" | "documents">("passages")
  const [evidences, setEvidences] = useState<EvidenceRow[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [emptyQueryError, setEmptyQueryError] = useState(false)
  const [searchHint, setSearchHint] = useState<string | null>(null)
  const [searchExamples, setSearchExamples] = useState<string[]>([])

  const [section, setSection] = useState<SectionType | "All">("All")
  const [confidence, setConfidence] = useState<Confidence | "All">("All")
  const [sort, setSort] = useState<"Relevance" | "Confidence" | "Year">("Relevance")

  useEffect(() => {
    setEvidences([])
  }, [])

  const handleSearch = async (q: string, m: "passages" | "documents" = mode) => {
    if (!q.trim()) {
      setEmptyQueryError(true)
      return
    }

    setEmptyQueryError(false)
    setSearchHint(null)
    setSearchExamples([])
    setLoading(true)
    setHasSearched(true)
    setEvidences([])

    console.log("[v0] SearchPane: Calling searchPassages with query:", q, "mode:", m)

    try {
      const result = await searchPassages({ q: q.trim(), mode: m, topK: 8, section, confidence, sort })

      setLoading(false)
      if (result.ok) {
        console.log("[v0] SearchPane: Results received, count:", result.results?.length ?? 0)
        // Ensure results is always an array, even if undefined/null
        setEvidences(Array.isArray(result.results) ? result.results : [])
        if (result.hint) setSearchHint(result.hint)
        if (result.examples) setSearchExamples(result.examples)
      } else {
        console.log("[v0] SearchPane: Error:", result.error)
        setEvidences([])
        setSearchHint(result.error ?? "Search failed. Please try again.")
      }
    } catch (err) {
      console.error("[v0] SearchPane: Unexpected error:", err)
      setLoading(false)
      setEvidences([])
      setSearchHint("An unexpected error occurred. Please try again.")
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSearch(query, mode)
  }

  const handleExampleClick = (example: string) => {
    setQuery(example)
    handleSearch(example, mode)
  }

  return (
    <div className="space-y-8 mt-6">
      {!hasSearched && (
        <ExplanationBox
          variant="search"
          title="Search"
          subtitle="Traditional keyword search"
          body="Traditional keyword search across section-tagged evidence spans. Use this when you want to browse specific topics or filter by paper section without AI synthesis. Results show exact matches from paper sections with confidence scores."
        />
      )}

      <div className="bg-white rounded-2xl aria-card-shadow-lg p-8 border-2 border-gray-200">
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setMode("passages")}
            title="Returns exact text chunks from papers"
            className={`px-6 py-3 rounded-xl font-bold transition-colors text-base ${
              mode === "passages" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Passages
          </button>
          <button
            type="button"
            onClick={() => setMode("documents")}
            title="Scores whole papers (title/abstract/metadata)"
            className={`px-6 py-3 rounded-xl font-bold transition-colors text-base ${
              mode === "documents" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Documents
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setEmptyQueryError(false)
            }}
            placeholder="Search for evidence spans or full papers..."
            className="w-full h-16 pl-14 pr-36 text-lg rounded-xl border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-200 transition-all"
            disabled={loading}
          />
          <Search className="absolute left-5 top-5 w-7 h-7 text-gray-400" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-3 px-7 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Searching…
              </>
            ) : (
              "Search"
            )}
          </button>
        </form>
        {emptyQueryError && <p className="mt-3 text-sm text-orange-600">Enter a query or try an example below.</p>}
      </div>

      {!hasSearched && (
        <div className="space-y-3">
          <p className="text-base text-gray-700 font-semibold">Try these examples:</p>
          <div className="grid gap-3">
            {searchExamplesDefault.slice(0, 3).map((kw, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(kw)}
                className="text-left px-5 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-base font-mono text-gray-900 transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasSearched && searchHint && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <p className="text-orange-900 font-semibold mb-3">{searchHint}</p>
          {searchExamples.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-orange-800 font-semibold">Try these examples:</p>
              {searchExamples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(ex)}
                  className="block w-full text-left px-4 py-3 bg-white hover:bg-orange-100 rounded-lg text-sm font-mono text-gray-900 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {hasSearched && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div>
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="inline-block animate-spin w-16 h-16 text-blue-600" />
                <p className="text-xl text-gray-700 mt-4">Searching evidence…</p>
              </div>
            ) : (
              <EvidenceAccordion results={evidences} />
            )}
          </div>

          <aside>
            <SearchFilters
              section={section}
              confidence={confidence}
              sort={sort}
              onSectionChange={setSection}
              onConfidenceChange={setConfidence}
              onSortChange={setSort}
            />
          </aside>
        </div>
      )}
    </div>
  )
}
