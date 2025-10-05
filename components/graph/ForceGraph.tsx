"use client"

import { useEffect, useMemo, useRef } from "react"
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d"
import type { GraphNode, GraphEdge } from "@/lib/fetchers"

export function ForceGraph({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const data = useMemo(
    () => ({
      nodes: nodes.map((n) => ({ id: n.id, name: n.label || n.id, type: n.type })),
      links: edges.map((e) => ({ source: e.source, target: e.target, relation: e.relation })),
    }),
    [nodes, edges],
  )

  const ref = useRef<ForceGraphMethods>()
  useEffect(() => {
    ref.current?.zoomToFit(400, 40)
  }, [data])

  return (
    <div className="w-full h-[520px] rounded-lg bg-white shadow">
      <ForceGraph2D
        ref={ref as any}
        graphData={data}
        nodeLabel={(n: any) => `${n.name}${n.type ? ` (${n.type})` : ""}`}
        nodeRelSize={6}
        nodeCanvasObject={(node: any, ctx, scale) => {
          const label = node.name
          const fontSize = 12 / Math.sqrt(scale)
          ctx.font = `${fontSize}px sans-serif`
          // color by type
          const color =
            node.type === "claim"
              ? "#0960E1"
              : node.type === "mechanism"
                ? "#16A34A"
                : node.type === "study"
                  ? "#374151"
                  : "#0042A6"
          // circle
          ctx.beginPath()
          ctx.fillStyle = color
          ctx.arc(node.x!, node.y!, 4, 0, 2 * Math.PI, false)
          ctx.fill()
          // label
          ctx.fillStyle = "#111827"
          ctx.fillText(label, node.x! + 6, node.y! + 3)
        }}
        linkColor={() => "#93C5FD"}
        linkDirectionalParticles={0}
        cooldownTicks={120}
      />
    </div>
  )
}
