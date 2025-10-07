import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { VEC_DIM, hash256 } from "@/lib/server/hash256"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Body = {
  query?: string
  embedding?: number[]
  k?: number // default 8
  mode?: "docs" | "passages" | "both" // default both
  minScore?: number // default 0
}

function scoreEuclid(a: number[], b: number[]) {
  let d2 = 0
  const n = Math.min(a.length, b.length, VEC_DIM)
  for (let i = 0; i < n; i++) {
    const dx = (a[i] || 0) - (b[i] || 0)
    d2 += dx * dx
  }
  return 1 / (1 + Math.sqrt(d2))
}

// Prefer your real tables via env, then safe fallbacks
const PASSAGE_VIEW_CANDIDATES = [
  process.env.NEXT_PUBLIC_PASSAGE_EMBEDDINGS_VIEW,
  "text_embeddings",          // <-- your current table
  "passage_embeddings",
  "passage_embeddings_view",
].filter(Boolean) as string[]

const DOCS_TABLE_CANDIDATES = [
  process.env.NEXT_PUBLIC_DOC_EMBEDDINGS_VIEW,
  "doc_embeddings",
].filter(Boolean) as string[]

const META_TABLE_CANDIDATES = [
  process.env.NEXT_PUBLIC_DOCUMENTS_TABLE,
  "documents",
  "doc_metadata_enriched",
].filter(Boolean) as string[]

const ABSTRACT_TABLE_CANDIDATES = [
  process.env.NEXT_PUBLIC_ABSTRACTS_TABLE,
  "abstracts_norm",
  "abstracts",
  "documents_abstracts",
  "documents",
  "imrad_spans",
].filter(Boolean) as string[]

async function fetchAbstractMap(
  supabase: ReturnType<typeof createClient>,
  pmcids: string[],
): Promise<{ map: Record<string, string>; usedTable: string | null; usedColumn: string | null }> {
  const textCols = ["abstract", "abstract_text", "text", "content", "body"]
  const out: Record<string, string> = {}
  let usedTable: string | null = null
  let usedColumn: string | null = null

  // ignore junk like “Graphical abstract”, “Highlights”
  const isUseful = (s: string) => {
    const t = (s || "").trim()
    if (!t) return false
    if (/^graphical\s+abstract/i.test(t)) return false
    if (/^highlights/i.test(t)) return false
    if (t.length < 12) return false
    return true
  }

  for (const t of ABSTRACT_TABLE_CANDIDATES) {
    try {
      if (!t) continue

      if (t === "imrad_spans") {
        const { data, error } = await supabase
          .from(t)
          .select("pmcid, section, text, content, chunk")
          .in("pmcid", pmcids)
          .limit(3000)

        if (!error && Array.isArray(data) && data.length) {
          for (const r of data as any[]) {
            const sec = String(r.section ?? "").toLowerCase()
            const txt = (r.text ?? r.content ?? r.chunk ?? "") as string
            if (sec === "abstract" && isUseful(txt)) out[String(r.pmcid)] = txt.trim()
          }
          if (Object.keys(out).length) {
            usedTable = t
            usedColumn = "section+text"
            break
          }
        }
        continue
      }

      const { data, error } = await supabase
        .from(t)
        .select("*")
        .in("pmcid", pmcids)
        .limit(2000)

      if (error || !Array.isArray(data) || data.length === 0) continue

      const first = data[0] as Record<string, any>
      const pick = textCols.find((c) => Object.prototype.hasOwnProperty.call(first, c))
      if (!pick) continue

      for (const r of data as any[]) {
        const a = r[pick]
        if (typeof a === "string" && isUseful(a)) out[String(r.pmcid)] = a.trim()
      }
      if (Object.keys(out).length) {
        usedTable = t
        usedColumn = pick
        break
      }
    } catch {
      continue
    }
  }

  return { map: out, usedTable, usedColumn }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/aria/search",
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      vecDim: VEC_DIM,
      passageViewCandidates: PASSAGE_VIEW_CANDIDATES,
      docViewCandidates: DOCS_TABLE_CANDIDATES,
      metaTableCandidates: META_TABLE_CANDIDATES,
      abstractTableCandidates: ABSTRACT_TABLE_CANDIDATES,
    },
    hint: "POST { query: string, k?: number, mode?: 'docs'|'passages'|'both', minScore?: number }",
  })
}

