import Groq from "groq-sdk"

export const DEFAULT_GROQ_MODEL = process.env.NEXT_PUBLIC_GROQ_MODEL || "llama-3.1-70b-versatile"

/**
 * Get Groq client instance
 * Returns null if GROQ_API_KEY is not configured
 */
export function getGroq() {
  const key = process.env.GROQ_API_KEY
  if (!key) return null

  return new Groq({
    apiKey: key,
  })
}
