import * as React from "react"
import { cn } from "@/lib/cn"

/**
 * Button Component
 *
 * Accessible, variant-driven button following NASA LifeLens brand tokens.
 * Supports multiple variants, sizes, loading states, and icon placement.
 *
 * @example
 * <Button variant="primary" size="md" leftIcon={<Icon />}>
 *   Click me
 * </Button>
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading = false, leftIcon, rightIcon, children, disabled, ...props },
    ref,
  ) => {
    const variantStyles = {
      primary:
        "bg-primary-base text-white hover:bg-primary-dark active:bg-primary-light disabled:bg-gray-200 disabled:text-gray-700",
      secondary:
        "bg-blue-yonder text-white hover:bg-primary-base active:bg-primary-light disabled:bg-gray-200 disabled:text-gray-700",
      outline:
        "border-2 border-primary-base text-primary-base hover:bg-primary-base hover:text-white active:border-primary-light active:text-primary-light disabled:border-gray-200 disabled:text-gray-700",
      ghost: "text-primary-base hover:bg-gray-50 active:text-primary-light disabled:text-gray-700",
    }

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-sm gap-2",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-semibold transition-colors focus-ring",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    )
  },
)

Button.displayName = "Button"

export { Button }
