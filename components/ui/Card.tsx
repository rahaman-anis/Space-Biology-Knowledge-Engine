import * as React from "react"
import { cn } from "@/lib/cn"

/**
 * Card Component
 *
 * Flexible container with header, content, and footer slots.
 * Supports multiple elevation levels for visual hierarchy.
 *
 * @example
 * <Card elevation="e1">
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *   </CardHeader>
 *   <CardContent>Card content goes here</CardContent>
 *   <CardFooter>Footer actions</CardFooter>
 * </Card>
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: "e0" | "e1" | "e2" | "e3"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, elevation = "e1", ...props }, ref) => {
  const elevationStyles = {
    e0: "shadow-none border border-gray-200",
    e1: "shadow-sm border border-gray-200",
    e2: "shadow-md",
    e3: "shadow-lg",
  }

  return <div ref={ref} className={cn("rounded-lg bg-white", elevationStyles[elevation], className)} {...props} />
})

Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col gap-1 p-6", className)} {...props} />,
)

CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-base font-bold text-gray-900", className)} {...props} />
  ),
)

CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm text-gray-700", className)} {...props} />,
)

CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
)

CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2 p-6 pt-0", className)} {...props} />
  ),
)

CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
