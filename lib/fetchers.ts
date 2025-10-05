/**
 * lib/fetchers.ts
 * Typed fetcher functions for all data operations
 * All functions return Result<T> envelopes
 */

import type {
  Claim,
  DocMeta,
  Gap,
  MechanismEdge,
  Topic,
  Subtopic,
  SearchFilters,
  Result,
  TopicSummary,
  EvidenceSummary,
  Section,
  BM25Scope,
  Passage,
  GraphNode,
  GraphEdge,
} from "@/types/domain"
import { getSupabaseClient } from "./supabaseClient"
import { TABLES, COLUMNS, buildSelectString, VIEWS } from "./datasources"
import { wrapQuery, createEmptyResult, detectMissingColumns } from "./fetch-shared"

// ============================================================================
// Documents
// ============================================================================

/**
 * Fetch all documents with optional filters
 */
export async function fetchDocuments(filters: SearchFilters = {}): Promise<Result<DocMeta[]>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult([])
  }

  const { limit = 50, offset = 0, yearFrom, yearTo, query } = filters

  return wrapQuery(async () => {
    let queryBuilder = supabase
      .from(TABLES.DOCS)
      .select(buildSelectString("DOCS"))
      .range(offset, offset + limit - 1)

    // Apply year filters
    if (yearFrom) {
      queryBuilder = queryBuilder.gte(COLUMNS.DOCS.YEAR, yearFrom)
    }
    if (yearTo) {
      queryBuilder = queryBuilder.lte(COLUMNS.DOCS.YEAR, yearTo)
    }

    // Apply text search
    if (query) {
      queryBuilder = queryBuilder.or(`${COLUMNS.DOCS.TITLE}.ilike.%${query}%,${COLUMNS.DOCS.ABSTRACT}.ilike.%${query}%`)
    }

    const result = await queryBuilder

    // Detect missing columns
    if (result.data && result.data.length > 0) {
      const missing = detectMissingColumns(result.data, Object.values(COLUMNS.DOCS))
      if (missing.length > 0) {
        return {
          data: result.data as DocMeta[],
          error: null,
        }
      }
    }

    return { data: result.data as DocMeta[], error: result.error }
  }, [])
}

/**
 * Fetch a single document by ID
 */
export async function fetchDocumentById(id: string): Promise<Result<DocMeta | null>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult(null)
  }

  return wrapQuery(async () => {
    const result = await supabase.from(TABLES.DOCS).select(buildSelectString("DOCS")).eq(COLUMNS.DOCS.ID, id).single()

    return { data: result.data as DocMeta | null, error: result.error }
  }, null)
}

// ============================================================================
// Claims
// ============================================================================

/**
 * Fetch all claims with optional filters
 */
export async function fetchClaims(filters: SearchFilters = {}): Promise<Result<Claim[]>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult([])
  }

  const { limit = 50, offset = 0, topic, subtopic, status, confidence, query } = filters

  return wrapQuery(async () => {
    let queryBuilder = supabase
      .from(TABLES.CLAIMS)
      .select(buildSelectString("CLAIMS"))
      .range(offset, offset + limit - 1)

    // Apply filters
    if (topic) {
      queryBuilder = queryBuilder.eq(COLUMNS.CLAIMS.TOPIC, topic)
    }
    if (subtopic) {
      queryBuilder = queryBuilder.eq(COLUMNS.CLAIMS.SUBTOPIC, subtopic)
    }
    if (status) {
      queryBuilder = queryBuilder.eq(COLUMNS.CLAIMS.STATUS, status)
    }
    if (confidence) {
      queryBuilder = queryBuilder.eq(COLUMNS.CLAIMS.CONFIDENCE, confidence)
    }
    if (query) {
      queryBuilder = queryBuilder.ilike(COLUMNS.CLAIMS.TEXT, `%${query}%`)
    }

    const result = await queryBuilder
    return { data: result.data as Claim[], error: result.error }
  }, [])
}

/**
 * Fetch a single claim by ID
 */
export async function fetchClaimById(id: string): Promise<Result<Claim | null>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult(null)
  }

  return wrapQuery(async () => {
    const result = await supabase
      .from(TABLES.CLAIMS)
      .select(buildSelectString("CLAIMS"))
      .eq(COLUMNS.CLAIMS.ID, id)
      .single()

    return { data: result.data as Claim | null, error: result.error }
  }, null)
}

/**
 * Fetch claims by topic
 */
export async function fetchClaimsByTopic(topic: string, limit = 20): Promise<Result<Claim[]>> {
  return fetchClaims({ topic, limit })
}

/**
 * Fetch claims by document ID
 */
