"use client"

import dynamic from "next/dynamic"

const GraphCanvas = dynamic(() => import("@/components/graph/SubgraphCanvas"), { ssr: false })

export function GraphCanvasClient({ data }: { data: any }) {
  return <GraphCanvas data={data} />
}
