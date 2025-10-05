"use client"
import { useMemo, useState } from "react"

type Props = { className?: string }
type Node = { id: string; x: number; y: number; r: number; colour: string }
type Edge = { a: number; b: number }

const TOPICS = [
  { id: "Bone Loss", colour: "#16A34A" },
  { id: "Muscle Atrophy", colour: "#16A34A" },
  { id: "Radiation", colour: "#EA580C" },
  { id: "Immune", colour: "#EA580C" },
  { id: "Vision", colour: "#DC2626" },
  { id: "Microbiome", colour: "#16A34A" },
  { id: "Sleep", colour: "#EA580C" },
  { id: "Cognition", colour: "#EA580C" },
  { id: "Cardio", colour: "#16A34A" },
  { id: "Dust", colour: "#DC2626" },
]

export default function HeroGraph2D({ className }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const { nodes, edges } = useMemo(() => {
    const cx = 0,
      cy = 0,
      R = 120
    const nodes: Node[] = TOPICS.map((t, i) => {
      const a = (i / TOPICS.length) * 2 * Math.PI
      return { id: t.id, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), r: 10, colour: t.colour }
    })
    const edges: Edge[] = nodes.map((_, i) => ({ a: i, b: (i + 1) % nodes.length }))
    return { nodes, edges }
  }, [])

  return (
    <svg viewBox="-200 -200 400 400" className={className} role="img" aria-label="Evidence network (2D)">
      <g stroke="#ffffff" strokeOpacity="0.25">
        {edges.map((e, i) => (
          <line key={i} x1={nodes[e.a].x} y1={nodes[e.a].y} x2={nodes[e.b].x} y2={nodes[e.b].y} />
        ))}
      </g>
      <g>
        {nodes.map((n, i) => (
          <g
            key={i}
            transform={`translate(${n.x},${n.y})`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onClick={() => console.log("Open topic:", n.id)}
            role="button"
            tabIndex={0}
            aria-label={`Topic ${n.id}`}
          >
            <circle r={hover === i ? n.r * 1.3 : n.r} fill={n.colour} />
            {hover === i && (
              <text x="12" y="4" fontSize="10" fill="white">
                {n.id}
              </text>
            )}
          </g>
        ))}
      </g>
    </svg>
  )
}
