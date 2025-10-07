// lib/supabase-browser.ts
import { createClient } from "@supabase/supabase-js"

let _sb: ReturnType<typeof createClient> | null = null

export function getBrowserSupabase() {
  if (_sb) return _sb
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!url || !anon) throw new Error("Missing Supabase env vars")
  _sb = createClient(url, anon, { auth: { persistSession: false } })
  return _sb
}
