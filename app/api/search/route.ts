import "server-only"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const VEC_DIM = Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256)

function hash256(text: string, dim = 256): number[] {
  const v = new Array(dim).fill(0)
  const toks = text.toLowerCase().split(/\W+/).filter(Boolean)
  for (const t of toks) {
    let h = 2166136261 >>> 0
    for (let i = 0; i < t.length; i++) {
      h ^= t.charCodeAt(i)
      h = Math.imul(h, 16777619) >>> 0
    }
    v[h % dim] += 1
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  return v.map((x) => x / norm)
}

export async function POST(req: Request) {
  try {
    if (!URL || !ANON) {
      return NextResponse.json({ ok: false, error: "Supabase env vars missing" }, { status: 200 })
    }
    const supabase = createClient(URL, ANON, { auth: { persistSession: false } })
    const body = await req.json().catch(() => ({}))

    const q = (body.q ?? "").toString().trim()
    if (!q) {
      return NextResponse.json({ ok: true, results: [] }, { status: 200 })
    }

    const mode: "passages" | "documents" = body.mode ?? "passages"
    const topK = Math.max(1, Math.min(20, Number(body.topK ?? 8)))
    const vec = hash256(q, VEC_DIM)

    if (mode === "documents") {
      const { data, error } = await supabase.rpc("match_documents", {
        query_embedding: vec,
        match_count: topK,
      })
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 200 })
      const results = (data ?? []).map((r: any) => ({
        pmcid: r.pmcid,
        title: r.title ?? null,
        year: r.year ?? null,
        score: r.score,
        type: "document" as const,
      }))
      return NextResponse.json({ ok: true, results }, { status: 200 })
    }

    // passages (default)
    const { data, error } = await supabase.rpc("match_passages", {
      query_embedding: vec,
      match_count: topK,
    })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 200 })

    const results = (data ?? []).map((r: any) => ({
      pmcid: r.pmcid,
      section: r.section ?? "All",
      snippet: r.snippet ?? "",
      score: r.score,
      type: "passage" as const,
    }))
    return NextResponse.json({ ok: true, results }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 200 })
  }
}
