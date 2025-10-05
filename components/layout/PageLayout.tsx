import type React from "react"
import { Breadcrumbs } from "./Breadcrumbs"

interface PageLayoutProps {
  title: string
  subtitle?: string
  breadcrumbs?: { label: string; href?: string }[]
  children: React.ReactNode
  background?: "white" | "gray"
}

export function PageLayout({ title, subtitle, breadcrumbs, children, background = "white" }: PageLayoutProps) {
  const bgClass = background === "gray" ? "bg-gray-50" : "bg-white"

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {breadcrumbs && <Breadcrumbs crumbs={breadcrumbs} />}

        <header className="mb-12">
          <h1 className="text-5xl font-heading font-bold text-gray-900 mb-4">{title}</h1>
          {subtitle && <p className="text-xl text-gray-600 max-w-3xl">{subtitle}</p>}
        </header>

        {children}
      </div>
    </div>
  )
}
