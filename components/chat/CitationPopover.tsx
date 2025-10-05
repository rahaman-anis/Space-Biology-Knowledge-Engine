"use client"
import { useEffect, useRef, useState } from "react"
import type { CitationRef } from "@/types/chat"

export default function CitationPopover({
  refs,
  anchorText = "[1]",
  onAddToBrief,
  onViewAll,
}: {
  refs: CitationRef[]
  anchorText?: string
  onAddToBrief?: () => void
  onViewAll?: () => void
}) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    const first = panelRef.current?.querySelector<HTMLElement>("a,button")
    first?.focus()
  }, [open])

  return (
    <span className="relative inline-block align-super leading-none">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="text-[10px] text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 rounded px-0.5"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="citation-popover"
        aria-label={`Show ${refs.length} citation${refs.length > 1 ? "s" : ""}`}
      >
        {anchorText}
      </button>
      {open && (
        <div
          ref={panelRef}
          id="citation-popover"
          role="dialog"
          aria-modal="true"
          className="absolute z-40 mt-1 w-[320px] right-0 rounded-lg border border-gray-200 bg-white shadow-lg p-3"
        >
          <ul className="space-y-2">
            {refs.map((r, i) => (
              <li key={i} className="text-caption text-gray-800">
                <div className="font-semibold">
                  {r.title ?? "Untitled"} {r.year ? `(${r.year})` : ""}
                </div>
                <div className="mono text-gray-700">
                  {r.pmcid ? `PMCID ${r.pmcid}` : r.ntrsId ? `NTRS ${r.ntrsId}` : r.osdrId ? `OSDR ${r.osdrId}` : "—"}
                  {r.section ? ` • ${r.section}` : ""}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => {
                onAddToBrief?.()
                setOpen(false)
                btnRef.current?.focus()
              }}
              className="rounded bg-gray-100 px-2 py-1 text-caption focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              Add to Brief
            </button>
            <button
              onClick={() => {
                onViewAll?.()
                setOpen(false)
                btnRef.current?.focus()
              }}
              className="rounded border-2 border-primary-600 text-primary-600 px-2 py-1 text-caption hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              View full papers
            </button>
          </div>
        </div>
      )}
    </span>
  )
}
