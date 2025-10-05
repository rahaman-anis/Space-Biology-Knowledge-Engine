"use client"

import { useEffect, useState } from "react"

export default function HeroSection() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mqRM = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mqRM.matches)
    const onChangeRM = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mqRM.addEventListener?.("change", onChangeRM)
    return () => mqRM.removeEventListener?.("change", onChangeRM)
  }, [])

  return (
    <section className="w-full relative">
      <div
        className="w-full grid grid-cols-1 lg:grid-cols-2 items-center min-h-[700px]"
        style={{ background: "linear-gradient(135deg, #0042A6 0%, #07173F 100%)" }}
      >
        {/* Left column: Text content */}
        <div className="px-6 lg:px-16 py-16 lg:py-24 relative z-10">
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

        {/* Right column: Astronaut image */}
        <div className="relative min-h-[420px] lg:min-h-[640px]">
          <div className="absolute inset-0 opacity-40">
            <img src="/astronaut-in-space-suit-floating.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          {/* Gradient overlay for better blend */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#07173F]/30 to-[#07173F]" />
        </div>
      </div>
    </section>
  )
}
