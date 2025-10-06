export interface PassageResult {
  pmcid: string
  title: string
  section: string
  snippet: string
  confidence: "High" | "Medium" | "Low"
  score: number
  year: number
  abstract?: string
}

export interface DocumentResult {
  pmcid: string
  title: string
  abstract: string
  confidence: "High" | "Medium" | "Low"
  score: number
  year: number
}

export interface SearchRequest {
  q: string
  mode?: "passages" | "documents"
  topK?: number
}

export interface SearchResponse {
  ok: boolean
  results: PassageResult[] | DocumentResult[]
  source?: "API" | "MOCK"
}
