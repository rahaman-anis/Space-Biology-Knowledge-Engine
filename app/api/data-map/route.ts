import "server-only"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function requireAdmin(req: Request) {
  const token = req.headers.get("x-admin-token")
  if (!process.env.ADMIN_DATA_MAP_TOKEN || token !== process.env.ADMIN_DATA_MAP_TOKEN) {
    return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 })
  }
}

export async function GET(req: Request) {
  const guard = requireAdmin(req)
  if (guard) return guard

  try {
    const supabase = createClient(URL, ANON, { auth: { persistSession: false } })
    const { data, error } = await supabase.rpc("dm_introspect_all")
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

    const tables = (data?.tables || []).map((t: any) => {
      const rowCount = Number(t.row_count || 0)
      const cols = (t.columns || []).map((c: any) => {
        const nulls = Number(c.nulls || 0)
        const completeness = rowCount
          ? Math.max(0, Math.min(100, Math.round((100 * (rowCount - nulls)) / rowCount)))
          : 0
        return { ...c, completeness, rowCount }
      })
      return { ...t, columns: cols, rowCount }
    })

    return NextResponse.json({ ok: true, tables })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
