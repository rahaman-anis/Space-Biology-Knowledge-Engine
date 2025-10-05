export type Section = "Results" | "Discussion" | "Methods"

export interface CitationRef {
  pmcid?: string
  ntrsId?: string
  osdrId?: string
  title?: string
  year?: number
  section?: Section
  authors?: string[]
  journal?: string
}

export interface ExportItem {
  id: string
  title?: string
  year?: number
  section?: Section
  pmcid?: string
  ntrsId?: string
  osdrId?: string
  authors?: string[]
  journal?: string
}
