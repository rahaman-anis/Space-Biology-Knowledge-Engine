export default function LatencyChip({ ms, cached }: { ms?: number; cached?: boolean }) {
  if (ms == null && cached == null) return null
  return (
    <span className="inline-flex items-center gap-2 rounded bg-gray-100 px-2 py-1 text-caption text-gray-800">
      {typeof ms === "number" ? <span>{ms} ms</span> : null}
      {cached != null ? <span>• {cached ? "Cached" : "Real-time"}</span> : null}
    </span>
  )
}
