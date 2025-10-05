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
      title="Gaps page failed to render"
      tips={["Check your network", "Try refreshing the page"]}
      onRetry={reset}
    />
  )
}
