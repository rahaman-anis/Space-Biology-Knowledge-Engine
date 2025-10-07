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

  const getDisplayTitle = (r: EvidenceRow): string => {
    // If title exists and is not "Untitled", use it
    if (r.title && r.title !== "Untitled" && r.title.trim().length > 0) {
      return r.title
    }

    // Fallback 1: Use first non-empty snippet from sections (truncate to 80 chars)
    const sections = r.sections || {}
    const allSectionTexts = Object.values(sections).filter(Boolean)
    if (allSectionTexts.length > 0 && allSectionTexts[0].trim().length > 0) {
      const firstSnippet = allSectionTexts[0].trim()
      return firstSnippet.length > 80 ? firstSnippet.slice(0, 80) + "..." : firstSnippet
    }

    // Fallback 2: Generic title with PMCID
    return `Study (${r.pmcid})`
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
          const sections = r.sections || {}
          const hasSections = Object.keys(sections).length > 0

          const sectionOrder = ["results", "discussion", "introduction", "methods", "abstract"]
          const availableSections = sectionOrder.filter((sec) => sections[sec as keyof typeof sections])

          return (
            <Accordion.Item
              key={`${r.pmcid}-${i}`}
              value={`item-${i}`}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all hover:shadow-md"
            >
              <Accordion.Header>
                <Accordion.Trigger className="w-full p-5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset group">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-[20px] font-bold text-gray-900 flex-1">{shortTitle}</h3>
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
                  </div>

                  {/* Relevance bar */}
                  <div className="mb-3">
                    <ProgressBar value={r.relevance} label="Relevance" />
                  </div>

                  <div className="flex items-center justify-end text-sm text-gray-600 group-data-[state=open]:hidden">
                    <span className="flex items-center gap-1">
                      <ChevronDown className="w-4 h-4" />
                      Expand
                    </span>
                  </div>
                </Accordion.Trigger>
              </Accordion.Header>

              <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <div className="px-5 pb-6 space-y-4 border-t border-gray-200 pt-4">
                  {/* Compact header line */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-900">{displayTitle}</h4>
                    <Link
                      href={pmcUrl(r.pmcid)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-bold whitespace-nowrap"
                    >
                      {r.pmcid}
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="h-px bg-gray-200" />

                  {hasSections && availableSections.length > 0 ? (
                    <div>
                      <h5 className="text-[18px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        SECTION EXCERPTS
                      </h5>
                      <div className="space-y-4">
                        {availableSections.slice(0, 3).map((sec) => {
                          const sectionName = sec.charAt(0).toUpperCase() + sec.slice(1)
                          const txt = sections[sec as keyof typeof sections] || ""
                          const isPrimary = sec === r.primary_section

                          return (
                            <div key={sec} className="bg-gray-50 rounded-lg p-4 md:p-5 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-base font-semibold text-gray-900 flex items-center gap-2">
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
                              <p
                                className={`leading-relaxed ${
                                  sec === "results" ? "text-[16px] text-gray-900" : "text-[16px] text-gray-700"
                                }`}
                              >
                                {txt || "Excerpt not available for this section."}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-base text-gray-700 italic">Excerpt not available for this section.</p>
                    </div>
                  )}

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
                  </div>

                  {/* Collapse indicator */}
                  <div className="flex items-center justify-center pt-2">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <ChevronUp className="w-4 h-4" />
                      Collapse
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
