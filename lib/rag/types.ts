export interface RetrievedPassage {
  id: string
  text: string
  section?: "Results" | "Discussion" | "Methods"
  pmcid?: string
  ntrsId?: string
  osdrId?: string
  year?: number
  method?: "in-vivo" | "in-vitro" | "in-silico"
  score?: number
}

export interface ChatRequestDTO {
  question: string
  scope?: { topic?: string; organism?: string; environment?: string }
  k?: number
}
