"use client"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/Badge"

export type EvidenceSection = "Results" | "Discussion" | "Methods"
export type Band = "High" | "Medium" | "Low"

export interface EvidenceRow {
  id: string
  sourceId: string // NTRS-12345 / PMC8765432
  section: EvidenceSection
  confidence: Band
  date?: string // ISO yyyy-mm-dd
  title?: string // optional tooltip/title
}

interface EvidenceTableProps {
  rows: EvidenceRow[]
  initialSort?: { key: keyof EvidenceRow | "sourceId" | "section" | "confidence" | "date"; dir: "asc" | "desc" }
  density?: "compact" | "comfortable" | "spacious"
  showActions?: boolean // default false
  onView?: (id: string) => void
  buildHref?: (id: string) => string | null
}

export default function EvidenceTable({
  rows,
  initialSort = { key: "date", dir: "desc" },
  density = "comfortable",
  showActions = false,
  onView,
  buildHref,
}: EvidenceTableProps) {
  const [sort, setSort] = useState(initialSort)
  const pad = density === "compact" ? "py-2" : density === "spacious" ? "py-4" : "py-3"

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const k = sort.key as any
      const av = (a[k] ?? "") as any
      const bv = (b[k] ?? "") as any
      if (av < bv) return sort.dir === "asc" ? -1 : 1
      if (av > bv) return sort.dir === "asc" ? 1 : -1
      return 0
    })
    return copy
  }, [rows, sort])

  function toggle(key: typeof sort.key) {
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }))
  }

  const toExternal = (id: string): string | null => {
    if (buildHref) return buildHref(id)
    if (/^PMC\d+$/i.test(id)) return `https://www.ncbi.nlm.nih.gov/pmc/articles/${id}/`
    if (/^NTRS[-]?\d+/i.test(id)) return `https://ntrs.nasa.gov/search?q=${encodeURIComponent(id)}`
    if (/^OSDR[-]?\d+/i.test(id)) return `https://osdr.nasa.gov/bio/repo/data/studies/${id.replace(/^[A-Z-]+/, "")}`
    return null
  }

  const thBase = `sticky top-0 bg-gray-50 text-gray-900 font-semibold text-sm ${pad} px-3 border-b border-gray-200 select-none`
  const tdBase = `px-3 ${pad} border-b border-gray-100`
  const zebra = "odd:bg-white even:bg-gray-50"

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className={`${thBase} w-[180px]`}>
              <button
                onClick={() => toggle("sourceId")}
                className="focus-visible:ring-2 focus-visible:ring-primary-300 rounded px-1"
              >
                Source
              </button>
            </th>
            <th className={thBase}>
              <button
                onClick={() => toggle("section")}
                className="focus-visible:ring-2 focus-visible:ring-primary-300 rounded px-1"
              >
                Section
              </button>
            </th>
            <th className={thBase}>
              <button
                onClick={() => toggle("confidence")}
                className="focus-visible:ring-2 focus-visible:ring-primary-300 rounded px-1"
              >
                Confidence
              </button>
            </th>
            <th className={`${thBase} w-[140px]`}>
              <button
                onClick={() => toggle("date")}
                className="focus-visible:ring-2 focus-visible:ring-primary-300 rounded px-1"
              >
                Date
              </button>
            </th>
            {showActions && <th className={`${thBase} w-[120px]`}>Actions</th>}
          </tr>
        </thead>
        <tbody className="text-sm text-gray-900">
          {sorted.map((r) => {
            const href = toExternal(r.sourceId)
            return (
              <tr key={r.id} className={`${zebra} hover:bg-gray-50`}>
                <td className={`${tdBase} whitespace-nowrap`}>
                  <span title={r.title ?? ""} className="mono">
                    {r.sourceId}
                  </span>
                </td>
                <td className={tdBase}>
                  <Badge variant={r.section as any}>{r.section}</Badge>
                </td>
                <td className={tdBase}>
                  <Badge variant={r.confidence as any}>{r.confidence}</Badge>
                </td>
                <td className={`${tdBase} text-gray-700`}>{r.date ?? "—"}</td>
                {showActions && (
                  <td className={tdBase}>
                    {href ? (
                      <Link
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded border-2 border-primary-600 text-primary-600 text-sm hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300 transition-colors"
                      >
                        View
                      </Link>
                    ) : (
                      <button
                        onClick={() => onView?.(r.sourceId)}
                        className="inline-flex items-center px-3 py-1.5 rounded border-2 border-primary-600 text-primary-600 text-sm hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300 transition-colors"
                      >
                        View
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={showActions ? 5 : 4} className="px-3 py-12 text-center text-gray-700">
                No rows
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
