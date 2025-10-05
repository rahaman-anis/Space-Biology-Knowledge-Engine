"use client"

import * as React from "react"
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { VisuallyHidden } from "@/components/ui/VisuallyHidden"

export interface MomentumPoint {
  year: number
  count: number
}

export interface MomentumSparklineProps {
  series: MomentumPoint[]
  height?: number
}

/**
 * MomentumSparkline Component
 *
 * Year-to-count mini chart showing publication momentum over time.
 * Uses Recharts with responsive container and accessible fallback text.
 *
 * @example
 * <MomentumSparkline
 *   series={[
 *     { year: 2020, count: 5 },
 *     { year: 2021, count: 8 },
 *     { year: 2022, count: 12 },
 *     { year: 2023, count: 15 }
 *   ]}
 *   height={80}
 * />
 */
export function MomentumSparkline({ series, height = 80 }: MomentumSparklineProps) {
  // Calculate trend for SR fallback
  const trend = React.useMemo(() => {
    if (series.length < 2) return "stable"
    const first = series[0].count
    const last = series[series.length - 1].count
    const change = ((last - first) / first) * 100
    if (change > 20) return "increasing"
    if (change < -20) return "decreasing"
    return "stable"
  }, [series])

  const totalCount = series.reduce((sum, point) => sum + point.count, 0)
  const yearRange = series.length > 0 ? `${series[0].year} to ${series[series.length - 1].year}` : "no data available"

  return (
    <div className="relative">
      <VisuallyHidden>
        Publication momentum from {yearRange}: {totalCount} total publications with {trend} trend.
      </VisuallyHidden>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={series} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis dataKey="year" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "none",
              borderRadius: "4px",
              padding: "8px 12px",
            }}
            labelStyle={{ color: "#fff", fontSize: "12px", fontWeight: "600" }}
            itemStyle={{ color: "#fff", fontSize: "12px" }}
          />
          <Line type="monotone" dataKey="count" stroke="#0B3D91" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Example usage:
// <MomentumSparkline
//   series={[
//     { year: 2020, count: 5 },
//     { year: 2021, count: 8 },
//     { year: 2022, count: 12 }
//   ]}
// />
