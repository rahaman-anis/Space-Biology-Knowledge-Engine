import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { MethodsPopover } from "@/components/ui/MethodsPopover"
import { cn } from "@/lib/cn"

export type Band = "High" | "Medium" | "Low"
export type Consensus = "Strong" | "Mixed" | "Conflicted"

export interface MaturityPanelProps {
  band: Band
  studyCount: number
  recencyIndex: number // 0..1
  consensus: Consensus
}

/**
 * MaturityPanel Component
 *
 * Visualizes maturity band with contributing factors (study count, recency, consensus).
 * Includes explanatory popover for methodology.
 *
 * @example
 * <MaturityPanel
 *   band="High"
 *   studyCount={24}
 *   recencyIndex={0.85}
 *   consensus="Strong"
 * />
 */
export function MaturityPanel({ band, studyCount, recencyIndex, consensus }: MaturityPanelProps) {
  const recencyPercent = Math.round(recencyIndex * 100)

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Maturity</h3>
          <Badge variant={band} heuristic className="text-base px-3 py-1">
            {band}
          </Badge>
        </div>
        <MethodsPopover
          title="Maturity Calculation"
          content="Maturity bands combine study count, recency index, and consensus strength. High: ≥20 studies, recency >70%, strong consensus. Medium: 10-19 studies or moderate recency. Low: <10 studies or conflicted evidence."
        />
      </div>

      {/* Contributing factors */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Study Count</span>
          <span className="font-semibold text-gray-900">{studyCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Recency Index</span>
          <span className="font-semibold text-gray-900">{recencyPercent}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Consensus</span>
          <Badge variant={consensus} heuristic>
            {consensus}
          </Badge>
        </div>
      </div>

      {/* Visual indicator */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex gap-1" role="presentation" aria-hidden="true">
          <div className={cn("h-2 flex-1 rounded-sm", band === "High" ? "bg-success-600" : "bg-gray-200")} />
          <div
            className={cn(
              "h-2 flex-1 rounded-sm",
              band === "High" || band === "Medium" ? "bg-warning-600" : "bg-gray-200",
            )}
          />
          <div className={cn("h-2 flex-1 rounded-sm", band === "Low" ? "bg-gray-400" : "bg-gray-200")} />
        </div>
      </div>
    </Card>
  )
}

// Example usage:
// <MaturityPanel band="High" studyCount={24} recencyIndex={0.85} consensus="Strong" />
