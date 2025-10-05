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
    // Get all mechanisms and count by relation type
    const { data, error } = await supabase.from("mechanisms").select("relation").ilike("source", `%${topic}%`)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const supports = data?.filter((m) => m.relation?.toLowerCase().includes("support")).length || 0
    const contradicts = data?.filter((m) => m.relation?.toLowerCase().includes("contradict")).length || 0

    return NextResponse.json({ supports, contradicts })
  } catch (err) {
    console.error("[mechanisms] Exception:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
