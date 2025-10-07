"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/layout/PageLayout"
import Link from "next/link"
import { ChevronRight, FlaskConical, Database, AlertTriangle } from "lucide-react"

interface Topic {
  topic: string
  study_count: number
  osdr_linked: number
  mission_criticality: number
  r4c_score: number
}

function getTopicIcon(topic: string): string {
  const icons: Record<string, string> = {
    bone: "🦴",
    immune: "🛡️",
    radiation: "☢️",
    muscle: "💪",
    cardiovascular: "❤️",
    plants: "🌱",
    microbiome: "🦠",
    vision: "👁️",
    sleep: "😴",
    cognition: "🧠",
  }
  return icons[topic.toLowerCase()] || "🔬"
}

function getMaturityLevel(r4c_score: number): {
  label: string
  color: string
} {
  if (r4c_score >= 0.7) return { label: "High", color: "bg-green-100 text-green-700 border-green-200" }
  if (r4c_score >= 0.4) return { label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-200" }
  return { label: "Low", color: "bg-red-100 text-red-700 border-red-200" }
}

export default function EvidencePage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/topics")
      .then((r) => r.json())
      .then((data) => {
        const topicList = data.ok ? data.topics : data
        setTopics(topicList || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load topics:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <PageLayout title="Explore Topics" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Explore Topics" }]}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Explore Topics"
      subtitle="Browse evidence across biological systems and research areas"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Explore Topics" }]}
    >
      {/* New header card with provided copy */}
      <div className="bg-white rounded-2xl border p-6 md:p-8 space-y-3 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Explore Topics</h1>
        <p className="text-lg text-gray-700">Browse evidence across biological systems and research areas</p>

        <p className="text-base text-gray-600 leading-relaxed">
          Discover what we know—and what we don't—about human spaceflight health risks. Each topic shows study coverage,
          mission criticality, and evidence maturity to guide research priorities.
        </p>

        <div className="pt-2">
          <p className="text-sm font-semibold text-gray-900 mb-2">Features:</p>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Study counts from NASA space biology corpus</li>
            <li>• Mission criticality ratings for Artemis/Mars planning</li>
            <li>• Evidence maturity assessment (readiness for crew application)</li>
            <li>• Direct links to topic-specific evidence and gaps</li>
          </ul>
        </div>
      </div>

      {/* Static stats strip */}
      <div className="mb-6 text-sm md:text-base text-muted-foreground text-center">
        Research Coverage Overview — 572 studies • 6 biological systems • 173 identified gaps
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => {
          const maturity = getMaturityLevel(topic.r4c_score)

          return (
            <Link
              key={topic.topic}
              href={`/evidence/${encodeURIComponent(topic.topic)}`}
              className="bg-card rounded-2xl p-6 shadow-lg border-2 border-border hover:border-blue-300 hover:shadow-lg transition-all group"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getTopicIcon(topic.topic)}</span>
                  <h3 className="text-2xl font-bold text-foreground">{topic.topic}</h3>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                {/* Study Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FlaskConical className="w-4 h-4" />
                    <span className="text-sm">Studies</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">{topic.study_count}</span>
                </div>

                {/* OSDR Linked */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Database className="w-4 h-4" />
                    <span className="text-sm">OSDR Links</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">{topic.osdr_linked}</span>
                </div>

                {/* Mission Criticality */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Criticality</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {(topic.mission_criticality * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Maturity Badge */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Evidence Maturity</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${maturity.color}`}>
                    {maturity.label}
                  </span>
                </div>

                {/* R4C Score Bar */}
                <div className="mt-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${topic.r4c_score * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[16px] py-3 rounded-lg transition-colors">
                Explore Evidence →
              </button>
            </Link>
          )
        })}
      </div>
    </PageLayout>
  )
}
