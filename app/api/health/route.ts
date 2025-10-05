// app/api/health/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/** Optional: change these at deploy time */
const DOCS_TABLE = (process.env.NEXT_PUBLIC_SUPABASE_DOCS_TABLE || "documents").trim()
const DOCS_PK = (process.env.NEXT_PUBLIC_SUPABASE_DOCS_PK || "pmcid").trim()

/** Enable RPC checks only when you’re ready (functions + RLS in place) */
const WANT_RPC = process.env.HEALTH_CHECK_RPC === "1"

/** If your pgvector dimension isn’t 256, set NEXT_PUBLIC_VECTOR_DIM */
const VEC_DIM = Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256)

/** Helpers */
const ok = (v: any) => !!v
const zeroVec = (n: number) => Array.from({ length: n }, () => 0)

/** Avoid ISR caching of this route */
export const dynamic = "force-dynamic"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const groq = process.env.GROQ_API_KEY

  const checks: Record<string, { ok: boolean; detail?: string; transient?: boolean }> = {
    env_supabase_url: { ok: ok(url) },
    env_supabase_anon: { ok: ok(anon) },
    env_groq: { ok: ok(groq) },
  }

  if (!url || !anon) {
    return NextResponse.json(
      { ok: false, stage: "env", checks, meta: { DOCS_TABLE, DOCS_PK, VEC_DIM } },
      { status: 200 },
    )
  }

  const supabase = createClient(url, anon, { auth: { persistSession: false } })

  // 1) Simple HEAD read on your documents table
  const docs = await supabase
    .from(DOCS_TABLE)
    // any existing column works for a HEAD count; using the configured PK
    .select(DOCS_PK, { head: true, count: "exact" })

  const cacheMsg = docs.error?.message || ""
  const isSchemaCache503 = /schema cache/i.test(cacheMsg) || /503/.test(cacheMsg)

  checks.db_read_docs = {
    ok: !docs.error,
    detail: docs.error?.message,
    transient: isSchemaCache503, // Supabase sometimes returns 503 while warming cache
  }

  // 2) Optional RPC checks
  if (WANT_RPC) {
    const vec = zeroVec(VEC_DIM) // JSON array → pgvector casts correctly

    try {
      const md = await supabase.rpc("match_documents", {
        query_embedding: vec,
        match_count: 1,
      })
      checks.rpc_match_documents = {
        ok: !md.error,
        detail: md.error?.message,
        transient:
          /schema cache/i.test(md.error?.message || "") || /expected\s+\d+\s+dimensions/i.test(md.error?.message || ""),
      }
    } catch (e: any) {
      checks.rpc_match_documents = { ok: false, detail: String(e?.message || e) }
    }

    try {
      const mp = await supabase.rpc("match_passages", {
        query_embedding: vec,
        match_count: 1,
      })
      checks.rpc_match_passages = {
        ok: !mp.error,
        detail: mp.error?.message,
        transient:
          /schema cache/i.test(mp.error?.message || "") || /expected\s+\d+\s+dimensions/i.test(mp.error?.message || ""),
      }
    } catch (e: any) {
      checks.rpc_match_passages = { ok: false, detail: String(e?.message || e) }
    }
  } else {
    checks.rpc_match_documents = { ok: true, detail: "skipped" }
    checks.rpc_match_passages = { ok: true, detail: "skipped" }
  }

  const publicEnv = Object.keys(process.env).filter((k) => k.startsWith("NEXT_PUBLIC_"))
  const leaks = publicEnv.filter((k) => /KEY|TOKEN|SECRET|SERVICE_ROLE/i.test(k))
  checks.leaks = {
    ok: leaks.length === 0,
    detail: leaks.length ? `Found ${leaks.length} dangerous public vars: ${leaks.join(", ")}` : "No leaks detected",
  }

  // Final status
  const allOk = Object.values(checks).every((c) => c.ok)
  return NextResponse.json(
    {
      ok: allOk,
      stage: allOk ? "ready" : "fix",
      checks,
      meta: { DOCS_TABLE, DOCS_PK, VEC_DIM, publicEnvCount: publicEnv.length },
    },
    { status: 200 },
  )
}
