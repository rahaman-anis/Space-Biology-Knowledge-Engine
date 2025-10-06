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

export async function searchPassages(params: SearchParams): Promise<SearchResult> {
  try {
    const r = await fetch("/api/aria/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: params.q,
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

    if (data.ok && Array.isArray(data.evidences)) {
      const results: EvidenceRow[] = data.evidences.map((e: any) => {
        const snippet = e.snippet || e.text || "[No passage text available]"
        const section = (e.section || "Unknown") as SectionType
        const sectionKey = section.toLowerCase() as Lowercase<SectionType>

        return {
          pmcid: e.pmcid,
          title: e.title || "Untitled",
          year: e.year || null,
          section,
          snippet,
          score: e.score || 0,
          confidence: "Medium" as Confidence,
          relevance: e.score || 0,
          sections: {
            [sectionKey]: snippet,
          } as Partial<Record<Lowercase<SectionType>, string>>,
          primary_section: sectionKey,
        }
      })
      return { ok: true, results, hint: data.hint, examples: data.examples }
    }
    return { ok: false, error: "Invalid response format" }
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) }
  }
}

export async function askAnswer(question: string): Promise<AnswerResult> {
  try {
    // Step 1: Search for evidence
    const searchRes = await fetch("/api/aria/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    const evidences = searchData.evidences || []

    // If no evidences found, return the hint/examples
    if (evidences.length === 0) {
      return {
        ok: false,
        error: searchData.hint || "No evidence found. Try different keywords or check the examples provided.",
      }
    }

    // Step 2: Call answer API with evidences
    const answerRes = await fetch("/api/aria/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, evidences }),
    })

    if (!answerRes.ok) {
      const err = await answerRes.text()
      return { ok: false, error: `Answer failed: HTTP ${answerRes.status}: ${err}` }
    }

    const answerData = await answerRes.json()
    if (answerData.ok && answerData.answer) {
      const evidence: EvidenceRow[] = evidences.map((e: any) => {
        const snippet = e.snippet || e.text || "[No passage text available]"
        const section = (e.section || "Unknown") as SectionType
        const sectionKey = section.toLowerCase() as Lowercase<SectionType>

        return {
          pmcid: e.pmcid,
          title: e.title || "Untitled",
          year: e.year || null,
          section,
          snippet,
          score: e.score || 0,
          confidence: "Medium" as Confidence,
          relevance: e.score || 0,
          sections: {
            [sectionKey]: snippet,
          } as Partial<Record<Lowercase<SectionType>, string>>,
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
