'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient, getSupabaseStatus } from '@/lib/supabaseClient'

type Doc = { pmcid?: string; title?: string; year?: string }

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export default function SupabaseCheck() {
  const [env] = useState(getSupabaseStatus())
  const [row, setRow] = useState<Doc | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const sb = getSupabaseClient()
      if (!sb) { setErr('Supabase not configured'); return }

      // retry a few times to ride out PGRST002 (cold start)
      for (let i = 0; i < 4; i++) {
        const sample = await sb.from('documents').select('pmcid,title,year').limit(1)
        if (sample.error) {
          const m = sample.error.message || ''
          const transient = sample.error.code === 'PGRST002' || /schema cache|503/.test(m.toLowerCase())
          if (transient && i < 3) { await sleep(400 * 2 ** i); continue }
          setErr(`sample error: ${m}`); break
        } else {
          setRow(sample.data?.[0] ?? null)
          const head = await sb.from('documents').select('pmcid', { head: true, count: 'exact' })
          if (head.error) {
            setErr(`count error: ${head.error.message}`)
          } else {
            setCount(head.count ?? null)
          }
          break
        }
      }
    })()
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Supabase sanity</h1>

      <div className="rounded-md border p-4">
        <div className="font-medium mb-2">Env status</div>
        <pre className="text-sm bg-black/5 p-3 rounded">{JSON.stringify({
          ...env,
          restUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '') + '/rest/v1'
        }, null, 2)}</pre>
      </div>

      <div className="rounded-md border p-4">
        <div className="font-medium mb-2">Documents sample row</div>
        <pre className="text-sm bg-black/5 p-3 rounded">{JSON.stringify(row, null, 2)}</pre>
      </div>

      <div className="rounded-md border p-4">
        <div className="font-medium mb-2">Documents count</div>
        <pre className="text-sm bg-black/5 p-3 rounded">{String(count)}</pre>
      </div>

      {err && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
          <div className="font-medium mb-1">Note</div>
          <pre className="text-sm whitespace-pre-wrap">{err}</pre>
        </div>
      )}
    </div>
  )
}
