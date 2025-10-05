import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest, { params }: { params: { topic: string } }) {
  const topic = decodeURIComponent(params.topic)
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "50")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 })
  }

  const supabase = createClient(url, key)

  try {
    // Get claims with document info
    const { data: claims, error: claimsError } = await supabase
      .from("claims")
      .select("pmcid,section,claim_text,confidence")
      .ilike("topic", `%${topic}%`)
      .order("confidence", { ascending: false })
      .limit(limit)

    if (claimsError) {
      return NextResponse.json({ error: claimsError.message }, { status: 500 })
    }

    // Get document details for these PMCIDs
    const pmcids = claims?.map((c) => c.pmcid) || []
    if (pmcids.length === 0) {
      return NextResponse.json({ studies: [] })
    }

    const { data: docs, error: docsError } = await supabase
      .from("documents")
      .select("pmcid,title,year")
      .in("pmcid", pmcids)

    if (docsError) {
      return NextResponse.json({ error: docsError.message }, { status: 500 })
    }

    // Merge claims and documents
    const docsMap = new Map(docs?.map((d) => [d.pmcid, d]))
    const studies = claims?.map((c) => {
      const doc = docsMap.get(c.pmcid)
      return {
        pmcid: c.pmcid,
        title: doc?.title || "Untitled",
        year: doc?.year || 0,
        section: c.section || "Results",
        claim_text: c.claim_text || "",
        confidence: c.confidence || 0.5,
      }
    })

    return NextResponse.json({ studies: studies || [] })
  } catch (err) {
    console.error("[studies] Exception:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
