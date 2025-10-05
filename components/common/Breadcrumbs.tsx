import Link from "next/link"

export interface Crumb {
  label: string
  href?: string
}
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-gray-700 mb-3">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {c.href ? (
              <Link
                href={c.href}
                className="hover:underline focus-visible:ring-2 focus-visible:ring-primary-300 rounded px-1"
              >
                {c.label}
              </Link>
            ) : (
              <span className="px-1">{c.label}</span>
            )}
            {i < items.length - 1 && <span className="text-gray-400">›</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
