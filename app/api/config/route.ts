import { NextResponse } from "next/server"

/**
 * GET /api/config
 * Safe diagnostics endpoint - shows presence of environment variables without leaking secrets
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_SUPABASE_DOCS_TABLE: process.env.NEXT_PUBLIC_SUPABASE_DOCS_TABLE || "documents",
        NEXT_PUBLIC_VECTOR_DIM: Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256),
        NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK || "false",
        GROQ_API_KEY: !!process.env.GROQ_API_KEY,
      },
      ts: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  )
}
