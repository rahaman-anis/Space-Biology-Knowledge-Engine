"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { MessageCircle, Loader2 } from "lucide-react"

interface SearchInputProps {
  onSearch: (query: string, mode: "passages" | "documents") => void
  isLoading: boolean
  initialQuery?: string
  initialMode?: "passages" | "documents"
}

export function SearchInput({ onSearch, isLoading, initialQuery = "", initialMode = "passages" }: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery)
  const [mode, setMode] = useState<"passages" | "documents">(initialMode)

  useEffect(() => {
    setQuery(initialQuery)
    setMode(initialMode)
  }, [initialQuery, initialMode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) onSearch(q, mode)
  }

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border">
      {/* Mode Toggle */}
      <div className="flex gap-3 mb-4">
        <button
          type="button"
          onClick={() => setMode("passages")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
            mode === "passages"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          aria-pressed={mode === "passages"}
        >
          Search Evidence Spans
        </button>
        <button
          type="button"
          onClick={() => setMode("documents")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
            mode === "documents"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          aria-pressed={mode === "documents"}
        >
          Search Full Papers
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What's the biggest risk for a 9-month Mars transit?"
          className="w-full h-14 md:h-16 pl-12 pr-32 text-base rounded-xl border-2 border-input bg-background text-foreground focus:border-primary focus:ring-4 focus:ring-ring/20 transition-all"
          disabled={isLoading}
          aria-label="Ask ARIA a research question"
        />
        <MessageCircle className="absolute left-4 top-4 md:top-5 w-6 h-6 text-muted-foreground" />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-2 px-5 md:px-6 py-2.5 md:py-3 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold rounded-lg transition-colors inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Searching…
            </>
          ) : (
            "Ask"
          )}
        </button>
      </form>
    </div>
  )
}
