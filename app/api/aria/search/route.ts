// /app/api/aria/search/route.ts
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
  // 1 / (1 + L2) in (0,1]; safe & monotonic
  let d2 = 0
  const n = Math.min(a.length, b.length, VEC_DIM)
  for (let i = 0; i < n; i++) {
    const dx = (a[i] || 0) - (b[i] || 0)
    d2 += dx * dx
  }
  return 1 / (1 + Math.sqrt(d2))
}

// Try multiple candidates so we work with either schema
const PASSAGE_VIEW_CANDIDATES = [
  process.env.NEXT_PUBLIC_PASSAGE_EMBEDDINGS_VIEW, // preferred via env
  "passage_embeddings",                          // old view name
  "passage_embeddings_view",                     // sometimes used
  "text_embeddings",                             // current table in your DB
].filter(Boolean) as string[]

const DOCS_TABLE_CANDIDATES = [
  process.env.NEXT_PUBLIC_DOC_EMBEDDINGS_VIEW, // preferred via env
  "doc_embeddings", // typical table for doc vectors
].filter(Boolean) as string[]

const META_TABLE_CANDIDATES = [
  process.env.NEXT_PUBLIC_DOCUMENTS_TABLE, // preferred via env
  "documents",                             // current name in your DB
  "doc_metadata_enriched",                 // legacy name some deployments use
].filter(Boolean) as string[]

const ABSTRACT_TABLE_CANDIDATES = [
  process.env.NEXT_PUBLIC_ABSTRACTS_TABLE, // preferred via env
  "abstracts_norm",                        // normalized view (if created)
  "abstracts",                             // raw abstracts table
  "documents_abstracts",                   // sometimes used
  "documents_stage",                       // staging view with abstracts in some setups
  "documents",                             // if abstracts live on the main table
  "imrad_spans",                           // derive Abstract from sectioned spans
].filter(Boolean) as string[]

async function fetchAbstractMap(
  supabase: ReturnType<typeof createClient>,
  pmcids: string[],
): Promise<{ map: Record<string, string>; usedTable: string | null; usedColumn: string | null }> {
  const textCols = ["abstract", "abstract_text", "text", "content", "body"]
  const out: Record<string, string> = {}
  let usedTable: string | null = null
  let usedColumn: string | null = null

  for (const t of ABSTRACT_TABLE_CANDIDATES) {
    try {
      if (!t) continue

      // Special handling for imrad_spans: pull Abstract section text
      if (t === "imrad_spans") {
        const { data, error } = await supabase
          .from(t)
          .select("pmcid, section, text, content, chunk")
          .in("pmcid", pmcids)
          .limit(3000)

        if (error || !Array.isArray(data) || data.length === 0) continue

        for (const r of data as any[]) {
          const sec = String(r.section ?? "").toLowerCase()
          const txt = (r.text ?? r.content ?? r.chunk ?? "") as string
          if (sec === "abstract" && typeof txt === "string" && txt.trim()) {
            out[String(r.pmcid)] = txt.trim()
          }
        }
        if (Object.keys(out).length) {
          usedTable = t
          usedColumn = "section+text"
          break
        }
        continue
      }

      // Generic: select all columns, then pick the first viable text column
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
        if (typeof a === "string" && a.trim()) {
          out[String(r.pmcid)] = a.trim()
        }
      }
      if (Object.keys(out).length) {
        usedTable = t
        usedColumn = pick
        break
      }
    } catch {
      // Ignore this source and try the next
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
    },
    hint: "POST a JSON body { query: string, k?: number, mode?: 'docs'|'passages'|'both', minScore?: number }",
  })
}

