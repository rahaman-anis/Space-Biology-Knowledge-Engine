"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import type { EvidenceRow } from "@/lib/aria/schema"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Props {
  results: EvidenceRow[]
}

function sectionBadge(section: string): string {
  const m: Record<string, string> = {
    Results: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Discussion: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Methods: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Introduction: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  }
  return m[section] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
}

function confidenceBadge(conf: string): string {
  if (conf === "High") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
  if (conf === "Medium") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
}

const pmcUrl = (pmcid: string) => `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`

export function EvidenceTable({ results }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [modalSection, setModalSection] = useState<{ section: string; text: string } | null>(null)

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <p className="text-lg text-muted-foreground">
          No evidence found. Try different keywords or check our example queries.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {results.map((r, i) => {
          const isExpanded = expandedIdx === i
          const primarySnippet = r.sections[r.primary_section || "abstract"] || "Section not available for this paper."

          return (
            <article
              key={`${r.pmcid}-${i}`}
              className="bg-card rounded-xl shadow border border-border overflow-hidden transition-all hover:shadow-lg"
            >
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset"
              >
                <header className="flex items-start justify-between mb-3 gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                      {r.title.length > 80 ? `${r.title.slice(0, 80)}...` : r.title}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sectionBadge(r.section)}`}>
                        {r.section}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${confidenceBadge(r.confidence)}`}>
                        {r.confidence}
                      </span>
                      {r.year && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                          {r.year}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={pmcUrl(r.pmcid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-primary hover:underline text-sm font-semibold whitespace-nowrap"
                    aria-label={`Open ${r.pmcid} in new tab`}
                  >
                    {r.pmcid}
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </header>

                <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                  <span>Relevance: {(r.relevance * 100).toFixed(1)}%</span>
                  {r.citations && <span>Cited by {r.citations}</span>}
                </div>

                <p className="text-base text-foreground leading-relaxed mb-3">
                  {primarySnippet.length > 150 && !isExpanded ? `${primarySnippet.slice(0, 150)}...` : primarySnippet}
                </p>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <h4 className="font-semibold text-sm text-foreground uppercase tracking-wide">
                      📄 Section Excerpts
                    </h4>
                    {Object.entries(r.sections).map(([sec, txt]) => {
                      const sectionName = sec.charAt(0).toUpperCase() + sec.slice(1)
                      const isPrimary = sec === r.primary_section
                      return (
                        <div key={sec} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-sm text-muted-foreground capitalize flex items-center gap-2">
                              [{sectionName}] {isPrimary && <span className="text-xs">⭐ Primary Evidence</span>}
                            </h5>
                            <Dialog>
                              <DialogTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setModalSection({ section: sectionName, text: txt || "Not available" })
                                  }}
                                  className="text-xs text-primary hover:underline"
                                >
                                  Read full {sectionName}
                                </button>
                              </DialogTrigger>
                            </Dialog>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">
                            {txt ? (txt.length > 150 ? `${txt.slice(0, 150)}...` : txt) : "Section not available"}
                          </p>
                        </div>
                      )
                    })}
                    {r.why_ranked && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold">🔍 Why this result?</span> {r.why_ranked}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Link
                        href={pmcUrl(r.pmcid)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        View Full Paper
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Implement "Find Related Papers" functionality
                          alert("Find Related Papers feature coming soon!")
                        }}
                        className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-semibold hover:bg-muted/80 transition-colors"
                      >
                        Find Related Papers
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-end">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {isExpanded ? "Collapse ▲" : "Expand ▼"}
                  </span>
                </div>
              </button>
            </article>
          )
        })}
      </div>

      <Dialog open={!!modalSection} onOpenChange={(open) => !open && setModalSection(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Full Section: {modalSection?.section}</DialogTitle>
            <DialogDescription>Complete text from the paper section</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{modalSection?.text}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
