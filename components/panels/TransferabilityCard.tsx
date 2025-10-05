import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/cn"

export type Band = "High" | "Medium" | "Low"

export interface TransferabilityProps {
  band: Band
  environmentMatch: number // 0..1
  durationMatch: number // 0..1
  analogueCoverage: number // 0..1
}

/**
 * TransferabilityCard Component
 *
 * Shows transferability band with contributing match factors.
 * Uses progress bars to visualize environment, duration, and analogue coverage.
 *
 * @example
 * <TransferabilityCard
 *   band="High"
 *   environmentMatch={0.9}
 *   durationMatch={0.75}
 *   analogueCoverage={0.85}
 * />
 */
export function TransferabilityCard({ band, environmentMatch, durationMatch, analogueCoverage }: TransferabilityProps) {
  const factors = [
    { label: "Environment Match", value: environmentMatch },
    { label: "Duration Match", value: durationMatch },
    { label: "Analogue Coverage", value: analogueCoverage },
  ]

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Transferability</h3>
        <Badge variant={band} heuristic className="text-base px-3 py-1">
          {band}
        </Badge>
      </div>

      {/* Match factors with progress bars */}
      <div className="space-y-3">
        {factors.map((factor) => {
          const percent = Math.round(factor.value * 100)
          return (
            <div key={factor.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{factor.label}</span>
                <span className="font-semibold text-gray-900">{percent}%</span>
              </div>
              <div
                className="h-2 bg-gray-200 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${factor.label}: ${percent}%`}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    percent >= 70 ? "bg-success-600" : percent >= 40 ? "bg-warning-600" : "bg-gray-400",
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Rationale */}
      <p className="text-xs text-gray-600 leading-relaxed pt-2 border-t border-gray-200">
        Transferability reflects how well findings from model organisms or analogues apply to the target context based
        on environmental similarity, duration alignment, and coverage of relevant biological systems.
      </p>
    </Card>
  )
}

// Example usage:
// <TransferabilityCard
//   band="High"
//   environmentMatch={0.9}
//   durationMatch={0.75}
//   analogueCoverage={0.85}
// />
