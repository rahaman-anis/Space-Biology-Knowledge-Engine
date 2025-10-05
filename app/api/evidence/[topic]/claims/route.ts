import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest, { params }: { params: { topic: string } }) {
  const topic = decodeURIComponent(params.topic)
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 })
  }

  const supabase = createClient(url, key)

  try {
    const { data, error } = await supabase
      .from("claims")
      .select("pmcid,claim_text,subject,predicate,object,confidence,section")
      .ilike("topic", `%${topic}%`)
      .order("confidence", { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ claims: data || [] })
  } catch (err) {
    console.error("[claims] Exception:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
