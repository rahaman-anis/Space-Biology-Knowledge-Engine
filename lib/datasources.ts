/**
 * lib/datasources.ts
 * Single source of truth for Supabase table / view / RPC names + columns.
 * Kept tiny, explicit, and aligned with the schema you imported.
 *
 * Env overrides (optional):
 *   - NEXT_PUBLIC_SUPABASE_DOCS_TABLE   (default: 'documents')
 *   - NEXT_PUBLIC_SUPABASE_DOCS_PK      (default: 'pmcid')
 *   - NEXT_PUBLIC_SUPABASE_EMBED_DIM    (default: 256)
 */

//
// ---------- Environment-driven knobs ----------
//

export const DOCS_TABLE = process.env.NEXT_PUBLIC_SUPABASE_DOCS_TABLE?.trim() || "documents"

export const DOCS_PK = process.env.NEXT_PUBLIC_SUPABASE_DOCS_PK?.trim() || "pmcid"

export const EMBED_DIM = Number(process.env.NEXT_PUBLIC_SUPABASE_EMBED_DIM || 256)

//
// ---------- Tables you actually have ----------
//

export const TABLES = {
  DOCUMENTS: DOCS_TABLE,
  ABSTRACTS: "abstracts",
  SEARCH_CORPUS: "search_corpus",
  EMBEDDINGS_META: "embeddings_meta",
  IMRAD_SPANS: "imrad_spans",
  CLAIMS: "claims",
  MECHANISMS: "mechanisms",
  GAPS: "gaps",
  RISK_SUMMARY: "risk_summary",
  RISK_LINKS: "risk_links",
  TEXT_EMBEDDINGS: "text_embeddings", // section-level vectors
  DOC_EMBEDDINGS: "doc_embeddings", // per-doc averaged vectors
  // curated small tables:
  PARADIGM_SHIFTS: "paradigm_shifts",
  MISSION_CRITICALITY: "mission_criticality",
  OSDR_EXEMPLARS: "osdr_exemplars",
  ORGANISM_NORMALIZATION: "organism_normalization",
} as const

//
// ---------- Column sets (only what UI likely needs) ----------
//

export const COLUMNS = {
  DOCUMENTS: {
    PK: DOCS_PK, // 'pmcid'
    TITLE: "title",
    YEAR: "year",
    JOURNAL: "journal",
    DOI: "doi",
    PMID: "pmid",
    ENVIRONMENT: "environment",
    DURATION_DAYS: "duration_days",
    ORGANISM_NORMALIZED: "organism_normalized",
  },

  DOCS: {
    ID: DOCS_PK,
    TITLE: "title",
    YEAR: "year",
    JOURNAL: "journal",
    DOI: "doi",
    PMID: "pmid",
    ABSTRACT: "abstract_text",
    ENVIRONMENT: "environment",
    DURATION_DAYS: "duration_days",
    ORGANISM_NORMALIZED: "organism_normalized",
  },

  ABSTRACTS: {
    PK: "pmcid",
    TEXT: "abstract_text",
  },

  SEARCH_CORPUS: {
    PK: "pmcid",
    TEXT: "search_text",
  },

  EMBEDDINGS_META: {
    PMC: "pmcid",
    SECTION: "section",
    TITLE: "title",
    YEAR: "year",
    JOURNAL: "journal",
    SEARCH_TEXT: "search_text",
  },

  IMRAD_SPANS: {
    PMC: "pmcid",
    SECTION: "section",
    TEXT: "text",
  },

  CLAIMS: {
    ID: "id",
    PMC: "pmcid",
    SECTION: "section",
    TEXT: "claim_text",
    SUBJECT: "subject",
    PREDICATE: "predicate",
    OBJECT: "object",
    CONFIDENCE: "confidence",
    TOPIC: "topic",
    SUBTOPIC: "subtopic",
    STATUS: "status",
    DOC_ID: "doc_id",
  },

  MECHANISMS: {
    ID: "id",
    SOURCE: "source",
    TARGET: "target",
    RELATION: "relation",
    PREDICATE: "predicate",
    EVIDENCE: "evidence",
    SECTION: "section",
    CONFIDENCE: "confidence",
    SOURCE_CLAIM_ID: "source_claim_id",
    TARGET_CLAIM_ID: "target_claim_id",
    MECHANISM_TYPE: "mechanism_type",
  },

  GAPS: {
    ID: "id",
    GAP_ID: "gap_id",
    PMC: "pmcid",
    TOPIC: "topic",
    ORGANISM: "organism",
    PRIORITY_SCORE: "priority_score",
    MISSION_IMPACT: "mission_impact",
    FEASIBILITY: "feasibility",
    ENABLING_MISSIONS_COUNT: "enabling_missions_count",
    RECOMMENDED_STUDY: "recommended_study",
    ESTIMATED_COST: "estimated_cost",
    TIMELINE_YEARS: "timeline_years",
    TEXT: "text",
    GAP_TYPE: "gap_type",
  },

  TOPICS: {
    ID: "id",
    NAME: "name",
    SLUG: "slug",
    DESCRIPTION: "description",
  },

  SUBTOPICS: {
    ID: "id",
    TOPIC_ID: "topic_id",
    NAME: "name",
    SLUG: "slug",
    DESCRIPTION: "description",
  },

  RISK_SUMMARY: {
    THEME: "theme",
    R4C_SCORE: "r4c_score",
    R4C_BAND: "r4c_band",
    NOTES: "notes",
  },

  RISK_LINKS: {
    THEME: "theme",
    PMC: "pmcid",
  },

  TEXT_EMBEDDINGS: {
    ID: "id",
    PMC: "pmcid",
    SECTION: "section",
    TITLE: "title",
    YEAR: "year",
    JOURNAL: "journal",
    EMBEDDING: "embedding", // vector(EMBED_DIM)
  },

  DOC_EMBEDDINGS: {
    PMC: "pmcid",
    EMBEDDING: "embedding", // vector(EMBED_DIM)
  },
} as const

