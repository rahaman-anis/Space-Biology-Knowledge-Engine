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
    const { data, error } = await supabase
      .from("documents")
      .select("organism_normalized")
      .ilike("topic", `%${topic}%`)
      .not("organism_normalized", "is", null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Count organisms
    const counts = new Map<string, number>()
    data?.forEach((doc) => {
      const org = doc.organism_normalized
      if (org) {
        counts.set(org, (counts.get(org) || 0) + 1)
      }
    })

    const organisms = Array.from(counts.entries())
      .map(([organism, count]) => ({ organism, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ organisms })
  } catch (err) {
    console.error("[organisms] Exception:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
