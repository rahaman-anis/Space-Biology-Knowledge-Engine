export type SectionType = "Introduction" | "Results" | "Discussion" | "Methods" | "Conclusion" | "Abstract"

export type Confidence = "High" | "Medium" | "Low"

export type EvidenceRow = {
  pmcid: string
  title: string
  year: number | null
  section: SectionType
  confidence: Confidence
  relevance: number // 0..1
  citations?: number
  sections: Partial<Record<Lowercase<SectionType>, string>>
  primary_section?: Lowercase<SectionType>
  why_ranked?: string
}

export type AriaAnswer = {
  summary: string
  sources: Array<{ pmcid: string; section: SectionType }>
}
