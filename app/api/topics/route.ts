import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * GET /api/topics
 * Returns list of topics with aggregated metrics
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "Missing Supabase credentials" }, { status: 500 })
  }

  const supabase = createClient(url, key)

  try {
    // Try to query topics_v view first
    const { data: topicsData, error: topicsError } = await supabase
      .from("topics_v")
      .select("topic,study_count,osdr_linked,mission_criticality,r4c_score")
      .order("r4c_score", { ascending: false })

    if (!topicsError && topicsData && topicsData.length > 0) {
      return NextResponse.json({ ok: true, topics: topicsData })
    }

    // Fallback: build from documents table
    const { data: docs, error: docsError } = await supabase
      .from("documents")
      .select("topic,year")
      .not("topic", "is", null)

    if (docsError) {
      return NextResponse.json({ ok: false, error: docsError.message }, { status: 500 })
    }

    // Aggregate by topic
    const topicMap = new Map<
      string,
      {
        topic: string
        study_count: number
        osdr_linked: number
        mission_criticality: number
        r4c_score: number
      }
    >()

    for (const doc of docs || []) {
      const topics = Array.isArray(doc.topic) ? doc.topic : [doc.topic]
      for (const t of topics) {
        if (!t) continue
        const topic = String(t).trim()
        if (!topicMap.has(topic)) {
          topicMap.set(topic, {
            topic,
            study_count: 0,
            osdr_linked: 0,
            mission_criticality: 0.5,
            r4c_score: 0.5,
          })
        }
        const entry = topicMap.get(topic)!
        entry.study_count++
      }
    }

    const topics = Array.from(topicMap.values()).sort((a, b) => b.study_count - a.study_count)

    return NextResponse.json({ ok: true, topics })
  } catch (err) {
    console.error("[/api/topics] Exception:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
