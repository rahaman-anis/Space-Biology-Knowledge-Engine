import "server-only"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const VEC_DIM = Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256)
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"

function hash256(text: string, dim = VEC_DIM): number[] {
  const v = new Array(dim).fill(0)
  const toks = text.toLowerCase().split(/\W+/).filter(Boolean)
  for (const t of toks) {
    let h = 2166136261 >>> 0
    for (let i = 0; i < t.length; i++) {
      h ^= t.charCodeAt(i)
      h = Math.imul(h, 16777619) >>> 0
    }
    v[h % dim] += 1
  }
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  return v.map((x) => x / n)
}

export async function POST(req: Request) {
  try {
    const { question, k = 6 } = await req.json().catch(() => ({}))
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const groqKey = process.env.GROQ_API_KEY

    if (!url || !anon) return NextResponse.json({ ok: false, error: "Supabase env missing" }, { status: 500 })
    if (!groqKey) return NextResponse.json({ ok: false, error: "GROQ_API_KEY missing" }, { status: 500 })
    if (!question || typeof question !== "string")
      return NextResponse.json({ ok: false, error: "question (string) is required" }, { status: 400 })

    const supabase = createClient(url, anon, { auth: { persistSession: false } })
    const embedding = hash256(question)

    const { data: passages, error } = await supabase.rpc("match_passages", {
      query_embedding: embedding,
      match_count: Math.min(Math.max(Number(k) || 6, 3), 12),
    })
    if (error) return NextResponse.json({ ok: false, error: `match_passages: ${error.message}` }, { status: 500 })

    const contextBlocks = (passages || [])
      .map(
        (p: any, i: number) =>
          `[#${i + 1}] PMCID ${p.pmcid ?? "—"} | ${p.section ?? "All"} | score=${(p.score ?? "").toString().slice(0, 5)}\n${p.text ?? p.snippet ?? ""}`,
      )
      .join("\n\n")

    const system = [
      "You are ARIA, a careful assistant that answers with citations.",
      "Only use the provided context if relevant. Be concise and precise.",
      "After factual statements, add citations like [#1][#3] pointing to the context blocks.",
    ].join(" ")

    const user = [
      `Question: ${question}`,
      `Context:\n${contextBlocks}`,
      "Instructions: If context is insufficient, state what is missing. Provide a short answer first, then bullet points with citations.",
    ].join("\n\n")

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
        max_tokens: 600,
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => "")
      return NextResponse.json({ ok: false, error: `Groq HTTP ${groqRes.status}: ${errText}` }, { status: 500 })
    }

    const groqData = await groqRes.json()
    const answer = (groqData.choices?.[0]?.message?.content || "").trim()

    return NextResponse.json({
      ok: true,
      question,
      k,
      contextCount: passages?.length || 0,
      answer,
      citations: (passages || []).map((p: any, i: number) => ({
        i: i + 1,
        pmcid: p.pmcid ?? null,
        section: p.section ?? null,
        score: p.score ?? null,
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
