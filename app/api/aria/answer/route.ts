import "server-only"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const VEC_DIM = Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256)

// Primary model (optional), plus an ordered fallback list.
// You can override the list via GROQ_MODEL_FALLBACKS="modelA,modelB,..."
const PRIMARY_MODEL = (process.env.GROQ_MODEL || "").trim()
const FALLBACKS_ENV = (process.env.GROQ_MODEL_FALLBACKS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

// Safe defaults that match the “Organization Limits” you showed.
const DEFAULT_MODEL_ORDER = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it", "allam-2-7b"]

function modelOrder(): string[] {
  const list = [...([PRIMARY_MODEL].filter(Boolean) as string[]), ...FALLBACKS_ENV, ...DEFAULT_MODEL_ORDER]
  // de-dupe while preserving order
  return Array.from(new Set(list))
}

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

type Passage = { pmcid: string | null; section: string | null; text: string | null; score?: number | null }

function packContext(passages: Passage[], charBudget = 7000, maxBlocks = 8): string {
  // prefer passages with real text
  const usable = passages.filter((p) => (p.text ?? "").trim().length > 0).slice(0, maxBlocks)

  // If nothing with text, we’ll still return empty context
  const blocks: string[] = []
  let used = 0
  for (let i = 0; i < usable.length; i++) {
    const p = usable[i]
    const head = `[#${i + 1}] PMCID ${p.pmcid ?? "—"} | ${p.section ?? "All"} | score=${(p.score ?? "").toString().slice(0, 6)}\n`
    const remaining = Math.max(0, charBudget - used - head.length)
    if (remaining <= 0) break
    const text = (p.text || "").replace(/\s+/g, " ").slice(0, Math.max(200, Math.min(1000, remaining)))
    const block = head + text
    used += block.length + 2
    blocks.push(block)
  }
  return blocks.join("\n\n")
}

/** Chat call with retries & backoff. Shrinks context on 413/token errors. */
async function callGroqChat({
  groqKey,
  models,
  system,
  userBuilder, // (charBudget) => userMessage
}: {
  groqKey: string
  models: string[]
  system: string
  userBuilder: (charBudget: number) => string
}) {
  let lastErrText = ""
  let lastStatus = 500

  // Start with ~7k chars budget and shrink on token errors
  let charBudget = 7000

  for (const model of models) {
    // up to 3 attempts per model with 0/400/1200 ms backoff
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, [0, 400, 1200][attempt]))
      const user = userBuilder(charBudget)

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.2,
          max_tokens: 600,
        }),
      })

      if (res.ok) {
        const json = await res.json().catch(() => ({}) as any)
        const answer = (json?.choices?.[0]?.message?.content || "").trim()
        return { ok: true as const, model, answer }
      }

      lastStatus = res.status
      lastErrText = await res.text().catch(() => "")

      // Parse common Groq error shapes
      let code = ""
      try {
        const j = JSON.parse(lastErrText)
        code = j?.error?.code || j?.error?.type || ""
      } catch {}

      // 503/500 => model capacity; try next attempt (or next model)
      if (res.status === 503 || /over capacity|incident/i.test(lastErrText)) {
        continue
      }

      // 429 (rate limits) => backoff and retry; if still failing, try next model
      if (res.status === 429 || /rate_limit/i.test(code)) {
        continue
      }

      // 413 or token limit => shrink context and retry same model
      if (res.status === 413 || /tokens per minute|context_length|max context/i.test(lastErrText)) {
        charBudget = Math.max(2000, Math.floor(charBudget * 0.6))
        continue
      }

      // 404 model not found => break attempts, try next model
      if (res.status === 404 || /model_not_found|does not exist/i.test(lastErrText)) {
        break
      }

      // Other 4xx => try next model
      if (res.status >= 400 && res.status < 500) break
      // Other 5xx => retry then fallback
    }
  }

  return {
    ok: false as const,
    status: lastStatus,
    error: lastErrText || "Groq chat failed",
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/aria/answer",
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasGroqKey: !!process.env.GROQ_API_KEY,
      modelOrder: modelOrder(),
    },
    hint: "POST { question: string, k?: number }",
  })
}

export async function POST(req: Request) {
  try {
    const { question, k = 6 } = await req.json().catch(() => ({}) as any)
    if (!question || typeof question !== "string") {
      return NextResponse.json({ ok: false, error: "question (string) is required" }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const groqKey = process.env.GROQ_API_KEY

    if (!url || !anon) return NextResponse.json({ ok: false, error: "Supabase env missing" }, { status: 500 })
    if (!groqKey) return NextResponse.json({ ok: false, error: "GROQ_API_KEY missing" }, { status: 500 })

    // 1) Retrieve passages from RPC (same as before)
    const supabase = createClient(url, anon, { auth: { persistSession: false } })
    const embedding = hash256(question)
    const matchCount = Math.min(Math.max(Number(k) || 6, 3), 12)

    const { data: passagesRaw, error } = await supabase.rpc("match_passages", {
      query_embedding: embedding,
      match_count: matchCount,
    })

    const passages: Passage[] = Array.isArray(passagesRaw)
      ? passagesRaw.map((p: any) => ({
          pmcid: p.pmcid ?? null,
          section: p.section ?? "All",
          text: p.text ?? p.snippet ?? null,
          score: typeof p.score === "number" ? p.score : Number(p.score ?? 0) || 0,
        }))
      : []

    // If no context at all, short-circuit with a helpful message
    if (!passages.length) {
      return NextResponse.json({
        ok: true,
        model: null,
        answer:
          "I couldn’t find any matching passages to answer this. Try adding section keywords (Results/Discussion) or more specific terms (e.g., RANKL, EBV, ARED).",
        contextCount: 0,
        citations: [],
      })
    }

    const contextBuilder = (charBudget: number) => {
      const contextBlocks = packContext(passages, charBudget, 8)
      const system = [
        "You are ARIA, a careful assistant that answers with citations.",
        "Summarize the retrieved evidence into 3–5 concise bullets (≤28 words each).",
        "For each bullet, append the single most relevant PMCID in square brackets, e.g., [PMC7756144].",
        "No intro or outro text—bulleted Markdown only. Do not repeat bullets.",
        "Use only the provided context when citing.",
      ].join(" ")
      const user = [
        `Question: ${question}`,
        `Context:\n${contextBlocks}`,
        "If context is insufficient, say so briefly and state what is missing.",
      ].join("\n\n")
      return { system, user }
    }

    // 2) Call Groq with fallback + retries
    const models = modelOrder()
    const { system } = contextBuilder(7000)
    const result = await callGroqChat({
      groqKey,
      models,
      system,
      userBuilder: (budget) => contextBuilder(budget).user,
    })

    if (!result.ok) {
      const status = result.status === 503 ? 503 : 500
      return NextResponse.json({ ok: false, error: `Groq HTTP ${result.status}: ${result.error}` }, { status })
    }

    // 3) Success
    const answer = result.answer
    return NextResponse.json({
      ok: true,
      model: result.model,
      answer,
      contextCount: passages.length,
      citations: passages.slice(0, 8).map((p, i) => ({
        i: i + 1,
        pmcid: p.pmcid,
        section: p.section,
        score: p.score ?? null,
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
