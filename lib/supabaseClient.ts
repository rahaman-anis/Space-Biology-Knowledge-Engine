/**
 * lib/supabaseClient.ts
 * Browser-side Supabase client for read-only public access.
 * - Safe if env vars are missing (returns null + logs a single warning)
 * - HMR-safe singleton (reused across hot reloads)
 * - Tiny helpers for status + REST headers
 */

import { createBrowserClient } from '@supabase/ssr'
// If you generated Supabase types, you can import and plug them in below.
// import type { Database } from '@/types/supabase'

// ================================================================
// Environment (NEXT_PUBLIC_* are safe to read in the browser)
// ================================================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ================================================================
// Singleton (HMR-safe)
// ================================================================
type BrowserSb = ReturnType<typeof createBrowserClient/*<Database>*/>

declare global {
  // eslint-disable-next-line no-var
  var __lifelens_sb_client: BrowserSb | null | undefined
}

function makeClient(): BrowserSb | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  return createBrowserClient/*<Database>*/(SUPABASE_URL, SUPABASE_ANON_KEY, {
    // For public, read-only usage, defaults are fine.
    // You can tune fetch here if you need custom headers, retry, etc.
  })
}

if (typeof window !== 'undefined' && globalThis.__lifelens_sb_client === undefined) {
  globalThis.__lifelens_sb_client = makeClient()
}

// ================================================================
// Public API
// ================================================================

/**
 * Get or create the Supabase browser client.
 * Returns null if env vars are missing.
 */
export function getSupabaseClient(): BrowserSb | null {
  if (typeof window === 'undefined') {
    // This file is intended for browser usage; guard just in case.
    return null
  }
  if (!globalThis.__lifelens_sb_client) {
    globalThis.__lifelens_sb_client = makeClient()
  }
  if (!globalThis.__lifelens_sb_client) {
    warnOnce(
      '[LifeLens] Supabase env vars not configured. Data fetching will return empty results.'
    )
  }
  return globalThis.__lifelens_sb_client ?? null
}

/** True if NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

/** Lightweight status object for debugging/telemetry. */
export function getSupabaseStatus() {
  return {
    configured: isSupabaseConfigured(),
    hasUrl: Boolean(SUPABASE_URL),
    hasKey: Boolean(SUPABASE_ANON_KEY),
    restUrl: SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : null,
  }
}

/**
 * Headers for calling Supabase REST directly (PostgREST) from the browser
 * when you aren’t using the JS client. Handy for quick fetches.
 */
export function getSupabaseRestHeaders() {
  return SUPABASE_ANON_KEY
    ? {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      }
    : {};
}

/** Optional convenience: get the REST base URL. */
export function getSupabaseRestUrl(): string | null {
  return SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : null
}

// ================================================================
// Internal: log a warning only once
// ================================================================
let _warned = false
function warnOnce(msg: string) {
  if (_warned) return
  _warned = true
  // eslint-disable-next-line no-console
  console.warn(msg)
}
