/**
 * lib/hash256.ts
 * Client-side 256-dimensional vector hashing for query embeddings
 * Matches the offline hashing strategy used in the corpus
 */

/**
 * Hash a text query into a 256-dimensional normalized vector
 * Uses FNV-1a hash to distribute tokens across dimensions
 */
export function hash256(text: string, dim = 256): number[] {
  const v = new Array(dim).fill(0)
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean)

  for (const t of tokens) {
    let h = 2166136261 >>> 0 // FNV offset basis
    for (let i = 0; i < t.length; i++) {
      h ^= t.charCodeAt(i)
      h = Math.imul(h, 16777619) >>> 0 // FNV prime
    }
    v[h % dim] += 1
  }

  // L2 normalization
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  return v.map((x) => x / norm)
}

/**
 * Convert a vector to a PostgreSQL array literal string
 * Format: [0.123456,0.234567,...]
 */
export function vecLiteral(vec: number[]): string {
  return `[${vec.map((n) => n.toFixed(6)).join(",")}]`
}
