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
    // Try to query topics_v view first
    const { data: topicData, error: topicError } = await supabase
      .from("topics_v")
      .select("topic,study_count,osdr_linked,mission_criticality,r4c_score")
      .ilike("topic", topic)
      .single()

    if (!topicError && topicData) {
      return NextResponse.json(topicData)
    }

    // Fallback: calculate metrics from documents table
    const { data: docs, error: docsError } = await supabase
      .from("documents")
      .select("pmcid")
      .ilike("topic", `%${topic}%`)

    if (docsError) {
      return NextResponse.json({ error: docsError.message }, { status: 500 })
    }

    return NextResponse.json({
      topic,
      study_count: docs?.length || 0,
      osdr_linked: 0,
      mission_criticality: 0.5,
      r4c_score: 0.5,
    })
  } catch (err) {
    console.error("[metadata] Exception:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
