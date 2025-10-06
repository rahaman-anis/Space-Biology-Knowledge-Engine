"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink, ChevronDown, ChevronUp, FileText } from "lucide-react"
import * as Accordion from "@radix-ui/react-accordion"
import type { EvidenceRow } from "@/lib/aria/schema"
import { SectionBadge, ConfidenceBadge } from "./Badges"
import { ProgressBar } from "./ProgressBar"
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

const pmcUrl = (pmcid: string) => `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`

export function EvidenceAccordion({ results }: Props) {
  const [modalSection, setModalSection] = useState<{ section: string; text: string } | null>(null)

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-200">
        <p className="text-xl text-gray-600">No evidence found. Try different keywords or check our example queries.</p>
      </div>
    )
  }

  // Get a display title (fallback if "Untitled")
  const getDisplayTitle = (r: EvidenceRow): string => {
    if (r.title && r.title !== "Untitled" && r.title.trim().length > 0) {
      return r.title
    }
    // Fallback to first 80 chars of abstract or generic title
    const abstractText = r.sections.abstract || r.sections.introduction || ""
    if (abstractText.length > 80) {
      return abstractText.slice(0, 80) + "..."
    }
    return `Study on ${r.section}, ${r.year || "Unknown Year"}`
  }

  return (
    <div className="space-y-4" data-testid="aria-evidence-accordion">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Evidence Sources ({results.length})</h2>
        <p className="text-base text-gray-600 mt-1">Expand any result to see section excerpts</p>
      </div>

      <Accordion.Root type="single" collapsible defaultValue="item-0" className="space-y-3">
        {results.map((r, i) => {
          const displayTitle = getDisplayTitle(r)
          const shortTitle = displayTitle.length > 80 ? displayTitle.slice(0, 80) + "..." : displayTitle

          return (
            <Accordion.Item
              key={`${r.pmcid}-${i}`}
              value={`item-${i}`}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all hover:shadow-md"
            >
              <Accordion.Header>
                <Accordion.Trigger className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset group">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{shortTitle}</h3>
                    <Link
                      href={pmcUrl(r.pmcid)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-bold whitespace-nowrap"
                      aria-label={`Open ${r.pmcid} in new tab`}
                    >
                      {r.pmcid}
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <SectionBadge section={r.section} />
                    <ConfidenceBadge confidence={r.confidence} />
                    {r.year && (
                      <span className="px-3 py-1 rounded-md text-sm font-bold bg-gray-100 text-gray-700">{r.year}</span>
                    )}
                    {r.citations && (
                      <span className="px-3 py-1 rounded-md text-sm font-bold bg-gray-100 text-gray-700">
                        Cited by {r.citations}
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <ProgressBar value={r.relevance} label="Relevance" />
                  </div>

                  <div className="flex items-center justify-end text-sm text-gray-600 group-data-[state=open]:hidden">
                    <span className="flex items-center gap-1">
                      <ChevronDown className="w-4 h-4" />
                      Expand ▼
                    </span>
                  </div>
                </Accordion.Trigger>
              </Accordion.Header>

              <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <div className="px-6 pb-6 space-y-4 border-t border-gray-200 pt-4">
                  {/* Full title */}
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">{displayTitle}</h4>
                    <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                      <SectionBadge section={r.section} />
                      <ConfidenceBadge confidence={r.confidence} />
                      {r.year && <span>• {r.year}</span>}
                      {r.citations && <span>• Cited by {r.citations}</span>}
                      <span>• Relevance {Math.round(r.relevance * 100)}%</span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  {/* Section Excerpts */}
                  <div>
                    <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      SECTION EXCERPTS
                    </h5>
                    <div className="space-y-4">
                      {Object.entries(r.sections).map(([sec, txt]) => {
                        const sectionName = sec.charAt(0).toUpperCase() + sec.slice(1)
                        const isPrimary = sec === r.primary_section
                        const displayText = txt || "Excerpt not available for this section"

                        return (
                          <div key={sec} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="font-bold text-base text-gray-900 flex items-center gap-2">
                                [{sectionName}]
                                {isPrimary && <span className="text-sm text-blue-600">⭐ Primary Evidence</span>}
                              </h6>
                              {txt && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setModalSection({ section: sectionName, text: txt })
                                      }}
                                      className="text-sm text-blue-600 hover:underline font-medium"
                                    >
                                      Read full {sectionName} →
                                    </button>
                                  </DialogTrigger>
                                </Dialog>
                              )}
                            </div>
                            <p className="text-base text-gray-700 leading-relaxed">{displayText}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Why this result */}
                  {r.why_ranked && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-bold text-gray-900">🔍 Why this result?</span> {r.why_ranked}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2">
                    <Link
                      href={pmcUrl(r.pmcid)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-bold hover:bg-blue-700 transition-colors"
                    >
                      View Full Paper
                    </Link>
                    <button className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg text-base font-bold hover:bg-gray-300 transition-colors">
                      Add to Brief
                    </button>
                    <button className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg text-base font-bold hover:bg-gray-300 transition-colors">
                      Find Related
                    </button>
                  </div>

                  {/* Collapse indicator */}
                  <div className="flex items-center justify-center pt-2">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <ChevronUp className="w-4 h-4" />
                      Collapse ▲
                    </span>
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion.Root>

      {/* Modal for full section text */}
      <Dialog open={!!modalSection} onOpenChange={(open) => !open && setModalSection(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Full Section: {modalSection?.section}</DialogTitle>
            <DialogDescription>Complete text from the paper section</DialogDescription>
          </DialogHeader>
          <div className="prose prose-base max-w-none">
            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{modalSection?.text}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
