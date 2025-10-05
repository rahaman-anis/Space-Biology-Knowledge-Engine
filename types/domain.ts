/**
 * types/domain.ts
 * Core domain types for NASA LifeLens
 * All entities, enums, and Result envelopes
 */

// ============================================================================
// Enums
// ============================================================================

export type ClaimStatus = "supported" | "refuted" | "inconclusive" | "unknown"
export type ConfidenceBand = "high" | "medium" | "low" | "none"
export type MaturityLevel = "mature" | "emerging" | "speculative" | "unknown"
export type TransferabilityScore = "high" | "medium" | "low" | "unknown"
export type Relation = "supports" | "contradicts" | "extends" | "requires" | "related"
export type Section = "abstract" | "introduction" | "methods" | "results" | "discussion" | "conclusion" | "other"

// ============================================================================
// Document Metadata
// ============================================================================

export interface DocMeta {
  id: string
  title: string
  authors?: string[]
  year?: number
  doi?: string
  url?: string
  abstract?: string
  keywords?: string[]
  source?: string // journal, conference, etc.
  citationCount?: number
  createdAt?: string
  updatedAt?: string
}

// ============================================================================
// Claims
// ============================================================================

export interface Claim {
  id: string
  text: string
  status: ClaimStatus
  confidence: ConfidenceBand
  topic?: string
  subtopic?: string
  docId?: string
  docMeta?: DocMeta
  supportingDocs?: string[] // doc IDs
  refutingDocs?: string[] // doc IDs
  relatedClaims?: string[] // claim IDs
  createdAt?: string
  updatedAt?: string
}

// ============================================================================
// Mechanisms (Graph Edges)
// ============================================================================

export interface MechanismEdge {
  id: string
  sourceClaimId: string
  targetClaimId: string
  mechanismType: string // e.g., "causal", "correlational", "inhibitory"
  description?: string
  confidence: ConfidenceBand
  supportingDocs?: string[]
  createdAt?: string
  updatedAt?: string
}

// ============================================================================
// Gaps
// ============================================================================

export interface Gap {
  id: string
  title: string
  description: string
  gapType: string // e.g., "data", "methodology", "theory"
  topic?: string
  subtopic?: string
  priority?: "high" | "medium" | "low"
  relatedClaims?: string[]
  suggestedApproaches?: string[]
  createdAt?: string
  updatedAt?: string
}

// ============================================================================
// Topics & Subtopics
// ============================================================================

export interface Topic {
  id: string
  name: string
  slug: string
  description?: string
  claimCount?: number
  docCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface Subtopic {
  id: string
  topicId: string
  name: string
  slug: string
  description?: string
  claimCount?: number
  docCount?: number
  createdAt?: string
  updatedAt?: string
}

// ============================================================================
// Search & Filters
// ============================================================================

export interface SearchFilters {
  query?: string
  topic?: string
  subtopic?: string
  status?: ClaimStatus
  confidence?: ConfidenceBand
  maturity?: MaturityLevel
  transferability?: TransferabilityScore
  yearFrom?: number
  yearTo?: number
  limit?: number
  offset?: number
}

// ============================================================================
// Result Envelopes
// ============================================================================

export interface ResultMeta {
  timestamp: string
  source: "supabase" | "cache" | "mock"
  queryMs?: number
  totalCount?: number
  hasMore?: boolean
  missingColumns?: string[]
  warnings?: string[]
}

export interface Result<T> {
  data: T
  meta: ResultMeta
  error?: string
}

// ============================================================================
// Heuristic Results
// ============================================================================

export interface ConsensusScore {
  score: number // 0-1
  band: ConfidenceBand
  supportCount: number
  refuteCount: number
  inconclusiveCount: number
  totalDocs: number
}

export interface MaturityScore {
  level: MaturityLevel
  score: number // 0-1
  factors: {
    citationCount: number
    yearsSincePublication: number
    replicationCount: number
    methodologicalRigor: number
  }
}

export interface TransferabilityResult {
  score: TransferabilityScore
  value: number // 0-1
  factors: {
    environmentalSimilarity: number
    scalabilityPotential: number
    resourceRequirements: number
    technologicalReadiness: number
  }
}

// ============================================================================
// Aggregate Views
// ============================================================================

export interface TopicSummary {
  topic: Topic
  claimCount: number
  docCount: number
  consensusDistribution: Record<ClaimStatus, number>
  maturityDistribution: Record<MaturityLevel, number>
  topClaims: Claim[]
  recentDocs: DocMeta[]
}

export interface EvidenceSummary {
  claim: Claim
  supportingDocs: DocMeta[]
  refutingDocs: DocMeta[]
  consensus: ConsensusScore
  maturity: MaturityScore
  relatedClaims: Claim[]
  mechanisms: MechanismEdge[]
}

// ============================================================================
// Graph / Knowledge Subgraphs
// ============================================================================

export interface GraphNode {
  id: string
  label?: string
  type?: string
}

export interface GraphEdge {
  source: string
  target: string
  relation?: Relation
}

// ============================================================================
// BM25 Search
// ============================================================================

export interface Passage {
  id: string
  text: string
  section?: Section
  pmcid?: string
  ntrsId?: string
  osdrId?: string
  year?: number
  method?: "bm25" | "vector" | "hybrid"
  score?: number
}

export interface BM25Scope {
  topic?: string
  yearFrom?: number
  yearTo?: number
  sources?: string[]
}
