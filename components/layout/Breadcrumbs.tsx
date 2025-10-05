import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface Crumb {
  label: string
  href?: string
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-2 text-lg mb-6" aria-label="Breadcrumb">
      {crumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          {crumb.href ? (
            <Link href={crumb.href} className="text-primary-600 hover:underline font-medium">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-semibold">{crumb.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
