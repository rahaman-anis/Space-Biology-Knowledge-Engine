"use client"

import { Badge } from "@/components/ui/Badge"
import { MethodsPopover } from "@/components/ui/MethodsPopover"
import ProvenanceStrip from "@/components/common/ProvenanceStrip"
import { HEURISTICS_VERSION } from "@/lib/heuristics"

export type EvidenceSection = "Results" | "Discussion" | "Methods"
export type Band = "High" | "Medium" | "Low"
export type Consensus = "Strong" | "Mixed" | "Conflicted"

export interface EvidenceItem {
  id: string
  section: EvidenceSection
  text: string
  citations: { pmcid?: string; ntrsId?: string }[]
  year?: number
  method?: "in-vivo" | "in-vitro" | "in-silico"
}

export interface AnswerCardProps {
  title: string
  summary: string
  confidence: Band
  consensus: Consensus
  coverageCount?: number
  freshnessText?: string
  confidenceInterval?: [number, number]
  evidence: EvidenceItem[]
  provenance?: { pmcid?: string; ntrsId?: string; taskbookId?: string; osdrIds?: string[] }
  onShowContradictions?: () => void
  onOpenSubgraph?: () => void
  onOpenARIA?: () => void
  onAddToBrief?: () => void
  onExportCitation?: () => void
}

const SECTION_ICON: Record<EvidenceSection, string> = {
  Results: "📊",
  Discussion: "📝",
  Methods: "🧪",
}

export default function AnswerCard(p: AnswerCardProps) {
  const {
    title,
    summary,
    confidence,
    consensus,
    coverageCount,
    freshnessText,
    confidenceInterval,
    evidence,
    provenance,
    onShowContradictions,
    onOpenSubgraph,
    onOpenARIA,
    onAddToBrief,
    onExportCitation,
  } = p

  return (
    <div className="rounded-lg bg-white shadow-md p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl text-gray-900">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={confidence as any}>{`${confidence} Confidence`}</Badge>
          <Badge variant={consensus as any}>{`${consensus} Consensus`}</Badge>
          {confidenceInterval && (
            <span className="inline-flex items-center rounded px-2 py-1 text-xs bg-gray-50 text-gray-700">
              {Math.round(confidenceInterval[0] * 100)}–{Math.round(confidenceInterval[1] * 100)}%
            </span>
          )}
          {coverageCount != null && <span className="text-xs text-gray-700">Based on {coverageCount} studies</span>}
          <a
            href="/methods#confidence"
            className="text-xs text-primary-600 hover:underline focus-visible:ring-2 focus-visible:ring-primary-300 rounded"
          >
            How computed (v{HEURISTICS_VERSION})
          </a>
          {freshnessText && <span className="text-xs text-gray-700">• Updated {freshnessText}</span>}
          <MethodsPopover source="confidence" />
        </div>
      </div>

      <p className="text-sm text-gray-900 mt-3">{summary}</p>

      <div className="mt-4 divide-y divide-gray-200">
        {evidence.length === 0 ? (
          <div className="mt-2 rounded border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-700">Insufficient section-tagged evidence.</p>
          </div>
        ) : (
          evidence.map((item) => {
            const old = item.year && item.year <= new Date().getFullYear() - 5
            return (
              <div key={item.id} className="flex items-start gap-3 py-3">
                <span aria-hidden className="text-sm">
                  {SECTION_ICON[item.section]}
                </span>
                <Badge variant={item.section as any}>{item.section}</Badge>
                <div className={`flex-1 ${old ? "opacity-70" : ""}`}>
                  <p className="text-sm text-gray-900">{item.text}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-700">
                    {item.year && <span>({item.year})</span>}
                    {item.method && <span className="rounded px-1.5 py-0.5 bg-gray-100">{item.method}</span>}
                    {item.citations?.length ? (
                      <span>
                        <sup>
                          {item.citations.map((c, i) => (
                            <span key={i} className="mono">
                              {c?.pmcid ?? c?.ntrsId}
                              {i < item.citations.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </sup>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {provenance && (
        <div className="mt-4">
          <ProvenanceStrip {...provenance} dense />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onOpenARIA}
          className="rounded bg-primary-600 text-white px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          Open in ARIA
        </button>
        <button
          onClick={onShowContradictions}
          className="rounded border-2 border-primary-600 text-primary-600 px-3 py-2 hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          Show Contradictions
        </button>
        <button
          onClick={onOpenSubgraph}
          className="rounded bg-gray-100 px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          Open Subgraph
        </button>
        <button
          onClick={onAddToBrief}
          className="rounded bg-gray-100 px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          Add to Brief
        </button>
        <button
          onClick={onExportCitation}
          className="rounded bg-gray-100 px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          Export Citation
        </button>
      </div>
    </div>
  )
}
