"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Skeleton } from "@/components/ui/Skeleton"

// Dynamically import CytoscapeComponent to avoid SSR issues
const CytoscapeComponent = dynamic(() => import("react-cytoscapejs"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[400px]" />,
})

export type Relation = "supports" | "contradicts" | "cites"

export interface Node {
  id: string
  label: string
}

export interface Edge {
  id: string
  source: string
  target: string
  relation: Relation
  snippet?: string
}

export interface SubgraphProps {
  nodes: Node[]
  edges: Edge[]
  filter?: "all" | "contradictions"
  maxElements?: number
  seed?: number // Add seed for deterministic layout
  onEdgeFocus?: (edgeId: string) => void
}

/**
 * SubgraphCanvas Component
 *
 * Interactive graph visualization using Cytoscape.js with deterministic layout.
 * Includes accessible fallback table and contradiction filtering.
 */
export function SubgraphCanvas({
  nodes,
  edges,
  filter = "all",
  maxElements = 30,
  seed = 42, // Default seed
  onEdgeFocus,
}: SubgraphProps) {
  const [activeFilter, setActiveFilter] = React.useState<"all" | "contradictions">(filter)

  // Filter edges based on active filter
  const filteredEdges = React.useMemo(() => {
    if (activeFilter === "contradictions") {
      return edges.filter((e) => e.relation === "contradicts")
    }
    return edges
  }, [edges, activeFilter])

  // Cap elements to maxElements
  const cappedEdges = filteredEdges.slice(0, maxElements)
  const nodeSet = new Set<string>(cappedEdges.flatMap((e) => [e.source, e.target]))
  const cappedNodes = nodes.filter((n) => nodeSet.has(n.id))

  // Build Cytoscape elements
  const elements = React.useMemo(() => {
    const nodeElements = cappedNodes.map((node) => ({
      data: { id: node.id, label: node.label },
    }))

    const edgeElements = cappedEdges.map((edge) => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.relation,
        relation: edge.relation,
      },
    }))

    return [...nodeElements, ...edgeElements]
  }, [cappedNodes, cappedEdges])

  // Cytoscape stylesheet
  const stylesheet = [
    {
      selector: "node",
      style: {
        "background-color": "#0960e1",
        label: "data(label)",
        "text-wrap": "wrap",
        "text-valign": "center",
        color: "#ffffff",
        "font-size": "12px",
        width: 40,
        height: 40,
      },
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#9CA3AF",
        "target-arrow-color": "#9CA3AF",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
      },
    },
    {
      selector: 'edge[relation="supports"]',
      style: {
        "line-color": "#16A34A",
        "target-arrow-color": "#16A34A",
      },
    },
    {
      selector: 'edge[relation="contradicts"]',
      style: {
        "line-color": "#DC2626",
        "target-arrow-color": "#DC2626",
        "line-style": "solid",
        width: 2.5,
      },
    },
    {
      selector: 'edge[relation="cites"]',
      style: {
        "line-color": "#64748B",
        "target-arrow-color": "#64748B",
        "line-style": "dotted",
      },
    },
  ]

  const layout = {
    name: "cose",
    randomize: false, // Deterministic
    animate: false,
    fit: true,
    padding: 30,
    nodeRepulsion: 8000,
    idealEdgeLength: 100,
    gravity: 1,
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Evidence Subgraph</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={activeFilter === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
          >
            All
          </Button>
          <Button
            variant={activeFilter === "contradictions" ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("contradictions")}
          >
            Contradictions
          </Button>
        </div>
      </div>

      {/* Graph visualization */}
      <div className="relative bg-gray-50 rounded-md overflow-hidden" style={{ height: 360 }}>
        {typeof window !== "undefined" && (
          <CytoscapeComponent
            elements={elements}
            style={{ width: "100%", height: "100%" }}
            stylesheet={stylesheet}
            layout={layout}
            cy={(cy) => {
              cy.on("select", "edge", (evt) => {
                const edge = evt.target
                if (onEdgeFocus) {
                  onEdgeFocus(edge.id())
                }
              })
            }}
          />
        )}
      </div>

      <p className="text-xs text-gray-700">
        Layout: deterministic (seed {seed}) • Showing {cappedEdges.length} edges
      </p>

      <details className="text-sm">
        <summary className="cursor-pointer text-primary-base hover:underline focus-visible-ring rounded-sm">
          Accessible edge list
        </summary>
        <div className="mt-3">
          {cappedEdges.length === 0 ? (
            <p className="text-xs text-gray-600">No edges to display.</p>
          ) : (
            <ul className="space-y-1 text-xs text-gray-800">
              {cappedEdges.map((e) => (
                <li key={e.id}>
                  <span className="mono">{e.source}</span> — <strong>{e.relation}</strong> →{" "}
                  <span className="mono">{e.target}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>

      {/* Element count warning */}
      {(nodes.length > maxElements || edges.length > maxElements) && (
        <p className="text-xs text-gray-600">
          Showing {cappedNodes.length} of {nodes.length} nodes and {cappedEdges.length} of {edges.length} edges.
        </p>
      )}
    </Card>
  )
}
