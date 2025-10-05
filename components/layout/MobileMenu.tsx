"use client"
import { useRef } from "react"
import { useFocusTrap } from "@/hooks/useFocusTrap"

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
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
            className="rounded px-2 py-1 focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            ✕
          </button>
        </div>
        <nav aria-label="Mobile navigation" className="flex flex-col">
          <a
            href="/"
            className="text-lg py-3 hover:bg-nasa-electric-blue rounded focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Home
          </a>
          <a
            href="/aria"
            className="text-lg py-3 hover:bg-nasa-electric-blue rounded focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            ARIA Q&A
          </a>
          <a
            href="/evidence/bone-loss"
            className="text-lg py-3 hover:bg-nasa-electric-blue rounded focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Browse Evidence
          </a>
          <a
            href="/gaps"
            className="text-lg py-3 hover:bg-nasa-electric-blue rounded focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Explore Gaps
          </a>
          <a
            href="/methods"
            className="text-lg py-3 hover:bg-nasa-electric-blue rounded focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Methods
          </a>
        </nav>
      </div>
    </div>
  )
}
