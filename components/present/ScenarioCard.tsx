"use client"

export default function ScenarioCard({
  title,
  subtitle,
  onRun,
  onOpen,
}: {
  title: string
  subtitle: string
  onRun?: () => Promise<void> | void
  onOpen?: () => void
}) {
  return (
    <div className="rounded-lg bg-white shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-heading text-h2 text-gray-900">{title}</h3>
          <p className="text-body text-gray-700">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          {onRun && (
            <button
              onClick={() => void onRun()}
              className="rounded bg-primary-600 text-white px-3 py-1.5 focus:ring-2 focus:ring-primary-300"
            >
              Run
            </button>
          )}
          {onOpen && (
            <button
              onClick={onOpen}
              className="rounded border-2 border-primary-600 text-primary-600 px-3 py-1.5 hover:bg-primary-600 hover:text-white focus:ring-2 focus:ring-primary-300"
            >
              Open
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
