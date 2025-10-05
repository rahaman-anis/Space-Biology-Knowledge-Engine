"use client"

import * as React from "react"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Chip } from "@/components/ui/Chip"

export interface FiltersBarProps {
  topic?: string
  organism?: string
  environment?: string
  duration?: string
  onChange: (next: Partial<Pick<FiltersBarProps, "topic" | "organism" | "environment" | "duration">>) => void
}

/**
 * FiltersBar Component
 *
 * Shared filter controls for topic, organism, environment, and duration.
 * Emits changes via onChange callback without making data calls.
 *
 * @example
 * <FiltersBar
 *   topic="bone-loss"
 *   organism="human"
 *   environment="microgravity"
 *   duration="long"
 *   onChange={(filters) => console.log("Filters changed:", filters)}
 * />
 */
export function FiltersBar({ topic, organism, environment, duration, onChange }: FiltersBarProps) {
  const [activeFilters, setActiveFilters] = React.useState<Set<string>>(new Set())

  const handleChange = (key: keyof FiltersBarProps, value: string) => {
    onChange({ [key]: value })
  }

  const toggleFilter = (filter: string) => {
    const next = new Set(activeFilters)
    if (next.has(filter)) {
      next.delete(filter)
    } else {
      next.add(filter)
    }
    setActiveFilters(next)
  }

  return (
    <div className="space-y-4">
      {/* Main filter inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="filter-topic" className="text-sm font-medium text-gray-900">
            Topic
          </label>
          <Input
            id="filter-topic"
            placeholder="e.g., bone-loss"
            value={topic || ""}
            onChange={(e) => handleChange("topic", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="filter-organism" className="text-sm font-medium text-gray-900">
            Organism
          </label>
          <Select
            id="filter-organism"
            value={organism || ""}
            onChange={(e) => handleChange("organism", e.target.value)}
          >
            <option value="">All organisms</option>
            <option value="human">Human</option>
            <option value="mouse">Mouse</option>
            <option value="rat">Rat</option>
            <option value="drosophila">Drosophila</option>
            <option value="c-elegans">C. elegans</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="filter-environment" className="text-sm font-medium text-gray-900">
            Environment
          </label>
          <Select
            id="filter-environment"
            value={environment || ""}
            onChange={(e) => handleChange("environment", e.target.value)}
          >
            <option value="">All environments</option>
            <option value="microgravity">Microgravity</option>
            <option value="simulated-microgravity">Simulated Microgravity</option>
            <option value="hypergravity">Hypergravity</option>
            <option value="radiation">Radiation</option>
            <option value="isolation">Isolation</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="filter-duration" className="text-sm font-medium text-gray-900">
            Duration
          </label>
          <Select
            id="filter-duration"
            value={duration || ""}
            onChange={(e) => handleChange("duration", e.target.value)}
          >
            <option value="">All durations</option>
            <option value="short">Short (&lt;30 days)</option>
            <option value="medium">Medium (30-180 days)</option>
            <option value="long">Long (&gt;180 days)</option>
          </Select>
        </div>
      </div>

      {/* Quick filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-600">Quick filters:</span>
        <Chip size="sm" active={activeFilters.has("high-confidence")} onClick={() => toggleFilter("high-confidence")}>
          High Confidence
        </Chip>
        <Chip size="sm" active={activeFilters.has("recent")} onClick={() => toggleFilter("recent")}>
          Recent Studies
        </Chip>
        <Chip size="sm" active={activeFilters.has("human-relevant")} onClick={() => toggleFilter("human-relevant")}>
          Human Relevant
        </Chip>
      </div>
    </div>
  )
}

// Example usage:
// const [filters, setFilters] = useState({ topic: "", organism: "", environment: "", duration: "" })
// <FiltersBar {...filters} onChange={(next) => setFilters({ ...filters, ...next })} />
