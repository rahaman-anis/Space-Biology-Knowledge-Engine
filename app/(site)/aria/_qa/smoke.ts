"use client"

import { useEffect } from "react"

export function SmokeTest() {
  useEffect(() => {
    // Run smoke tests
    const runTests = () => {
      console.log("[ARIA_SMOKE] Starting smoke tests...")

      // Check tabs exist
      const tabs = document.querySelector('[data-testid="aria-tabs"]')
      if (!tabs) {
        console.error("[ARIA_SMOKE] FAIL: Tabs not found")
        return
      }
      console.log("[ARIA_SMOKE] PASS: Tabs found")

      // Check explanation box
      const explanation = document.querySelector('[data-testid="aria-explanation"]')
      if (!explanation) {
        console.error("[ARIA_SMOKE] FAIL: Explanation box not found")
        return
      }
      console.log("[ARIA_SMOKE] PASS: Explanation box found")

      // Check preset cards
      const presetCards = document.querySelectorAll('[data-testid="aria-preset-card"]')
      if (presetCards.length !== 3) {
        console.error(`[ARIA_SMOKE] FAIL: Expected 3 preset cards, found ${presetCards.length}`)
        return
      }
      console.log("[ARIA_SMOKE] PASS: 3 preset cards found")

      console.log("[ARIA_SMOKE] ARIA_UI_SMOKE_OK")
    }

    // Wait for DOM to be ready
    setTimeout(runTests, 1000)
  }, [])

  return null
}
