import { NextResponse } from "next/server"
import { getGroq, DEFAULT_GROQ_MODEL } from "@/lib/groq"

export async function GET() {
  try {
    const groq = getGroq()
    if (!groq) {
      return NextResponse.json({ ok: false, error: "GROQ_API_KEY missing" }, { status: 500 })
    }

    const resp = await groq.chat.completions.create({
      model: DEFAULT_GROQ_MODEL,
      messages: [{ role: "user", content: "In one sentence, say hello from ARIA." }],
      temperature: 0.2,
      max_tokens: 24,
    })

    const text = resp?.choices?.[0]?.message?.content ?? ""
    return NextResponse.json(
      { ok: true, model: DEFAULT_GROQ_MODEL, text },
      { headers: { "cache-control": "no-store" } },
    )
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
