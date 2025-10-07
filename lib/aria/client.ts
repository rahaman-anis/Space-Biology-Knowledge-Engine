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
      // Avoid any stale cached responses from the edge/network
      cache: "no-store",
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

    // Accept either {evidences: [...]} or {results: [...]} and tolerate missing ok flag
    const raw = Array.isArray(data?.evidences)
      ? data.evidences
      : Array.isArray(data?.results)
      ? data.results
      : []

    if (raw.length) {
      const pick = (o: any, keys: string[]) => {
        for (const k of keys) if (o && typeof o[k] === "string" && o[k].trim()) return o[k]
        return ""
      }

      const results: EvidenceRow[] = raw.map((e: any) => {
        const snippet =
          pick(e, ["snippet", "text", "abstract", "abstract_text", "content", "chunk"]) ||
          "[No passage text available]"
        // Default to "All" (not "Unknown") so UI filters don’t hide these rows
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
      cache: "no-store",
      body: JSON.stringify({ question, k: 8, mode: "both" }),
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
      const pick = (o: any, keys: string[]) => {
        for (const k of keys) if (o && typeof o[k] === "string" && o[k].trim()) return o[k]
        return ""
      }
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
