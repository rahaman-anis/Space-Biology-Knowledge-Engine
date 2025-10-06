// /app/api/aria/search/route.ts
import { createClient } from "@supabase/supabase-js";
import { VEC_DIM, hash256 } from "@/lib/server/hash256";
import { assertNodeRuntime } from "@/lib/server/assert-node";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
assertNodeRuntime("/api/aria/search");

type Body = {
  query?: string;
  embedding?: number[];
  k?: number; // default 8
  mode?: "docs" | "passages" | "both"; // default both
  minScore?: number; // default 0
};

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function scoreEuclid(a: number[], b: number[]) {
  // 1 / (1 + L2) in (0,1]; safe & monotonic
  let d2 = 0;
  const n = Math.min(a.length, b.length, VEC_DIM);
  for (let i = 0; i < n; i++) {
    const dx = (a[i] || 0) - (b[i] || 0);
    d2 += dx * dx;
  }
  return 1 / (1 + Math.sqrt(d2));
}

// Try multiple candidates so we work with either schema
const PASSAGE_VIEW_CANDIDATES = [
  process.env.NEXT_PUBLIC_PASSAGE_EMBEDDINGS_VIEW, // preferred via env
  "passage_embeddings",                            // old view name
  "text_embeddings",                               // current table in your DB
].filter(Boolean) as string[];

const DOCS_TABLE_CANDIDATES = [
  process.env.NEXT_PUBLIC_DOC_EMBEDDINGS_VIEW,     // preferred via env
  "doc_embeddings",                                // typical table for doc vectors
].filter(Boolean) as string[];

export async function GET() {
  return json(200, {
    ok: true,
    route: "/api/aria/search",
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      vecDim: VEC_DIM,
      passageViewCandidates: PASSAGE_VIEW_CANDIDATES,
      docViewCandidates: DOCS_TABLE_CANDIDATES,
    },
    hint:
      "POST a JSON body { query: string, k?: number, mode?: 'docs'|'passages'|'both', minScore?: number }",
  });
}

export async function POST(req: Request) {
  const t0 = Date.now();
  try {
    const { query, embedding, k = 8, mode = "both", minScore = 0 } =
      (await req.json().catch(() => ({}))) as Body;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return json(500, { ok: false, error: "Supabase env vars missing" });

    if (!Array.isArray(embedding) && !(typeof query === "string" && query.trim())) {
      return json(400, { ok: false, error: "Provide either 'query' or 'embedding'." });
    }

    // Build vector
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

    async function withRpc<T>(fn: string, args: any): Promise<{ data?: T; error?: any }> {
      try {
        const { data, error } = await supabase.rpc(fn, args);
        return { data, error };
      } catch (e: any) {
        return { error: { message: String(e?.message || e) } };
      }
    }

    // ---------- RPC first ----------
    const [docsRpc, passRpc] = await Promise.all([
      needDocs
        ? withRpc<any[]>("match_documents", { query_embedding: vec, match_count: k })
        : Promise.resolve({ data: [] }),
      needPass
        ? withRpc<any[]>("match_passages", { query_embedding: vec, match_count: k })
        : Promise.resolve({ data: [] }),
    ]);

    // ---------- Fallbacks ----------
    async function queryDocsFallback(): Promise<any[]> {
      for (const view of DOCS_TABLE_CANDIDATES) {
        try {
          const { data, error } = await supabase
            .from(view)
            .select("pmcid,title,year,embedding")
            .limit(1500);
          if (error || !Array.isArray(data) || data.length === 0) continue;

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
          if (scored.length) return scored.sort((a, b) => b.score - a.score).slice(0, k);
        } catch {
          // try next candidate
        }
      }
      return [];
    }

    async function queryPassagesView(view: string): Promise<any[] | null> {
      // Try a few select shapes to accommodate different schemas without throwing
      const selects = [
        "pmcid,section,text,snippet,chunk,content,embedding",
        "pmcid,section,text,embedding",
        "pmcid,section,content,embedding",
        "pmcid,section,chunk,embedding",
        "pmcid,section,embedding",
      ];
      for (const sel of selects) {
        const { data, error } = await supabase.from(view).select(sel).limit(3000);
        if (error) continue;
        if (Array.isArray(data) && data.length) return data as any[];
      }
      return null;
    }

    async function fallbackPassages(): Promise<any[]> {
      for (const view of PASSAGE_VIEW_CANDIDATES) {
        try {
          const data = await queryPassagesView(view);
          if (!data || !data.length) continue;

          const rows = data
            .map((r: any) => {
              const e: number[] = r.embedding || [];
              if (e.length !== VEC_DIM) return null;
              // Prefer text; then snippet/content/chunk if present
              const txt = r.text ?? r.snippet ?? r.content ?? r.chunk ?? null;
              return {
                pmcid: r.pmcid,
                section: r.section ?? "All",
                text: txt,
                score: scoreEuclid(e, vec),
              };
            })
            .filter(Boolean) as any[];

          if (rows.length) return rows.sort((a, b) => b.score - a.score).slice(0, k);
        } catch {
          // try next candidate
        }
      }
      return [];
    }

    const docs =
      needDocs ? (Array.isArray(docsRpc.data) ? docsRpc.data : await queryDocsFallback()) : [];
    const passages =
      needPass ? (Array.isArray(passRpc.data) ? passRpc.data : await fallbackPassages()) : [];

    // ---------- Collect metadata for titles/years ----------
    const pmcids = Array.from(
      new Set([
        ...docs.map((d: any) => d.pmcid),
        ...passages.map((p: any) => p.pmcid),
      ]),
    ).filter(Boolean);

    const meta: Record<string, { title: string | null; year: string | number | null }> = {};
    if (pmcids.length) {
      const { data } = await supabase.from("documents").select("pmcid,title,year").in("pmcid", pmcids);
      if (Array.isArray(data)) {
        for (const r of data) meta[r.pmcid] = { title: r.title ?? null, year: r.year ?? null };
      }
    }

    // ---------- Merge + filter ----------
    const evidences: any[] = [];
    for (const p of passages)
      evidences.push({
        pmcid: p.pmcid,
        title: meta[p.pmcid]?.title ?? null,
        year: meta[p.pmcid]?.year ?? null,
        section: p.section ?? "All",
        snippet: p.text ?? p.snippet ?? null,
        score: typeof p.score === "number" ? p.score : Number(p.score ?? 0) || 0,
      });
    for (const d of docs)
      evidences.push({
        pmcid: d.pmcid,
        title: d.title ?? meta[d.pmcid]?.title ?? null,
        year: d.year ?? meta[d.pmcid]?.year ?? null,
        section: "All",
        snippet: null,
        score: typeof d.score === "number" ? d.score : Number(d.score ?? 0) || 0,
      });

    const filtered = evidences
      .filter((e) => !Number.isFinite(minScore) || (e.score ?? 0) >= (minScore as number))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, k);

    const durationMs = Date.now() - t0;

    if (!filtered.length) {
      // Surface *why* RPCs failed, if they did
      const rpcErrors = {
        match_documents: docsRpc.error?.message || null,
        match_passages: passRpc.error?.message || null,
      };
      return json(200, {
        ok: true,
        evidences: [],
        hint:
          "No matches. Try adding section keywords (Results/Discussion) or more specific terms (RANKL, EBV, ARED).",
        rpcErrors,
        durationMs,
      });
    }

    return json(200, { ok: true, evidences: filtered, durationMs });
  } catch (e: any) {
    return json(500, { ok: false, error: String(e?.message || e) });
  }
}
