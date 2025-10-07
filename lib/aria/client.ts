import type { EvidenceRow, SectionType, Confidence } from "@/lib/aria/schema"

function pick(obj: any, keys: string[]): string | null {
  for (const k of keys) {
    const val = obj[k]
    if (val != null && String(val).trim()) return String(val)
  }
  return null
}

type SearchParams = {
  q: string
  mode: "passages" | "documents"
  topK?: number
  section?: SectionType | "All"
  confidence?: Confidence | "All"
  sort?: "Relevance" | "Confidence" | "Year"
}

type SearchResult =
  | { ok: true; results: EvidenceRow[]; hint?: string; examples?: string[]; source?: string }
  | { ok: false; error: string }

export async function searchPassages(params: SearchParams): Promise<SearchResult> {
  try {
    // Allow toggling server-side debug via ?aria_debug=1 or localStorage
    const wantDebug = (() => {
      try {
        if (typeof window !== "undefined") {
          const qs = new URLSearchParams(window.location.search)
          if (qs.has("aria_debug") || localStorage.getItem("aria_debug") === "1") return true
        }
      } catch {}
      return false
    })()

    const searchEndpointBase = `/api/aria/search${wantDebug ? "?debug=1" : ""}`

    // Normalise mode for the API (docs | passages | both)
    const initialMode: "docs" | "passages" | "both" =
      params.mode === "documents" ? "docs" : params.mode === "passages" ? "passages" : "both"

    // small helpers local to this function
    const doSearch = async (mode: "docs" | "passages" | "both") => {
      const r = await fetch(searchEndpointBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          query: params.q,
          k: params.topK || 8,
          mode,
          minScore: 0,
        }),
      })
      if (!r.ok) {
        const err = await r.text().catch(() => "")
        throw new Error(`HTTP ${r.status}: ${err}`)
      }
      return r.json()
    }

    const parseRows = (data: any) => {
      // Accept either {evidences:[...]} or {results:[...]} or {hits:[...]} or {evidence:[...]}
      const raw: any[] =
        (Array.isArray(data?.evidences) && data.evidences) ||
        (Array.isArray(data?.results) && data.results) ||
        (Array.isArray(data?.hits) && data.hits) ||
        (Array.isArray(data?.evidence) && data.evidence) ||
        []

      const rows: EvidenceRow[] = raw.map((e: any) => {
        const snippet =
          pick(e, ["snippet", "text", "abstract", "abstract_text", "content", "chunk"]) || "[No passage text available]"
        const section = ((e.section as string) || "All") as SectionType
        const sectionKey = section.toLowerCase() as Lowercase<SectionType>

        const title = e.title ?? e.paper_title ?? e.doc_title ?? e?.metadata?.title ?? (e.meta && e.meta.title) ?? null

        return {
          pmcid: e.pmcid,
          title: title || `Untitled (${e.pmcid ?? "Unknown"})`,
          year: e.year ?? null,
          section,
          confidence: "Medium" as Confidence,
          relevance: Number(e.score ?? 0) || 0,
          sections: { [sectionKey]: snippet } as Partial<Record<Lowercase<SectionType>, string>>,
          primary_section: sectionKey,
        }
      })
      return rows
    }

    // 1) First attempt using the requested/initial mode
    let data = await doSearch(initialMode)
    let rows = parseRows(data)
    console.debug("[aria] /api/aria/search raw response (", initialMode, ") -> rows:", rows.length)

    // 2) Fallback: if UI asked for passages but we got zero rows, retry with both
    if (initialMode === "passages" && rows.length === 0) {
      console.debug("[aria] 0 passage hits – retrying with mode=both")
      const data2 = await doSearch("both")
      const rows2 = parseRows(data2)
      if (rows2.length > 0) {
        data = data2
        rows = rows2
      }
    }

    return { ok: true, results: rows, hint: data?.hint, examples: data?.examples, source: "API" }
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) }
  }
}

export async function askAnswer(question: string): Promise<{
  ok: boolean
  answer?: string
  evidence?: EvidenceRow[]
  error?: string
}> {
  try {
    const response = await fetch("/api/aria/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ question, k: 8 }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")
      return {
        ok: false,
        error: `HTTP ${response.status}: ${errorText || "Failed to get answer"}`,
      }
    }

    const data = await response.json()

    if (!data.ok) {
      return {
        ok: false,
        error: data.error || "Unknown error from answer API",
      }
    }

    // Transform citations into evidence rows for the UI
    const evidence: EvidenceRow[] = (data.citations || []).map((c: any) => ({
      pmcid: c.pmcid || "",
      title: `Study ${c.pmcid || ""}`,
      year: null,
      section: (c.section || "All") as SectionType,
      confidence: "Medium" as Confidence,
      relevance: typeof c.score === "number" ? c.score : 0,
      sections: {},
      primary_section: (c.section || "all").toLowerCase() as Lowercase<SectionType>,
    }))

    return {
      ok: true,
      answer: data.answer || "",
      evidence,
    }
  } catch (e: any) {
    return {
      ok: false,
      error: String(e?.message || e),
    }
  }
}
