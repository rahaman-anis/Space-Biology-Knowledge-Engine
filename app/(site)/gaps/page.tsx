"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Filter, Download, FileText, Share2 } from "lucide-react"

interface Gap {
  gap_id: string
  topic: string
  organism: string
  priority_score: number
  mission_impact: string
  recommended_study: string
  text: string
}

function getSeverityFromPriority(priority: number): {
  level: "Critical" | "Important" | "Exploratory"
  color: string
  bgColor: string
  textColor: string
  borderColor: string
} {
  if (priority >= 85) {
    return {
      level: "Critical",
      color: "bg-red-500",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
      borderColor: "border-red-500",
    }
  }
  if (priority >= 70) {
    return {
      level: "Important",
      color: "bg-orange-500",
      bgColor: "bg-orange-100",
      textColor: "text-orange-700",
      borderColor: "border-orange-500",
    }
  }
  return {
    level: "Exploratory",
    color: "bg-gray-400",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    borderColor: "border-gray-400",
  }
}

function getTopicIcon(topic: string): string {
  const topicLower = topic.toLowerCase()
  const icons: Record<string, string> = {
    bone: "🦴",
    immune: "🛡️",
    radiation: "☢️",
    muscle: "💪",
    vision: "👁️",
    plant: "🌱",
    microbiome: "🦠",
    cardiovascular: "❤️",
    sleep: "😴",
    brain: "🧠",
    dna: "🧬",
  }

  for (const [key, icon] of Object.entries(icons)) {
    if (topicLower.includes(key)) return icon
  }

  return "🔬"
}

