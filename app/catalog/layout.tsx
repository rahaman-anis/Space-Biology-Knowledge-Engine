import type React from "react"
export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-white text-gray-900">{children}</main>
}
