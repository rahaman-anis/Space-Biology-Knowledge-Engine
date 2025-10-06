"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchInput } from "@/components/aria/SearchInput"
import { ResultsTable } from "@/components/aria/ResultsTable"
import { RightSidebar } from "@/components/aria/RightSidebar"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import type { PassageResult, DocumentResult, SearchResponse } from "@/types/aria"

type Mode = "passages" | "documents"
type Result = PassageResult | DocumentResult

export default function AriaPage() {
  const router = useRouter()
  const params = useSearchParams()
  const initialQuery = params.get("q") ?? ""
  const initialMode = (params.get("mode") as Mode) ?? "passages"

  const [results, setResults] = useState<Result[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<Mode>(initialMode)
  const [hasSearched, setHasSearched] = useState(false)
  const [dataSource, setDataSource] = useState<"API" | "MOCK" | null>(null)
  const [filterPmcid, setFilterPmcid] = useState<string | null>(null)
  const topK = 10

  const updateUrl = (q: string, m: Mode) => {
    const sp = new URLSearchParams(params.toString())
    sp.set("q", q)
    sp.set("mode", m)
    router.replace(`/aria?${sp.toString()}`)
  }

  const handleSearch = async (query: string, searchMode: Mode) => {
    setIsLoading(true)
    setMode(searchMode)
    setHasSearched(true)
    setFilterPmcid(null)
    updateUrl(query, searchMode)

    try {
      const r = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query, mode: searchMode, topK }),
      })
      const data: SearchResponse = await r.json()
      setResults(data?.ok ? (data.results ?? []) : [])
      setDataSource(data?.source ?? "API")
    } catch (e) {
      console.error("[v0] ARIA search error", e)
      setResults([])
      setDataSource(null)
    } finally {
      setIsLoading(false)
    }
  }

  // auto-run if q provided in URL (deep link)
  useEffect(() => {
    const q = initialQuery.trim()
    if (q && !hasSearched) {
      handleSearch(q, initialMode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Extract unique citations for sidebar (top 5 by score)
  const recentCitations = useMemo(() => {
    const seen = new Set<string>()
    const citations: { pmcid: string; title: string; score: number }[] = []

    for (const r of results) {
      if (!seen.has(r.pmcid)) {
        seen.add(r.pmcid)
        citations.push({
          pmcid: r.pmcid,
          title: r.title,
          score: r.score,
        })
      }
    }

    return citations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ pmcid, title }) => ({ pmcid, title }))
  }, [results])

  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-7xl mx-auto px-4 md:px-6 pt-10 pb-6">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Search ARIA" }]} />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl text-foreground">Ask ARIA</h1>
            <p className="text-muted-foreground mt-2">
              Artemis Research Intelligence Assistant — section-aware search with citations.
            </p>
          </div>

          {/* QA Banner */}
          {dataSource && (
            <div className="px-3 py-1.5 rounded-lg bg-muted text-xs font-mono text-muted-foreground">
              data-source: {dataSource}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <SearchInput
          onSearch={handleSearch}
          isLoading={isLoading}
          initialQuery={initialQuery}
          initialMode={initialMode}
        />

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <section>
            {!hasSearched ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Enter a question to search {mode === "passages" ? "section-tagged evidence spans" : "publications"}.
                </p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                <p className="text-lg text-muted-foreground mt-4">Searching evidence…</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Results ({filterPmcid ? results.filter((r) => r.pmcid === filterPmcid).length : results.length})
                  </h2>
                  {filterPmcid && <span className="text-sm text-muted-foreground">Filtered by {filterPmcid}</span>}
                </div>
                <ResultsTable results={results} mode={mode} filterPmcid={filterPmcid} />
              </>
            )}
          </section>

          {hasSearched && !isLoading && results.length > 0 && (
            <RightSidebar
              citations={recentCitations}
              activePmcid={filterPmcid}
              onFilterByPmcid={setFilterPmcid}
              onClearFilter={() => setFilterPmcid(null)}
            />
          )}
        </div>
      </main>
    </div>
  )
}
