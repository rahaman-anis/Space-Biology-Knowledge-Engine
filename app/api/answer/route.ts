import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { hash256, vecLiteral } from "@/lib/hash256"
import { getGroq } from "@/lib/groq"

export async function POST(req: Request) {
  const { q, k = 6 } = await req.json()
  if (!q) return NextResponse.json({ ok: false, error: "q required" }, { status: 400 })

  const sb = getSupabaseClient()
  if (!sb) return NextResponse.json({ ok: false, error: "supabase not configured" }, { status: 500 })

  const vec = vecLiteral(hash256(q))
  const { data: passages, error } = await sb.rpc("match_passages", {
    query_embedding: vec,
    match_count: Math.min(12, Number(k) * 2),
  })

  if (error) return NextResponse.json({ ok: false, stage: "match_passages", error: error.message }, { status: 502 })

  const groq = getGroq()
  if (!groq)
    return NextResponse.json({
      ok: true,
      answer: "(LLM disabled — add GROQ_API_KEY to enable synthesis)",
      passages: passages ?? [],
    })

  const ctx = (passages ?? [])
    .slice(0, k)
    .map(
      (p: any, i: number) =>
        `[${i + 1}] ${p.pmcid} ${p.section || ""} — ${String(p.text || p.snippet || "").slice(0, 350)}`,
    )
    .join("\n")

  const prompt = `You are ARIA. Answer only from context. Cite as [#]. Prefer [Results] over [Discussion].\nQuestion: ${q}\n\nContext:\n${ctx}\n\nAnswer with citations:`

  const resp = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 420,
  })

  return NextResponse.json({
    ok: true,
    answer: resp.choices?.[0]?.message?.content ?? "",
    passages: passages ?? [],
  })
}

export async function GET(req: Request) {
  const u = new URL(req.url)
  const q = u.searchParams.get("q") || ""
  const k = Number(u.searchParams.get("k") || 6)
  return POST(
    new Request(req.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q, k }),
    }),
  )
}
