"use client"

import * as React from "react"
import { createBrowserClient } from "@supabase/ssr"
import { SubgraphCanvas, type Node, type Edge, type Relation } from "./SubgraphCanvas"
import { TABLES, COLUMNS } from "@/lib/datasources"
import { Skeleton } from "@/components/ui/Skeleton"
import { Alert } from "@/components/ui/Alert"

interface MechanismRow {
  source: string
  target: string
  relation: string
  predicate: string | null
  evidence: string | null
  section: string | null
  confidence: number | null
}

interface MechanismGraphProps {
  /** Optional filter by pmcid to show mechanisms from specific document */
  pmcid?: string
  /** Maximum number of edges to display */
  maxElements?: number
  /** Filter type: all or contradictions only */
  filter?: "all" | "contradictions"
  /** Seed for deterministic layout */
  seed?: number
  /** Callback when edge is focused */
  onEdgeFocus?: (edgeId: string) => void
}

/**
 * MechanismGraph Component
 *
 * Fetches mechanism data from Supabase and renders an interactive graph
 * showing relationships between biological entities (genes, proteins, pathways).
 */
export function MechanismGraph({
  pmcid,
  maxElements = 30,
  filter = "all",
  seed = 42,
  onEdgeFocus,
}: MechanismGraphProps) {
  const [nodes, setNodes] = React.useState<Node[]>([])
  const [edges, setEdges] = React.useState<Edge[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchMechanisms() {
      try {
        setLoading(true)
        setError(null)

        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        // Build query
        const query = supabase
          .from(TABLES.MECHANISMS)
          .select(
            `${COLUMNS.MECHANISMS.SOURCE},
             ${COLUMNS.MECHANISMS.TARGET},
             ${COLUMNS.MECHANISMS.RELATION},
             ${COLUMNS.MECHANISMS.PREDICATE},
             ${COLUMNS.MECHANISMS.EVIDENCE},
             ${COLUMNS.MECHANISMS.SECTION},
             ${COLUMNS.MECHANISMS.CONFIDENCE}`,
          )
          .order(COLUMNS.MECHANISMS.CONFIDENCE, { ascending: false, nullsLast: true })
          .limit(maxElements * 2) // Fetch more to account for filtering

        // Optional: filter by pmcid if provided
        // Note: mechanisms table doesn't have pmcid column in datasources.ts
        // If you need pmcid filtering, you'll need to add it to the schema

        const { data, error: fetchError } = await query

        if (fetchError) {
          throw new Error(`Failed to fetch mechanisms: ${fetchError.message}`)
        }

        if (!data || data.length === 0) {
          setNodes([])
          setEdges([])
          setLoading(false)
          return
        }

        // Transform data to nodes and edges
        const mechanismData = data as MechanismRow[]
        const nodeMap = new Map<string, Node>()
        const edgeList: Edge[] = []

        mechanismData.forEach((mech, idx) => {
          // Add source node
          if (!nodeMap.has(mech.source)) {
            nodeMap.set(mech.source, {
              id: mech.source,
              label: mech.source,
            })
          }

          // Add target node
          if (!nodeMap.has(mech.target)) {
            nodeMap.set(mech.target, {
              id: mech.target,
              label: mech.target,
            })
          }

          // Map relation to SubgraphCanvas relation type
          let relationType: Relation = "cites" // default
          const relationLower = mech.relation.toLowerCase()

          if (
            relationLower.includes("support") ||
            relationLower.includes("activate") ||
            relationLower.includes("upregulate") ||
            relationLower.includes("enhance")
          ) {
            relationType = "supports"
          } else if (
            relationLower.includes("contradict") ||
            relationLower.includes("inhibit") ||
            relationLower.includes("downregulate") ||
            relationLower.includes("suppress")
          ) {
            relationType = "contradicts"
          }

          // Create edge
          edgeList.push({
            id: `edge-${idx}`,
            source: mech.source,
            target: mech.target,
            relation: relationType,
            snippet: mech.evidence || mech.predicate || undefined,
          })
        })

        setNodes(Array.from(nodeMap.values()))
        setEdges(edgeList)
      } catch (err) {
        console.error("[MechanismGraph] Error fetching mechanisms:", err)
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchMechanisms()
  }, [pmcid, maxElements])

  if (loading) {
    return <Skeleton className="w-full h-[500px]" />
  }

  if (error) {
    return (
      <Alert variant="error" title="Failed to load mechanism graph">
        {error}
      </Alert>
    )
  }

  if (nodes.length === 0 || edges.length === 0) {
    return (
      <Alert variant="info" title="No mechanisms found">
        No mechanism data available to display.
      </Alert>
    )
  }

  return (
    <SubgraphCanvas
      nodes={nodes}
      edges={edges}
      filter={filter}
      maxElements={maxElements}
      seed={seed}
      onEdgeFocus={onEdgeFocus}
    />
  )
}
