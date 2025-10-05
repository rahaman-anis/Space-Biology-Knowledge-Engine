"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { SearchIcon, Loader2 } from "lucide-react"
import { PageLayout } from "@/components/layout/PageLayout"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

interface SearchResult {
  id: string
  title: string
  snippet: string
  source: string
  pmcid?: string
  doi?: string
  year?: number
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`)

      if (!res.ok) {
        throw new Error(`Search failed: ${res.statusText}`)
      }

      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      console.error("[v0] Search error:", err)
      setError(err instanceof Error ? err.message : "Search failed")
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery) {
        router.push(`/search?q=${encodeURIComponent(query)}`, { scroll: false })
      }
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch, router, initialQuery])

  // Initial search on mount if query param exists
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query)
  }

  const buildSourceLink = (result: SearchResult) => {
    if (result.pmcid) {
      return `https://www.ncbi.nlm.nih.gov/pmc/articles/${result.pmcid}/`
    }
    if (result.doi) {
      return `https://doi.org/${result.doi}`
    }
    return null
  }

  return (
    <PageLayout
      title="Search Evidence"
      subtitle="Search across 572 publications in the space biology corpus"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
    >
      <div className="max-w-4xl mx-auto">
        {/* Search input */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for topics, studies, or findings..."
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              autoFocus
            />
          </div>
        </form>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-3 text-lg text-gray-600">Searching...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <p className="text-red-900 font-semibold">Error: {error}</p>
            <p className="text-red-700 text-sm mt-2">Please try again or contact support if the issue persists.</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && hasSearched && results.length === 0 && !error && (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-12 text-center">
            <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try different keywords or browse topics instead.</p>
            <Link
              href="/evidence"
              className="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Topics
            </Link>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((result) => {
              const link = buildSourceLink(result)
              return (
                <div
                  key={result.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-300 transition-colors"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{result.title}</h3>
                  <p className="text-gray-700 mb-3 leading-relaxed">{result.snippet}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-mono">{result.source}</span>
                      {result.pmcid && <span className="font-mono">PMCID: {result.pmcid}</span>}
                      {result.doi && <span className="font-mono">DOI: {result.doi}</span>}
                      {result.year && <span>{result.year}</span>}
                    </div>
                    {link && (
                      <Link
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                      >
                        Open
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
