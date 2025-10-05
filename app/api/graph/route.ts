import { type NextRequest, NextResponse } from "next/server"
import { fetchSubgraph } from "@/lib/fetchers"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const topic = searchParams.get("topic") || searchParams.get("q") || undefined
  const limit = Number(searchParams.get("limit") || 200)
  const minConfidence = Number(searchParams.get("minConfidence") || 0.6)

  try {
    const data = await fetchSubgraph({
      q: topic,
      limit: Math.min(limit, 2000), // Cap at 2000
    })

    // Filter by confidence if provided
    let filteredEdges = data.edges
    if (minConfidence > 0) {
      filteredEdges = data.edges.filter((e: any) => !e.confidence || e.confidence >= minConfidence)
    }

    return NextResponse.json({
      nodes: data.nodes,
      edges: filteredEdges,
      meta: {
        ...data.meta,
        count: {
          nodes: data.nodes.length,
          edges: filteredEdges.length,
        },
      },
    })
  } catch (err) {
    console.error("[api/graph] Error:", err)
    return NextResponse.json({ error: "Failed to fetch graph data" }, { status: 500 })
  }
}
