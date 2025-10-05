"use client"
import { useState } from "react"

export default function AdvancedFiltersBar({
  initial = "",
  onApply,
  onClear,
  activeCount = 0,
  savedSets = [],
}: {
  initial?: string
  onApply: (query: string) => void
  onClear?: () => void
  activeCount?: number
  savedSets?: { name: string; query: string }[]
}) {
  const [q, setQ] = useState(initial)
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <label className="text-xs text-gray-700">Advanced filters (AND/OR/NOT)</label>
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          rows={2}
          placeholder="(topic:bone AND organism:human) OR (topic:muscle AND environment:microgravity)"
          className="flex-1 rounded border border-gray-200 p-2 focus-visible:ring-2 focus-visible:ring-primary-300"
        />
        <div className="flex gap-2">
          <button
            onClick={() => onApply(q)}
            className="rounded bg-primary-600 text-white px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Apply
          </button>
          <button
            onClick={onClear}
            className="rounded border-2 border-primary-600 text-primary-600 px-3 py-2 hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-700">Active: {activeCount} filters</div>
      {savedSets.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {savedSets.map((s) => (
            <button
              key={s.name}
              onClick={() => onApply(s.query)}
              className="rounded bg-gray-100 px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
