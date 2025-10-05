// app/api/smoke-fetcher/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  // optional override; defaults to your actual table name
  const DOCS = process.env.NEXT_PUBLIC_SUPABASE_DOCS_TABLE || 'documents'

  const checks: Record<string, { ok: boolean; detail?: string }> = {
    env_url:  { ok: !!url },
    env_anon: { ok: !!anon },
    table:    { ok: true, detail: DOCS },
  }

  if (!url || !anon) {
    return NextResponse.json({ ok: false, stage: 'env', checks }, { status: 200 })
  }

  const supabase = createClient(url, anon, { auth: { persistSession: false } })

  // Simple read to prove RLS/REST works
  const sample = await supabase
    .from(DOCS)
    .select('pmcid,title,year')   // <-- your columns
    .limit(1)

  checks.read_docs = { ok: !sample.error, detail: sample.error?.message }

  // If PostgREST is warming its schema cache you'll sometimes see 503 (PGRST002).
  // We treat that as transient and surface it in the response.
  const ok = Object.values(checks).every(c => c.ok) && !sample.error

  return NextResponse.json(
    {
      ok,
      stage: ok ? 'ready' : 'fix',
      checks,
      sample: sample.data?.[0] ?? null,
    },
    { status: 200 }
  )
}
