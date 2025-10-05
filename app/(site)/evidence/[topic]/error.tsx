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
      title="Evidence page failed to render"
      tips={["Check your network", "Try a different topic", "Remove some filters"]}
      onRetry={reset}
    />
  )
}
