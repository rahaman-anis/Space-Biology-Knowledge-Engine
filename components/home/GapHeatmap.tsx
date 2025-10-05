"use client"

import { useState } from "react"

const ROWS = ["Bone", "Immune", "Radiation", "Muscle", "Vision"] as const
const COLS = ["<30d", "30–180d", ">180d"] as const
const DATA: Record<(typeof ROWS)[number], number[]> = {
  Bone: [2, 5, 8],
  Immune: [4, 1, 3],
  Radiation: [12, 9, 2],
  Muscle: [3, 6, 4],
  Vision: [1, 3, 5],
}

function colour(n: number) {
  if (n >= 8) return "bg-danger-600"
  if (n >= 3) return "bg-warning-600"
  return "bg-gray-300"
}

export default function GapHeatmap() {
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null)
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="font-heading text-h2 text-gray-900 mb-6">Knowledge Gap Matrix</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-caption text-gray-700">Topic</th>
                {COLS.map((c, i) => (
                  <th key={i} className="px-3 py-2 text-caption text-gray-700">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, ri) => (
                <tr key={r} className="border-b border-gray-100">
                  <th className="px-3 py-2 text-body text-gray-900">{r}</th>
                  {DATA[r].map((n, ci) => (
                    <td key={ci} className="px-3 py-3">
                      <button
                        onMouseEnter={() => setHover({ r: ri, c: ci })}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => console.log("Open gaps:", r, COLS[ci])}
                        className="w-8 h-8 rounded focus-visible:ring-2 focus-visible:ring-primary-300"
                      >
                        <div className={`w-8 h-8 rounded ${colour(n)}`} />
                      </button>
                      {hover?.r === ri && hover?.c === ci && (
                        <div className="mt-1 text-caption text-gray-700">
                          {" "}
                          {n} {n >= 8 ? "critical" : n >= 3 ? "important" : "exploratory"} gaps
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 text-caption text-gray-700 mt-3">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-danger-600" /> Critical
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-warning-600" /> Important
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-300" /> Exploratory
          </span>
          <a href="/gaps" className="ml-auto text-primary-600 hover:underline">
            View all 47 gaps →
          </a>
        </div>
      </div>
    </section>
  )
}
