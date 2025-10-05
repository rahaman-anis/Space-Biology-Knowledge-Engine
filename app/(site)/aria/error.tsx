"use client"
import RetryPanel from "@/components/common/RetryPanel"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RetryPanel
      title="ARIA failed to render"
      tips={["Check your network", "Try rephrasing your question", "Remove some filters"]}
      onRetry={reset}
    />
  )
}
