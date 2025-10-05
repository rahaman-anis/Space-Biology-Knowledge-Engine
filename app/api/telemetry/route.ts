import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const ev = await req.json()
    // Don't log secrets; keep payload minimal.
    console.log("[telemetry]", {
      t: new Date().toISOString(),
      type: ev?.type,
      route: ev?.route,
      ms: ev?.ms,
      ok: ev?.ok,
      code: ev?.code,
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "telemetry error" }, { status: 400 })
  }
}
