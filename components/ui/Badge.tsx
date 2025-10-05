import * as React from "react"
import { cn } from "@/lib/cn"

/**
 * Badge Component
 *
 * Compact status indicator with semantic and domain-specific variants.
 * Neon yellow used only for text, never backgrounds (per brand guidelines).
 *
 * @example
 * <Badge variant="primary">New</Badge>
 * <Badge variant="Results">Results</Badge>
 * <Badge variant="High" heuristic>High Confidence</Badge>
 */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "neutral"
    | "primary"
    | "accent"
    | "success"
    | "warning"
    | "danger"
    | "Results"
    | "Discussion"
    | "Methods"
    | "High"
    | "Medium"
    | "Low"
    | "Strong"
    | "Mixed"
    | "Conflicted"
    | "Critical"
    | "Important"
    | "Exploratory"
  heuristic?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", heuristic = false, children, ...props }, ref) => {
    const variantStyles = {
      neutral: "bg-gray-200 text-gray-900",
      primary: "bg-primary-600 text-white",
      accent: "bg-gray-900 text-accent-neon", // Neon yellow text only
      success: "bg-success-600 text-white",
      warning: "bg-warning-600 text-white",
      danger: "bg-danger-600 text-white",
      // Domain-specific tags
      Results: "bg-primary-600 text-white",
      Discussion: "bg-blueYonder text-white",
      Methods: "bg-gray-700 text-white",
      High: "bg-success-600 text-white",
      Medium: "bg-warning-600 text-white",
      Low: "bg-gray-200 text-gray-900",
      Strong: "bg-success-600 text-white",
      Mixed: "bg-warning-600 text-white",
      Conflicted: "bg-danger-600 text-white",
      Critical: "bg-rocketRed text-white",
      Important: "bg-primary-600 text-white",
      Exploratory: "bg-blueYonder text-white",
    }

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-semibold",
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {heuristic && (
          <span className="text-[10px]" aria-label="Heuristic indicator">
            ~
          </span>
        )}
        {children}
      </span>
    )
  },
)

Badge.displayName = "Badge"

export { Badge }
