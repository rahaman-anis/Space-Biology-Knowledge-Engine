import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const topic = searchParams.get("topic") ?? ""
  const contradictionsOnly = searchParams.get("contradictionsOnly") === "true"
  const limit = Number(searchParams.get("limit") ?? 30)

  // TODO: Replace with a real Supabase-powered subgraph.
  // Returning an empty graph is OK; the fetcher will fall back to BM25-derived graph if you call it directly.
  return NextResponse.json({
    topic,
    contradictionsOnly,
    limit,
    nodes: [],
    edges: [],
    total: 0,
    cached: false,
  })
}
