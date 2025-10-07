export function sanitizeBullets(raw: Array<string | null | undefined>, fallbackPmcs: string[] = [], min = 3, max = 5) {
  const STRIP = /^[\s]*([•\-*\u2022]+)\s*/ // remove any leading bullet-like markers
  const cleaned = (raw || [])
    .map((b) => (b ?? "").replace(STRIP, "").trim())
    .filter(Boolean)
    .slice(0, Math.max(max, min)) // cap to max; min enforced only if available
  const top = fallbackPmcs[0]

  // Ensure each bullet ends with at least one [PMC\d+]
  return cleaned.map((b) => (/\[PMC\d+\]/i.test(b) ? b : top ? `${b} [PMC${top}]` : b))
}
