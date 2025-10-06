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

type Passage = { pmcid: string; section?: string; text?: string; snippet?: string; score?: number }
type DocHit  = { pmcid: string; title?: string|null; year?: string|number|null; score?: number }

export async function POST(req: Request) {
  try {
    const { question, k = 6 } = await req.json().catch(() => ({}))
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const groqKey = process.env.GROQ_API_KEY

    if (!url || !anon) return NextResponse.json({ ok: false, error: "Supabase env missing" }, { status: 500 })
    if (!groqKey)     return NextResponse.json({ ok: false, error: "GROQ_API_KEY missing" }, { status: 500 })
    if (!question || typeof question !== "string")
      return NextResponse.json({ ok: false, error: "question (string) is required" }, { status: 400 })

    const supabase = createClient(url, anon, { auth: { persistSession: false } })
    const embedding = hash256(question)

    // --- 1) Try passages RPC first ---
    const kSafe = Math.min(Math.max(Number(k) || 6, 3), 12)
    let passages: Passage[] = []
    {
      const { data, error } = await supabase.rpc("match_passages", {
        query_embedding: embedding,
        match_count: kSafe,
      })
      if (!error && Array.isArray(data)) {
        passages = data as Passage[]
      }
    }

    // --- 2) Fallback to documents + abstracts if passages empty ---
    let usedFallback = false
    if (!passages.length) {
      usedFallback = true

      // 2a) Try document RPC for kSafe docs
      let docs: DocHit[] = []
      {
        const { data, error } = await supabase.rpc("match_documents", {
          query_embedding: embedding,
          match_count: kSafe,
        })
        if (!error && Array.isArray(data)) {
          docs = data as DocHit[]
        }
      }

      // 2b) If no RPC, fallback to view-based scoring in JS (safe, but slower)
      if (!docs.length) {
        const { data } = await supabase
          .from("doc_embeddings")
          .select("pmcid,title,year,embedding")
          .limit(1000)
        if (Array.isArray(data)) {
          const vec = embedding
          const scored = data
            .map((r: any) => {
              const e: number[] =
                Array.isArray(r.embedding) ? r.embedding :
                (typeof r.embedding === "string" && r.embedding.trim().startsWith("["))
                  ? JSON.parse(r.embedding) : []
              if (e.length !== VEC_DIM) return null
              // cosine-ish score in [0,1]
              let dot = 0, nv = 0, ne = 0
              for (let i = 0; i < VEC_DIM; i++) {
                const a = vec[i] || 0
                const b = e[i]   || 0
                dot += a*b; nv += a*a; ne += b*b
              }
              const score = dot / ((Math.sqrt(nv)||1) * (Math.sqrt(ne)||1))
              return { pmcid: r.pmcid, title: r.title, year: r.year, score }
            })
            .filter(Boolean) as any[]
          docs = scored.sort((a,b)=> (b.score||0)-(a.score||0)).slice(0, kSafe)
        }
      }

      // 2c) Pull abstracts for those docs and turn them into pseudo-passages
      if (docs.length) {
        const pmcids = docs.map(d => d.pmcid)
        const { data: abs } = await supabase
          .from("abstracts_norm") // view with (pmcid, abstract)
          .select("pmcid,abstract")
          .in("pmcid", pmcids)

        const byPmc: Record<string,string> = {}
        if (Array.isArray(abs)) {
          for (const r of abs) byPmc[r.pmcid] = r.abstract || ""
        }

        passages = docs.map((d, i) => ({
          pmcid: d.pmcid,
          section: "Abstract",
          text: (byPmc[d.pmcid] || "").slice(0, 700),
          score: d.score ?? 0,
        }))
      }
    }

    // --- 3) Compose the prompt context (passages or fallback abstracts) ---
    const contextBlocks = (passages || [])
      .map((p: any, i: number) =>
        `[#${i + 1}] PMCID ${p.pmcid ?? "—"} | ${p.section ?? "All"} | score=${(p.score ?? "").toString().slice(0, 5)}\n${p.text ?? p.snippet ?? ""}`
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
      "Instructions: Provide a short answer first, then 2–4 bullet points with citations. If context is weak, say what’s missing.",
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
        max_tokens: 700,
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
      model: MODEL,
      usedFallback,
      question,
      k: kSafe,
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
