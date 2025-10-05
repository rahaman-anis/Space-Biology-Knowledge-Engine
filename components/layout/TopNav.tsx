"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { GlobalSearch } from "@/components/search/GlobalSearch"
import { Button } from "@/components/ui/Button"
import DensityToggle from "@/components/common/DensityToggle"

export function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault()
        const searchInput = document.getElementById("global-search") as HTMLInputElement | null
        searchInput?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-40 col-span-full backdrop-blur-md bg-deep-blue-900/80 border-b border-neutral-700/50 px-4 py-3 md:px-6"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <Link href="/" className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-ring rounded-md">
          <img src="/brand/logo-placeholder.jpg" alt="NASA LifeLens" className="h-8 w-auto md:h-10" />
        </Link>

        {/* Center: Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-4">
          <GlobalSearch />
        </div>

        {/* Right: Density toggle + Methods link + Mobile menu toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <DensityToggle />
          </div>
          <Link
            href="/methods"
            className="hidden md:inline-flex px-4 py-2 text-sm text-neutral-100 hover:text-neon-yellow transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
          >
            Methods
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-neutral-100"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden mt-3">
        <GlobalSearch />
      </div>

      {/* Mobile menu state signal for SideNav */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  )
}
