"use client"

import { useEffect, useState } from "react"

export default function HotkeysOverlay() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") setOpen((v) => !v)
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute right-6 top-6 w-[360px] rounded-lg bg-white p-4 shadow-xl"
      >
        <h3 className="font-heading text-h2 text-gray-900 mb-2">Presenter Hotkeys</h3>
        <ul className="text-body text-gray-800 space-y-1">
          <li>
            <kbd className="px-1 py-0.5 bg-gray-100 rounded">/</kbd> Focus search
          </li>
          <li>
            <kbd className="px-1 py-0.5 bg-gray-100 rounded">⌘</kbd>+
            <kbd className="px-1 py-0.5 bg-gray-100 rounded">K</kbd> Toggle this overlay
          </li>
          <li>
            <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> Close menus/popovers
          </li>
        </ul>
      </div>
    </div>
  )
}
