"use client"

export default function RetryPanel({
  title = "Couldn't complete request",
  tips,
  onRetry,
}: {
  title?: string
  tips?: string[]
  onRetry?: () => void
}) {
  return (
    <div role="alert" className="rounded-lg border-2 border-danger-600 bg-white p-4">
      <h3 className="font-heading text-h3 text-danger-600 mb-2">{title}</h3>
      {tips?.length ? (
        <ul className="list-disc ml-5 text-caption text-gray-800 space-y-1">
          {tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-3">
        <button
          onClick={onRetry}
          className="rounded border-2 border-primary-600 text-primary-600 px-3 py-1.5 text-caption hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
