"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { NAV_ITEMS, isActive } from "@/lib/nav"

export function SideNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  // Close on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block col-start-1 row-start-2 border-r border-neutral-700/50 bg-deep-blue-900/50 px-4 py-6">
        <nav aria-label="Site navigation">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                      active
                        ? "bg-primary-base/20 text-primary-light font-semibold"
                        : "text-neutral-200 hover:bg-neutral-700/30 hover:text-neutral-100"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-deep-blue-900 border-r border-neutral-700/50 z-50 transform transition-transform md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="px-4 py-6">
          <nav aria-label="Site navigation">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                        active
                          ? "bg-primary-base/20 text-primary-light font-semibold"
                          : "text-neutral-200 hover:bg-neutral-700/30 hover:text-neutral-100"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}
