"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Suspense, useMemo, useEffect, useState } from "react"

type Props = { className?: string }
type Topic = { id: string; colour: string }

const TOPICS: Topic[] = [
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

function hexToLinear(colour: string): [number, number, number] {
  const hex = colour.replace("#", "")
  const r = Number.parseInt(hex.slice(0, 2), 16) / 255
  const g = Number.parseInt(hex.slice(2, 4), 16) / 255
  const b = Number.parseInt(hex.slice(4, 6), 16) / 255
  return [r, g, b]
}

function Scene() {
  // Fibonacci sphere for even distribution
  const nodes = useMemo(() => {
    const N = TOPICS.length
    const radius = 3.2
    return Array.from({ length: N }, (_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / N)
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
      const x = radius * Math.cos(theta) * Math.sin(phi)
      const y = radius * Math.sin(theta) * Math.sin(phi)
      const z = radius * Math.cos(phi)
      return { ...TOPICS[i], position: [x, y, z] as [number, number, number] }
    })
  }, [])

  const edges = useMemo(() => nodes.map((_, i) => [i, (i + 1) % nodes.length] as [number, number]), [nodes])

  return (
    <>
      {/* Soft, readable lighting */}
      <ambientLight intensity={0.7} />
      <hemisphereLight intensity={0.4} groundColor="#0b132b" />
      <directionalLight position={[5, 8, 5]} intensity={0.6} />

      {/* Edges */}
      {edges.map(([a, b], i) => {
        const pa = nodes[a].position,
          pb = nodes[b].position
        const mid = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, (pa[2] + pb[2]) / 2]
        const dx = pb[0] - pa[0],
          dy = pb[1] - pa[1],
          dz = pb[2] - pa[2]
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz)
        const up = [0, 1, 0]
        const dir = [dx / len, dy / len, dz / len]
        const cross = [
          up[1] * dir[2] - up[2] * dir[1],
          up[2] * dir[0] - up[0] * dir[2],
          up[0] * dir[1] - up[1] * dir[0],
        ]
        const dot = up[0] * dir[0] + up[1] * dir[1] + up[2] * dir[2]
        const angle = Math.acos(Math.min(1, Math.max(-1, dot)))
        return (
          <mesh key={i} position={mid as any} rotation={[cross[0] * angle, cross[1] * angle, cross[2] * angle]}>
            <cylinderGeometry args={[0.016, 0.016, len, 6]} />
            <meshBasicMaterial color="#ffffff" opacity={0.28} transparent />
          </mesh>
        )
      })}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <mesh key={i} position={n.position as any} onClick={() => console.log("Open topic:", n.id)}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={hexToLinear(n.colour)} emissive="#0a0a0a" emissiveIntensity={0.06} />
        </mesh>
      ))}
    </>
  )
}

function Controls() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => setReduce(m.matches)
    setReduce(m.matches)
    m.addEventListener?.("change", onChange)
    return () => m.removeEventListener?.("change", onChange)
  }, [])
  return <OrbitControls makeDefault enablePan={false} enableZoom={false} autoRotate={!reduce} autoRotateSpeed={0.6} />
}

function Legend() {
  return (
    <ul className="pointer-events-none rounded-lg bg-white/80 backdrop-blur px-3 py-2 text-[11px] text-gray-800 shadow-md">
      <li className="flex items-center gap-2" aria-label="High maturity">
        <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-green-500" />
        <span>High maturity</span>
      </li>
      <li className="flex items-center gap-2" aria-label="Medium maturity">
        <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
        <span>Medium</span>
      </li>
      <li className="flex items-center gap-2" aria-label="Low / gaps">
        <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-red-500" />
        <span>Low / gaps</span>
      </li>
      <li className="flex items-center gap-2" aria-label="Evidence relation">
        <span aria-hidden className="inline-block h-[2px] w-3 bg-gray-600" />
        <span>Evidence relation</span>
      </li>
    </ul>
  )
}

function DebugBadge() {
  const canvasPresent = typeof document !== "undefined" && !!document.querySelector('canvas[data-graph="hero3d"]')
  const flag = process.env.NEXT_PUBLIC_FEATURE_3D_GRAPH === "true"
  return (
    <div className="ml-auto rounded bg-black/40 px-2 py-0.5 text-[10px] text-white">
      3D: {flag ? "ON" : "OFF"} · Canvas: {canvasPresent ? "✓" : "✗"}
    </div>
  )
}

export default function HeroGraph3D({ className }: Props) {
  return (
    <div className="relative h-[260px] sm:h-[340px] md:h-[440px] lg:h-[520px] xl:h-[600px] min-h-[260px]">
      <Canvas
        data-graph="hero3d"
        className={className}
        dpr={[1, typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio) : 1]}
        camera={{ position: [0, 0, 26], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false }}
        style={{ display: "block", touchAction: "auto" }}
      >
        <Suspense fallback={null}>
          <Scene />
          <Controls />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute right-3 top-3 flex flex-col gap-2">
        <Legend />
        <DebugBadge />
      </div>
    </div>
  )
}
