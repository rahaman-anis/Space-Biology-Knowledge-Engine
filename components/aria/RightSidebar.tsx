"use client"

import { X } from "lucide-react"

interface RecentCitation {
  pmcid: string
  title: string
}

interface RightSidebarProps {
  citations: RecentCitation[]
  activePmcid: string | null
  onFilterByPmcid: (pmcid: string) => void
  onClearFilter: () => void
}

export function RightSidebar({ citations, activePmcid, onFilterByPmcid, onClearFilter }: RightSidebarProps) {
  if (!citations.length) return null

  return (
    <aside className="bg-card rounded-xl shadow border border-border p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-foreground">Recently Cited</h3>
        {activePmcid && (
          <button
            onClick={onClearFilter}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            aria-label="Clear filter"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <ul className="space-y-3">
        {citations.map((citation) => {
          const isActive = activePmcid === citation.pmcid
          return (
            <li key={citation.pmcid}>
              <button
                onClick={() => onFilterByPmcid(citation.pmcid)}
                className={`w-full text-left p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                  isActive
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                }`}
                aria-pressed={isActive}
              >
                <div className="font-mono text-xs text-primary mb-1">{citation.pmcid}</div>
                <div className="text-sm text-foreground line-clamp-2">{citation.title}</div>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">Click a citation to filter results by that paper</p>
      </div>
    </aside>
  )
}
