"use client"

import type { EvidenceRow, SectionType, Confidence } from "./schema"
import type { Lowercase } from "typescript"

export type SearchParams = {
  q: string
  mode?: "passages" | "documents"
  topK?: number
  section?: SectionType | "All"
  confidence?: Confidence | "All"
  sort?: "Relevance" | "Confidence" | "Year"
}

export type SearchResult =
  | { ok: true; results: EvidenceRow[]; source?: "API" | "MOCK"; hint?: string; examples?: string[] }
  | { ok: false; error: string }

export type AnswerResult =
  | { ok: true; answer: string; evidence: EvidenceRow[]; model?: string }
  | { ok: false; error: string }

// Small helper: pick the first non-empty string across a set of keys
function pick(o: any, keys: string[]): string {
  for (const k of keys) if (o && typeof o[k] === "string" && o[k].trim()) return o[k]
  return ""
}

export async function searchPassages(params: SearchParams): Promise<SearchResult> {
  try {
    const r = await fetch("/api/aria/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store", // avoid stale edge/browser cache
      body: JSON.stringify({
        query: params.q, // IMPORTANT: the API expects `query`, not `question`
        k: params.topK || 8,
        mode: params.mode === "documents" ? "docs" : params.mode === "passages" ? "passages" : "both",
        minScore: 0,
      }),
    })
    if (!r.ok) {
      const err = await r.text()
      return { ok: false, error: `HTTP ${r.status}: ${err}` }
    }
    const data = await r.json()

    // Accept either {evidences:[...]} or {results:[...]}
    const raw: any[] = Array.isArray(data?.evidences)
      ? data.evidences
      : Array.isArray(data?.results)
      ? data.results
      : []

    if (raw.length) {
      const results: EvidenceRow[] = raw.map((e: any) => {
        const snippet =
          pick(e, ["snippet", "text", "abstract", "abstract_text", "content", "chunk"]) ||
          "[No passage text available]"
        // Default to "All" so UI filters don’t hide rows when section is missing
        const section = ((e.section as string) || "All") as SectionType
        const sectionKey = (section.toLowerCase() as unknown) as Lowercase<SectionType>

        return {
          pmcid: e.pmcid,
          title: e.title || "Untitled",
          year: e.year ?? null,
          section,
          snippet,
          score: Number(e.score ?? 0) || 0,
          confidence: ("Medium" as unknown) as Confidence,
          relevance: Number(e.score ?? 0) || 0,
          sections: { [sectionKey]: snippet } as Partial<Record<Lowercase<SectionType>, string>>,
          primary_section: sectionKey,
        }
      })
      return { ok: true, results, hint: data.hint, examples: data.examples, source: "API" }
    }

    // Bubble up server-provided hint so the UI shows something helpful
    return { ok: false, error: data?.hint || "No evidence found." }
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) }
  }
}

export async function askAnswer(question: string): Promise<AnswerResult> {
  try {
    // 1) Search for evidence first (use `query`, not `question`)
    const searchRes = await fetch("/api/aria/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ query: question, k: 8, mode: "both" }),
    })

    if (!searchRes.ok) {
      const err = await searchRes.text()
      return { ok: false, error: `Search failed: HTTP ${searchRes.status}: ${err}` }
    }

    const searchData = await searchRes.json()
    if (!searchData.ok) {
      return { ok: false, error: `Search failed: ${searchData.error || "Unknown error"}` }
    }

    const evidences: any[] = searchData.evidences || []
    if (!evidences.length) {
      return {
        ok: false,
        error: searchData.hint || "No evidence found. Try different keywords or check the examples.",
      }
    }

    // 2) Ask the answer endpoint with the evidence list
    const answerRes = await fetch("/api/aria/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ question, evidences }),
    })

    if (!answerRes.ok) {
      const err = await answerRes.text()
      return { ok: false, error: `Answer failed: HTTP ${answerRes.status}: ${err}` }
    }

    const answerData = await answerRes.json()
    if (answerData.ok && answerData.answer) {
      const evidence: EvidenceRow[] = evidences.map((e: any) => {
        const snippet =
          pick(e, ["snippet", "text", "abstract", "abstract_text", "content", "chunk"]) ||
          "[No passage text available]"
        const section = ((e.section as string) || "All") as SectionType
        const sectionKey = (section.toLowerCase() as unknown) as Lowercase<SectionType>
        return {
          pmcid: e.pmcid,
          title: e.title || "Untitled",
          year: e.year ?? null,
          section,
          snippet,
          score: Number(e.score ?? 0) || 0,
          confidence: ("Medium" as unknown) as Confidence,
          relevance: Number(e.score ?? 0) || 0,
          sections: { [sectionKey]: snippet } as Partial<Record<Lowercase<SectionType>, string>>,
          primary_section: sectionKey,
        }
      })

      return { ok: true, answer: answerData.answer, evidence, model: answerData.model }
    }

    return { ok: false, error: answerData.error || "Invalid response format" }
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) }
  }
}
