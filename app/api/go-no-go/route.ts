import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// tiny helper
function ok(ok: boolean, note?: string) {
  return { ok, note }
}

export async function GET() {
  const started = Date.now()
  const results: Record<string, any> = { meta: { ts: new Date().toISOString() } }

  // 1) Env presence (booleans only)
  const SUPABASE_URL = !!process.env.SUPABASE_URL || !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_ANON = !!process.env.SUPABASE_ANON_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const GROQ = !!process.env.GROQ_API_KEY
  results.env = {
    SUPABASE_URL: ok(SUPABASE_URL),
    SUPABASE_ANON_KEY: ok(SUPABASE_ANON),
    GROQ_API_KEY: ok(GROQ),
  }

  // 2) Internal endpoints reachable (don't fail build if false)
  async function ping(path: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      const r = await fetch(`${baseUrl}${path}`, { method: "HEAD", cache: "no-store" })
      return ok(r.ok, `HTTP ${r.status}`)
    } catch (e: any) {
      return ok(false, e?.message ?? "network error")
    }
  }
  results.endpoints = {
    "/api/health": await ping("/api/health"),
    "/api/search-passages": await ping("/api/search-passages"),
    "/api/chat": await ping("/api/chat"),
  }

  // 3) Supabase RPC + RLS (read-only)
  try {
    const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) as string | undefined
    const anon = (process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined
    if (!url || !anon) {
      results.supabase = { connect: ok(false, "Missing URL or anon key") }
    } else {
      const sb = createClient(url, anon, { auth: { persistSession: false } })
      // lightweight read to a safe public table (documents). Adjust if your table name differs.
      const tableName = process.env.NEXT_PUBLIC_SUPABASE_DOCS_TABLE || "documents"
      const head = await sb.from(tableName).select("pmcid", { count: "exact", head: true }).limit(1)
      results.supabase = {
        connect: ok(!head.error, head.error?.message),
        count: head.count ?? null,
      }

      // RPC smoke (match_documents) with a 256-dim zero vector (pgvector accepts)
      const vectorDim = Number.parseInt(process.env.NEXT_PUBLIC_VECTOR_DIM || "256", 10)
      const zero = `[${Array.from({ length: vectorDim }, () => 0).join(",")}]`
      // If your RPC signature differs, adapt match_count param name.
      const rpc = await sb.rpc("match_documents", {
        query_embedding: zero,
        match_count: 1,
      } as any)
      results.supabase.rpc_match_documents = ok(!rpc.error, rpc.error?.message)
    }
  } catch (e: any) {
    results.supabase = { connect: ok(false, e?.message ?? "Supabase error") }
  }

  // 4) Groq key validity (don't send user content)
  try {
    if (!process.env.GROQ_API_KEY) {
      results.groq = { auth: ok(false, "No GROQ_API_KEY set") }
    } else {
      // Avoid importing SDK; use fetch to /openai/v1/models (OpenAI-compatible)
      const r = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        cache: "no-store",
      })
      results.groq = { auth: ok(r.ok, `HTTP ${r.status}`) }
    }
  } catch (e: any) {
    results.groq = { auth: ok(false, e?.message ?? "Groq error") }
  }

  // 5) End-to-end dry-run (optional, best-effort)
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const r = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: "Demo: bone loss in microgravity?", k: 3 }),
      cache: "no-store",
    })
    results.e2e_chat = ok(r.ok, r.ok ? "ok" : `HTTP ${r.status}`)
  } catch (e: any) {
    results.e2e_chat = ok(false, e?.message ?? "chat call failed")
  }

  results.meta.elapsedMs = Date.now() - started
  // Overall status = all leaf checks true
  const leafs = [
    results.env.SUPABASE_URL.ok,
    results.env.SUPABASE_ANON_KEY.ok,
    results.env.GROQ_API_KEY.ok,
    results.endpoints["/api/health"].ok,
    results.endpoints["/api/search-passages"].ok,
    results.supabase?.connect?.ok,
    results.supabase?.rpc_match_documents?.ok,
    results.groq?.auth?.ok,
  ]
  results.overall = leafs.every(Boolean)
  return NextResponse.json(results, { status: 200 })
}
