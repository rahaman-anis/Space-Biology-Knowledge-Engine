"use client"

import type { SectionType, Confidence } from "@/lib/aria/schema"

export function SectionBadge({ section }: { section: SectionType | string }) {
  const colors: Record<string, string> = {
    Results: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Discussion: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Methods: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Introduction: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  }
  const className = colors[section] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"

  return (
    <span className={`px-3 py-1 rounded-md text-sm font-bold ${className}`} data-testid="section-badge">
      {section}
    </span>
  )
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence | string }) {
  const colors: Record<string, { bg: string; icon: string }> = {
    High: { bg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: "✓" },
    Medium: { bg: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: "~" },
    Low: { bg: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", icon: "?" },
  }
  const config = colors[confidence] || colors.Low

  return (
    <span
      className={`px-3 py-1 rounded-md text-sm font-bold ${config.bg} inline-flex items-center gap-1`}
      data-testid="confidence-badge"
    >
      <span>{config.icon}</span>
      <span>Confidence: {confidence}</span>
    </span>
  )
}

export function ConsensusBadge({ consensus }: { consensus?: "Strong" | "Mixed" | "Weak" }) {
  if (!consensus) return null

  const colors: Record<string, { bg: string; dot: string }> = {
    Strong: { bg: "bg-green-100 text-green-700", dot: "bg-green-500" },
    Mixed: { bg: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
    Weak: { bg: "bg-gray-100 text-gray-700", dot: "bg-gray-500" },
  }
  const config = colors[consensus]

  return (
    <span className={`px-3 py-1 rounded-md text-sm font-bold ${config.bg} inline-flex items-center gap-1.5`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span>Consensus: {consensus}</span>
    </span>
  )
}
