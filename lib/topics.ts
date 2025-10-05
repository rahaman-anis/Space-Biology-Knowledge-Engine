import "server-only"
import { dsListTopics } from "@/lib/datasources"

/** Normalize a topic string for matching: lowercase, remove punctuation, collapse spaces/hyphens */
export function normalizeTopic(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[_]/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, " ")
    .trim()
}

/** Return canonical topic and match meta for a user input (slug or text) */
export async function canonicalizeTopic(input: string): Promise<{
  input: string
  normalized: string
  canonical: string | null
  candidates: string[]
  matchType: "exact" | "normalized-eq" | "includes" | "startsWith" | "none"
}> {
  const list = await dsListTopics(200) // already de-duped
  const normalizedInput = normalizeTopic(input)

  // 1) direct exact (case-insensitive)
  for (const t of list) {
    if (t.toLowerCase() === input.toLowerCase()) {
      return { input, normalized: normalizedInput, canonical: t, candidates: list, matchType: "exact" }
    }
  }

  // 2) normalized equality (handles hyphens/spaces/punct)
  const normMap = new Map<string, string>()
  for (const t of list) normMap.set(normalizeTopic(t), t)
  if (normMap.has(normalizedInput)) {
    return {
      input,
      normalized: normalizedInput,
      canonical: normMap.get(normalizedInput)!,
      candidates: list,
      matchType: "normalized-eq",
    }
  }

  // 3) includes / startsWith (soft match)
  for (const t of list) {
    if (normalizeTopic(t).includes(normalizedInput) || t.toLowerCase().includes(input.toLowerCase())) {
      return { input, normalized: normalizedInput, canonical: t, candidates: list, matchType: "includes" }
    }
  }
  for (const t of list) {
    if (normalizeTopic(t).startsWith(normalizedInput) || t.toLowerCase().startsWith(input.toLowerCase())) {
      return { input, normalized: normalizedInput, canonical: t, candidates: list, matchType: "startsWith" }
    }
  }

  return { input, normalized: normalizedInput, canonical: null, candidates: list, matchType: "none" }
}