export async function POST(req: Request) {
  const t0 = Date.now()
  const wantDebug = (() => {
    try { return new URL(req.url).searchParams.get("debug") === "1" } catch { return false }
  })()

  try {
    let body: Body = {}
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 })
    }

    const { query, embedding, k = 8, mode = "both", minScore } = body

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) return NextResponse.json({ ok: false, error: "Supabase env vars missing" }, { status: 500 })

    if (!Array.isArray(embedding) && !(typeof query === "string" && query.trim())) {
      return NextResponse.json({ ok: false, error: "Provide either 'query' or 'embedding'." }, { status: 400 })
    }

    const vec: number[] = Array.isArray(embedding)
      ? (() => {
          if (embedding.length !== VEC_DIM) throw new Error(`Embedding length ${embedding.length} != ${VEC_DIM}`)
          return embedding.map((x) => Number(x) || 0)
        })()
      : hash256(query!.trim(), VEC_DIM)

    const supabase = createClient(url, anon, { auth: { persistSession: false } })

    const needDocs = mode === "docs" || mode === "both"
    const needPass = mode === "passages" || mode === "both"

    async function withRpc<T>(fn: string, args: any): Promise<{ data?: T; error?: any }> {
      try {
        const { data, error } = await supabase.rpc(fn, args)
        return { data, error }
      } catch (e: any) {
        return { error: { message: String(e?.message || e) } }
      }
    }

    // 1) RPCs first
    const [docsRpc, passRpc] = await Promise.all([
      needDocs ? withRpc<any[]>("match_documents", { query_embedding: vec, match_count: k }) : Promise.resolve({ data: [] }),
      needPass ? withRpc<any[]>("match_passages", { query_embedding: vec, match_count: k }) : Promise.resolve({ data: [] }),
    ])

    // 2) Fallbacks
    async function queryDocsFallback(): Promise<any[]> {
      for (const view of DOCS_TABLE_CANDIDATES) {
        try {
          const { data, error } = await supabase.from(view).select("pmcid,title,year,embedding").limit(1500)
          if (error || !Array.isArray(data) || data.length === 0) continue
          const scored = data
            .map((r: any) => {
              let e: any = r.embedding
              if (typeof e === "string" && e.trim().startsWith("[")) { try { e = JSON.parse(e) } catch {} }
              if (!Array.isArray(e) || e.length !== VEC_DIM) return null
              return { pmcid: r.pmcid, title: r.title ?? null, year: r.year ?? null, score: scoreEuclid(e as number[], vec) }
            })
            .filter(Boolean) as any[]
          if (scored.length) return scored.sort((a, b) => b.score - a.score).slice(0, k)
        } catch {}
      }
      return []
    }

    async function queryPassagesView(view: string): Promise<any[] | null> {
      const selects = [
        "pmcid,section,text,snippet,chunk,content,embedding",
        "pmcid,section,text,embedding",
        "pmcid,section,content,embedding",
        "pmcid,section,chunk,embedding",
        "pmcid,section,embedding",
      ]
      for (const sel of selects) {
        const { data, error } = await supabase.from(view).select(sel).limit(3000)
        if (error) continue
        if (Array.isArray(data) && data.length) return data as any[]
      }
      return null
    }

    async function fallbackPassages(): Promise<any[]> {
      for (const view of PASSAGE_VIEW_CANDIDATES) {
        try {
          const data = await queryPassagesView(view)
          if (!data || !data.length) continue
          const rows = data
            .map((r: any) => {
              let e: any = r.embedding
              if (typeof e === "string" && e.trim().startsWith("[")) { try { e = JSON.parse(e) } catch {} }
              if (!Array.isArray(e) || e.length !== VEC_DIM) return null
              const txt = r.text ?? r.snippet ?? r.content ?? r.chunk ?? null
              return { pmcid: r.pmcid, section: r.section ?? "All", text: txt, score: scoreEuclid(e as number[], vec) }
            })
            .filter(Boolean) as any[]
          if (rows.length) return rows.sort((a, b) => b.score - a.score).slice(0, k)
        } catch {}
      }
      return []
    }

    const docs = needDocs ? (Array.isArray(docsRpc.data) ? docsRpc.data : await queryDocsFallback()) : []
    const passages = needPass ? (Array.isArray(passRpc.data) ? passRpc.data : await fallbackPassages()) : []

    // 3) Merge metadata + abstracts
    const pmcids = Array.from(new Set([...docs.map((d: any) => d.pmcid), ...passages.map((p: any) => p.pmcid)])).filter(Boolean)

    const meta: Record<string, { title: string | null; year: string | number | null }> = {}
    if (pmcids.length) {
      for (const mt of META_TABLE_CANDIDATES) {
        const { data, error } = await supabase.from(mt).select("pmcid,title,year").in("pmcid", pmcids)
        if (error) continue
        if (Array.isArray(data) && data.length) {
          for (const r of data) meta[r.pmcid] = { title: r.title ?? null, year: r.year ?? null }
          break
        }
      }
    }

    const { map: abstracts, usedTable: absTable, usedColumn: absCol } = await fetchAbstractMap(supabase, pmcids)

    const evidences: any[] = []
    for (const p of passages) evidences.push({
      pmcid: p.pmcid,
      title: meta[p.pmcid]?.title ?? null,
      year:  meta[p.pmcid]?.year  ?? null,
      section: p.section ?? "All",
      snippet: p.text ?? null,
      score: typeof p.score === "number" ? p.score : Number(p.score ?? 0) || 0,
    })

    for (const d of docs) {
      const pmcid = d.pmcid
      const abstract = abstracts[pmcid]
      evidences.push({
        pmcid,
        title: d.title ?? meta[pmcid]?.title ?? null,
        year:  d.year  ?? meta[pmcid]?.year  ?? null,
        section: abstract ? "Abstract" : "All",
        snippet: abstract ? abstract.slice(0, 320) : null,
        score: typeof d.score === "number" ? d.score : Number(d.score ?? 0) || 0,
      })
    }

    const hasMin = typeof minScore === "number" && Number.isFinite(minScore)
    const filtered = evidences
      .filter((e) => !hasMin || (e.score ?? 0) >= (minScore as number))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, k)

    const durationMs = Date.now() - t0

    if (!filtered.length) {
      const rpcErrors = {
        match_documents: docsRpc.error?.message || null,
        match_passages: passRpc.error?.message || null,
      }
      return NextResponse.json({
        ok: true,
        evidences: [],
        hint: "No matches. Try adding section keywords (Results/Discussion) or more specific terms (RANKL, EBV, ARED).",
        rpcErrors,
        durationMs,
      })
    }

    return NextResponse.json({
      ok: true,
      evidences: filtered,
      durationMs,
      ...(wantDebug ? {
        debug: {
          docsRpcRows: Array.isArray(docsRpc.data) ? docsRpc.data.length : 0,
          passRpcRows: Array.isArray(passRpc.data) ? passRpc.data.length : 0,
          docsAfterFallback: docs.length,
          passagesAfterFallback: passages.length,
          metaHit: Object.keys(meta).length,
          abstractsHit: Object.keys(abstracts).length,
          abstractSource: absTable || null,
          abstractColumn: absCol || null,
        }
      } : {})
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
