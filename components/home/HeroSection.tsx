"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const HeroGraph3D = dynamic(() => import("./HeroGraph3D"), { ssr: false })

export default function HeroSection() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)

  const feature3D = (process.env.NEXT_PUBLIC_FEATURE_3D_GRAPH ?? "").toLowerCase() === "true"
  const use3D = feature3D && isDesktop && !reducedMotion && !pageHidden

  useEffect(() => {
    const mqRM = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mqRM.matches)
    const onChangeRM = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mqRM.addEventListener?.("change", onChangeRM)

    const mqDesk = window.matchMedia("(min-width: 768px)")
    setIsDesktop(mqDesk.matches)
    const onChangeDesk = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mqDesk.addEventListener?.("change", onChangeDesk)

    const onVis = () => setPageHidden(document.hidden)
    document.addEventListener("visibilitychange", onVis)

    return () => {
      mqRM.removeEventListener?.("change", onChangeRM)
      mqDesk.removeEventListener?.("change", onChangeDesk)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [])

  return (
    <section
      className="relative min-h-[700px]"
      style={{ background: "linear-gradient(135deg, #0042A6 0%, #07173F 100%)" }}
    >
      {/* Background astronaut image (right side, faded) */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30">
        <img src="/astronaut-in-space-suit-floating.jpg" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Contrast overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 py-24 lg:w-1/2">
        <div className="lg:w-1/2">
          <h1 className="text-6xl lg:text-7xl font-heading font-black text-white mb-8 leading-tight">
            Know what we know.
            <br />
            Find what we don't.
            <br />
            Plan what's next.
          </h1>

          <p className="text-xl text-white font-bold mb-4 leading-relaxed">
            572 studies analyzed. 173 critical unknowns identified.
          </p>
          <p className="text-xl text-white font-bold mb-12 leading-relaxed">
            Zero guesswork. One mission: Get humans to Mars safely.
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-lg border-2 border-white/30 rounded-xl px-8 py-6">
              <div className="text-5xl font-black text-white mb-2">2,847</div>
              <div className="text-lg text-white font-semibold uppercase tracking-wide">Connections</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg border-2 border-white/30 rounded-xl px-8 py-6">
              <div className="text-5xl font-black text-white mb-2">173</div>
              <div className="text-lg text-white font-semibold uppercase tracking-wide">Critical Gaps</div>
            </div>
            <div className="bg-white/20 backdrop-blur-lg border-2 border-white/30 rounded-xl px-8 py-6">
              <div className="text-5xl font-black text-white mb-2">572</div>
              <div className="text-lg text-white font-semibold uppercase tracking-wide">Publications</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
