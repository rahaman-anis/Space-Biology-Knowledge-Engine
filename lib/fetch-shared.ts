/**
 * lib/fetch-shared.ts
 * Shared utilities for data fetching
 * Query wrapping, error handling, missing column detection
 */

import type { Result, ResultMeta } from "@/types/domain"
import { isSupabaseConfigured } from "./supabaseClient"

// ============================================================================
// Result Envelope Helpers
// ============================================================================

/**
 * Create a successful result envelope
 */
export function createResult<T>(data: T, meta: Partial<ResultMeta> = {}): Result<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      source: meta.source || "supabase",
      queryMs: meta.queryMs,
      totalCount: meta.totalCount,
      hasMore: meta.hasMore,
      missingColumns: meta.missingColumns,
      warnings: meta.warnings,
    },
  }
}

/**
 * Create an error result envelope
 */
export function createErrorResult<T>(error: string, fallbackData: T, meta: Partial<ResultMeta> = {}): Result<T> {
  return {
    data: fallbackData,
    meta: {
      timestamp: new Date().toISOString(),
      source: meta.source || "mock",
      warnings: [...(meta.warnings || []), error],
    },
    error,
  }
}

/**
 * Create an empty result for when Supabase is not configured
 */
export function createEmptyResult<T>(emptyValue: T): Result<T> {
  return createResult(emptyValue, {
    source: "mock",
    warnings: ["Supabase not configured. Returning empty data."],
  })
}

// ============================================================================
// Query Wrapper
// ============================================================================

/**
 * Wrap a Supabase query with timing and error handling
 */
export async function wrapQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: Error | null }>,
  fallbackData: T,
): Promise<Result<T>> {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return createEmptyResult(fallbackData)
  }

  const startTime = performance.now()

  try {
    const { data, error } = await queryFn()
    const queryMs = Math.round(performance.now() - startTime)

    if (error) {
      console.error("[LifeLens] Query error:", error)
      return createErrorResult(error.message, fallbackData, { queryMs })
    }

    if (data === null) {
      return createResult(fallbackData, { queryMs, source: "supabase" })
    }

    return createResult(data, { queryMs, source: "supabase" })
  } catch (err) {
    const queryMs = Math.round(performance.now() - startTime)
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    console.error("[LifeLens] Query exception:", err)
    return createErrorResult(errorMessage, fallbackData, { queryMs })
  }
}

// ============================================================================
// Missing Column Detection
// ============================================================================

/**
 * Detect missing columns in query results
 * Compares expected columns against actual data
 */
export function detectMissingColumns<T extends Record<string, unknown>>(
  data: T[],
  expectedColumns: string[],
): string[] {
  if (data.length === 0) {
    return []
  }

  const firstRow = data[0]
  const actualColumns = Object.keys(firstRow)
  const missing = expectedColumns.filter((col) => !actualColumns.includes(col))

  return missing
}

/**
 * Add missing column warnings to result meta
 */
export function addMissingColumnWarnings<T>(result: Result<T>, missingColumns: string[]): Result<T> {
  if (missingColumns.length === 0) {
    return result
  }

  return {
    ...result,
    meta: {
      ...result.meta,
      missingColumns,
      warnings: [...(result.meta.warnings || []), `Missing columns: ${missingColumns.join(", ")}`],
    },
  }
}

// ============================================================================
// Rank Merging
// ============================================================================

/**
 * Merge multiple ranked lists by interleaving items
 * Used for combining results from different sources
 */
export function mergeRankedLists<T extends { id: string }>(lists: T[][], maxResults = 20): T[] {
  const merged: T[] = []
  const seen = new Set<string>()
  let index = 0

  // Interleave items from each list
  while (merged.length < maxResults) {
    let addedAny = false

    for (const list of lists) {
      if (index < list.length) {
        const item = list[index]
        if (!seen.has(item.id)) {
          merged.push(item)
          seen.add(item.id)
          addedAny = true

          if (merged.length >= maxResults) {
            break
          }
        }
      }
    }

    if (!addedAny) {
      break // All lists exhausted
    }

    index++
  }

  return merged
}

/**
 * Deduplicate items by ID, keeping first occurrence
 */
export function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false
    }
    seen.add(item.id)
    return true
  })
}
