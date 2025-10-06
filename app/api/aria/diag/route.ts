import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function GET() {
  const url = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const dim = process.env.NEXT_PUBLIC_VECTOR_DIM || "(unset)"
  const groq = !!process.env.GROQ_API_KEY

  const rpc = { match_documents: false, match_passages: false },
    errors: any = {}
  try {
    if (url && anon) {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: false },
      })
      const zero = new Array(Number(dim) || 256).fill(0)
      const md = await sb.rpc("match_documents", { query_embedding: zero, match_count: 1 })
      rpc.match_documents = !md.error
      if (md.error) errors.match_documents = md.error.message
      const mp = await sb.rpc("match_passages", { query_embedding: zero, match_count: 1 })
      rpc.match_passages = !mp.error
      if (mp.error) errors.match_passages = mp.error.message
    }
  } catch (e: any) {
    errors.diag = String(e?.message || e)
  }

  return NextResponse.json({
    ok: true,
    env: { SUPABASE_URL: url, SUPABASE_ANON: anon, VECTOR_DIM: dim, GROQ_API_KEY: groq },
    rpc,
    errors,
  })
}
