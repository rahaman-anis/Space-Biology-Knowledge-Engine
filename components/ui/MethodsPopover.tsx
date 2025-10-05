"use client"

import * as React from "react"
import { cn } from "@/lib/cn"

/**
 * MethodsPopover Component
 *
 * Minimal popover button (i) that displays methodology information.
 * Links to /methods page with specific anchor. Keyboard accessible.
 *
 * @example
 * <MethodsPopover source="maturity" />
 * <MethodsPopover source="consensus" />
 */

export interface MethodsPopoverProps {
  source: "maturity" | "consensus" | "transferability" | "confidence"
  className?: string
}

const sourceLabels = {
  maturity: "Technology Maturity",
  consensus: "Scientific Consensus",
  transferability: "Transferability",
  confidence: "Confidence Level",
}

const sourceDescriptions = {
  maturity: "Assessment of technology readiness and development stage",
  consensus: "Level of agreement within the scientific community",
  transferability: "Applicability to different contexts and environments",
  confidence: "Statistical confidence in the findings",
}

const MethodsPopover = React.forwardRef<HTMLDivElement, MethodsPopoverProps>(({ source, className }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const popoverRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          "inline-flex items-center justify-center",
          "w-4 h-4 rounded-full",
          "text-[10px] font-bold",
          "bg-gray-200 text-gray-700 hover:bg-primary-600 hover:text-white",
          "transition-colors focus-ring",
        )}
      >
        <span aria-hidden="true">i</span>
        <span className="sr-only">More information about {sourceLabels[source]}</span>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`${sourceLabels[source]} information`}
          className={cn(
            "absolute z-50 mt-2 w-64 p-3",
            "bg-white rounded-md shadow-lg border border-gray-200",
            "left-0",
          )}
        >
          <h4 className="text-sm font-bold text-gray-900 mb-1">{sourceLabels[source]}</h4>
          <p className="text-xs text-gray-700 mb-2">{sourceDescriptions[source]}</p>
          <a
            href={`/methods#${source}`}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 focus-ring rounded-sm"
            onClick={() => setIsOpen(false)}
          >
            Learn more →
          </a>
        </div>
      )}
    </div>
  )
})

MethodsPopover.displayName = "MethodsPopover"

export { MethodsPopover }
