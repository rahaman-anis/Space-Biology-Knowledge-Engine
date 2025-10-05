import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { hash256, vecLiteral } from "@/lib/hash256"

export async function POST(req: Request) {
  const { q, k = 8, mode = "both" } = await req.json()
  if (!q) return NextResponse.json({ ok: false, error: "q required" }, { status: 400 })

  const sb = getSupabaseClient()
  if (!sb) return NextResponse.json({ ok: false, error: "supabase not configured" }, { status: 500 })

  const vec = vecLiteral(hash256(q))
  const wantDocs = mode === "both" || mode === "documents"
  const wantPass = mode === "both" || mode === "passages"

  const docs = wantDocs
    ? await sb.rpc("match_documents", { query_embedding: vec, match_count: Number(k) })
    : { data: [], error: null }
  const pass = wantPass
    ? await sb.rpc("match_passages", { query_embedding: vec, match_count: Math.min(12, Number(k) * 2) })
    : { data: [], error: null }

  if (docs.error || pass.error) {
    return NextResponse.json(
      {
        ok: false,
        stage: docs.error ? "match_documents" : "match_passages",
        error: (docs.error || pass.error)?.message,
      },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true, query: q, k, documents: docs.data ?? [], passages: pass.data ?? [] })
}

export async function GET(req: Request) {
  const u = new URL(req.url)
  const q = u.searchParams.get("q") || ""
  const k = Number(u.searchParams.get("k") || 8)
  const mode = u.searchParams.get("mode") || "both"
  return POST(
    new Request(req.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q, k, mode }),
    }),
  )
}
