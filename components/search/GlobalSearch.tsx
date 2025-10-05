"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/Input"
import { Chip } from "@/components/ui/Chip"
import { Button } from "@/components/ui/Button"
import { VisuallyHidden } from "@/components/ui/VisuallyHidden"

const FILTER_OPTIONS = {
  topic: ["Biosignatures", "Habitability", "Origins", "Extremophiles"],
  organism: ["Bacteria", "Archaea", "Eukaryotes", "Viruses"],
  environment: ["Marine", "Terrestrial", "Atmospheric", "Subsurface"],
}

export function GlobalSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [topic, setTopic] = useState(searchParams.get("topic") || "")
  const [organism, setOrganism] = useState(searchParams.get("organism") || "")
  const [environment, setEnvironment] = useState(searchParams.get("environment") || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (topic) params.set("topic", topic)
    if (organism) params.set("organism", organism)
    if (environment) params.set("environment", environment)

    router.push(`/aria?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <VisuallyHidden>
            <label htmlFor="global-search-input">Search NASA LifeLens</label>
          </VisuallyHidden>
          <Input
            id="global-search-input"
            type="search"
            placeholder="Search astrobiology knowledge..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button type="submit" variant="primary" size="md">
          Search
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 items-center">
          <span className="text-xs text-neutral-400">Topic:</span>
          {FILTER_OPTIONS.topic.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={topic === option}
              onClick={() => setTopic(topic === option ? "" : option)}
            />
          ))}
        </div>
        <div className="flex gap-1 items-center">
          <span className="text-xs text-neutral-400">Organism:</span>
          {FILTER_OPTIONS.organism.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={organism === option}
              onClick={() => setOrganism(organism === option ? "" : option)}
            />
          ))}
        </div>
        <div className="flex gap-1 items-center">
          <span className="text-xs text-neutral-400">Environment:</span>
          {FILTER_OPTIONS.environment.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={environment === option}
              onClick={() => setEnvironment(environment === option ? "" : option)}
            />
          ))}
        </div>
      </div>
    </form>
  )
}
