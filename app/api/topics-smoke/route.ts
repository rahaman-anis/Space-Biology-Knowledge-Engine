import { NextResponse } from "next/server"
import { dsListTopics } from "@/lib/datasources"
import { canonicalizeTopic } from "@/lib/topics"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const list = await dsListTopics(200)
  const canon = q ? await canonicalizeTopic(q) : null
  return NextResponse.json(
    {
      ok: true,
      total: list.length,
      sample: list.slice(0, 20),
      query: q || undefined,
      canonical: canon || undefined,
    },
    { headers: { "cache-control": "no-store" } },
  )
}
