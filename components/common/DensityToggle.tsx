"use client"

/**
 * DensityToggle Component
 *
 * Toggles compact density mode by adding/removing .density-compact class on body.
 * Reduces line-height and padding for research-focused reading.
 */
export default function DensityToggle() {
  return (
    <button
      type="button"
      aria-label="Toggle compact density"
      onClick={() => document.body.classList.toggle("density-compact")}
      className="text-xs px-2 py-1 rounded hover:bg-gray-100 focus-visible-ring"
    >
      Compact
    </button>
  )
}
