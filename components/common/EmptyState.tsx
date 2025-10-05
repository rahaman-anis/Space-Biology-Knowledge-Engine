"use client"

import Link from "next/link"

export default function EmptyState({
  title = "No evidence found",
  suggestions = ["Broaden your search terms", "Remove some filters", "Browse all gaps"],
  primaryHref = "/gaps",
  onReset,
  actions,
}: {
  title?: string
  suggestions?: string[]
  primaryHref?: string
  onReset?: () => void
  actions?: Array<{ label: string; variant?: "primary" | "secondary"; onClick?: () => void }>
}) {
  return (
    <div className="text-center rounded-lg border border-gray-200 bg-white p-10">
      <div className="text-4xl mb-3">🔍</div>
      <h3 className="font-heading text-xl text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-700 mb-6">Try:</p>
      <ul className="inline-block text-left text-sm text-gray-700 mb-6 list-disc pl-6">
        {suggestions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <div className="flex justify-center gap-3">
        {actions ? (
          actions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={
                action.variant === "primary"
                  ? "rounded bg-primary-600 text-white px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary-300"
                  : "rounded border-2 border-primary-600 text-primary-600 px-4 py-2 hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300"
              }
            >
              {action.label}
            </button>
          ))
        ) : (
          <>
            <Link
              href={primaryHref}
              className="rounded bg-primary-600 text-white px-4 py-2 focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              Browse Gaps
            </Link>
            <button
              onClick={onReset}
              className="rounded border-2 border-primary-600 text-primary-600 px-4 py-2 hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              Reset Filters
            </button>
          </>
        )}
      </div>
    </div>
  )
}
