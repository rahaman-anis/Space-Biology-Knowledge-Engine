import type { ReactNode } from "react"

export interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  meta?: {
    shown?: number
    total?: number
    ms?: number
    cached?: boolean
  }
}

/**
 * PageHeader Component
 *
 * Reusable page header with title, subtitle, actions, and performance metadata.
 *
 * @example
 * <PageHeader
 *   title="Evidence Explorer"
 *   subtitle="Browse topic-based evidence"
 *   meta={{ shown: 12, total: 45, ms: 234, cached: true }}
 *   actions={<Button>Export</Button>}
 * />
 */
export default function PageHeader({ title, subtitle, actions, meta }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-700 mt-1">{subtitle}</p>}
          {meta && (
            <p className="text-xs text-gray-700 mt-1">
              {meta.shown != null && meta.total != null && (
                <>
                  Showing {meta.shown} of {meta.total} •{" "}
                </>
              )}
              {meta.ms != null && <>{meta.ms}ms • </>}
              {meta.cached ? "Cached 5m" : "Real-time"}
            </p>
          )}
        </div>
        {actions}
      </div>
    </header>
  )
}