export async function fetchClaimsByDocId(docId: string): Promise<Result<Claim[]>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult([])
  }

  return wrapQuery(async () => {
    const result = await supabase
      .from(TABLES.CLAIMS)
      .select(buildSelectString("CLAIMS"))
      .eq(COLUMNS.CLAIMS.DOC_ID, docId)

    return { data: result.data as Claim[], error: result.error }
  }, [])
}

// ============================================================================
// Mechanisms
// ============================================================================

/**
 * Fetch mechanisms (graph edges) for a claim
 */
export async function fetchMechanismsByClaimId(claimId: string): Promise<Result<MechanismEdge[]>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult([])
  }

  return wrapQuery(async () => {
    const result = await supabase
      .from(TABLES.MECHANISMS)
      .select(buildSelectString("MECHANISMS"))
      .or(`${COLUMNS.MECHANISMS.SOURCE_CLAIM_ID}.eq.${claimId},${COLUMNS.MECHANISMS.TARGET_CLAIM_ID}.eq.${claimId}`)

    return { data: result.data as MechanismEdge[], error: result.error }
  }, [])
}

/**
 * Fetch all mechanisms with optional filters
 */
export async function fetchMechanisms(
  filters: { mechanismType?: string; limit?: number } = {},
): Promise<Result<MechanismEdge[]>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult([])
  }

  const { mechanismType, limit = 100 } = filters

  return wrapQuery(async () => {
    let queryBuilder = supabase.from(TABLES.MECHANISMS).select(buildSelectString("MECHANISMS")).limit(limit)

    if (mechanismType) {
      queryBuilder = queryBuilder.eq(COLUMNS.MECHANISMS.MECHANISM_TYPE, mechanismType)
    }

    const result = await queryBuilder
    return { data: result.data as MechanismEdge[], error: result.error }
  }, [])
}

// ============================================================================
// Gaps
// ============================================================================

/**
 * Fetch all gaps with optional filters
 */
export async function fetchGaps(
  filters: { topic?: string; gapType?: string; limit?: number } = {},
): Promise<Result<Gap[]>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult([])
  }

  const { topic, gapType, limit = 50 } = filters

  return wrapQuery(async () => {
    let queryBuilder = supabase.from(TABLES.GAPS).select(buildSelectString("GAPS")).limit(limit)

    if (topic) {
      queryBuilder = queryBuilder.eq(COLUMNS.GAPS.TOPIC, topic)
    }
    if (gapType) {
      queryBuilder = queryBuilder.eq(COLUMNS.GAPS.GAP_TYPE, gapType)
    }

    const result = await queryBuilder
    return { data: result.data as Gap[], error: result.error }
  }, [])
}

/**
 * Fetch a single gap by ID
 */
export async function fetchGapById(id: string): Promise<Result<Gap | null>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult(null)
  }

  return wrapQuery(async () => {
    const result = await supabase.from(TABLES.GAPS).select(buildSelectString("GAPS")).eq(COLUMNS.GAPS.ID, id).single()

    return { data: result.data as Gap | null, error: result.error }
  }, null)
}

// ============================================================================
// Topics & Subtopics
// ============================================================================

/**
 * Fetch all topics
 */
export async function fetchTopics(): Promise<Result<Topic[]>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult([])
  }

  return wrapQuery(async () => {
    const result = await supabase.from(TABLES.TOPICS).select(buildSelectString("TOPICS")).order(COLUMNS.TOPICS.NAME)

    return { data: result.data as Topic[], error: result.error }
  }, [])
}

/**
 * Fetch a single topic by slug
 */
export async function fetchTopicBySlug(slug: string): Promise<Result<Topic | null>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult(null)
  }

  return wrapQuery(async () => {
    const result = await supabase
      .from(TABLES.TOPICS)
      .select(buildSelectString("TOPICS"))
      .eq(COLUMNS.TOPICS.SLUG, slug)
      .single()

    return { data: result.data as Topic | null, error: result.error }
  }, null)
}

/**
 * Fetch subtopics for a topic
 */
export async function fetchSubtopicsByTopicId(topicId: string): Promise<Result<Subtopic[]>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult([])
  }

  return wrapQuery(async () => {
    const result = await supabase
      .from(TABLES.SUBTOPICS)
      .select(buildSelectString("SUBTOPICS"))
      .eq(COLUMNS.SUBTOPICS.TOPIC_ID, topicId)
      .order(COLUMNS.SUBTOPICS.NAME)

    return { data: result.data as Subtopic[], error: result.error }
  }, [])
}

// ============================================================================
// Aggregate Views
// ============================================================================

/**
 * Fetch topic summary with aggregated data
 * Falls back to individual queries if view doesn't exist
 */
