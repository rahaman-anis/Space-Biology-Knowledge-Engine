import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest, { params }: { params: { topic: string } }) {
  const topic = decodeURIComponent(params.topic)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 })
  }

  const supabase = createClient(url, key)

  try {
    // Calculate metrics directly from documents table
    const { data: docs, error: docsError } = await supabase
      .from("documents")
      .select("pmcid,year")
      .ilike("topic", `%${topic}%`)

    if (docsError) {
      console.error("[metadata] Documents query error:", docsError)
      return NextResponse.json({ error: docsError.message }, { status: 500 })
    }

    // Calculate basic metrics
    const studyCount = docs?.length || 0
    const years = docs?.map((d) => d.year).filter(Boolean) || []
    const avgYear = years.length > 0 ? Math.round(years.reduce((a, b) => a + b, 0) / years.length) : null

    return NextResponse.json({
      topic,
      study_count: studyCount,
      osdr_linked: 0,
      mission_criticality: 0.5,
      r4c_score: 0.5,
      avg_year: avgYear,
    })
  } catch (err) {
    console.error("[metadata] Exception:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
