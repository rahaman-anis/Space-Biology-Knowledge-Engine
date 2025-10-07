export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_KEY

  const env = {
    URL: !!url,
    ANON: !!anon,
    SERVICE: !!service,
  }

  // If we don't have the minimum required envs, return early
  if (!url || (!anon && !service)) {
    return NextResponse.json({
      ok: false,
      env,
      probe: { count: null, error: true },
    })
  }

  // Try to probe the database
  try {
    const supabase = createClient(url, service || anon!, { auth: { persistSession: false } })

    const { count, error } = await supabase
      .from("graph_edges_v")
      .select("source", { count: "exact", head: true })
      .limit(1)

    return NextResponse.json({
      ok: true,
      env,
      probe: { count, error: !!error },
    })
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      env,
      probe: { count: null, error: true },
    })
  }
}
