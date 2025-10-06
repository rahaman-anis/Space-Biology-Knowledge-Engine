import "server-only"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------
const VEC_DIM = Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256)

// Prefer current Groq models first, then fast/cheap, then Mixtral
const GROQ_MODEL_FALLBACKS = [
  process.env.GROQ_MODEL || "llama-3.2-90b-text-preview",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
]

// Max passages to send to LLM
const MAX_CONTEXT = 8

// ---------------------------------------------------------
// Utilities
// ---------------------------------------------------------
function hash256(text: string, dim = VEC_DIM): number[] {
  const v = new Array(dim).fill(0)
  const toks = String(text).toLowerCase().split(/\W+/).filter(Boolean)
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

function json(status: number, body: any) {
  return NextResponse.json(body, { status })
}

// ---------------------------------------------------------
// Health check (never 500)
// ---------------------------------------------------------
export async function GET() {
  return json(200, {
    ok: true,
    route: "/api/aria/answer",
    vecDim: VEC_DIM,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasGroqKey: !!process.env.GROQ_API_KEY,
  })
}

// ---------------------------------------------------------
// Main
// ---------------------------------------------------------
type Body = { question?: string; k?: number }

export async function POST(req: Request) {
  const t0 = Date.now()
  let evidence: Array<{ pmcid: string; section: string | null; text: string; score: number }> = []
  try {
    const { question, k = 6 } = (await req.json().catch(() => ({}))) as Body

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const groqKey = process.env.GROQ_API_KEY

    if (!question || typeof question !== "string") {
      return json(400, { ok: false, error: "question (string) is required", evidence: [], citations: [] })
    }
    if (!url || !anon) {
      return json(500, { ok: false, error: "Supabase env missing", evidence: [], citations: [] })
    }
    if (!groqKey) {
      return json(500, { ok: false, error: "GROQ_API_KEY missing", evidence: [], citations: [] })
    }

    const supabase = createClient(url, anon, { auth: { persistSession: false } })
    const embedding = hash256(question)

    // 1) Primary: RPC
    let rpcOk = false
    try {
      const { data, error } = await supabase.rpc("match_passages", {
        query_embedding: embedding,
        match_count: Math.min(Math.max(Number(k) || 6, 3), 12),
      })
      if (!error && Array.isArray(data)) {
        evidence = (data as any[]).map((p) => ({
          pmcid: String(p.pmcid ?? ""),
          section: p.section ?? "All",
          text: String(p.text ?? p.snippet ?? ""),
          score: Number(p.score ?? 0),
        }))
        rpcOk = true
      }
    } catch {
      // ignore, we’ll try the fallback
    }

    // 1b) Fallback: view (passage_embeddings) if RPC failed or empty
    if (!rpcOk || evidence.length === 0) {
      const { data, error } = await supabase
        .from("passage_embeddings")
        .select("pmcid, section, text, embedding")
        .limit(2000)

      if (!error && Array.isArray(data)) {
        // Score locally (L2) to avoid blocking on RPC
        const scored = (data as any[])
          .map((r) => {
            const e: number[] = r.embedding || []
            if (e.length !== VEC_DIM) return null
            let d2 = 0
            for (let i = 0; i < VEC_DIM; i++) {
              const dx = (e[i] || 0) - embedding[i]
              d2 += dx * dx
            }
            const score = 1 / (1 + Math.sqrt(d2))
            return {
              pmcid: String(r.pmcid ?? ""),
              section: r.section ?? "All",
              text: String(r.text ?? ""),
              score,
            }
          })
          .filter(Boolean) as Array<{ pmcid: string; section: string | null; text: string; score: number }>
        evidence = scored.sort((a, b) => b.score - a.score).slice(0, Math.min(MAX_CONTEXT, Number(k) || 6))
      }
    }

    // Guarantee arrays for UI even if empty
    evidence = Array.isArray(evidence) ? evidence : []

    // Build LLM context
    const top = evidence.slice(0, MAX_CONTEXT)
    const blocks = top.map(
      (p, i) =>
        `[#${i + 1}] ${p.pmcid} (${p.section || "All"}) score=${p.score.toFixed(3)}\n${p.text || "[no passage text]"}`
    )

    const system = [
      "You are ARIA, a careful scientific assistant.",
      "Use ONLY the evidence blocks provided.",
      "Cite blocks inline like [#1] and finish with 'Sources:' listing PMCIDs you used.",
      "If evidence is insufficient, say so clearly.",
    ].join(" ")

    const user = [
      `Question: ${question.trim()}`,
      "",
      "Evidence:",
      blocks.length ? blocks.join("\n\n") : "[none]",
      "",
      "Output format:",
      "1) One-sentence answer (Yes/No/Unknown + brief reason).",
      "2) 2–4 bullets with inline citations [#i].",
      "3) 'Sources:' followed by PMCIDs.",
    ].join("\n")

    const answer = await groqChatWithFallback(system, user, process.env.GROQ_API_KEY!)

    // Build citations array (stable, never null)
    const citations = top.map((p, i) => ({
      i: i + 1,
      pmcid: p.pmcid,
      section: p.section,
      score: p.score,
    }))

    return json(200, {
      ok: true,
      question,
      k,
      contextCount: top.length,
      answer,
      evidence: top,       // <-- new, always an array
      citations,           // <-- kept for backward compatibility
      meta: {
        durationMs: Date.now() - t0,
        modelTried: GROQ_MODEL_FALLBACKS,
        vecDim: VEC_DIM,
      },
    })
  } catch (e: any) {
    // Ensure arrays exist to protect UI
    return json(500, {
      ok: false,
      error: String(e?.message || e),
      evidence: evidence || [],
      citations: [],
    })
  }
}

// ---------------------------------------------------------
// Groq client with model fallbacks
// ---------------------------------------------------------
async function groqChatWithFallback(system: string, user: string, apiKey: string): Promise<string> {
  const endpoint = "https://api.groq.com/openai/v1/chat/completions"
  const headers = { "content-type": "application/json", authorization: `Bearer ${apiKey}` }

  const body = (model: string) =>
    JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    })

  let lastErr: any = null
  for (const m of GROQ_MODEL_FALLBACKS) {
    try {
      const r = await fetch(endpoint, { method: "POST", headers, body: body(m) })
      const txt = await r.text()
      if (!r.ok) {
        lastErr = `HTTP ${r.status}: ${txt}`
        continue
      }
      const j = JSON.parse(txt)
      const content = (j?.choices?.[0]?.message?.content ?? "").trim()
      if (content) return content
      lastErr = "Empty content from Groq"
    } catch (e: any) {
      lastErr = String(e?.message || e)
    }
  }
  throw new Error(`Groq call failed for all models: ${lastErr}`)
}
