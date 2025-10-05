"use client"

import * as React from "react"
import { cn } from "@/lib/cn"

/**
 * Chip Component
 *
 * Filter pill with active state for faceted search and filtering.
 * Keyboard accessible with aria-pressed state.
 *
 * @example
 * <Chip active={isActive} onClick={() => setActive(!isActive)}>
 *   Filter Name
 * </Chip>
 */

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, active = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="button"
        aria-pressed={active}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-1.5 rounded-full",
          "text-xs font-semibold transition-colors",
          "border focus-ring",
          active
            ? "bg-primary-600 text-white border-primary-600"
            : "bg-white text-gray-900 border-gray-200 hover:border-primary-600 hover:text-primary-600",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Chip.displayName = "Chip"

export { Chip }
