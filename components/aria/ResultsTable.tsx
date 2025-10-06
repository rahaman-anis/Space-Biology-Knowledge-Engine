"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react"
import type { PassageResult, DocumentResult } from "@/types/aria"

type Result = PassageResult | DocumentResult

interface ResultsTableProps {
  results: Result[]
  mode: "passages" | "documents"
  filterPmcid?: string | null
}

type SortField = "confidence" | "year"
type SortOrder = "asc" | "desc"

function confidenceValue(conf: string): number {
  if (conf === "High") return 3
  if (conf === "Medium") return 2
  return 1
}

function sectionBadge(section: string): string {
  const m: Record<string, string> = {
    Results: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Discussion: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Methods: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Introduction: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  }
  return m[section] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
}

function confidenceBadge(conf: string): string {
  if (conf === "High") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
  if (conf === "Medium") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
}

const pmcUrl = (pmcid: string) => `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`

export function ResultsTable({ results, mode, filterPmcid }: ResultsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [sortField, setSortField] = useState<SortField>("confidence")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter by pmcid if active
  const filteredResults = filterPmcid ? results.filter((r) => r.pmcid === filterPmcid) : results

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortField === "confidence") {
      const diff = confidenceValue(b.confidence) - confidenceValue(a.confidence)
      return sortOrder === "desc" ? diff : -diff
    }
    // year
    const aYear = a.year ?? 0
    const bYear = b.year ?? 0
    const diff = bYear - aYear
    return sortOrder === "desc" ? diff : -diff
  })

  // Paginate
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedResults = sortedResults.slice(startIdx, startIdx + itemsPerPage)

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
    setCurrentPage(1)
  }

  const toggleExpand = (idx: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx)
    } else {
      newExpanded.add(idx)
    }
    setExpandedRows(newExpanded)
  }

  if (!filteredResults.length) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <p className="text-lg text-muted-foreground mb-4">No results found.</p>
        <button
          onClick={() => (window.location.href = "/aria?q=What+evidence+exists+for+bone+loss+countermeasures%3F")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try example query
        </button>
      </div>
    )
  }

  if (mode === "passages") {
    return (
      <div className="space-y-6">
        {/* Sort Controls */}
        <div className="flex gap-3 items-center flex-wrap">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <button
            onClick={() => toggleSort("confidence")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Confidence
            {sortField === "confidence" &&
              (sortOrder === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
            {sortField !== "confidence" && <ArrowUpDown className="w-4 h-4 opacity-50" />}
          </button>
          <button
            onClick={() => toggleSort("year")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Year
            {sortField === "year" &&
              (sortOrder === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
            {sortField !== "year" && <ArrowUpDown className="w-4 h-4 opacity-50" />}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {paginatedResults.map((r, i) => {
            const passage = r as PassageResult
            const globalIdx = startIdx + i
            const isExpanded = expandedRows.has(globalIdx)

            return (
              <article
                key={`${passage.pmcid}-${globalIdx}`}
                className="bg-card rounded-xl shadow border border-border overflow-hidden transition-all hover:shadow-lg"
                aria-label="Evidence result"
              >
                <button
                  onClick={() => toggleExpand(globalIdx)}
                  className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset"
                >
                  <header className="flex items-start justify-between mb-3 gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">{passage.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${sectionBadge(passage.section)}`}
                        >
                          {passage.section}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${confidenceBadge(passage.confidence)}`}
                        >
                          {passage.confidence}
                        </span>
                        {passage.year && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                            {passage.year}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={pmcUrl(passage.pmcid)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-primary hover:underline text-sm font-semibold whitespace-nowrap"
                      aria-label={`Open ${passage.pmcid} in new tab`}
                    >
                      {passage.pmcid}
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </header>

                  <p className="text-base text-foreground leading-relaxed">
                    {passage.snippet.length > 200 && !isExpanded
                      ? `${passage.snippet.slice(0, 200)}...`
                      : passage.snippet}
                  </p>

                  {isExpanded && passage.abstract && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Full Abstract</h4>
                      <p className="text-sm text-foreground leading-relaxed">{passage.abstract}</p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Similarity: {(passage.score * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {isExpanded ? "Collapse" : "Expand"}
                    </span>
                  </div>
                </button>
              </article>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Next
            </button>
          </div>
        )}
      </div>
    )
  }

  // documents mode
  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex gap-3 items-center flex-wrap">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <button
          onClick={() => toggleSort("confidence")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Relevance
          {sortField === "confidence" &&
            (sortOrder === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
          {sortField !== "confidence" && <ArrowUpDown className="w-4 h-4 opacity-50" />}
        </button>
        <button
          onClick={() => toggleSort("year")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Year
          {sortField === "year" &&
            (sortOrder === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
          {sortField !== "year" && <ArrowUpDown className="w-4 h-4 opacity-50" />}
        </button>
      </div>

      <div className="space-y-3">
        {paginatedResults.map((r, i) => {
          const doc = r as DocumentResult
          const globalIdx = startIdx + i
          const isExpanded = expandedRows.has(globalIdx)

          return (
            <article
              key={`${doc.pmcid}-${globalIdx}`}
              className="bg-card rounded-xl shadow border border-border overflow-hidden transition-all hover:shadow-lg"
              aria-label="Document result"
            >
              <button
                onClick={() => toggleExpand(globalIdx)}
                className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground mb-2">{doc.title}</h3>
                    <div className="flex gap-3 items-center text-sm flex-wrap">
                      {doc.year && <span className="text-muted-foreground">Year: {doc.year}</span>}
                      <span aria-hidden className="text-muted-foreground">
                        •
                      </span>
                      <span className={`px-2 py-1 rounded ${confidenceBadge(doc.confidence)} text-xs font-semibold`}>
                        {doc.confidence} Relevance
                      </span>
                    </div>
                    {isExpanded && doc.abstract && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-foreground leading-relaxed">{doc.abstract}</p>
                      </div>
                    )}
                  </div>
                  <Link
                    href={pmcUrl(doc.pmcid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-primary hover:underline font-semibold whitespace-nowrap text-sm"
                    aria-label="View paper in PMC"
                  >
                    View Paper
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {isExpanded ? "Collapse" : "Expand for abstract"}
                </div>
              </button>
            </article>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
