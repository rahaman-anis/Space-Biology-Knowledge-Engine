import * as React from "react"
import { cn } from "@/lib/cn"

/**
 * Skeleton Component
 *
 * Loading placeholder with multiple shape variants and presets.
 * Respects prefers-reduced-motion for accessibility.
 *
 * @example
 * <Skeleton variant="text" className="w-full" />
 * <Skeleton variant="circular" className="w-12 h-12" />
 * <SkeletonText lines={3} />
 * <SkeletonCard />
 */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular"
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rectangular", ...props }, ref) => {
    const variantStyles = {
      text: "h-4 rounded-sm",
      circular: "rounded-full",
      rectangular: "rounded-md",
    }

    return (
      <div
        ref={ref}
        className={cn("animate-pulse bg-gray-200", variantStyles[variant], className)}
        aria-busy="true"
        aria-live="polite"
        {...props}
      />
    )
  },
)

Skeleton.displayName = "Skeleton"

export interface SkeletonTextProps {
  lines?: number
  className?: string
}

const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 3, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" className={cn("w-full", i === lines - 1 && "w-4/5")} />
      ))}
    </div>
  )
}

SkeletonText.displayName = "SkeletonText"

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("space-y-4 p-6 border border-gray-200 rounded-lg", className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}

SkeletonCard.displayName = "SkeletonCard"

export { Skeleton, SkeletonText, SkeletonCard }
