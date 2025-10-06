"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchInput } from "@/components/aria/SearchInput"
import { ResultsTable } from "@/components/aria/ResultsTable"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"

type Mode = "passages" | "documents"
type Result = any

export default function AriaPage() {
  const router = useRouter()
  const params = useSearchParams()
  const initialQuery = params.get("q") ?? ""
  const initialMode = (params.get("mode") as Mode) ?? "passages"

  const [results, setResults] = useState<Result[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<Mode>(initialMode)
  const [hasSearched, setHasSearched] = useState(false)
  const topK = 8

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
    updateUrl(query, searchMode)

    try {
      const r = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query, mode: searchMode, topK }),
      })
      const data = await r.json()
      setResults(data?.ok ? (data.results ?? []) : [])
    } catch (e) {
      console.error("ARIA search error", e)
      setResults([])
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

  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-7xl mx-auto px-4 md:px-6 pt-10 pb-6">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Search ARIA" }]} />

        <h1 className="font-heading text-3xl md:text-4xl text-foreground">Ask ARIA</h1>
        <p className="text-muted-foreground mt-2">
          Artemis Research Intelligence Assistant — section-aware search with citations.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <SearchInput
          onSearch={handleSearch}
          isLoading={isLoading}
          initialQuery={initialQuery}
          initialMode={initialMode}
        />

        <section className="mt-10">
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
              <h2 className="text-2xl font-semibold text-foreground mb-6">Results ({results.length})</h2>
              <ResultsTable results={results} mode={mode} />
            </>
          )}
        </section>
      </main>
    </div>
  )
}
