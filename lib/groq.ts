import "server-only"
import Groq from "groq-sdk"

export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"

export const DEFAULT_GROQ_MODEL = process.env.NEXT_PUBLIC_GROQ_MODEL || "llama-3.3-70b-versatile"

/**
 * Get Groq client instance
 * Throws error if GROQ_API_KEY is not configured (per spec requirements)
 */
export function getGroq() {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error("Missing GROQ_API_KEY")

  return new Groq({
    apiKey: key,
  })
}
