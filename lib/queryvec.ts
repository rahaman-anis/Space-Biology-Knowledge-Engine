export function hash256Vector(text: string, dim = Number(process.env.NEXT_PUBLIC_VECTOR_DIM || 256)): number[] {
  const v = new Array(dim).fill(0)
  const toks = (text || "").toLowerCase().split(/\W+/).filter(Boolean)
  for (const t of toks) {
    let h = 2166136261 >>> 0
    for (let i = 0; i < t.length; i++) {
      h ^= t.charCodeAt(i)
      h = Math.imul(h, 16777619) >>> 0
    }
    v[h % dim] += 1
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1
  return v.map((x) => x / norm)
}
