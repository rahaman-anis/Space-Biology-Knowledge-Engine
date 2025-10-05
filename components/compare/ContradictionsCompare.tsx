"use client"
import { useEffect } from "react"
import CompareTwoPane from "@/components/layout/CompareTwoPane"

export interface CompareEntry {
  id: string
  text: string
  left?: { study: string; finding: string }
  right?: { study: string; finding: string }
}

export default function ContradictionsCompare({
  open,
  onClose,
  leftTitle = "Supporting",
  rightTitle = "Contradicting",
  left,
  right,
}: {
  open: boolean
  onClose: () => void
  leftTitle?: string
  rightTitle?: string
  left: Array<{ study: string; finding: string }>
  right: Array<{ study: string; finding: string }>
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="absolute left-1/2 top-1/2 w-[min(100%,960px)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-xl text-gray-900">Contradictions</h2>
          <button onClick={onClose} className="rounded px-2 py-1 focus-visible:ring-2 focus-visible:ring-primary-300">
            Close
          </button>
        </div>
        <CompareTwoPane
          leftTitle={`${leftTitle} (${left.length})`}
          rightTitle={`${rightTitle} (${right.length})`}
          left={
            <ul className="space-y-2">
              {left.map((e, i) => (
                <li key={i} className="rounded border border-gray-200 p-2">
                  <div className="font-semibold text-sm">{e.study}</div>
                  <div className="text-xs text-gray-700">{e.finding}</div>
                </li>
              ))}
            </ul>
          }
          right={
            <ul className="space-y-2">
              {right.map((e, i) => (
                <li key={i} className="rounded border border-gray-200 p-2">
                  <div className="font-semibold text-sm">{e.study}</div>
                  <div className="text-xs text-gray-700">{e.finding}</div>
                </li>
              ))}
            </ul>
          }
        />
        <p className="mt-3 text-xs text-gray-700">
          Tip: Open the Graph with &quot;Contradictions only&quot; to inspect relations.
        </p>
      </div>
    </div>
  )
}