export async function POST(req: Request) {
  const t0 = Date.now()
  const wantDebug = (() => {
    try { return new URL(req.url).searchParams.get("debug") === "1" } catch { return false }
  })()
  try {
    console.log("[v0] /api/aria/search POST started")

    let body: Body = {}
    try {
      body = await req.json()
    } catch (e) {
      console.error("[v0] Failed to parse request body:", e)
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 })
    }

    const { query, embedding, k = 8, mode = "both", minScore } = body

    console.log("[v0] Request params:", { query, hasEmbedding: !!embedding, k, mode, minScore })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("[v0] Supabase config:", { hasUrl: !!url, hasAnon: !!anon })

    if (!url || !anon) {
      console.error("[v0] Missing Supabase env vars")
      return NextResponse.json({ ok: false, error: "Supabase env vars missing" }, { status: 500 })
    }

    if (!Array.isArray(embedding) && !(typeof query === "string" && query.trim())) {
      console.error("[v0] Invalid request: no query or embedding")
      return NextResponse.json({ ok: false, error: "Provide either 'query' or 'embedding'." }, { status: 400 })
    }

    // Build vector
    console.log("[v0] Building vector...")
    let vec: number[]
    try {
      vec = Array.isArray(embedding)
        ? (() => {
            if (embedding.length !== VEC_DIM) {
              console.error(`[v0] Embedding length mismatch: ${embedding.length} != ${VEC_DIM}`)
              throw new Error(`Embedding length ${embedding.length} != ${VEC_DIM}`)
            }
            return embedding.map((x) => Number(x) || 0)
          })()
        : hash256(query!.trim(), VEC_DIM)
    } catch (e: any) {
      console.error("[v0] Vector creation failed:", e)
      return NextResponse.json({ ok: false, error: `Vector creation failed: ${e.message}` }, { status: 400 })
    }

    console.log("[v0] Vector created, length:", vec.length)

    const supabase = createClient(url, anon, { auth: { persistSession: false } })

    const needDocs = mode === "docs" || mode === "both"
    const needPass = mode === "passages" || mode === "both"

    console.log("[v0] Search mode:", { needDocs, needPass })

    async function withRpc<T>(fn: string, args: any): Promise<{ data?: T; error?: any }> {
      try {
        console.log(`[v0] Calling RPC: ${fn}`)
        const { data, error } = await supabase.rpc(fn, args)
        if (error) {
          console.error(`[v0] RPC ${fn} error:`, error)
        } else {
          console.log(`[v0] RPC ${fn} success, rows:`, Array.isArray(data) ? data.length : "N/A")
        }
        return { data, error }
      } catch (e: any) {
        console.error(`[v0] RPC ${fn} exception:`, e)
        return { error: { message: String(e?.message || e) } }
      }
    }

    // ---------- RPC first ----------
    console.log("[v0] Starting RPC calls...")
    const [docsRpc, passRpc] = await Promise.all([
      needDocs
        ? withRpc<any[]>("match_documents", { query_embedding: vec, match_count: k })
        : Promise.resolve({ data: [] }),
      needPass
        ? withRpc<any[]>("match_passages", { query_embedding: vec, match_count: k })
        : Promise.resolve({ data: [] }),
    ])

    // ---------- Fallbacks ----------
    async function queryDocsFallback(): Promise<any[]> {
      console.log("[v0] Trying docs fallback...")
      for (const view of DOCS_TABLE_CANDIDATES) {
        try {
          console.log(`[v0] Trying docs view: ${view}`)
          const { data, error } = await supabase.from(view).select("pmcid,title,year,embedding").limit(1500)
          if (error) {
            console.error(`[v0] Docs view ${view} error:`, error)
            continue
          }
          if (!Array.isArray(data) || data.length === 0) {
            console.log(`[v0] Docs view ${view} returned no data`)
            continue
          }

          console.log(`[v0] Docs view ${view} returned ${data.length} rows`)
          const scored = data
            .map((r: any) => {
              let e: any = r.embedding
              if (typeof e === "string" && e.trim().startsWith("[")) {
                try { e = JSON.parse(e) } catch {}
              }
              if (!Array.isArray(e) || e.length !== VEC_DIM) return null
              return {
                pmcid: r.pmcid,
                title: r.title ?? null,
                year: r.year ?? null,
                score: scoreEuclid(e as number[], vec),
              }
            })
            .filter(Boolean) as any[]
          if (scored.length) {
            console.log(`[v0] Docs fallback scored ${scored.length} results`)
            return scored.sort((a, b) => b.score - a.score).slice(0, k)
          }
        } catch (e) {
          console.error(`[v0] Docs view ${view} exception:`, e)
        }
      }
      console.log("[v0] Docs fallback found nothing")
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
        if (error) {
          console.error(`[v0] Passages view ${view} select ${sel} error:`, error)
          continue
        }
        if (Array.isArray(data) && data.length) {
          console.log(`[v0] Passages view ${view} select ${sel} returned ${data.length} rows`)
          return data as any[]
        }
      }
      return null
    }

    async function fallbackPassages(): Promise<any[]> {
      console.log("[v0] Trying passages fallback...")
      for (const view of PASSAGE_VIEW_CANDIDATES) {
        try {
          console.log(`[v0] Trying passages view: ${view}`)
          const data = await queryPassagesView(view)
          if (!data || !data.length) continue

          const rows = data
            .map((r: any) => {
              let e: any = r.embedding
              if (typeof e === "string" && e.trim().startsWith("[")) {
                try { e = JSON.parse(e) } catch {}
              }
              if (!Array.isArray(e) || e.length !== VEC_DIM) return null
              const txt = r.text ?? r.snippet ?? r.content ?? r.chunk ?? null
              return {
                pmcid: r.pmcid,
                section: r.section ?? "All",
                text: txt,
                score: scoreEuclid(e as number[], vec),
              }
            })
            .filter(Boolean) as any[]

          if (rows.length) {
            console.log(`[v0] Passages fallback scored ${rows.length} results`)
            return rows.sort((a, b) => b.score - a.score).slice(0, k)
          }
        } catch (e) {
          console.error(`[v0] Passages view ${view} exception:`, e)
        }
      }
      console.log("[v0] Passages fallback found nothing")
      return []
    }

    console.log("[v0] Processing results...")
    const docs = needDocs ? (Array.isArray(docsRpc.data) ? docsRpc.data : await queryDocsFallback()) : []
    const passages = needPass ? (Array.isArray(passRpc.data) ? passRpc.data : await fallbackPassages()) : []

    console.log(`[v0] Results: ${docs.length} docs, ${passages.length} passages`)

    // ---------- Collect metadata for titles/years ----------
    const pmcids = Array.from(new Set([...docs.map((d: any) => d.pmcid), ...passages.map((p: any) => p.pmcid)])).filter(
      Boolean,
    )

    console.log(`[v0] Fetching metadata for ${pmcids.length} PMCIDs`)

    const meta: Record<string, { title: string | null; year: string | number | null }> = {}
    if (pmcids.length) {
      let metaFilled = false
      for (const mt of META_TABLE_CANDIDATES) {
        console.log(`[v0] Trying metadata table: ${mt}`)
        const { data, error } = await supabase.from(mt).select("pmcid,title,year").in("pmcid", pmcids)
        if (error) {
          console.error(`[v0] Metadata fetch error from ${mt}:`, error)
          continue
        }
        if (Array.isArray(data) && data.length) {
          console.log(`[v0] Fetched metadata from ${mt} for ${data.length} documents`)
          for (const r of data) meta[r.pmcid] = { title: r.title ?? null, year: r.year ?? null }
          metaFilled = true
          break
        } else {
          console.log(`[v0] Metadata table ${mt} returned no rows`)
        }
      }
      if (!metaFilled) {
        console.warn("[v0] No metadata fetched from any candidate table")
      }
    }

    // ---------- Abstracts fallback for doc-only results ----------
    const { map: abstracts, usedTable: absTable, usedColumn: absCol } = await fetchAbstractMap(supabase, pmcids)

    // ---------- Merge + filter ----------
    const evidences: any[] = []
    for (const p of passages)
      evidences.push({
        pmcid: p.pmcid,
        title: meta[p.pmcid]?.title ?? null,
        year: meta[p.pmcid]?.year ?? null,
        section: p.section ?? "All",
        snippet: p.text ?? p.snippet ?? null,
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

    console.log(`[v0] Filtered to ${filtered.length} evidences`)

    const durationMs = Date.now() - t0

    if (!filtered.length) {
      const rpcErrors = {
        match_documents: docsRpc.error?.message || null,
        match_passages: passRpc.error?.message || null,
      }
      console.log("[v0] No results found, returning hint")
      return NextResponse.json({
        ok: true,
        evidences: [],
        hint: "No matches. Try adding section keywords (Results/Discussion) or more specific terms (RANKL, EBV, ARED).",
        rpcErrors,
        durationMs,
      })
    }

    console.log(`[v0] Search completed successfully in ${durationMs}ms`)
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
    console.error("[v0] Search API error:", e)
    console.error("[v0] Error stack:", e?.stack)
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
