import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Search API
 * - POST { query?: string, embedding?: number[], k?: number, mode?: 'docs'|'passages'|'both', minScore?: number }
 * - GET  -> health/status
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================== Config ========================
const VEC_DIM = Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256);

// Views / tables (can be overridden via env)
const DOC_EMB_VIEW =
  process.env.NEXT_PUBLIC_DOC_EMBEDDINGS_VIEW || "doc_embeddings";
const PASS_EMB_VIEW =
  process.env.NEXT_PUBLIC_PASSAGE_EMBEDDINGS_VIEW || "passage_embeddings";
const DOCS_TABLE =
  process.env.NEXT_PUBLIC_SUPABASE_DOCS_TABLE || "documents";

// ======================== Utils =========================
function hash256(text: string, dim = VEC_DIM): number[] {
  const v = new Array(dim).fill(0);
  const toks = text.toLowerCase().split(/\W+/).filter(Boolean);
  for (const t of toks) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < t.length; i++) {
      h ^= t.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    v[h % dim] += 1;
  }
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / n);
}

function scoreEuclid(a: number[], b: number[]) {
  let d2 = 0;
  for (let i = 0; i < a.length; i++) {
    const dx = (a[i] || 0) - (b[i] || 0);
    d2 += dx * dx;
  }
  return 1 / (1 + Math.sqrt(d2)); // (0,1]
}

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ======================== GET (health) ==================
export async function GET() {
  return json(200, {
    ok: true,
    route: "/api/aria/search",
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      vecDim: VEC_DIM,
    },
    hint:
      "POST a JSON body { query: string, k?: number, mode?: 'docs'|'passages'|'both' }",
  });
}

// ======================== POST (search) =================
type Body = {
  query?: string;
  embedding?: number[];
  k?: number;
  mode?: "docs" | "passages" | "both";
  minScore?: number;
};

export async function POST(req: Request) {
  const t0 = Date.now();
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const { query, embedding, k = 8, mode = "both", minScore = 0 } = body;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon)
      return json(500, { ok: false, error: "Supabase env vars missing" });

    if (!Array.isArray(embedding) && !(typeof query === "string" && query.trim()))
      return json(400, {
        ok: false,
        error: "Provide either 'query' (string) or 'embedding' (number[dim]).",
      });

    const vec: number[] = Array.isArray(embedding)
      ? (() => {
          if (embedding.length !== VEC_DIM)
            throw new Error(`Embedding length ${embedding.length} != ${VEC_DIM}`);
          return embedding.map((x) => Number(x) || 0);
        })()
      : hash256(query!.trim(), VEC_DIM);

    const supabase = createClient(url, anon, { auth: { persistSession: false } });

    const needDocs = mode === "docs" || mode === "both";
    const needPass = mode === "passages" || mode === "both";

    async function callRpc<T>(fn: string, args: any) {
      try {
        const { data, error } = await supabase.rpc(fn, args);
        if (error) return { data: null as T | null, error: error.message };
        return { data: (data as T) ?? null, error: null };
      } catch (e: any) {
        return { data: null as T | null, error: String(e?.message || e) };
      }
    }

    // 1) Try RPCs first
    const [docsRpc, passRpc] = await Promise.all([
      needDocs
        ? callRpc<any[]>("match_documents", {
            query_embedding: vec,
            match_count: Math.min(Math.max(Number(k) || 8, 1), 20),
          })
        : Promise.resolve({ data: [] as any[], error: null }),
      needPass
        ? callRpc<any[]>("match_passages", {
            query_embedding: vec,
            match_count: Math.min(Math.max(Number(k) || 8, 1), 20),
          })
        : Promise.resolve({ data: [] as any[], error: null }),
    ]);

    // 2) Fallbacks to views (if RPCs unavailable/empty)
    async function fallbackDocs(): Promise<any[]> {
      const { data } = await supabase
        .from(DOC_EMB_VIEW)
        .select("pmcid,title,year,embedding")
        .limit(2000);

      if (!Array.isArray(data)) return [];
      const scored = data
        .map((r: any) => {
          const e: number[] = r.embedding || [];
          if (e.length !== VEC_DIM) return null;
          return {
            pmcid: r.pmcid,
            title: r.title ?? null,
            year: r.year ?? null,
            score: scoreEuclid(e, vec),
          };
        })
        .filter(Boolean) as any[];
      return scored.sort((a, b) => b.score - a.score).slice(0, k);
    }

    async function fallbackPassages(): Promise<any[]> {
      const { data } = await supabase
        .from(PASS_EMB_VIEW)
        .select("pmcid,section,text,snippet,embedding")
        .limit(3000);

      if (!Array.isArray(data)) return [];
      const scored = data
        .map((r: any) => {
          const e: number[] = r.embedding || [];
          if (e.length !== VEC_DIM) return null;
          return {
            pmcid: r.pmcid,
            section: r.section ?? "All",
            text: r.text ?? r.snippet ?? null,
            score: scoreEuclid(e, vec),
          };
        })
        .filter(Boolean) as any[];
      return scored.sort((a, b) => b.score - a.score).slice(0, k);
    }

    const docs =
      needDocs && Array.isArray(docsRpc.data) && docsRpc.data.length
        ? docsRpc.data
        : needDocs
        ? await fallbackDocs()
        : [];

    const passages =
      needPass && Array.isArray(passRpc.data) && passRpc.data.length
        ? passRpc.data
        : needPass
        ? await fallbackPassages()
        : [];

    // 3) Collect metadata (title/year) for pmcids that need it
    const pmcids = Array.from(
      new Set([
        ...docs.map((d: any) => d.pmcid),
        ...passages.map((p: any) => p.pmcid),
      ])
    );

    const meta: Record<
      string,
      { title: string | null; year: string | number | null }
    > = {};
    if (pmcids.length) {
      const { data: md } = await supabase
        .from(DOCS_TABLE)
        .select("pmcid,title,year")
        .in("pmcid", pmcids);
      if (Array.isArray(md)) {
        for (const r of md) {
          meta[r.pmcid] = { title: r.title ?? null, year: r.year ?? null };
        }
      }
    }

    // 4) Merge into evidence items; always include 'abstract'
    const evidences: any[] = [];

    for (const p of passages) {
      evidences.push({
        pmcid: p.pmcid,
        title: meta[p.pmcid]?.title ?? null,
        year: meta[p.pmcid]?.year ?? null,
        section: p.section ?? "All",
        snippet: p.text ?? null,
        abstract: null, // keep shape stable for UI
        score: Number(p.score ?? 0),
      });
    }

    for (const d of docs) {
      evidences.push({
        pmcid: d.pmcid,
        title: d.title ?? meta[d.pmcid]?.title ?? null,
        year: d.year ?? meta[d.pmcid]?.year ?? null,
        section: "All",
        snippet: null,
        abstract: null, // keep shape stable for UI
        score: Number(d.score ?? 0),
      });
    }

    const filtered = evidences
      .filter(
        (e) => !Number.isFinite(minScore) || Number(e.score ?? 0) >= minScore
      )
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, k);

    const durationMs = Date.now() - t0;

    if (!filtered.length) {
      return json(200, {
        ok: true,
        evidences: [],
        hint:
          "No matches. Try adding section keywords (Results/Discussion) or more specific terms (RANKL, EBV, ARED).",
        rpcErrors: {
          match_documents: docsRpc.error,
          match_passages: passRpc.error,
        },
        durationMs,
      });
    }

    return json(200, { ok: true, evidences: filtered, durationMs });
  } catch (e: any) {
    return json(500, { ok: false, error: String(e?.message || e) });
  }
}
