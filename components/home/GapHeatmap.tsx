"use client"

import { useState } from "react"

const ROWS = ["Bone", "Immune", "Radiation", "Muscle", "Vision"] as const
const COLS = ["<30d", "30–180d", ">180d"] as const
const DATA: Record<(typeof ROWS)[number], number[]> = {
  Bone: [2, 5, 8],
  Immune: [1, 4, 3],
  Radiation: [7, 6, 2],
  Muscle: [3, 5, 4],
  Vision: [2, 3, 4],
}

function colour(n: number) {
  if (n >= 6) return "bg-red-500"
  if (n >= 3) return "bg-orange-500"
  return "bg-gray-300"
}

export default function GapHeatmap() {
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null)
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-heading text-4xl font-bold text-gray-900 mb-4 text-center">Knowledge Gap Matrix</h2>
        <p className="text-lg text-gray-600 mb-12 text-center">173 research gaps mapped across mission durations</p>

        <div className="bg-gray-50 rounded-2xl p-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-4 px-4 text-lg font-bold text-gray-900">Topic</th>
                {COLS.map((c, i) => (
                  <th key={i} className="text-center py-4 px-4 text-lg font-bold text-gray-900">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, ri) => (
                <tr key={r} className="border-b border-gray-200">
                  <th className="py-4 px-4 text-lg font-semibold text-gray-900 text-left">{r}</th>
                  {DATA[r].map((n, ci) => (
                    <td key={ci} className="py-4 px-4 text-center">
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${colour(n)}`}
                        onMouseEnter={() => setHover({ r: ri, c: ci })}
                        onMouseLeave={() => setHover(null)}
                      >
                        <span className="text-white font-bold text-lg">{n}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex gap-8 justify-center mt-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <span className="text-base text-gray-700">Critical (≥6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded"></div>
              <span className="text-base text-gray-700">Important (3-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <span className="text-base text-gray-700">Exploratory (1-2)</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <a href="/gaps" className="text-primary-600 hover:underline font-semibold text-lg">
            View all 173 gaps →
          </a>
        </div>
      </div>
    </section>
  )
}
