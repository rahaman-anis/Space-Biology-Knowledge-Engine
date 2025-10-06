// app/api/aria/search/route.ts
import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VEC_DIM = Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256);

// Optional env overrides for your view names
const DOC_VIEW = process.env.NEXT_PUBLIC_DOC_EMBEDDINGS_VIEW || "doc_embeddings";
const PASS_VIEW = process.env.NEXT_PUBLIC_PASSAGE_EMBEDDINGS_VIEW || "passage_embeddings";

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function hash256(text: string, dim: number) {
  const v = new Array(dim).fill(0);
  const toks = String(text).toLowerCase().split(/\W+/).filter(Boolean);
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

export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return json(200, {
    ok: !!(url && anon),
    route: "/api/aria/search",
    env: { hasUrl: !!url, hasAnon: !!anon, vecDim: VEC_DIM },
    views: { DOC_VIEW, PASS_VIEW },
    hint: "POST a JSON body { query: string, k?: number, mode?: 'docs'|'passages'|'both' }",
  });
}

export async function POST(req: Request) {
  const t0 = Date.now();
  const debug = new URL(req.url).searchParams.get("debug") === "1";
  const diag: any = {};

  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    const k = Math.max(1, Math.min(Number(body?.k || 8), 15));
    const mode = (body?.mode as string) || "both";

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return json(500, { ok: false, error: "Supabase env vars missing" });

    if (!query) return json(400, { ok: false, error: "query (string) is required" });

    const vec = hash256(query, VEC_DIM);
    const sb = createClient(url, anon, { auth: { persistSession: false } });

    const needDocs = mode === "docs" || mode === "both";
    const needPass = mode === "passages" || mode === "both";

    async function callRpc(name: string, args: any) {
      try {
        const { data, error } = await sb.rpc(name, args);
        if (error) return { data: [], error: error.message };
        return { data: Array.isArray(data) ? data : [], error: null };
      } catch (e: any) {
        return { data: [], error: String(e?.message || e) };
      }
    }

    // 1) Try RPCs (non-fatal)
    const [docsRpc, passRpc] = await Promise.all([
      needDocs ? callRpc("match_documents", { query_embedding: vec, match_count: k }) : Promise.resolve({ data: [] }),
      needPass ? callRpc("match_passages", { query_embedding: vec, match_count: k }) : Promise.resolve({ data: [] }),
    ]);
    if (debug) diag.rpc = { docs: docsRpc.error, passages: passRpc.error };

    // 2) Fallbacks (non-fatal)
    async function fallbackDocs() {
      try {
        const { data, error } = await sb.from(DOC_VIEW).select("pmcid,title,year,embedding").limit(2000);
        if (error || !Array.isArray(data)) return [];
        const scored = data
          .map((r: any) => {
            const e: number[] = r.embedding || [];
            if (!Array.isArray(e) || e.length !== VEC_DIM) return null;
            let d2 = 0;
            for (let i = 0; i < VEC_DIM; i++) {
              const dx = (e[i] || 0) - vec[i];
              d2 += dx * dx;
            }
            const score = 1 / (1 + Math.sqrt(d2));
            return { pmcid: r.pmcid, title: r.title ?? null, year: r.year ?? null, section: "All", snippet: null, score };
          })
          .filter(Boolean) as any[];
        return scored.sort((a, b) => b.score - a.score).slice(0, k);
      } catch {
        return [];
      }
    }

    async function fallbackPassages() {
      try {
        const { data, error } = await sb.from(PASS_VIEW).select("pmcid,section,text,embedding").limit(3000);
        if (error || !Array.isArray(data)) return [];
        const scored = data
          .map((r: any) => {
            const e: number[] = r.embedding || [];
            if (!Array.isArray(e) || e.length !== VEC_DIM) return null;
            let d2 = 0;
            for (let i = 0; i < VEC_DIM; i++) {
              const dx = (e[i] || 0) - vec[i];
              d2 += dx * dx;
            }
            const score = 1 / (1 + Math.sqrt(d2));
            return { pmcid: r.pmcid, section: r.section ?? "All", snippet: r.text ?? null, score };
          })
          .filter(Boolean) as any[];
        return scored.sort((a, b) => b.score - a.score).slice(0, k);
      } catch {
        return [];
      }
    }

    const docs = needDocs ? (docsRpc.data.length ? docsRpc.data : await fallbackDocs()) : [];
    const passages = needPass ? (passRpc.data.length ? passRpc.data : await fallbackPassages()) : [];

    const evidences = [...passages, ...docs].slice(0, k);
    const durationMs = Date.now() - t0;

    if (!evidences.length) {
      return json(200, {
        ok: true,
        evidences: [],
        hint:
          "No matches. Try adding section keywords (Results/Discussion) or specific terms (RANKL, EBV, ARED).",
        rpcErrors: { match_documents: docsRpc.error, match_passages: passRpc.error },
        ...(debug ? { diag } : {}),
        durationMs,
      });
    }

    return json(200, { ok: true, evidences, ...(debug ? { diag } : {}), durationMs });
  } catch (e: any) {
    return json(200, { ok: false, error: String(e?.message || e) }); // never 500 the page
  }
}
