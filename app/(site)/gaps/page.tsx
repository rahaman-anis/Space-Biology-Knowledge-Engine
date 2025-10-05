"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/layout/PageLayout"
import { Filter } from "lucide-react"

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
    return matchesTopic && matchesSeverity
  })

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

          return (
            <div
              key={gap.gap_id || idx}
              className={`bg-background rounded-2xl p-6 shadow-lg border-l-4 ${severity.borderColor}`}
            >
              <div className="flex items-start justify-between mb-4">
                {/* Left: Gap Info */}
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
