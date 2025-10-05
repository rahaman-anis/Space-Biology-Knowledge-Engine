import { fetchSubgraph } from "@/lib/fetchers"
import { ForceGraph } from "@/components/graph/ForceGraph"
import EmptyState from "@/components/common/EmptyState"

export const revalidate = 60

export default async function GraphPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q
  const { nodes, edges, meta } = await fetchSubgraph({ q, limit: 200 })

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <header>
        <h1 className="font-heading text-4xl text-white">Knowledge Subgraphs</h1>
        <p className="text-gray-200 mt-2">
          Visualize relationships across the evidence corpus{q ? ` for "${q}"` : ""}.
        </p>
      </header>

      {!nodes.length ? (
        <EmptyState
          title="No graph data"
          suggestions={[
            "Try a different topic (e.g., q=bone)",
            "Verify graph views via /api/graph-smoke?q=bone",
            "Check NEXT_PUBLIC_GRAPH_* env table names",
          ]}
          actions={[
            {
              label: "Open graph smoke",
              variant: "primary",
              onClick: () => {
                window.location.href = "/api/graph-smoke?q=bone"
              },
            },
          ]}
        />
      ) : (
        <>
          <ForceGraph nodes={nodes} edges={edges} />
          <p className="text-xs text-gray-300">
            Nodes: {meta?.count?.nodes ?? nodes.length} • Edges: {meta?.count?.edges ?? edges.length}{" "}
            {q ? `• Filter: "${q}"` : ""}
          </p>
        </>
      )}
    </section>
  )
}