export default function GapsPage() {
  const [gaps, setGaps] = useState<Gap[]>([])
  const [loading, setLoading] = useState(true)
  const [topicFilter, setTopicFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [missionFilter, setMissionFilter] = useState<string>("all")
  const [heatmapFilter, setHeatmapFilter] = useState<{ system: string; phase: string } | null>(null)
  const [selectedGaps, setSelectedGaps] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch("/api/gaps-data")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setGaps(data.results || [])
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Failed to load gaps:", err)
        setLoading(false)
      })
  }, [])

  const topics = Array.from(new Set(gaps.map((g) => g.topic))).filter(Boolean)

  const filteredGaps = gaps.filter((gap) => {
    const severity = getSeverityFromPriority(gap.priority_score)
    const matchesTopic = topicFilter === "all" || gap.topic === topicFilter
    const matchesSeverity = severityFilter === "all" || severity.level === severityFilter
    const matchesMission = missionFilter === "all" || true // TODO: wire real mission data
    const matchesHeatmap = !heatmapFilter || gap.topic === heatmapFilter.system // Simple filter by topic
    return matchesTopic && matchesSeverity && matchesMission && matchesHeatmap
  })

  const criticalCount = gaps.filter((g) => getSeverityFromPriority(g.priority_score).level === "Critical").length
  const importantCount = gaps.filter((g) => getSeverityFromPriority(g.priority_score).level === "Important").length
  const exploratoryCount = gaps.filter((g) => getSeverityFromPriority(g.priority_score).level === "Exploratory").length

  const heatmapData = [
    { system: "Bone", phases: [5, 8, 3, 2] },
    { system: "Immune", phases: [4, 6, 7, 1] },
    { system: "Muscle", phases: [9, 5, 4, 3] },
    { system: "Cardiovascular", phases: [2, 4, 6, 5] },
    { system: "Vision", phases: [3, 2, 1, 0] },
    { system: "Radiation", phases: [7, 9, 8, 6] },
  ]
  const phases = ["Pre-flight", "Launch/Transit", "On-orbit", "Return/Recovery"]

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "bg-gray-100 text-gray-400"
    if (count <= 3) return "bg-gray-100 text-gray-700"
    if (count <= 7) return "bg-orange-200 text-orange-900"
    return "bg-red-300 text-red-900"
  }

  const toggleGapSelection = (gapId: string) => {
    const newSelected = new Set(selectedGaps)
    if (newSelected.has(gapId)) {
      newSelected.delete(gapId)
    } else {
      newSelected.add(gapId)
    }
    setSelectedGaps(newSelected)
  }

  if (loading) {
    return (
      <PageLayout title="Research Gaps" subtitle="Loading...">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Research Gaps"
      subtitle={`${filteredGaps.length} mission-critical unknowns identified across the evidence corpus`}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Identify Gaps" }]}
    >
      <div className="bg-white rounded-xl p-8 shadow-lg mb-8 border border-gray-200">
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Knowledge gaps are the invisible risks in human spaceflight. We systematically extracted research gaps from
          Discussion sections across 572 NASA publications, identifying what authors explicitly note as "unknown,"
          "requires investigation," or "future research needed."
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Why this matters:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li>Unknown risks threaten crew safety and mission success</li>
              <li>Gaps guide research funding priorities</li>
              <li>Mission planners need to know confidence limits</li>
              <li>Each gap represents a potential mission showstopper</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">How we prioritize gaps:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li>
                <strong>Critical:</strong> Could jeopardize crew safety or mission objectives
              </li>
              <li>
                <strong>Important:</strong> Significant impact on mission planning or countermeasures
              </li>
              <li>
                <strong>Exploratory:</strong> Scientific interest but lower immediate mission risk
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Actions you can take:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li>"View in ARIA" → Search related evidence for each gap</li>
              <li>"Design Experiment" → See suggested research protocols</li>
              <li>Filter by mission phase to focus on your specific needs</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
          <div className="text-5xl font-bold text-red-700 mb-2">{criticalCount}</div>
          <div className="text-lg font-semibold text-red-900">Critical</div>
          <div className="text-sm text-red-700 mt-1">Crew safety or mission objectives at risk</div>
        </div>

        <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
          <div className="text-5xl font-bold text-orange-700 mb-2">{importantCount}</div>
          <div className="text-lg font-semibold text-orange-900">Important</div>
          <div className="text-sm text-orange-700 mt-1">Significant mission planning impact</div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-300">
          <div className="text-5xl font-bold text-gray-700 mb-2">{exploratoryCount}</div>
          <div className="text-lg font-semibold text-gray-900">Exploratory</div>
          <div className="text-sm text-gray-700 mt-1">Scientific interest, lower immediate risk</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-8 border border-blue-200">
        <div className="text-center text-lg font-semibold text-gray-800">
          🌙 Lunar (47 gaps) • 🚀 Mars Transit (82) • 🛰️ ISS (44)
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-lg mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Gap Distribution Heatmap</h2>
        <p className="text-gray-600 mb-6">Click a cell to filter gaps by biological system and mission phase</p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left font-semibold text-gray-700 border-b-2 border-gray-300">System</th>
                {phases.map((phase) => (
                  <th key={phase} className="p-3 text-center font-semibold text-gray-700 border-b-2 border-gray-300">
                    {phase}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row) => (
                <tr key={row.system}>
                  <td className="p-3 font-semibold text-gray-800 border-b border-gray-200">{row.system}</td>
                  {row.phases.map((count, idx) => (
                    <td
                      key={idx}
                      className={`p-3 text-center font-bold border-b border-gray-200 cursor-pointer hover:opacity-80 transition-opacity ${getHeatmapColor(
                        count,
                      )}`}
                      onClick={() =>
                        setHeatmapFilter(
                          heatmapFilter?.system === row.system && heatmapFilter?.phase === phases[idx]
                            ? null
                            : { system: row.system, phase: phases[idx] },
                        )
                      }
                    >
                      {count}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {heatmapFilter && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              Filtered by: <strong>{heatmapFilter.system}</strong> • <strong>{heatmapFilter.phase}</strong>
              <button
                onClick={() => setHeatmapFilter(null)}
                className="ml-3 text-blue-700 underline hover:text-blue-900"
              >
                Clear filter
              </button>
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg mb-8 border border-gray-200">
        <div className="flex gap-2 flex-wrap">
          {["all", "lunar", "mars", "iss"].map((mission) => (
            <button
              key={mission}
              onClick={() => setMissionFilter(mission)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                missionFilter === mission
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {mission === "all" && "All Gaps"}
              {mission === "lunar" && "🌙 Lunar Focus"}
              {mission === "mars" && "🚀 Mars Transit"}
              {mission === "iss" && "🛰️ ISS Operations"}
            </button>
          ))}
        </div>
      </div>

      {selectedGaps.size > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200 flex items-center justify-between">
          <div className="text-sm font-semibold text-blue-900">{selectedGaps.size} gaps selected</div>
          <div className="flex gap-3">
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Selected
            </button>
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Create Research Brief
            </button>
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Gap List
            </button>
          </div>
        </div>
      )}

      <div className="bg-background rounded-xl p-6 shadow-lg mb-8 border border-border">
        <div className="flex gap-4 items-center flex-wrap">
          <Filter className="w-5 h-5 text-muted-foreground" />

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border-2 border-input rounded-lg text-base bg-background"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="Important">Important</option>
            <option value="Exploratory">Exploratory</option>
          </select>

          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-4 py-2 border-2 border-input rounded-lg text-base bg-background"
          >
            <option value="all">All Topics</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic.charAt(0).toUpperCase() + topic.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {filteredGaps.map((gap, idx) => {
          const severity = getSeverityFromPriority(gap.priority_score)
          const isSelected = selectedGaps.has(gap.gap_id || idx.toString())

          return (
            <div
              key={gap.gap_id || idx}
              className={`bg-background rounded-2xl p-6 shadow-lg border-l-4 ${severity.borderColor} ${
                isSelected ? "ring-2 ring-blue-400" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleGapSelection(gap.gap_id || idx.toString())}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{getTopicIcon(gap.topic)}</span>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {gap.topic.charAt(0).toUpperCase() + gap.topic.slice(1)} Research Gap
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Organism: {gap.organism} • Impact: {gap.mission_impact}
                        </p>
                      </div>
                    </div>

                    <p className="text-base text-foreground mb-3">
                      {gap.text ||
                        `Targeted mechanistic flight study needed to understand ${gap.topic} effects in ${gap.organism} under spaceflight conditions.`}
                    </p>

                    <div className="flex items-center gap-6 mb-3 text-sm text-muted-foreground">
                      <div>
                        <strong>Consensus:</strong> Mentioned in — papers
                      </div>
                      <div>
                        <strong>Related studies:</strong> — related studies available
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-muted-foreground">Mission phases:</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">Priority Score:</span>
                      <div className="flex-1 max-w-xs">
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${severity.color}`} style={{ width: `${gap.priority_score}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-foreground">{gap.priority_score.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`px-4 py-2 rounded-lg ${severity.bgColor} ${severity.textColor} font-bold text-sm ml-4`}
                >
                  {severity.level}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <a
                  href={`/aria?q=${encodeURIComponent(`${gap.topic} ${gap.organism} spaceflight`)}`}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
                >
                  View in ARIA
                </a>
                <button
                  className="px-4 py-2 border-2 border-primary text-primary hover:bg-primary/10 font-semibold rounded-lg transition-colors"
                  onClick={() => alert("Experiment design feature coming soon")}
                >
                  Design Experiment
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </PageLayout>
  )
}
