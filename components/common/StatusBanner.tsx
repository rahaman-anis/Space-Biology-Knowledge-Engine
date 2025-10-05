"use client"

export function BusyBanner({ text }: { text: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="rounded-lg border border-gray-200 bg-white p-3 text-caption text-gray-800"
    >
      {text}
    </div>
  )
}

export function ErrorBanner({
  text,
  onRetry,
  altHref,
}: {
  text: string
  onRetry?: () => void
  altHref?: string
}) {
  return (
    <div role="alert" className="rounded-lg border-2 border-danger-600 bg-white p-3 text-body text-danger-600">
      {text}
      <div className="mt-2 flex gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded border-2 border-primary-600 text-primary-600 px-3 py-1.5 text-caption hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Try again
          </button>
        )}
        {altHref && (
          <a
            href={altHref}
            className="rounded px-3 py-1.5 text-caption focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Browse gaps instead
          </a>
        )}
      </div>
    </div>
  )
}
