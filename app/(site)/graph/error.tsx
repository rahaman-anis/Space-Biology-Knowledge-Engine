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
      title="Graph page failed to render"
      tips={["Check your network", "Try reducing the number of nodes", "Remove some filters"]}
      onRetry={reset}
    />
  )
}
