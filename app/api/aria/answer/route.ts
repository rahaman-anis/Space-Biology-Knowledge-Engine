import { NextResponse } from "next/server"
import Groq from "groq-sdk"
import { assertNodeRuntime } from "@/lib/server/assert-node"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

assertNodeRuntime("/api/aria/answer")

const MODEL_CANDIDATES = [
  "llama-3.3-70b-versatile", // preferred
  "llama-3.3-8b-instant", // fast fallback
  "openai/gpt-oss-20b", // OSS fallback
]

type Evidence = {
  pmcid: string
  title?: string | null
  year?: string | number | null
  section?: string | null
  snippet?: string | null
}

function buildPrompt(question: string, evidences: Evidence[]) {
  const lines = evidences.slice(0, 8).map((e, i) => {
    const t = (e.title ?? "Untitled").trim()
    const y = e.year ? String(e.year) : ""
    const sec = e.section ? ` [${e.section}]` : ""
    const sn = (e.snippet ?? "").replace(/\s+/g, " ").slice(0, 300)
    return `[${i + 1}] ${t}${y ? ` (${y})` : ""}${sec} — PMCID:${e.pmcid}${sn ? ` — ${sn}` : ""}`
  })

  return `
You are ARIA, a careful scientific assistant. Use ONLY these sources.

Question: "${question}"

Evidence:
${lines.join("\n") || "(none)"}

Output requirements:
- Start with a direct 1–2 sentence answer.
- Then 2–4 short bullets of rationale (if applicable).
- End with "Sources:" listing [n] Title (Year) — PMCID.
- If evidence is weak/inconclusive, say so plainly.
- Do not invent sources; only cite the items above.
  `.trim()
}

async function callGroq(messages: { role: "system" | "user"; content: string }[]) {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  let lastErr: any
  for (const model of MODEL_CANDIDATES) {
    try {
      const resp = await client.chat.completions.create({ model, temperature: 0.2, max_tokens: 700, messages })
      const text = resp?.choices?.[0]?.message?.content?.trim()
      if (text) return { model, text }
    } catch (err: any) {
      const msg = String(err?.message || err)
      if (msg.includes("model") && (msg.includes("decommissioned") || msg.includes("not") || msg.includes("found"))) {
        lastErr = err
        continue
      }
      throw err
    }
  }
  throw lastErr || new Error("No Groq model available")
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ ok: false, error: "Missing GROQ_API_KEY" }, { status: 500 })
    }
    const { question, evidences } = (await req.json()) as { question?: string; evidences?: Evidence[] }
    if (!question) return NextResponse.json({ ok: false, error: "Missing 'question'" }, { status: 400 })

    const ev = Array.isArray(evidences) ? evidences : []
    const prompt = buildPrompt(question, ev)
    const { model, text } = await callGroq([
      { role: "system", content: "You write concise, well-cited scientific answers." },
      { role: "user", content: prompt },
    ])

    return NextResponse.json({ ok: true, model, answer: text }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
