import type { RetrievedPassage } from "./types"

export function buildSynthesisPrompt(q: string, passages: RetrievedPassage[]) {
  const ctx = passages
    .map((p, i) => {
      const src = p.pmcid ? `PMCID ${p.pmcid}` : p.ntrsId ? `NTRS ${p.ntrsId}` : p.osdrId ? `OSDR ${p.osdrId}` : "—"
      const sec = p.section ?? "Results"
      const yr = p.year ? ` (${p.year})` : ""
      return `#${i + 1} [${sec}] ${src}${yr}\n${p.text.trim()}`
    })
    .join("\n\n")

  return `You are ARIA, a research assistant for space biology. Write a structured, section-aware answer.

Question:
${q}

Context (top evidence snippets):
${ctx}

INSTRUCTIONS:
- Write a 2–3 sentence SUMMARY first (neutral, precise).
- Then list 3–6 EVIDENCE BULLETS grouped by section: [Results], [Discussion], [Methods].
- Add inline citations as superscripts using the passage numbers, e.g. [1,3].
- Report CONFIDENCE (High/Medium/Low) and CONSENSUS (Strong/Mixed/Conflicted).
- If contradictory findings exist, note them.
- Keep numbers conservative; prefer ranges when uncertain.
- End with a SOURCES list (PMCID/NTRS/OSDR IDs).
- Output as JSON ONLY matching this TypeScript type:

type Out = {
  summary: string
  confidence: 'High'|'Medium'|'Low'
  consensus: 'Strong'|'Mixed'|'Conflicted'
  coverageCount: number
  evidence: Array<{ section: 'Results'|'Discussion'|'Methods'; text: string; cites: number[] }>
}

Return valid JSON. Do not include markdown fences.`
}
