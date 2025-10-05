"use client"
import { useEffect } from "react"
import type React from "react"

export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, active: boolean, onEscape?: () => void) {
  useEffect(() => {
    if (!active) return
    const root = containerRef.current
    if (!root) return

    const focusables = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"))

    const first = () => focusables()[0]
    const last = () => {
      const f = focusables()
      return f[f.length - 1]
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape?.()
        return
      }
      if (e.key !== "Tab") return
      const F = first(),
        L = last()
      if (!F || !L) return
      const activeEl = document.activeElement as HTMLElement | null
      if (e.shiftKey && activeEl === F) {
        L.focus()
        e.preventDefault()
      } else if (!e.shiftKey && activeEl === L) {
        F.focus()
        e.preventDefault()
      }
    }

    const prev = document.activeElement as HTMLElement | null
    first()?.focus()
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      prev?.focus()
    }
  }, [active, containerRef, onEscape])
}
