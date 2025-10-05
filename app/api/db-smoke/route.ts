import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * GET /api/db-smoke
 * Test basic database connectivity via supabase-js
 * Queries the documents table for a small sample
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "Supabase env not set" }, { status: 500 })
  }

  const sb = createClient(url, key)
  const table = process.env.NEXT_PUBLIC_SUPABASE_DOCS_TABLE || "documents"

  const { data, error, count } = await sb
    .from(table)
    .select("pmcid,title,year,topic,organism_normalized", { count: "exact", head: false })
    .limit(3)

  if (error) {
    return NextResponse.json({ ok: false, stage: "table", table, error: error.message }, { status: 502 })
  }

  return NextResponse.json({ ok: true, table, count, sample: data }, { headers: { "cache-control": "no-store" } })
}
