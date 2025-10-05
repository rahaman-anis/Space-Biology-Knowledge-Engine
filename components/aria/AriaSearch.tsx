"use client"

import { useState } from "react"
import { Search } from "lucide-react"

export function AriaSearch() {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<string[]>([])

  const toggleFilter = (filter: string) => {
    setFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What's the biggest risk for a 9-month Mars transit?"
          className="w-full h-16 pl-14 pr-32 text-lg rounded-xl border-2 border-gray-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-200 transition-all"
        />
        <Search className="absolute left-5 top-5 w-6 h-6 text-gray-400" />
        <button className="absolute right-2 top-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors">
          Search
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-3">
        {["Topic", "Organism", "Environment"].map((filter) => (
          <button
            key={filter}
            onClick={() => toggleFilter(filter)}
            className={`px-5 py-2 rounded-full font-medium transition-colors ${
              filters.includes(filter) ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
}