export async function fetchTopicSummary(topicSlug: string): Promise<Result<TopicSummary | null>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult(null)
  }

  // Try to fetch from view first
  const viewResult = await wrapQuery(async () => {
    const result = await supabase.from(VIEWS.TOPIC_SUMMARY).select("*").eq("topic_slug", topicSlug).single()

    return { data: result.data as TopicSummary | null, error: result.error }
  }, null)

  // If view exists and has data, return it
  if (viewResult.data) {
    return viewResult
  }

  // Otherwise, build summary from individual queries
  const topicResult = await fetchTopicBySlug(topicSlug)
  if (!topicResult.data) {
    return createEmptyResult(null)
  }

  const claimsResult = await fetchClaimsByTopic(topicSlug, 10)
  const docsResult = await fetchDocuments({ topic: topicSlug, limit: 5 })

  // Build consensus distribution
  const consensusDistribution = claimsResult.data.reduce(
    (acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const summary: TopicSummary = {
    topic: topicResult.data,
    claimCount: claimsResult.data.length,
    docCount: docsResult.data.length,
    consensusDistribution,
    maturityDistribution: {}, // Would need additional logic
    topClaims: claimsResult.data.slice(0, 5),
    recentDocs: docsResult.data,
  }

  return {
    data: summary,
    meta: {
      timestamp: new Date().toISOString(),
      source: "supabase",
      warnings: ["Built summary from individual queries (view not available)"],
    },
  }
}

/**
 * Fetch evidence summary for a claim
 */
export async function fetchEvidenceSummary(claimId: string): Promise<Result<EvidenceSummary | null>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return createEmptyResult(null)
  }

  // Fetch claim
  const claimResult = await fetchClaimById(claimId)
  if (!claimResult.data) {
    return createEmptyResult(null)
  }

  const claim = claimResult.data

  // Fetch supporting and refuting docs
  const supportingDocs: DocMeta[] = []
  const refutingDocs: DocMeta[] = []

  if (claim.supportingDocs && claim.supportingDocs.length > 0) {
    for (const docId of claim.supportingDocs.slice(0, 5)) {
      const docResult = await fetchDocumentById(docId)
      if (docResult.data) {
        supportingDocs.push(docResult.data)
      }
    }
  }

  if (claim.refutingDocs && claim.refutingDocs.length > 0) {
    for (const docId of claim.refutingDocs.slice(0, 5)) {
      const docResult = await fetchDocumentById(docId)
      if (docResult.data) {
        refutingDocs.push(docResult.data)
      }
    }
  }

  // Fetch related claims
  const relatedClaims: Claim[] = []
  if (claim.relatedClaims && claim.relatedClaims.length > 0) {
    for (const relatedId of claim.relatedClaims.slice(0, 5)) {
      const relatedResult = await fetchClaimById(relatedId)
      if (relatedResult.data) {
        relatedClaims.push(relatedResult.data)
      }
    }
  }

  // Fetch mechanisms
  const mechanismsResult = await fetchMechanismsByClaimId(claimId)

  const summary: EvidenceSummary = {
    claim,
    supportingDocs,
    refutingDocs,
    consensus: {
      score: 0.5,
      band: "medium",
      supportCount: supportingDocs.length,
      refuteCount: refutingDocs.length,
      inconclusiveCount: 0,
      totalDocs: supportingDocs.length + refutingDocs.length,
    },
    maturity: {
      level: "emerging",
      score: 0.5,
      factors: {
        citationCount: 0,
        yearsSincePublication: 0,
        replicationCount: 0,
        methodologicalRigor: 0,
      },
    },
    relatedClaims,
    mechanisms: mechanismsResult.data,
  }

  return {
    data: summary,
    meta: {
      timestamp: new Date().toISOString(),
      source: "supabase",
    },
  }
}

// ============================================================================
// BM25 Search
// ============================================================================

/**
 * searchBM25
 * Uses the Batch-3 /api/search-passages route to retrieve top-k passages.
 * Pages: ARIA, Evidence.
 */
export async function searchBM25(
  q: string,
  scope: BM25Scope = {},
  k = 12,
): Promise<{ passages: Passage[]; total: number; cached: boolean }> {
  if (!q || typeof q !== "string") {
    return { passages: [], total: 0, cached: false }
  }

  const res = await fetch("/api/search-passages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: q, k, scope }),
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`searchBM25 failed: ${res.status} ${res.statusText}`)
  }

  const { results } = await res.json()

  const passages: Passage[] = (results ?? [])
    .map((r: any, i: number) => ({
      id: r.id ?? String(i),
      text: r.snippet ?? r.text ?? "",
      section: (r.section as Section) ?? undefined,
      pmcid: r.pmcid ?? undefined,
      ntrsId: r.ntrs_id ?? r.ntrsId ?? undefined,
      osdrId: r.osdr_id ?? undefined,
      year: r.year ?? undefined,
      method: (r.method as Passage["method"]) ?? undefined,
      score: r.score ?? undefined,
    }))
    .filter((p) => p.text.length > 0)

  return {
    passages,
    total: Number(results?.length ?? passages.length),
    cached: false,
  }
}

