"use client"
import { useEffect, useState } from "react"
import type { ExportItem } from "@/types/citation"
import { listBrief, removeFromBrief, clearBrief } from "@/lib/brief/store"
import { downloadBibTeX } from "@/lib/export/bibtex"
import { downloadRIS } from "@/lib/export/ris"

export default function BriefDrawer() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<ExportItem[]>([])
  useEffect(() => {
    setItems(listBrief())
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-primary-600 text-white px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        Brief ({items.length})
      </button>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-xl text-gray-900">Brief</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded px-2 py-1 focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                Close
              </button>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-gray-700">No items yet. Use &quot;Add to brief&quot;.</p>
            ) : (
              <ul className="space-y-3">
                {items.map((it) => (
                  <li key={it.id} className="rounded border border-gray-200 p-3">
                    <div className="font-semibold text-sm text-gray-900">
                      {it.title ?? it.pmcid ?? it.ntrsId ?? it.osdrId ?? it.id}
                    </div>
                    <div className="text-xs text-gray-700">
                      {it.section ? `[${it.section}] ` : ""}
                      {it.year ?? ""}
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          removeFromBrief(it.id)
                          setItems(listBrief())
                        }}
                        className="rounded bg-gray-100 px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-primary-300"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => downloadBibTeX(items)}
                className="rounded border-2 border-primary-600 text-primary-600 px-3 py-1.5 text-sm hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                Export .bib
              </button>
              <button
                onClick={() => downloadRIS(items)}
                className="rounded border-2 border-primary-600 text-primary-600 px-3 py-1.5 text-sm hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                Export .ris
              </button>
              <button
                onClick={() => {
                  clearBrief()
                  setItems([])
                }}
                className="rounded px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                Clear
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
