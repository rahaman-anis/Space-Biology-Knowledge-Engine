import { createClient } from "@supabase/supabase-js";

// Force Node runtime & no static optimization
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "iad1"; // or your closest

// --- shared helpers ---------------------------------------------------------
const VEC_DIM = Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256);

// lightweight, deterministic hash → pseudo-embedding (fallback only)
function hash256(text: string, dim = VEC_DIM): number[] {
  const v = new Array(dim).fill(0);
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
  for (const t of tokens) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < t.length; i++) {
      h ^= t.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    v[h % dim] += 1;
  }
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map(x => x / n);
}

function j(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

// --- GET: health ping so we can see the route is deployed -------------------
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return j(200, {
    ok: true,
    route: "/api/aria/search",
    env: {
      hasUrl: !!url,
      hasAnon: !!anon,
      vecDim: VEC_DIM,
    },
    hint: "POST a JSON body { query: string, k?: number, mode?: 'docs'|'passages'|'both' }",
  });
}

// --- POST: main search ------------------------------------------------------
type Body = {
  query?: string;
  embedding?: number[];
  k?: number; // default 8
  mode?: "docs" | "passages" | "both"; // default 'both'
  minScore?: number; // default 0
};

export async function POST(req: Request) {
  const t0 = Date.now();
  try {
    const { query, embedding, k = 8, mode = "both", minScore = 0 } = (await req.json()) as Body;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return j(500, { ok: false, error: "Supabase env vars missing" });

    if (!Array.isArray(embedding) && !(typeof query === "string" && query.trim())) {
      return j(400, { ok: false, error: "Provide either 'query' or 'embedding'." });
    }

    // build query vector (strict length if embedding provided)
    const vec: number[] = Array.isArray(embedding)
      ? (embedding.length === VEC_DIM
          ? embedding.map((x) => Number(x) || 0)
          : (() => { throw new Error(`Embedding length ${embedding.length} != ${VEC_DIM}`) })())
      : hash256(query!.trim(), VEC_DIM);

    const supabase = createClient(url, anon, { auth: { persistSession: false } });

    const needDocs = mode === "docs" || mode === "both";
    const needPass = mode === "passages" || mode === "both";

    // --- try RPCs first (sending JSON array → pgvector) ---------------------
    async function rpc<T>(fn: string, args: any): Promise<{ data?: T; error?: any }> {
      try {
        const { data, error } = await supabase.rpc(fn, args);
        return { data, error };
      } catch (e: any) {
        return { error: { message: String(e?.message || e) } };
      }
    }

    const [docsRpc, passRpc] = await Promise.all([
      needDocs ? rpc<any[]>("match_documents", { query_embedding: vec, match_count: k }) : Promise.resolve({ data: [] }),
      needPass ? rpc<any[]>("match_passages",  { query_embedding: vec, match_count: k }) : Promise.resolve({ data: [] }),
    ]);

    // --- fallback to views if RPCs not available ----------------------------
    async function fallbackDocs() {
      const { data, error } = await supabase
        .from("doc_embeddings")
        .select("pmcid,title,year,embedding")
        .limit(2000);
      if (error || !Array.isArray(data)) return [];
      const scored = data
        .map((r: any) => {
          const e: number[] = r.embedding || [];
          if (e.length !== VEC_DIM) return null;
          let d2 = 0;
          for (let i = 0; i < VEC_DIM; i++) {
            const dx = (e[i] || 0) - vec[i];
            d2 += dx * dx;
          }
          const score = 1 / (1 + Math.sqrt(d2));
          return { pmcid: r.pmcid, title: r.title, year: r.year, score };
        })
        .filter(Boolean) as any[];
      return scored.sort((a, b) => b.score - a.score).slice(0, k);
    }

    async function fallbackPassages() {
      const { data, error } = await supabase
        .from("passage_embeddings")
        .select("pmcid, section, snippet as text, embedding")
        .limit(3000);
      if (error || !Array.isArray(data)) return [];
      const scored = data
        .map((r: any) => {
          const e: number[] = r.embedding || [];
          if (e.length !== VEC_DIM) return null;
          let d2 = 0;
          for (let i = 0; i < VEC_DIM; i++) {
            const dx = (e[i] || 0) - vec[i];
            d2 += dx * dx;
          }
          const score = 1 / (1 + Math.sqrt(d2));
          return { pmcid: r.pmcid, section: r.section, text: r.text, score };
        })
        .filter(Boolean) as any[];
      return scored.sort((a, b) => b.score - a.score).slice(0, k);
    }

    const docs = needDocs ? (Array.isArray(docsRpc.data) ? docsRpc.data : await fallbackDocs()) : [];
    const passages = needPass ? (Array.isArray(passRpc.data) ? passRpc.data : await fallbackPassages()) : [];

    // join in titles/years for passages
    const pmcids = Array.from(new Set([...docs.map((d:any)=>d.pmcid), ...passages.map((p:any)=>p.pmcid)]));
    const meta: Record<string, { title: string|null; year: string|number|null }> = {};
    if (pmcids.length) {
      const { data } = await supabase.from("documents").select("pmcid,title,year").in("pmcid", pmcids);
      if (Array.isArray(data)) for (const r of data) meta[r.pmcid] = { title: r.title, year: r.year };
    }

    const evidences: any[] = [];
    for (const p of passages) {
      evidences.push({
        pmcid: p.pmcid,
        title: meta[p.pmcid]?.title ?? null,
        year:  meta[p.pmcid]?.year ?? null,
        section: p.section ?? null,
        snippet: p.text ?? null,
        score: p.score ?? 0,
      });
    }
    for (const d of docs) {
      evidences.push({
        pmcid: d.pmcid,
        title: d.title ?? meta[d.pmcid]?.title ?? null,
        year:  d.year  ?? meta[d.pmcid]?.year  ?? null,
        section: "All",
        snippet: null,
        score: d.score ?? 0,
      });
    }

    const filtered = evidences
      .filter(e => !Number.isFinite(minScore) || (e.score ?? 0) >= minScore)
      .sort((a,b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, k);

    const durationMs = Date.now() - t0;

    if (!filtered.length) {
      return j(200, {
        ok: true,
        evidences: [],
        hint: "No matches. Try adding section keywords (Results/Discussion) or more specific terms (RANKL, EBV, ARED).",
        rpcErrors: {
          match_documents: docsRpc.error?.message || null,
          match_passages:  passRpc.error?.message || null,
        },
        durationMs,
      });
    }

    return j(200, { ok: true, evidences: filtered, durationMs });
  } catch (e: any) {
    return j(500, { ok: false, error: String(e?.message || e) });
  }
}
