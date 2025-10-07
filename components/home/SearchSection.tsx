"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"

export default function SearchSection() {
  const [q, setQ] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const router = useRouter()

  const library = useMemo(
    () => [
      "bone loss in microgravity (87 studies, High confidence)",
      "bone loss countermeasures (34 studies)",
      "bone loss recovery timeline (12 studies, 3 gaps)",
      "radiation dna damage (102 studies)",
      "immune dysregulation (56 studies)",
    ],
    [],
  )

  useEffect(() => {
    const s = q.length > 3 ? library.filter((x) => x.toLowerCase().includes(q.toLowerCase())).slice(0, 3) : []
    setSuggestions(s)
  }, [q, library])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set("q", q || "spaceflight bone loss")
    router.push(`/aria?${params.toString()}`)
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900">
            Ask ARIA anything about space biology evidence
          </h2>
          <div className="relative group">
            <button className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 transition-colors text-sm font-bold">
              ?
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-72 bg-gray-900 text-white text-sm rounded-lg p-4 shadow-xl z-10">
              <strong>ARIA</strong>: Artemis Research Intelligence Assistant
              <br />
              AI-powered 2-second search across 572 NASA studies with section-aware retrieval
            </div>
          </div>
        </div>

        <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed">
          Section-aware answers with citations, confidence and contradiction detection
        </p>

        <form onSubmit={submit} className="relative mb-6">
          <div className="relative">
            <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="What's the biggest risk for a 9-month Mars transit?"
              className="w-full h-14 md:h-16 pl-14 pr-32 text-base rounded-full border-2 border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20 transition-all outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 md:px-8 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors min-h-[44px]"
            >
              Ask
            </button>
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <ul>
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => {
                        setQ(s)
                        setSuggestions([])
                      }}
                      className="w-full text-left px-6 py-4 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#0960E1] text-base"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
