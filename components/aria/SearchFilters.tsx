"use client"

import type { SectionType, Confidence } from "@/lib/aria/schema"

interface Props {
  section: SectionType | "All"
  confidence: Confidence | "All"
  sort: "Relevance" | "Confidence" | "Year"
  onSectionChange: (s: SectionType | "All") => void
  onConfidenceChange: (c: Confidence | "All") => void
  onSortChange: (s: "Relevance" | "Confidence" | "Year") => void
}

export function SearchFilters({ section, confidence, sort, onSectionChange, onConfidenceChange, onSortChange }: Props) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Section</label>
        <select
          value={section}
          onChange={(e) => onSectionChange(e.target.value as any)}
          className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 transition-all"
        >
          <option value="All">All Sections</option>
          <option value="Results">Results</option>
          <option value="Discussion">Discussion</option>
          <option value="Methods">Methods</option>
          <option value="Introduction">Introduction</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Confidence</label>
        <select
          value={confidence}
          onChange={(e) => onConfidenceChange(e.target.value as any)}
          className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 transition-all"
        >
          <option value="All">All Levels</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Sort By</label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 transition-all"
        >
          <option value="Relevance">Relevance</option>
          <option value="Confidence">Confidence</option>
          <option value="Year">Year</option>
        </select>
      </div>
    </div>
  )
}
