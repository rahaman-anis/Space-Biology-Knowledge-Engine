export default function Legend({ compact = false }: { compact?: boolean }) {
  const row = "flex items-center gap-2"
  const dot = (bg: string) => <span className={`inline-block w-3 h-3 rounded-full ${bg}`} />
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-3 ${compact ? "text-xs" : "text-sm"}`}>
      <div className="font-semibold text-gray-900 mb-2">Legend</div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <div className={row}>
          <span className="w-6 h-0.5 bg-[#16A34A]" /> <span>Supports</span>
        </div>
        <div className={row}>
          <span className="w-6 h-0.5 bg-[#DC2626]" /> <span>Contradicts</span>
        </div>
        <div className={row}>
          <span className="w-6 h-0.5 bg-[#64748B]" /> <span>Cites</span>
        </div>
        <div className={row}>
          {dot("bg-[#0960E1]")} <span>Claim</span>
        </div>
        <div className={row}>
          {dot("bg-gray-700 rounded")} <span>Mechanism</span>
        </div>
        <div className={row}>
          {dot("bg-gray-400 rounded-none w-3 h-3")} <span>Study</span>
        </div>
      </div>
    </div>
  )
}
