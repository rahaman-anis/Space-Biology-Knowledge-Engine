import type React from "react"
import { TopNav } from "./TopNav"
import { SideNav } from "./SideNav"
import { Footer } from "./Footer"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] md:grid-cols-[240px_1fr]">
      <TopNav />
      <SideNav />
      <main id="main" className="col-span-full md:col-start-2 px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
