import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "Supabase env not set" }, { status: 500 })
  }

  const sb = createClient(url, key)
  const table = process.env.NEXT_PUBLIC_GAPS_TABLE || "gaps"

  try {
    const { data, error, count } = await sb
      .from(table)
      .select("id,gap_id,topic,priority_score,mission_impact", { count: "exact", head: false })
      .limit(3)

    if (error) {
      return NextResponse.json({ ok: false, stage: "gaps", table, error: error.message }, { status: 502 })
    }

    return NextResponse.json({ ok: true, table, count, sample: data }, { headers: { "cache-control": "no-store" } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
