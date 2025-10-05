"use client"

export default function ChatActionsBar({
  onExport,
  onAddToBrief,
  onShare,
  onClear,
}: {
  onExport?: () => void
  onAddToBrief?: () => void
  onShare?: () => void
  onClear?: () => void
}) {
  const btn =
    "rounded border-2 border-primary-600 text-primary-600 px-3 py-1.5 text-xs hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300"
  const ghost = "rounded px-3 py-1.5 text-xs focus-visible:ring-2 focus-visible:ring-primary-300"
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={onExport} className={btn}>
        Export conversation
      </button>
      <button onClick={onAddToBrief} className={btn}>
        Add to brief
      </button>
      <button onClick={onShare} className={ghost}>
        Share link
      </button>
      <button onClick={onClear} className={ghost}>
        Clear
      </button>
    </div>
  )
}
