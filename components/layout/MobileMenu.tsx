"use client"
import { useRef } from "react"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { NAV_ITEMS } from "@/lib/nav"
import { usePathname } from "next/navigation"
import Link from "next/link"

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  useFocusTrap(ref, open, onClose)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" aria-labelledby="mobile-menu-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
        className="absolute left-0 top-0 h-full w-4/5 max-w-xs bg-nasa-deep-blue text-white shadow-xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="mobile-menu-title" className="font-heading text-h2">
            Menu
          </h2>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="rounded px-2 py-1 min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            ✕
          </button>
        </div>
        <nav aria-label="Mobile navigation" className="flex flex-col">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`text-lg py-3 px-2 rounded min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary-300 ${
                  isActive ? "bg-nasa-electric-blue font-semibold" : "hover:bg-nasa-electric-blue"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
