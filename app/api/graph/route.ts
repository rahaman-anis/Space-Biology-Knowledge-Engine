export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_KEY
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || (!service && !anon)) {
    return null
  }

  return createClient(url, service || anon!, { auth: { persistSession: false } })
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.max(50, Math.min(Number(searchParams.get("limit") || "500"), 1000))

    const supabase = getServerSupabase()

    if (!supabase) {
      return NextResponse.json({
        nodes: [],
        edges: [],
        meta: { reason: "missing-envs", details: "Supabase environment variables not configured" },
      })
    }

    const { data: edges, error: e1 } = await supabase
      .from("graph_edges_v")
      .select("source, target, relation")
      .limit(limit)

    if (e1) {
      return NextResponse.json({
        nodes: [],
        edges: [],
        meta: { reason: "supabase-error", details: e1.message },
      })
    }

    if (!edges || edges.length === 0) {
      return NextResponse.json({
        nodes: [],
        edges: [],
        meta: { limit, reason: "no-edges", count: { nodes: 0, edges: 0 } },
      })
    }

    const nodeIds = Array.from(new Set(edges.flatMap((e) => [e.source, e.target])))

    const { data: rawNodes, error: e2 } = await supabase.from("graph_nodes_v").select("id, label").in("id", nodeIds)

    if (e2) {
      return NextResponse.json({
        nodes: [],
        edges: [],
        meta: { reason: "supabase-error", details: e2.message },
      })
    }

    const nodes = (rawNodes || []).map((n: any) => ({
      ...n,
      type: n.type || "node",
    }))

    return NextResponse.json({
      nodes,
      edges,
      meta: { limit, count: { nodes: nodes.length, edges: edges.length } },
    })
  } catch (err: any) {
    console.error("[api/graph] Error:", err)
    return NextResponse.json({
      nodes: [],
      edges: [],
      meta: { reason: "supabase-error", details: String(err?.message || err) },
    })
  }
}
