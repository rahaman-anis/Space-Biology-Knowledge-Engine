"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function CrossSpeciesPanel() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors mb-6"
        >
          <h2 className="text-3xl font-bold text-gray-900">Cross-Species Evidence</h2>
          <ChevronDown className={`w-8 h-8 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Human</h3>
              <div className="text-5xl font-black text-gray-900 mb-2">71</div>
              <p className="text-xl text-gray-700">Studies</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mouse</h3>
              <div className="text-5xl font-black text-gray-900 mb-2">89</div>
              <p className="text-xl text-gray-700">Studies</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Rat</h3>
              <div className="text-5xl font-black text-gray-900 mb-2">43</div>
              <p className="text-xl text-gray-700">Studies</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
