// hooks/usePmcidMeta.ts
"use client"
import { useEffect, useState } from "react"
import { getBrowserSupabase } from "@/lib/supabase-browser"

type MetaRow = { pmcid: string; title: string | null; year: string | number | null }

export function usePmcidMeta(pmcids: string[]) {
  const [meta, setMeta] = useState<Record<string, MetaRow>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const ids = Array.from(new Set((pmcids || []).filter(Boolean)))
    if (!ids.length) {
      setMeta({})
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const sb = getBrowserSupabase()
        const { data, error } = await sb
          .from("documents") // ⚠️ read-only, existing table the Search page already uses
          .select("pmcid,title,year")
          .in("pmcid", ids)
        if (error) throw error
        if (cancelled) return
        const byId = Object.fromEntries((data || []).map((r: MetaRow) => [r.pmcid, r]))
        setMeta(byId)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [JSON.stringify(pmcids)])

  return { meta, loading }
}
