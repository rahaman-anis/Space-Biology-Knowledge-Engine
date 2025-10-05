"use client"
import { useEffect, useMemo, useState } from "react"

type FeatureRow = {
  feature: string
  route: string
  table: string
  field: string
  completeness: number
  samples: string[]
  rowCount: number
}

export default function DataMapAdminPage() {
  const [token, setToken] = useState<string | null>(null)
  const [rows, setRows] = useState<FeatureRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = new URL(window.location.href)
    const t = url.searchParams.get("token")
    if (!t) {
      window.location.href = "/"
      return
    }
    setToken(t)
    ;(async () => {
      try {
        const r = await fetch("/api/feature-map", {
          method: "POST",
          headers: { "x-admin-token": t },
        })
        const j = await r.json()
        if (!j.ok) {
          setError(j.error || "failed")
          return
        }

        const out: FeatureRow[] = []
        for (const f of j.features) {
          for (const t of f.tables) {
            for (const fld of t.fields) {
              out.push({
                feature: f.feature,
                route: f.route,
                table: t.table,
                field: fld.name,
                completeness: fld.completeness,
                samples: fld.samples || [],
                rowCount: t.rowCount || 0,
              })
            }
          }
        }
        setRows(out)
      } catch (e: any) {
        setError(String(e?.message || e))
      }
    })()
  }, [])

  const csv = useMemo(() => {
    if (!rows.length) return ""
    const header = ["feature", "route", "table", "field", "completeness", "rowCount", "samples"].join(",")
    const lines = rows.map((r) =>
      [r.feature, r.route, r.table, r.field, r.completeness, r.rowCount, JSON.stringify(r.samples || [])]
        .map((x) => `"${String(x).replaceAll('"', '""')}"`)
        .join(","),
    )
    return [header, ...lines].join("\n")
  }, [rows])

  function downloadCSV() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data-feature-mapping.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Production Data ↔ Feature Mapping</h1>
      {error && <div className="text-sm text-red-600">Error: {error}</div>}
      {!error && !rows.length && <div className="text-sm text-neutral-500">Loading…</div>}

      {rows.length > 0 && (
        <>
          <div className="flex items-center gap-3">
            <button onClick={downloadCSV} className="rounded bg-black px-3 py-2 text-white">
              Export CSV
            </button>
            <div className="text-sm text-neutral-500">Rows: {rows.length}</div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {rows.slice(0, 200).map((r, i) => (
              <div key={i} className="rounded border p-3">
                <div className="text-sm font-medium">
                  {r.feature} <span className="text-xs text-neutral-500">({r.route})</span>
                </div>
                <div className="text-xs text-neutral-500">
                  {r.table} • {r.field} • completeness {r.completeness}% • rows {r.rowCount}
                </div>
                {r.samples?.length ? (
                  <div className="mt-1 text-xs">e.g. {r.samples.slice(0, 3).join(" · ")}</div>
                ) : (
                  <div className="mt-1 text-xs text-neutral-500">no samples</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
