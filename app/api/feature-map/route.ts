import "server-only"
import { NextResponse } from "next/server"
import { FEATURE_MAP } from "./features"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const token = req.headers.get("x-admin-token")
  if (!process.env.ADMIN_DATA_MAP_TOKEN || token !== process.env.ADMIN_DATA_MAP_TOKEN) {
    return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 })
  }

  try {
    const origin = new URL(req.url).origin
    const res = await fetch(`${origin}/api/data-map`, {
      headers: { "x-admin-token": token! },
    })
    const dm = await res.json()
    if (!dm.ok) return NextResponse.json(dm, { status: 500 })

    const byTable: Record<string, any> = {}
    for (const t of dm.tables) byTable[t.table] = t

    const features = FEATURE_MAP.map((f) => {
      const tables = f.tables.map((t) => {
        const tmeta = byTable[t.table]
        const colMap: Record<string, any> = {}
        for (const c of tmeta?.columns || []) colMap[c.column] = c

        const fields = t.fields.map((name) => {
          const meta = colMap[name]
          return {
            name,
            present: !!meta,
            completeness: meta?.completeness ?? 0,
            samples: meta?.samples ?? [],
          }
        })
        return { table: t.table, rowCount: tmeta?.rowCount ?? 0, fields }
      })
      return { feature: f.feature, route: f.route, tables }
    })

    return NextResponse.json({ ok: true, features })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
