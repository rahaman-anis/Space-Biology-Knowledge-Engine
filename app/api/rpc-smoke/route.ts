import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { hash256, vecLiteral } from "@/lib/hash256"

/**
 * GET /api/rpc-smoke
 * Test RPC functions (match_documents, match_passages) via supabase-js
 * Uses hash256 to generate a test query embedding
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "Supabase env not set" }, { status: 500 })
  }

  const sb = createClient(url, key)
  const payload = { query_embedding: vecLiteral(hash256("bone loss")), match_count: 3 }

  const docs = await sb.rpc("match_documents", payload)
  const passages = await sb.rpc("match_passages", payload)

  return NextResponse.json(
    {
      ok: true,
      supabase_js: {
        docs_error: docs.error?.message || null,
        docs: Array.isArray(docs.data) ? docs.data : null,
        passages_error: passages.error?.message || null,
        passages: Array.isArray(passages.data) ? passages.data : null,
      },
    },
    { headers: { "cache-control": "no-store" } },
  )
}
