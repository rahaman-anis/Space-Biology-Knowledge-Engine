export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!url || !anon) throw new Error("Supabase envs missing")
  return createClient(url, anon, { auth: { persistSession: false } })
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const rawTopic = (searchParams.get("topic") || "all").toLowerCase().trim()
    const limit = Math.max(50, Math.min(Number(searchParams.get("limit") || "500"), 1000))
    const topic = rawTopic === "" ? "all" : rawTopic

    const supabase = getServerSupabase()

    let q = supabase.from("graph_edges_v").select("source, target, relation, predicate, confidence, topic").limit(limit)

    if (topic !== "all") q = q.eq("topic", topic)

    const { data: edges, error: e1 } = await q
    if (e1) throw e1

    if (!edges || edges.length === 0) {
      return NextResponse.json({
        nodes: [],
        edges: [],
        meta: { topic, limit, reason: "no-edges", count: { nodes: 0, edges: 0 } },
      })
    }

    const nodeIds = Array.from(new Set(edges.flatMap((e) => [e.source, e.target])))

    const { data: nodes, error: e2 } = await supabase
      .from("graph_nodes_v")
      .select("id, label, type, topic")
      .in("id", nodeIds)

    if (e2) throw e2

    return NextResponse.json({
      nodes: nodes || [],
      edges,
      meta: { topic, limit, count: { nodes: nodes?.length || 0, edges: edges.length } },
    })
  } catch (err: any) {
    console.error("[api/graph] Error:", err)
    return NextResponse.json({ error: String(err?.message || err), meta: { route: "/api/graph" } }, { status: 500 })
  }
}
