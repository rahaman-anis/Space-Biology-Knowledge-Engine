// app/api/aria/answer/route.ts
import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---- Tunables (safe defaults) ----
const VEC_DIM = Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256);
const K_MAX = Number(process.env.ARIA_K_MAX || 8);                    // passages to request from DB (cap)
const PASSAGE_CHARS = Number(process.env.ARIA_PASSAGE_CHARS || 420);   // max chars per snippet
const CONTEXT_BUDGET = Number(process.env.ARIA_CONTEXT_BUDGET_CHARS || 6800); // total chars for all snippets

const MODEL_PRIMARY = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const MODEL_FALLBACK = "llama-3.3-8b-instant";

// ---------- Helpers ----------
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

function cleanText(s: string) {
  return String(s || "")
    .replace(/^\s*(abstract|results?|discussion|introduction|methods|conclusion)s?\W*/i, "")
    .replace(/^\s*\d+(\.\d+)*\.\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionRank(sec: string | null | undefined) {
  const x = String(sec || "").toLowerCase();
  if (x === "abstract") return 0;
  if (x === "results") return 1;
  if (x === "discussion") return 2;
  if (x === "conclusion") return 3;
  if (x === "introduction") return 4;
  if (x === "methods") return 5;
  return 6;
}

function buildContextBlocks(passages: any[], budgetChars: number) {
  // Deduplicate by pmcid+section, keep highest score
  const keep: Record<string, any> = {};
  for (const p of passages) {
    const key = `${p?.pmcid || "?"}::${p?.section || "All"}`;
    if (!(key in keep) || Number(p?.score || 0) > Number(keep[key]?.score || 0)) keep[key] = p;
  }
  const uniq = Object.values(keep);

  // Prefer Abstract/Results and higher score
  uniq.sort((a: any, b: any) => {
    const sa = sectionRank(a?.section);
    const sb = sectionRank(b?.section);
    if (sa !== sb) return sa - sb;
    return Number(b?.score || 0) - Number(a?.score || 0);
  });

  const blocks: string[] = [];
  let used = 0;
  for (const p of uniq) {
    const snippet = cleanText(p?.text || p?.snippet || "").slice(0, PASSAGE_CHARS);
    if (!snippet) continue;
    const head = `[#${blocks.length + 1}] PMCID ${p?.pmcid || "—"} | ${p?.section || "All"} | score=${String(
      p?.score ?? ""
    ).slice(0, 5)}\n`;
    const block = head + snippet;
    if (used + block.length > budgetChars) break;
    blocks.push(block);
    used += block.length;
  }
  return blocks;
}

async function groqChat(model: string, system: string, user: string, apiKey: string) {
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      max_tokens: 600,
    }),
  });
  const text = await resp.text().catch(() => "");
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* ignore */
  }
  return { ok: resp.ok, status: resp.status, json, text };
}

// ---------- Route ----------
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = body?.question;
    const kReq = Number(body?.k || 6);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!url || !anon) return NextResponse.json({ ok: false, error: "Supabase env missing" }, { status: 500 });
    if (!groqKey) return NextResponse.json({ ok: false, error: "GROQ_API_KEY missing" }, { status: 500 });
    if (!question || typeof question !== "string")
      return NextResponse.json({ ok: false, error: "question (string) is required" }, { status: 400 });

    // 1) Retrieve passages (server-side)
    const supabase = createClient(url, anon, { auth: { persistSession: false } });
    const embedding = hash256(question, VEC_DIM);
    const k = Math.max(3, Math.min(kReq, K_MAX));

    const { data: passages, error } = await supabase.rpc("match_passages", {
      query_embedding: embedding,
      match_count: k,
    });
    if (error) return NextResponse.json({ ok: false, error: `match_passages: ${error.message}` }, { status: 500 });

    const list: any[] = Array.isArray(passages) ? passages : [];
    const blocks = buildContextBlocks(list, CONTEXT_BUDGET);

    if (!blocks.length) {
      return NextResponse.json({
        ok: true,
        model: MODEL_PRIMARY,
        answer:
          "I couldn’t find passages relevant enough in the indexed corpus to answer confidently. Try refining the question (e.g., add ‘Results’/‘Discussion’ or specific markers like RANKL, EBV, ARED).",
        citations: [],
      });
    }

    // 2) Build prompt
    const system =
      "You are ARIA, a careful assistant for space biology evidence. Answer concisely in natural language, then add bracketed citations like [#1][#3] taken only from the provided context blocks. If evidence is weak or absent, say so explicitly.";
    const user =
      `Question: ${question}\n\n` +
      `Context:\n${blocks.join("\n\n")}\n\n` +
      "Instructions: Start with a direct 1–2 sentence answer. Then provide 2–5 bullet points each with citations. End with a one-line conclusion.";

    // 3) Call Groq with budget; on 413/429, fall back to smaller model once
    let usedModel = MODEL_PRIMARY;
    let r = await groqChat(usedModel, system, user, groqKey);
    if (!r.ok && (r.status === 413 || r.status === 429)) {
      usedModel = MODEL_FALLBACK;
      r = await groqChat(usedModel, system, user, groqKey);
    }
    if (!r.ok) {
      const bodyText = r.json ? JSON.stringify(r.json) : r.text;
      return NextResponse.json({ ok: false, error: `Groq HTTP ${r.status}: ${bodyText}` }, { status: 500 });
    }

    const answer = String(r.json?.choices?.[0]?.message?.content || "").trim();
    if (!answer) return NextResponse.json({ ok: false, error: "LLM returned empty response" }, { status: 500 });

    // 4) Simple citations parsed from the block headers
    const citations = blocks.map((b, i) => {
      const line1 = b.split("\n", 1)[0]; // "[#n] PMCID XXX | Section ..."
      const m = line1.match(/PMCID\s+([^\s|]+)/i);
      const s = line1.match(/\|\s+([A-Za-z]+)\s+\|/);
      return { i: i + 1, pmcid: m ? m[1] : null, section: s ? s[1] : null };
    });

    return NextResponse.json({ ok: true, model: usedModel, answer, citations });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
