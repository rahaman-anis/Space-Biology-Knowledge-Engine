import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { VisuallyHidden } from "@/components/ui/VisuallyHidden"

export type Band = "High" | "Medium" | "Low"

export interface CrossSpeciesRow {
  source: string
  target: string
  confidence: Band
  n?: number
}

export interface CrossSpeciesPanelProps {
  rows: CrossSpeciesRow[]
}

/**
 * CrossSpeciesPanel Component
 *
 * Compact table showing species-to-species mapping with confidence bands.
 * Includes accessible caption and proper table semantics.
 *
 * @example
 * <CrossSpeciesPanel
 *   rows={[
 *     { source: "Mouse", target: "Human", confidence: "High", n: 24 },
 *     { source: "Rat", target: "Human", confidence: "Medium", n: 12 },
 *     { source: "Drosophila", target: "Human", confidence: "Low", n: 5 }
 *   ]}
 * />
 */
export function CrossSpeciesPanel({ rows }: CrossSpeciesPanelProps) {
  if (rows.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-gray-600">No cross-species mappings available.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Cross-Species Mapping</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <VisuallyHidden>
            <caption>Cross-species mapping showing source organism, target organism, and confidence level</caption>
          </VisuallyHidden>
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-900">Source</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-900">Target</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-900">Confidence</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-900">Studies</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`${row.source}-${row.target}-${idx}`} className="border-b border-gray-100 last:border-0">
                <td className="py-2 px-3 text-gray-700">{row.source}</td>
                <td className="py-2 px-3 text-gray-700">{row.target}</td>
                <td className="py-2 px-3">
                  <Badge variant={row.confidence} heuristic>
                    {row.confidence}
                  </Badge>
                </td>
                <td className="py-2 px-3 text-right text-gray-700">{row.n !== undefined ? row.n : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// Example usage:
// <CrossSpeciesPanel
//   rows={[
//     { source: "Mouse", target: "Human", confidence: "High", n: 24 },
//     { source: "Rat", target: "Human", confidence: "Medium", n: 12 }
//   ]}
// />