//
// ---------- RPCs (if/when you enable them) ----------
//

export const RPC = {
  MATCH_DOCUMENTS: "match_documents", // (query_embedding vector, match_count int)
  MATCH_PASSAGES: "match_passages", // (query_embedding vector, match_count int)
} as const

//
// ---------- Views (materialized or regular) ----------
//

export const VIEWS = {
  TOPIC_SUMMARY: "topic_summary_view",
  EVIDENCE_SUMMARY: "evidence_summary_view",
} as const

//
// ---------- Helpers ----------
//

/** Return all columns for a named group (for select lists). */
export function cols<T extends keyof typeof COLUMNS>(group: T): string[] {
  // @ts-expect-error – Object.values is fine here for simple string maps
  return Object.values(COLUMNS[group])
}

/** Build a select clause from one of the column groups. */
export function selectList<T extends keyof typeof COLUMNS>(group: T): string {
  return cols(group).join(",")
}

/**
 * Build a select string for Supabase queries from a column group
 * Alias for selectList() to maintain compatibility with existing code
 */
export function buildSelectString<T extends keyof typeof COLUMNS>(group: T): string {
  return selectList(group)
}

/** Minimal config snapshot for debugging UI banners. */
export function dataSourcesStatus() {
  return {
    docsTable: TABLES.DOCUMENTS,
    docsPk: COLUMNS.DOCUMENTS.PK,
    embedDim: EMBED_DIM,
    rpc: { ...RPC },
    tables: { ...TABLES },
  }
}

import { createClient } from "@supabase/supabase-js"

/**
 * Server-only Supabase client for data fetching in RSC
 * Uses service role or anon key depending on your setup
 */
function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn("[datasources] Missing Supabase credentials")
    return null
  }

  return createClient(url, key)
}

/**
 * Check if mock mode is enabled
 */
function useMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === "true"
}

const TOPIC_CANDIDATES = [
  "topic",
  "topics",
  "category",
  "categories",
  "subject",
  "domain",
  "area",
  "label",
  "tag",
  "tags",
]

let resolvedTopicColumn: string | null = null

async function resolveTopicColumn(): Promise<string | null> {
  if (resolvedTopicColumn !== null) return resolvedTopicColumn

  const client = getServerClient()
  if (!client) return (resolvedTopicColumn = null)

  for (const col of TOPIC_CANDIDATES) {
    const { data, error } = await client
      .from(TABLES.DOCUMENTS)
      .select(`${col}`)
      .not(col as any, "is", null)
      .limit(1)

    if (!error && Array.isArray(data) && data.length && data[0][col] != null) {
      resolvedTopicColumn = col
      console.log(`[datasources] Resolved topic column: ${col}`)
      return col
    }
  }

  resolvedTopicColumn = null
  return null
}

/**
 * Fetch list of unique topics from documents table
 * Now auto-detects topic column name and handles array/scalar values
 */
export async function dsListTopics(limit = 60): Promise<string[]> {
  if (useMockMode()) {
    return [
      "Radiation Biology",
      "Microgravity Effects",
      "Bone Density Loss",
      "Cardiovascular Adaptation",
      "Immune System Changes",
      "Sleep Disruption",
      "Muscle Atrophy",
      "Vision Impairment",
    ]
  }

  const client = getServerClient()
  if (!client) return []

  const col = await resolveTopicColumn()
  if (!col) {
    console.warn("[dsListTopics] No topic column found")
    return []
  }

  try {
    const { data, error } = await client
      .from(TABLES.DOCUMENTS)
      .select(`${col}`)
      .not(col as any, "is", null)
      .order(col as any, { ascending: true })
      .limit(limit * 5) // get enough to de-dupe

    if (error) {
      console.error("[dsListTopics] Error:", error)
      return []
    }

    const uniq = new Set<string>()
    for (const row of data || []) {
      for (const colName of [
        "topic",
        "topics",
        "category",
        "categories",
        "subject",
        "domain",
        "area",
        "label",
        "tag",
        "tags",
      ]) {
        const v = (row as any)[colName]
        if (!v) continue
        if (Array.isArray(v)) {
          for (const itm of v) if (itm && String(itm).trim()) uniq.add(String(itm).trim())
        } else if (String(v).trim()) {
          uniq.add(String(v).trim())
        }
      }
    }

    return Array.from(uniq).slice(0, limit)
  } catch (err) {
    console.error("[dsListTopics] Exception:", err)
    return []
  }
}

