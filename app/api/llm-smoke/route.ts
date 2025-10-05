import "server-only"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const key = process.env.GROQ_API_KEY
    if (!key) return NextResponse.json({ ok: false, error: "GROQ_API_KEY missing" }, { status: 500 })

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "reply with OK" }],
        max_tokens: 2,
        temperature: 0,
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      return NextResponse.json({ ok: false, error: `Groq HTTP ${res.status}: ${errText}` }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({ ok: true, reply: data.choices?.[0]?.message?.content?.trim() || "" })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
