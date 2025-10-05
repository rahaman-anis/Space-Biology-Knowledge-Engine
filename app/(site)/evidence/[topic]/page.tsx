"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/layout/PageLayout"
import { ExternalLink, TrendingUp, TrendingDown } from "lucide-react"

interface TopicMetadata {
  topic: string
  study_count: number
  osdr_linked: number
  mission_criticality: number
  r4c_score: number
}

interface Claim {
  pmcid: string
  claim_text: string
  subject: string
  predicate: string
  object: string
  confidence: number
  section: string
}

interface Study {
  pmcid: string
  title: string
  year: number
  section: string
  claim_text: string
  confidence: number
}

function getPMCUrl(pmcid: string): string {
  return `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`
}

function getSectionColor(section: string): string {
  const colors: Record<string, string> = {
    Results: "bg-blue-100 text-blue-700",
    Discussion: "bg-purple-100 text-purple-700",
    Methods: "bg-orange-100 text-orange-700",
    Introduction: "bg-green-100 text-green-700",
    Conclusion: "bg-red-100 text-red-700",
  }
  return colors[section] || "bg-gray-100 text-gray-700"
}

function getConfidenceLevel(score: number): { label: string; color: string } {
  if (score >= 0.8) return { label: "High", color: "bg-green-100 text-green-700" }
  if (score >= 0.6) return { label: "Medium", color: "bg-yellow-100 text-yellow-700" }
  return { label: "Low", color: "bg-gray-100 text-gray-700" }
}

export default function TopicDetailPage({ params }: { params: { topic: string } }) {
  const topic = decodeURIComponent(params.topic)
  const [metadata, setMetadata] = useState<TopicMetadata | null>(null)
  const [claims, setClaims] = useState<Claim[]>([])
  const [mechanisms, setMechanisms] = useState({ supports: 0, contradicts: 0 })
  const [organisms, setOrganisms] = useState<Array<{ organism: string; count: number }>>([])
  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/evidence/${params.topic}/metadata`).then((r) => r.json()),
      fetch(`/api/evidence/${params.topic}/claims?limit=10`).then((r) => r.json()),
      fetch(`/api/evidence/${params.topic}/mechanisms`).then((r) => r.json()),
      fetch(`/api/evidence/${params.topic}/organisms`).then((r) => r.json()),
      fetch(`/api/evidence/${params.topic}/studies?limit=50`).then((r) => r.json()),
    ])
      .then(([metaData, claimsData, mechData, orgData, studiesData]) => {
        setMetadata(metaData)
        setClaims(claimsData.claims || [])
        setMechanisms(mechData)
        setOrganisms(orgData.organisms || [])
        setStudies(studiesData.studies || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load topic data:", err)
        setLoading(false)
      })
  }, [params.topic])

  if (loading) {
    return (
      <PageLayout title={topic}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={topic}
      subtitle={metadata ? `${metadata.study_count} studies • ${metadata.osdr_linked} OSDR links` : ""}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Explore Topics", href: "/evidence" }, { label: topic }]}
    >
      {/* KPI Cards */}
      {metadata && (
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="text-sm text-muted-foreground mb-2">Studies</div>
            <div className="text-3xl font-black text-foreground">{metadata.study_count}</div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="text-sm text-muted-foreground mb-2">OSDR Links</div>
            <div className="text-3xl font-black text-foreground">{metadata.osdr_linked}</div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="text-sm text-muted-foreground mb-2">Mission Criticality</div>
            <div className="text-3xl font-black text-foreground">
              {(metadata.mission_criticality * 100).toFixed(0)}%
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="text-sm text-muted-foreground mb-2">R4C Score</div>
            <div className="text-3xl font-black text-foreground">{(metadata.r4c_score * 100).toFixed(0)}%</div>
          </div>
        </div>
      )}

      {/* Top Claims */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Top Claims</h2>
        <div className="space-y-4">
          {claims.slice(0, 5).map((claim, idx) => {
            const confidence = getConfidenceLevel(claim.confidence)
            return (
              <div key={idx} className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSectionColor(claim.section)}`}>
                      [{claim.section}]
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${confidence.color}`}>
                      {confidence.label}
                    </span>
                  </div>
                  <a
                    href={getPMCUrl(claim.pmcid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm font-semibold flex items-center gap-1"
                  >
                    {claim.pmcid}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-base text-foreground mb-2">{claim.claim_text}</p>
                <div className="text-sm text-muted-foreground">
                  <strong>{claim.subject}</strong> {claim.predicate} <strong>{claim.object}</strong>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Mechanisms Chart */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-card rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-foreground mb-4">Evidence Relations</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-foreground">Supports</span>
              </div>
              <span className="text-2xl font-black text-green-600">{mechanisms.supports}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-foreground">Contradicts</span>
              </div>
              <span className="text-2xl font-black text-red-600">{mechanisms.contradicts}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-foreground mb-4">Organism Distribution</h3>
          <div className="space-y-2">
            {organisms.slice(0, 5).map((org) => (
              <div key={org.organism} className="flex items-center justify-between">
                <span className="text-foreground">{org.organism}</span>
                <span className="font-bold text-foreground">{org.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence Table */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">Evidence Table</h2>
        <div className="bg-card rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted border-b-2 border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Source</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Section</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Claim</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Confidence</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {studies.map((study, idx) => {
                const confidence = getConfidenceLevel(study.confidence)
                return (
                  <tr key={idx} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <a
                        href={getPMCUrl(study.pmcid)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        {study.pmcid}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getSectionColor(study.section)}`}>
                        {study.section}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-sm text-foreground line-clamp-2">{study.claim_text}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${confidence.color}`}>
                        {confidence.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground">{study.year}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </PageLayout>
  )
}
