import { dsDocsByTopic } from "@/lib/datasources"
import { canonicalizeTopic } from "@/lib/topics"
import { PageLayout } from "@/components/layout/PageLayout"
import EvidenceTable from "@/components/table/EvidenceTable"
import EmptyState from "@/components/common/EmptyState"

export const revalidate = 60

function log(...args: any[]) {
  if (process.env.NEXT_PUBLIC_LOG_QUERIES === "true") console.info("[evidence-topic]", ...args)
}

export default async function TopicPage({ params }: { params: { topic: string } }) {
  const raw = decodeURIComponent(params.topic || "")
  const canon = await canonicalizeTopic(raw)
  log("input=", raw, "normalized=", canon.normalized, "matchType=", canon.matchType, "canonical=", canon.canonical)

  const topicForQuery = canon.canonical ?? raw // fall back to raw if we didn't find a canonical match
  const rows = await dsDocsByTopic(topicForQuery, 80)
  const count = rows.length

  return (
    <PageLayout
      title={topicForQuery}
      subtitle={`${count} studies found in the evidence corpus`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Explore Topics", href: "/evidence" },
        { label: topicForQuery },
      ]}
      background="gray"
    >
      {canon.canonical && canon.canonical.toLowerCase() !== raw.toLowerCase() && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            Matched <strong>"{raw}"</strong> to <strong>"{canon.canonical}"</strong> ({canon.matchType} match)
          </p>
        </div>
      )}

      {count ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <EvidenceTable
            rows={rows.map((r) => ({
              id: r.pmcid,
              sourceId: r.pmcid,
              section: "Results" as const,
              confidence: "High" as const,
              date: r.year ? String(r.year) + "-01-01" : "",
              title: r.title || "(untitled)",
            }))}
            showActions={true}
          />
        </div>
      ) : (
        <EmptyState
          title="No evidence found"
          suggestions={[
            `Try a broader or alternate spelling (we matched "${topicForQuery}" from "${raw}")`,
            "Open /api/topics-smoke to see available topics",
            "Browse all gaps for this area",
          ]}
          primaryHref="/gaps"
        />
      )}
    </PageLayout>
  )
}
