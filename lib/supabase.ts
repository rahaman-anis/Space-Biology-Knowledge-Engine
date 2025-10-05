/**
 * lib/supabase.ts
 * Convenience export for direct Supabase client access.
 * Re-exports the browser client from supabaseClient.ts for compatibility.
 */

import { getSupabaseClient } from "./supabaseClient"

/**
 * Direct Supabase client instance.
 * Returns null if environment variables are not configured.
 *
 * @example
 * import { supabase } from '@/lib/supabase'
 * const { data, error } = await supabase.from('documents').select('*')
 */
export const supabase = getSupabaseClient()

// Re-export utilities for convenience
export {
  getSupabaseClient,
  isSupabaseConfigured,
  getSupabaseStatus,
  getSupabaseRestHeaders,
  getSupabaseRestUrl,
} from "./supabaseClient"
