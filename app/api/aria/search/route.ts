import { createClient } from "@supabase/supabase-js"
import { VEC_DIM, hash256 } from "@/lib/server/hash256"
import { assertNodeRuntime } from "@/lib/server/assert-node"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
assertNodeRuntime("/api/aria/search")

type Body = {
  query?: string
  embedding?: number[]
  k?: number
  mode?: "docs" | "passages" | "both"
  minScore?: number
}

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export async function GET() {
  // simple health for debugging
  return json(200, {
    ok: true,
    route: "/api/aria/search",
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      vecDim: Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256),
    },
    hint:
      "POST a JSON body { query: string, k?: number, mode?: 'docs'|'passages'|'both' }",
  })
}

export async function POST(req: Request) {
  const t0 = Date.now()
  try {
    const { query, embedding, k = 8, mode = "both", minScore = 0 } =
      (await req.json()) as Body

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) return json(500, { ok: false, error: "Supabase env vars missing" })

    if (!Array.isArray(embedding) && !(typeof query === "string" && query.trim())) {
      return json(400, { ok: false, error: "Provide either 'query' or 'embedding'." })
    }

    const vec: number[] = Array.isArray(embedding)
      ? ((): number[] => {
          if (embedding.length !== VEC_DIM)
            throw new Error(`Embedding length ${embedding.length} != ${VEC_DIM}`)
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

    // Fallback scorers (pure JS, view reads)
    async function fallbackDocs() {
      const { data, error } = await supabase
        .from("doc_embeddings")
        .select("pmcid,title,year,embedding")
        .limit(2000)

      if (error || !Array.isArray(data)) return []
      const scored = data
        .map((r: any) => {
          const e: number[] = r.embedding || []
          if (e.length !== VEC_DIM) return null
          let d2 = 0
          for (let i = 0; i < VEC_DIM; i++) {
            const dx = (e[i] || 0) - vec[i]
            d2 += dx * dx
          }
          const score = 1 / (1 + Math.sqrt(d2))
          return { pmcid: r.pmcid, title: r.title, year: r.year, score }
        })
        .filter(Boolean) as any[]
      return scored.sort((a, b) => b.score - a.score).slice(0, k)
    }

    async function fallbackPassages() {
      const { data, error } = await supabase
        .from("passage_embeddings")
        .select("pmcid,section,text,embedding")
        .limit(4000)

      if (error || !Array.isArray(data)) return []
      const scored = data
        .map((r: any) => {
          const e: number[] = r.embedding || []
          if (e.length !== VEC_DIM) return null
          let d2 = 0
          for (let i = 0; i < VEC_DIM; i++) {
            const dx = (e[i] || 0) - vec[i]
            d2 += dx * dx
          }
          const score = 1 / (1 + Math.sqrt(d2))
          return { pmcid: r.pmcid, section: r.section, text: r.text, score }
        })
        .filter(Boolean) as any[]
      return scored.sort((a, b) => b.score - a.score).slice(0, k)
    }

    // 1) Try RPCs
    const [docsRpc, passRpc] = await Promise.all([
      needDocs
        ? withRpc<any[]>("match_documents", { query_embedding: vec, match_count: k })
        : Promise.resolve({ data: [] }),
      needPass
        ? withRpc<any[]>("match_passages", { query_embedding: vec, match_count: k })
        : Promise.resolve({ data: [] }),
    ])

    // 2) Use fallback if RPC errored **or returned no rows**
    const docs =
      needDocs
        ? (Array.isArray(docsRpc.data) && docsRpc.data.length
            ? docsRpc.data
            : await fallbackDocs())
        : []

    const passages =
      needPass
        ? (Array.isArray(passRpc.data) && passRpc.data.length
            ? passRpc.data
            : await fallbackPassages())
        : []

    // Attach metadata (titles/years)
    const pmcids = Array.from(
      new Set([
        ...docs.map((d: any) => d.pmcid),
        ...passages.map((p: any) => p.pmcid),
      ])
    )

    const meta: Record<string, { title: string | null; year: string | number | null }> = {}
    if (pmcids.length) {
      const { data } = await supabase
        .from("documents")
        .select("pmcid,title,year")
        .in("pmcid", pmcids)
      if (Array.isArray(data)) {
        for (const r of data) meta[r.pmcid] = { title: r.title, year: r.year }
      }
    }

    const evidences: any[] = []
    for (const p of passages)
      evidences.push({
        pmcid: p.pmcid,
        title: meta[p.pmcid]?.title ?? "Untitled",
        year: meta[p.pmcid]?.year ?? "Unknown",
        section: p.section ?? null,
        snippet: p.text ?? null,
        score: p.score ?? 0,
      })
    for (const d of docs)
      evidences.push({
        pmcid: d.pmcid,
        title: d.title ?? meta[d.pmcid]?.title ?? "Untitled",
        year: d.year ?? meta[d.pmcid]?.year ?? "Unknown",
        section: "All",
        snippet: null,
        score: d.score ?? 0,
      })

    const filtered = evidences
      .filter((e) => !Number.isFinite(minScore) || (e.score ?? 0) >= minScore)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, k)

    const durationMs = Date.now() - t0

    if (!filtered.length) {
      const rpcErrors = {
        match_documents: docsRpc.error?.message || (Array.isArray(docsRpc.data) && !docsRpc.data.length ? "no rows" : null),
        match_passages: passRpc.error?.message || (Array.isArray(passRpc.data) && !passRpc.data.length ? "no rows" : null),
      }
      return json(200, {
        ok: true,
        evidences: [],
        hint:
          "No matches. Try adding section keywords (Results/Discussion) or more specific terms (RANKL, EBV, ARED).",
        rpcErrors,
        durationMs,
      })
    }

    return json(200, { ok: true, evidences: filtered, durationMs })
  } catch (e: any) {
    return json(500, { ok: false, error: String(e?.message || e) })
  }
}
