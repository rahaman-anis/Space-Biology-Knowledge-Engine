"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/layout/PageLayout"
import EmptyState from "@/components/common/EmptyState"
import { Loader2, AlertCircle } from "lucide-react"
import dynamic from "next/dynamic"

const ForceGraph = dynamic(() => import("@/components/graph/ForceGraph").then((m) => ({ default: m.ForceGraph })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[520px] bg-gray-50 rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
    </div>
  ),
})

interface GraphData {
  nodes: any[]
  edges: any[]
  meta?: { count?: { nodes?: number; edges?: number } }
}

export default function GraphPage() {
  const [data, setData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [limit, setLimit] = useState(200)
  const [minConfidence, setMinConfidence] = useState(0.6)
  const [topic, setTopic] = useState("")

  useEffect(() => {
    fetchGraph()
  }, [limit, minConfidence, topic])

  const fetchGraph = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: String(limit),
        minConfidence: String(minConfidence),
        ...(topic && { topic }),
      })

      const res = await fetch(`/api/graph?${params}`)

      if (!res.ok) {
        throw new Error(`Failed to load graph: ${res.statusText}`)
      }

      const json = await res.json()

      if (json.nodes?.length > 2000) {
        setError("Graph is too large. Try a narrower topic or reduce the limit.")
        setData(null)
        return
      }

      setData(json)
    } catch (err) {
      console.error("[v0] Graph fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to load graph")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout
      title="Evidence Knowledge Graph"
      subtitle="Visualize evidence relations (supports/contradicts) across the research corpus"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Map Evidence" }]}
    >
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Topic (optional)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., bone"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Node Limit: {limit}</label>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Min Confidence: {minConfidence.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-24 bg-white rounded-xl shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-3 text-lg text-gray-600">Loading graph...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">Failed to load graph</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <p className="text-sm text-red-600">
                Try a narrower topic, reduce the node limit, or increase the minimum confidence threshold.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && data && data.nodes.length === 0 && (
        <EmptyState
          title="No graph data"
          suggestions={[
            "Try a different topic (e.g., bone, radiation)",
            "Reduce the minimum confidence threshold",
            "Check /api/graph-smoke for diagnostics",
          ]}
          actions={[
            {
              label: "Open graph diagnostics",
              variant: "primary",
              onClick: () => {
                window.open("/api/graph-smoke?q=bone", "_blank")
              },
            },
          ]}
        />
      )}

      {/* Graph visualization */}
      {!loading && !error && data && data.nodes.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <p className="text-lg text-gray-900 mb-6">
            Interactive graph showing how studies support or contradict each other
            {topic && ` for "${topic}"`}
          </p>

          <ForceGraph nodes={data.nodes} edges={data.edges} />

          <p className="text-sm text-gray-600 mt-4">
            Nodes: {data.meta?.count?.nodes ?? data.nodes.length} • Edges:{" "}
            {data.meta?.count?.edges ?? data.edges.length}
          </p>
        </div>
      )}
    </PageLayout>
  )
}
