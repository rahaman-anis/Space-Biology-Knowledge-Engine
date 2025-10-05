import { NextResponse } from "next/server"
import Groq from "groq-sdk"
import { buildSynthesisPrompt } from "@/lib/rag/prompt"
import type { RetrievedPassage, ChatRequestDTO } from "@/lib/rag/types"
import { allow, keyFromRequest, chatRule } from "@/lib/security/rateLimit"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

async function telemetry(ev: {
  type: string
  ms?: number
  ok?: boolean
  code?: number
}) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/telemetry`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(ev),
    })
  } catch {}
}

async function retrievePassages(
  question: string,
  k = 12,
  scope?: ChatRequestDTO["scope"],
): Promise<RetrievedPassage[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/search-passages`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: question, k, scope }),
  })
  if (!res.ok) throw new Error(`retrieval failed: ${res.status}`)
  const { results } = await res.json()

  return (results ?? [])
    .map((r: any, i: number) => ({
      id: r.id ?? String(i),
      text: r.snippet ?? r.text ?? "",
      section: r.section ?? undefined,
      pmcid: r.pmcid ?? undefined,
      ntrsId: r.ntrs_id ?? r.ntrsId ?? undefined,
      osdrId: r.osdr_id ?? undefined,
      year: r.year ?? undefined,
      method: r.method ?? undefined,
      score: r.score ?? undefined,
    }))
    .filter((p: RetrievedPassage) => p.text?.length > 0)
}

function inferConsensus(passages: RetrievedPassage[]): "Strong" | "Mixed" | "Conflicted" {
  const n = passages.length
  if (n >= 10) return "Strong"
  if (n >= 4) return "Mixed"
  return "Conflicted"
}

function inferConfidence(passages: RetrievedPassage[]): "High" | "Medium" | "Low" {
  const n = passages.length
  if (n >= 12) return "High"
  if (n >= 5) return "Medium"
  return "Low"
}

export async function POST(req: Request) {
  const rlKey = keyFromRequest(req)
  const gate = allow(`${rlKey}:chat`, chatRule)
  if (!gate.ok) {
    return new Response(JSON.stringify({ error: "Too many requests. Please slow down." }), {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": Math.ceil(gate.resetMs / 1000).toString(),
        "x-ratelimit-remaining": gate.remaining.toString(),
      },
    })
  }

  const t0 = Date.now()
  try {
    const { question, scope, k = 12 } = (await req.json()) as ChatRequestDTO
    if (!question || typeof question !== "string") {
      await telemetry({ type: "chat", ms: Date.now() - t0, ok: false, code: 400 })
      return NextResponse.json({ error: "question required" }, { status: 400 })
    }

    // 1) Retrieve
    const passages = await retrievePassages(question, k, scope)
    if (!passages.length) {
      await telemetry({ type: "chat", ms: Date.now() - t0, ok: true, code: 200 })
      return NextResponse.json({ answer: null, payload: null, retrieval: { count: 0 } }, { status: 200 })
    }

    // 2) Build prompt
    const prompt = buildSynthesisPrompt(question, passages)

    // 3) Call Groq
    const comp = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      temperature: 0.2,
      max_tokens: 900,
      messages: [{ role: "user", content: prompt }],
    })

    const raw = comp.choices?.[0]?.message?.content ?? ""

    // 4) Parse JSON
    let out: any
    try {
      out = JSON.parse(raw)
    } catch {
      const start = raw.indexOf("{")
      const end = raw.lastIndexOf("}")
      if (start >= 0 && end > start) out = JSON.parse(raw.slice(start, end + 1))
      else throw new Error("model did not return JSON")
    }

    // 5) Convert to AssistantPayload format
    const payload = {
      summary: String(out.summary || ""),
      confidence: (out.confidence as any) ?? inferConfidence(passages),
      consensus: (out.consensus as any) ?? inferConsensus(passages),
      coverageCount: Number(out.coverageCount ?? passages.length),
      evidence: Array.isArray(out.evidence)
        ? out.evidence.map((e: any, i: number) => ({
            id: `ev_${i}`,
            section: (e.section as any) ?? "Results",
            text: String(e.text ?? ""),
            year: undefined as number | undefined,
            citations: Array.isArray(e.cites)
              ? e.cites.map((idx: number) => {
                  const p = passages[idx - 1]
                  return p
                    ? {
                        pmcid: p.pmcid,
                        ntrsId: p.ntrsId,
                        osdrId: p.osdrId,
                        section: p.section,
                        year: p.year,
                        title: undefined,
                      }
                    : {}
                })
              : [],
          }))
        : [],
      freshnessText: (() => {
        const years = passages.map((p) => p.year).filter(Boolean) as number[]
        if (!years.length) return undefined
        const newest = Math.max(...years)
        const now = new Date().getFullYear()
        const ageYears = Math.max(0, now - newest)
        return ageYears === 0 ? "recently" : `${ageYears}y ago`
      })(),
      sources: passages.slice(0, 8).map((p) => ({
        pmcid: p.pmcid,
        ntrsId: p.ntrsId,
        osdrId: p.osdrId,
        section: p.section,
        year: p.year,
      })),
    }

    await telemetry({ type: "chat", ms: Date.now() - t0, ok: true, code: 200 })
    return NextResponse.json({ payload, retrieval: { count: passages.length } })
  } catch (err: any) {
    const ms = Date.now() - t0
    await telemetry({ type: "chat", ms, ok: false, code: 500 })
    return NextResponse.json({ error: err?.message ?? "chat failure" }, { status: 500 })
  }
}
