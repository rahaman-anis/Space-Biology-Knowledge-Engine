import EvidenceTable, { type EvidenceRow } from "@/components/table/EvidenceTable"

export default function ChatSidebar({
  sources = [],
  context,
  onOpenARIA,
}: {
  sources: EvidenceRow[]
  context?: { topic?: string; organism?: string; environment?: string }
  onOpenARIA?: (q: string) => void
}) {
  return (
    <aside className="space-y-3">
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <h3 className="font-semibold text-sm text-gray-900 mb-2">Context</h3>
        <ul className="text-sm text-gray-700">
          <li>
            <strong>Topic:</strong> {context?.topic ?? "—"}
          </li>
          <li>
            <strong>Organism:</strong> {context?.organism ?? "—"}
          </li>
          <li>
            <strong>Environment:</strong> {context?.environment ?? "—"}
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-sm text-gray-900 mb-2">Recently cited</h3>
        <EvidenceTable rows={sources} density="compact" />
      </div>
    </aside>
  )
}
