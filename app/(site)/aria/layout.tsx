import type React from "react"
export const metadata = { title: "ARIA — Section-aware Q&A" }

export default function AriaLayout({ children }: { children: React.ReactNode }) {
  return <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
}
