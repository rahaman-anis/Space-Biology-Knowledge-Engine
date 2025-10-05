import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { hash256, vecLiteral } from "@/lib/hash256"

const VEC_DIM = Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256)

export async function POST(req: Request) {
  try {
    const { query, k = 12, scope } = await req.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query required" }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anon) {
      return NextResponse.json({ error: "supabase not configured" }, { status: 500 })
    }

    const supabase = createClient(url, anon, { auth: { persistSession: false } })

    // Generate query embedding
    const vec = vecLiteral(hash256(query, VEC_DIM))

    // Call match_passages RPC function
    const { data, error } = await supabase.rpc("match_passages", {
      query_embedding: vec,
      match_count: Number(k),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ results: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
