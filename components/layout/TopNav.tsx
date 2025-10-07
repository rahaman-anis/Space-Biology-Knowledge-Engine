"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import DensityToggle from "@/components/common/DensityToggle"
import { NAV_ITEMS } from "@/lib/nav"
import { usePathname } from "next/navigation"

export function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-40 col-span-full backdrop-blur-md bg-deep-blue-900/80 border-b border-neutral-700/50 px-4 py-3 md:px-6"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          <img src="/brand/logo-placeholder.jpg" alt="NASA LifeLens" className="h-8 w-auto md:h-10" />
        </Link>

        <div className="hidden lg:flex flex-wrap items-center gap-x-4 xl:gap-x-6">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md min-h-[44px] flex items-center ${
                  isActive ? "text-neon-yellow font-semibold" : "text-neutral-100 hover:text-neon-yellow"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Right: Density toggle + Mobile menu toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <DensityToggle />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-neutral-100 min-h-[44px] min-w-[44px]"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
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

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className="absolute left-0 right-0 top-full bg-deep-blue-900 border-b border-neutral-700/50 shadow-lg lg:hidden z-40"
          >
            <nav aria-label="Mobile navigation" className="px-4 py-3">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 text-base rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[44px] ${
                          isActive
                            ? "bg-primary-base/20 text-neon-yellow font-semibold"
                            : "text-neutral-100 hover:bg-neutral-700/30"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </>
      )}
    </nav>
  )
}
