export type Section = "Results" | "Discussion" | "Methods"
export type Band = "High" | "Medium" | "Low"
export type Consensus = "Strong" | "Mixed" | "Conflicted"

export interface CitationRef {
  pmcid?: string
  ntrsId?: string
  osdrId?: string
  section?: Section
  title?: string
  year?: number
}

export interface EvidenceBullet {
  id: string
  section: Section
  text: string
  citations: CitationRef[]
  year?: number
  method?: "in-vivo" | "in-vitro" | "in-silico"
}

export interface AssistantPayload {
  summary: string
  confidence: Band
  consensus: Consensus
  coverageCount?: number
  confidenceInterval?: [number, number]
  freshnessText?: string
  evidence: EvidenceBullet[]
  sources?: CitationRef[]
  gapsCount?: number
}

export type ChatRole = "user" | "assistant" | "system"

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  payload?: AssistantPayload
  createdAt: string
  context?: { topic?: string; organism?: string; environment?: string }
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
  context?: { topic?: string; organism?: string; environment?: string }
}
