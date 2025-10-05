"use client"
import AnswerCard from "@/components/aria/AnswerCard"
import type { AssistantPayload } from "@/types/chat"
import { addToBrief } from "@/lib/brief/store"
import { downloadBibTeX } from "@/lib/export/bibtex"
import { downloadRIS } from "@/lib/export/ris"
import ContradictionsCompare from "@/components/compare/ContradictionsCompare"
import { useMemo, useState } from "react"

export default function ChatMessageAssistant({ payload, time }: { payload: AssistantPayload; time?: string }) {
  const [openCompare, setOpenCompare] = useState(false)

  const exportItems = useMemo(() => {
    return (payload.sources ?? []).map((s, i) => ({
      id: `src_${i}`,
      title: s.title,
      year: s.year,
      section: s.section,
      pmcid: s.pmcid,
      ntrsId: s.ntrsId,
      osdrId: s.osdrId,
      authors: s.authors,
      journal: s.journal,
    }))
  }, [payload.sources])

  const supports = (payload.evidence ?? [])
    .filter((e) => e.section === "Results")
    .map((e, i) => ({
      study: e.citations?.[0]?.pmcid
        ? `PMCID ${e.citations[0].pmcid}`
        : e.citations?.[0]?.ntrsId
          ? `NTRS ${e.citations[0].ntrsId}`
          : `Study ${i + 1}`,
      finding: e.text,
    }))
  const contradicts = (payload.evidence ?? [])
    .filter((e) => e.section === "Discussion" && /no effect|contradict/i.test(e.text))
    .map((e, i) => ({
      study: e.citations?.[0]?.pmcid
        ? `PMCID ${e.citations[0].pmcid}`
        : e.citations?.[0]?.ntrsId
          ? `NTRS ${e.citations[0].ntrsId}`
          : `Study ${i + 1}`,
      finding: e.text,
    }))

  return (
    <article role="article" aria-label="AI response" className="max-w-[900px]">
      <AnswerCard
        title="Summary"
        summary={payload.summary}
        confidence={payload.confidence}
        consensus={payload.consensus}
        coverageCount={payload.coverageCount}
        confidenceInterval={payload.confidenceInterval}
        freshnessText={payload.freshnessText}
        evidence={payload.evidence}
        onOpenARIA={() => {}}
        onShowContradictions={() => setOpenCompare(true)}
        onOpenSubgraph={() => {
          window.location.href = `/graph?contradictionsOnly=true`
        }}
        onAddToBrief={() => addToBrief(exportItems)}
        onExportCitation={() => {
          if (exportItems.length) downloadBibTeX(exportItems)
        }}
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => downloadBibTeX(exportItems)}
          className="rounded border-2 border-primary-600 text-primary-600 px-3 py-1.5 text-sm hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          Export .bib
        </button>
        <button
          onClick={() => downloadRIS(exportItems)}
          className="rounded border-2 border-primary-600 text-primary-600 px-3 py-1.5 text-sm hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          Export .ris
        </button>
        <button
          onClick={() => addToBrief(exportItems)}
          className="rounded bg-gray-100 px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          Add to brief
        </button>
      </div>
      {time && <p className="mt-1 text-xs text-gray-600">{time}</p>}
      <ContradictionsCompare
        open={openCompare}
        onClose={() => setOpenCompare(false)}
        left={supports}
        right={contradicts}
      />
    </article>
  )
}
