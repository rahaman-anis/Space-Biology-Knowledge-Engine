import { NextResponse } from "next/server"
import { fetchSubgraph } from "@/lib/fetchers"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || undefined
  const res = await fetchSubgraph({ q, limit: 200 })
  return NextResponse.json(res)
}
