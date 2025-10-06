import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================== Config ========================
const VEC_DIM = Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256);
const DOCS_TABLE =
  process.env.NEXT_PUBLIC_SUPABASE_DOCS_TABLE || "documents";
const PASS_EMB_VIEW =
  process.env.NEXT_PUBLIC_PASSAGE_EMBEDDINGS_VIEW || "passage_embeddings";

// Allow-listed Groq models your org supports (pick via GROQ_MODEL)
const ALLOWED_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "openai/gpt-oss-20b",
] as const;
type AllowedModel = (typeof ALLOWED_MODELS)[number];

const DEFAULT_MODEL: AllowedModel =
  (ALLOWED_MODELS.find((m) => m === process.env.GROQ_MODEL) as AllowedModel) ||
  "llama-3.1-8b-instant";

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

function clip(s: string, max = 600) {
  if (!s) return "";
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

function buildContext(passages: any[], maxChars = 9000) {
  const blocks: string[] = [];
  for (let i = 0; i < passages.length; i++) {
    const p = passages[i];
    const line =
      `[#${i + 1}] PMCID ${p.pmcid ?? "—"} | ${p.section ?? "All"} | score=${String(
        p.score ?? ""
      ).slice(0, 6)}\n` + clip(p.text ?? p.snippet ?? "", 1000);
    blocks.push(line);
    if (blocks.join("\n\n").length > maxChars) break;
  }
  return blocks.join("\n\n");
}

// ======================== Handler =======================
export async function POST(req: Request) {
  try {
    const { question, k = 6 } = await req.json().catch(() => ({}));
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const modelEnv = process.env.GROQ_MODEL as AllowedModel | undefined;
    const model =
      (modelEnv && (ALLOWED_MODELS as readonly string[]).includes(modelEnv)
        ? (modelEnv as AllowedModel)
        : DEFAULT_MODEL) || "llama-3.1-8b-instant";

    if (!url || !anon)
      return NextResponse.json(
        { ok: false, error: "Supabase env missing" },
        { status: 500 }
      );
    if (!groqKey)
      return NextResponse.json(
        { ok: false, error: "GROQ_API_KEY missing" },
        { status: 500 }
      );
    if (!question || typeof question !== "string")
      return NextResponse.json(
        { ok: false, error: "question (string) is required" },
        { status: 400 }
      );

    const supabase = createClient(url, anon, { auth: { persistSession: false } });

    // --- Retrieve evidence passages (RPC preferred, fallback to view) ---
    const embedding = hash256(question);

    async function rpcPassages() {
      try {
        const { data, error } = await supabase.rpc("match_passages", {
          query_embedding: embedding,
          match_count: Math.min(Math.max(Number(k) || 6, 3), 12),
        });
        if (error) return [] as any[];
        return Array.isArray(data) ? data : [];
      } catch {
        return [] as any[];
      }
    }

    async function viewPassages() {
      const { data } = await supabase
        .from(PASS_EMB_VIEW)
        .select("pmcid,section,text,snippet,embedding")
        .limit(2000);
      // No vector re-ranking here; we already did a cheap hash embedding.
      return (Array.isArray(data) ? data : []).slice(0, Math.max(3, Number(k) || 6));
    }

    const passages = await (async () => {
      const rpc = await rpcPassages();
      if (rpc.length) return rpc;
      return await viewPassages();
    })();

    // Get titles/years for display (best-effort)
    const pmcids = Array.from(new Set(passages.map((p: any) => p.pmcid))).slice(
      0,
      50
    );
    const meta: Record<string, { title: string | null; year: string | number | null }> =
      {};
    if (pmcids.length) {
      const { data: md } = await supabase
        .from(DOCS_TABLE)
        .select("pmcid,title,year")
        .in("pmcid", pmcids);
      if (Array.isArray(md)) {
        for (const r of md) meta[r.pmcid] = { title: r.title ?? null, year: r.year ?? null };
      }
    }

    // --- Build trimmed context to avoid 413/TPM limits ---
    const context = buildContext(passages, 9000);

    const system =
      "You are ARIA, a careful assistant that answers with citations from the supplied context only. " +
      "Give a concise answer first, then 3–6 bullet points. After factual claims, add citations like [#1][#3]. " +
      "If context is insufficient, say so explicitly.";

    const user =
      `Question: ${question}\n\nContext:\n${context}\n\n` +
      "Instructions: Use only the context above. Include citations like [#1] that match the blocks.";

    // --- Groq call ---
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.2,
          max_tokens: 500, // keep response lean to stay within TPM
        }),
      }
    );

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `Groq HTTP ${groqRes.status}: ${errText}` },
        { status: 500 }
      );
    }

    const groqData = await groqRes.json();
    const answer = (groqData.choices?.[0]?.message?.content || "").trim();

    // Return citations list for UI
    const citations = (passages || []).map((p: any, i: number) => ({
      i: i + 1,
      pmcid: p?.pmcid ?? null,
      section: p?.section ?? "All",
      title: meta[p?.pmcid || ""]?.title ?? null,
      year: meta[p?.pmcid || ""]?.year ?? null,
      score: p?.score ?? null,
    }));

    return NextResponse.json({
      ok: true,
      model,
      answer,
      contextCount: passages.length,
      citations,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