// ============================================================================
// Graph / Subgraph
// ============================================================================

/**
 * fetchSubgraph
 * Loads nodes and edges from Supabase graph tables with graceful fallbacks.
 * Uses env vars NEXT_PUBLIC_GRAPH_NODES_TABLE and NEXT_PUBLIC_GRAPH_EDGES_TABLE.
 */
export async function fetchSubgraph(opts?: {
  q?: string
  limit?: number
  contradictOnly?: boolean
  timeoutMs?: number
}): Promise<{ nodes: GraphNode[]; edges: GraphEdge[]; meta: Record<string, any> }> {
  const sb = getSupabaseClient()
  if (!sb) return { nodes: [], edges: [], meta: { reason: "no-supabase-client" } }

  const NODES = process.env.NEXT_PUBLIC_GRAPH_NODES_TABLE || "graph_nodes"
  const EDGES = process.env.NEXT_PUBLIC_GRAPH_EDGES_TABLE || "graph_edges"
  const q = (opts?.q || "").trim()
  const limit = Math.max(10, Math.min(1000, opts?.limit ?? 200))

  // Strategy:
  // 1) load candidate nodes (filtered by q if provided) with a hard limit
  // 2) load edges that touch those nodes, then union extra nodes referenced by edges
  // 3) filter edges to only include those where both source and target exist
  // This is schema-agnostic as long as views expose id/label/type and source/target/relation.

  // 1) candidate nodes
  let nodesResp
  if (q) {
    // try ilike on label; if your view exposes topic field, adapt here
    nodesResp = await sb.from(NODES).select("id,label").ilike("label", `%${q}%`).limit(limit)
  } else {
    nodesResp = await sb.from(NODES).select("id,label").limit(limit)
  }
  if (nodesResp.error) {
    return { nodes: [], edges: [], meta: { error: nodesResp.error.message, stage: "nodes" } }
  }
  // Add default type to all nodes
  const baseNodes: GraphNode[] = (nodesResp.data || []).map((n: any) => ({
    ...n,
    type: n.type || "node",
  }))
  const wantedIds = new Set(baseNodes.map((n) => n.id))
  if (!baseNodes.length) return { nodes: [], edges: [], meta: { empty: true, stage: "nodes" } }

  // 2) edges that touch those nodes
  const idsArray = Array.from(wantedIds)
  const edgesResp = await sb
    .from(EDGES)
    .select("source,target,relation")
    .in("source", idsArray)
    .limit(limit * 3)
  if (edgesResp.error) {
    return { nodes: baseNodes, edges: [], meta: { error: edgesResp.error.message, stage: "edges" } }
  }
  const rawEdges: GraphEdge[] = edgesResp.data || []

  // 3) include target nodes referenced by edges (best-effort, limit bounded)
  const missingIds = Array.from(new Set(rawEdges.flatMap((e) => [e.source, e.target])))
    .filter((id) => !wantedIds.has(id))
    .slice(0, Math.max(0, limit - baseNodes.length))

  let extraNodes: GraphNode[] = []
  if (missingIds.length) {
    const extra = await sb.from(NODES).select("id,label").in("id", missingIds)
    if (!extra.error && extra.data) {
      extraNodes = extra.data.map((n: any) => ({
        ...n,
        type: n.type || "node",
      }))
    }
  }

  const nodes = [...baseNodes, ...extraNodes]

  const nodeIds = new Set(nodes.map((n) => n.id))
  const edges = rawEdges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
  const filteredCount = rawEdges.length - edges.length

  return {
    nodes,
    edges,
    meta: {
      count: { nodes: nodes.length, edges: edges.length },
      filteredBy: q || null,
      edgesFiltered: filteredCount > 0 ? filteredCount : undefined,
    },
  }
}

// ============================================================================
// Unified Search and ARIA Fetchers
// ============================================================================

/**
 * Search documents using unified search endpoint
 */
export async function searchDocs(q: string, k = 8) {
  const r = await fetch("/api/search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q, k, mode: "documents" }),
  })
  if (!r.ok) throw new Error(await r.text())
  const { documents } = await r.json()
  return documents as any[]
}

/**
 * Search passages using unified search endpoint
 */
export async function searchPassages(q: string, k = 12) {
  const r = await fetch("/api/search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q, k, mode: "passages" }),
  })
  if (!r.ok) throw new Error(await r.text())
  const { passages } = await r.json()
  return passages as any[]
}

/**
 * Ask ARIA a question and get synthesized answer with passages
 */
export async function askAria(q: string, k = 6) {
  const r = await fetch("/api/answer", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q, k }),
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json() as Promise<{ ok: boolean; answer: string; passages: any[] }>
}
