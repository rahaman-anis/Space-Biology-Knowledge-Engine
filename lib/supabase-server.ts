import { createClient } from "@supabase/supabase-js"

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!url || !anon) throw new Error("Supabase envs missing")
  return createClient(url, anon, { auth: { persistSession: false } })
}
