"use client"

import { useState, useEffect, useRef } from "react"
import { PageLayout } from "@/components/layout/PageLayout"
import * as d3 from "d3"
import { Loader2, AlertCircle, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"

interface Node extends d3.SimulationNodeDatum {
  id: string
  label: string
  type: string
  topic?: string
}

interface Edge {
  source: string | Node
  target: string | Node
  relation: string
  predicate?: string
  confidence?: number
}

interface GraphData {
  nodes: Node[]
  edges: Edge[]
  meta?: { count?: { nodes?: number; edges?: number } }
}

export default function GraphPage() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string>("all")
  const [selectedRelation, setSelectedRelation] = useState<string>("all")
  const [limit, setLimit] = useState(200)

  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (selectedTopic !== "all") params.append("topic", selectedTopic)
        params.append("limit", String(limit))

        const res = await fetch(`/api/graph?${params}`)

        if (!res.ok) {
          throw new Error(`Failed to load graph: ${res.statusText}`)
        }

        const json = await res.json()

        if (json.nodes?.length > 2000) {
          setError("Graph is too large. Try a narrower topic or reduce the limit.")
          setGraphData(null)
          return
        }

        setGraphData(json)
      } catch (err) {
        console.error("[v0] Graph fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to load graph")
        setGraphData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchGraph()
  }, [selectedTopic, limit])

  useEffect(() => {
    if (!graphData || !svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    const container = containerRef.current

    const margin = 40
    const width = container.clientWidth - margin * 2
    const height = container.clientHeight - margin * 2

    svg.selectAll("*").remove()

    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width + margin * 2} ${height + margin * 2}`)
      .attr("preserveAspectRatio", "xMidYMid meet")

    const g = svg.append("g").attr("transform", `translate(${margin}, ${margin})`)

    const edges =
      selectedRelation === "all" ? graphData.edges : graphData.edges.filter((e) => e.relation === selectedRelation)

    const nodeMap = new Map(graphData.nodes.map((n) => [n.id, n]))

    const validEdges = edges.filter((e) => {
      const sourceId = typeof e.source === "string" ? e.source : e.source.id
      const targetId = typeof e.target === "string" ? e.target : e.target.id
      return nodeMap.has(sourceId) && nodeMap.has(targetId)
    })

    const simulation = d3
      .forceSimulation(graphData.nodes)
      .force(
        "link",
        d3
          .forceLink(validEdges)
          .id((d: any) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(25))

    const link = g
      .append("g")
      .selectAll("line")
      .data(validEdges)
      .join("line")
      .attr("stroke", (d) => (d.relation === "supports" ? "#16A34A" : "#DC2626"))
      .attr("stroke-width", (d) => (d.confidence || 0.5) * 3)
      .attr("opacity", 0.6)

    const node = g
      .append("g")
      .selectAll("circle")
      .data(graphData.nodes)
      .join("circle")
      .attr("r", 8)
      .attr("fill", (d) => {
        const colors: Record<string, string> = {
          bone: "#EAB308",
          immune: "#3B82F6",
          radiation: "#EF4444",
          muscle: "#10B981",
          cardiovascular: "#F43F5E",
        }
        return colors[d.topic || ""] || "#6B7280"
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "grab")
      .call(d3.drag<SVGCircleElement, Node>().on("start", dragstarted).on("drag", dragged).on("end", dragended))

    const label = g
      .append("g")
      .selectAll("text")
      .data(graphData.nodes)
      .join("text")
      .text((d) => d.label.slice(0, 20))
      .attr("font-size", 10)
      .attr("fill", "#374151")
      .attr("dx", 12)
      .attr("dy", 4)
      .style("pointer-events", "none")

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y)

      label.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y)
    })

    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
      d3.select(event.sourceEvent.target as Element).style("cursor", "grabbing")
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
      d3.select(event.sourceEvent.target as Element).style("cursor", "grab")
    }

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr(
          "transform",
          `translate(${margin + event.transform.x}, ${margin + event.transform.y}) scale(${event.transform.k})`,
        )
        setZoomTransform(event.transform)
      })

    svg.call(zoom)
    zoomBehaviorRef.current = zoom

    return () => {
      simulation.stop()
    }
  }, [graphData, selectedRelation])

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3)
  }

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7)
  }

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().duration(500).call(zoomBehaviorRef.current.transform, d3.zoomIdentity)
  }

  if (loading) {
    return (
      <PageLayout title="Evidence Knowledge Graph">
        <div className="flex items-center justify-center py-24 bg-white rounded-xl shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-3 text-lg text-gray-600">Loading graph...</span>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Evidence Knowledge Graph"
      subtitle={graphData ? `${graphData.nodes.length} nodes • ${graphData.edges.length} relations` : ""}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Map Evidence" }]}
    >
      <div className="bg-white rounded-xl p-6 shadow-lg mb-8 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Topic</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none"
          >
            <option value="all">All Topics</option>
            <option value="bone">Bone</option>
            <option value="immune">Immune</option>
            <option value="radiation">Radiation</option>
            <option value="muscle">Muscle</option>
            <option value="cardiovascular">Cardiovascular</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Relation Type</label>
          <select
            value={selectedRelation}
            onChange={(e) => setSelectedRelation(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none"
          >
            <option value="all">All Relations</option>
            <option value="supports">Supports Only</option>
            <option value="contradicts">Contradicts Only</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Node Limit: {limit}</label>
          <input
            type="range"
            min="50"
            max="500"
            step="50"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">Failed to load graph</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!error && graphData && graphData.nodes.length > 0 && (
        <>
          <div
            ref={containerRef}
            className="relative bg-white rounded-xl shadow-lg mb-8 flex items-center justify-center overflow-hidden"
            style={{ height: "calc(100vh - 200px)", minHeight: "600px" }}
          >
            <svg ref={svgRef} className="w-full h-full" />

            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={handleZoomIn}
                className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
                title="Zoom In"
              >
                <ZoomIn className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
                title="Zoom Out"
              >
                <ZoomOut className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
                title="Reset View"
              >
                <Maximize2 className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-4 py-2 text-sm text-gray-600">
              <p className="font-medium mb-1">Controls:</p>
              <p>• Drag nodes to reposition</p>
              <p>• Mouse wheel to zoom</p>
              <p>• Click and drag background to pan</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Legend</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Relations</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-green-600"></div>
                    <span className="text-sm text-gray-700">Supports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-red-600"></div>
                    <span className="text-sm text-gray-700">Contradicts</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Topics</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-700">Bone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-700">Immune</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-700">Radiation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700">Muscle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-pink-500"></div>
                    <span className="text-sm text-gray-700">Cardiovascular</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!error && graphData && graphData.nodes.length === 0 && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-12 text-center">
          <p className="text-lg text-gray-600 mb-4">No graph data available</p>
          <p className="text-sm text-gray-500">Try selecting a different topic or adjusting the filters</p>
        </div>
      )}
    </PageLayout>
  )
}
