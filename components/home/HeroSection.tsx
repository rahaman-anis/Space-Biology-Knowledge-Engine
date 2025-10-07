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
    <section className="w-full relative bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 lg:gap-12 items-center">
          {/* Left column: Text content */}
          <div className="order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-gray-900 mb-6 leading-tight">
              Know what we know.
              <br />
              Find what we don't.
              <br />
              Plan what's next.
            </h1>

            <p className="text-lg md:text-xl text-gray-700 font-semibold mb-3 leading-relaxed">
              Evidence-driven decisions for Lunar, Mars, and ISS missions
            </p>

            <p className="mt-3 text-base md:text-lg text-gray-600">
              For mission planners, researchers, and research managers.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col items-center gap-1 text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-gray-900">28,864</div>
                <div className="text-sm text-gray-600">Connections</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col items-center gap-1 text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-gray-900">173</div>
                <div className="text-sm text-gray-600">Gaps</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col items-center gap-1 text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-gray-900">572</div>
                <div className="text-sm text-gray-600">Studies</div>
              </div>
            </div>
          </div>

          {/* Right column: Astronaut image */}
          <div className="order-1 lg:order-2 w-full">
            <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none">
              <img
                src="/astronaut-in-space-suit-floating.jpg"
                alt="Astronaut in space suit floating in microgravity environment"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
