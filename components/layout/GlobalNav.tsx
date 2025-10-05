"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Ask ARIA", href: "/aria" },
  { label: "Search", href: "/search" },
  { label: "Explore Topics", href: "/evidence" },
  { label: "Identify Gaps", href: "/gaps" },
  { label: "Map Evidence", href: "/graph" },
  { label: "Methods", href: "/methods" },
]

export default function GlobalNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const first = drawerRef.current?.querySelector<HTMLElement>("a,button")
    first?.focus()
  }, [open])

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 border-b border-white/20"
      style={{ backgroundColor: "#07173F" }}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-primary-300 text-white/90"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link
            href="/"
            className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary-300 rounded"
          >
            <span className="text-white font-heading font-bold text-2xl">Space Biology Knowledge Engine</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => {
            const active = isActive(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-lg font-semibold transition-all ${
                  active ? "text-white border-b-2 border-nasa-neon-yellow pb-1" : "text-white/80 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div
        className={`md:hidden fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <div
          ref={drawerRef}
          className={`absolute left-0 top-0 h-full w-64 text-white shadow-2xl transition-transform duration-300 ease-out
            ${open ? "translate-x-0" : "-translate-x-full"}`}
          style={{ backgroundColor: "#07173F" }}
          role="dialog"
          aria-label="Mobile navigation menu"
        >
          <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
            <span className="font-heading font-bold">Navigation</span>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-primary-300"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col py-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-active={isActive(l.href)}
                className="px-6 py-3 text-base hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-300 data-[active=true]:bg-white/20"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