/**
 * Fetch documents for a specific topic
 * Now auto-detects topic column and tries multiple query strategies
 */
export async function dsDocsByTopic(topic: string, limit = 50) {
  if (useMockMode()) {
    return [
      {
        pmcid: "PMC1234567",
        title: "Effects of Microgravity on Human Physiology",
        year: 2023,
        topic,
        organism: "Homo sapiens",
      },
      {
        pmcid: "PMC7654321",
        title: "Long-Duration Spaceflight and Bone Density",
        year: 2022,
        topic,
        organism: "Homo sapiens",
      },
    ]
  }

  const client = getServerClient()
  if (!client) return []

  const col = await resolveTopicColumn()
  if (!col) {
    console.warn("[dsDocsByTopic] No topic column found")
    return []
  }

  const selectFields = `pmcid,title,year,${col},organism_normalized`

  try {
    // Try exact match first
    const exact = await client
      .from(TABLES.DOCUMENTS)
      .select(selectFields)
      .eq(col as any, topic)
      .order("year", { ascending: false })
      .limit(limit)

    if (!exact.error && exact.data?.length) {
      return exact.data
    }

    // If array column, use contains
    const arr = await client
      .from(TABLES.DOCUMENTS)
      .select(selectFields)
      .contains(col as any, [topic])
      .order("year", { ascending: false })
      .limit(limit)

    if (!arr.error && arr.data?.length) {
      return arr.data
    }

    // Fallback ilike
    const ilike = await client
      .from(TABLES.DOCUMENTS)
      .select(selectFields)
      .ilike(col as any, `%${topic}%`)
      .order("year", { ascending: false })
      .limit(limit)

    return ilike.data || []
  } catch (err) {
    console.error("[dsDocsByTopic] Exception:", err)
    return []
  }
}

/**
 * Fetch research gaps
 * Added better error handling and empty array fallback
 */
export async function dsGaps(limit = 60) {
  if (useMockMode()) {
    return [
      {
        id: "G-001",
        gap_id: "GAP001",
        topic: "Radiation Biology",
        organism: "Homo sapiens",
        priority_score: 95,
        mission_impact: "Critical",
        recommended_study: "Long-term radiation exposure effects on DNA repair mechanisms",
        text: "Limited data on cumulative radiation effects during multi-year missions",
        title: "Combined radiation × bone healing unknowns",
        severity: "Critical",
      },
      {
        id: "G-002",
        gap_id: "GAP002",
        topic: "Bone Density Loss",
        organism: "Homo sapiens",
        priority_score: 88,
        mission_impact: "High",
        recommended_study: "Countermeasure effectiveness for extended microgravity exposure",
        text: "Insufficient evidence for bone recovery protocols after 2+ year missions",
        title: "Bone recovery protocols for extended missions",
        severity: "Important",
      },
    ]
  }

  const client = getServerClient()
  if (!client) return []

  const table = process.env.NEXT_PUBLIC_GAPS_TABLE || "gaps"

  try {
    const { data, error } = await client
      .from(table)
      .select("gap_id,topic,organism,priority_score,mission_impact,recommended_study,text")
      .order("priority_score", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[dsGaps] Error:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("[dsGaps] Exception:", err)
    return []
  }
}

/**
 * Fetch knowledge subgraph centered on a claim/node
 */
export async function dsSubgraph(centerId: string, hops = 1) {
  if (useMockMode()) {
    return {
      nodes: [
        { id: centerId, label: "Central Claim", type: "claim" },
        { id: "node2", label: "Related Finding", type: "claim" },
        { id: "node3", label: "Supporting Evidence", type: "evidence" },
      ],
      edges: [
        { source: centerId, target: "node2", relation: "supports" },
        { source: "node2", target: "node3", relation: "cites" },
      ],
    }
  }

  const client = getServerClient()
  if (!client) {
    return { nodes: [], edges: [] }
  }

  try {
    // Try RPC function first if it exists
    const { data: rpcData, error: rpcError } = await client.rpc("fetch_subgraph", {
      center_id: centerId,
      hop: hops,
    })

    if (!rpcError && rpcData) {
      return rpcData
    }

    // Fallback: query claims and edges tables directly
    const { data: claims, error: claimsError } = await client.from(TABLES.CLAIMS).select("*").limit(50)

    if (claimsError) {
      console.error("[dsSubgraph] Claims error:", claimsError)
      return { nodes: [], edges: [] }
    }

    // Simple transformation - in production you'd do proper graph traversal
    const nodes =
      claims?.map((c: any) => ({
        id: c.pmcid || c.subject,
        label: c.claim_text || c.subject,
        type: "claim",
      })) || []

    return { nodes, edges: [] }
  } catch (err) {
    console.error("[dsSubgraph] Exception:", err)
    return { nodes: [], edges: [] }
  }
}
