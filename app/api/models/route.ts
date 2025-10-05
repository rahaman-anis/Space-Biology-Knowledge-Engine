import "server-only"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const key = process.env.GROQ_API_KEY
    if (!key) return NextResponse.json({ ok: false, error: "GROQ_API_KEY missing" }, { status: 500 })

    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    })

    if (!res.ok) return NextResponse.json({ ok: false, status: res.status }, { status: res.status })

    const data = await res.json()
    // Compact response - just return model IDs
    const ids = (data?.data || []).map((m: any) => m.id)

    return NextResponse.json({ ok: true, count: ids.length, models: ids })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
