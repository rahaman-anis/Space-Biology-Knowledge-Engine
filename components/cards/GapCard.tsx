"use client"

import { Badge } from "@/components/ui/Badge"

export type Severity = "Critical" | "Important" | "Exploratory"
export interface Gap {
  id: string
  text: string
  whyItMatters?: string
  severity: Severity
  missionPhase?: string
  curated: boolean
  related?: { pmcid?: string; ntrsId?: string }[]
}

export default function GapCard({
  gap,
  onOpenARIA,
  onAddToBrief,
  onExportCitation,
  onShowContradictions,
}: {
  gap: Gap
  onOpenARIA?: () => void
  onAddToBrief?: () => void
  onExportCitation?: () => void
  onShowContradictions?: () => void
}) {
  return (
    <div className="rounded-lg bg-white shadow-md p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-base text-gray-900">{gap.text}</h3>
          {gap.whyItMatters && <p className="text-sm text-gray-700 mt-1">{gap.whyItMatters}</p>}
          {gap.missionPhase && (
            <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
              Phase: {gap.missionPhase}
            </span>
          )}
        </div>
        <Badge
          variant={
            gap.severity === "Critical" ? "Critical" : gap.severity === "Important" ? "Important" : "Exploratory"
          }
        >
          {gap.severity}
        </Badge>
      </div>

      {!gap.curated && (
        <div className="mt-3 inline-flex items-center gap-2 rounded px-2 py-1 text-xs text-[#E43700] bg-[repeating-linear-gradient(45deg,rgba(228,55,0,.08)_0_10px,rgba(228,55,0,.16)_10px_20px)]">
          Needs curation
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
