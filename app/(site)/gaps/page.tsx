import { dsGaps } from "@/lib/datasources"
import { PageLayout } from "@/components/layout/PageLayout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import EmptyState from "@/components/common/EmptyState"

export const revalidate = 60

function log(...a: any[]) {
  if (process.env.NEXT_PUBLIC_LOG_QUERIES === "true") console.info("[gaps]", ...a)
}

export default async function GapsPage() {
  const gaps = await dsGaps(60)
  log("count=", gaps.length)

  return (
    <PageLayout
      title="Research Gaps"
      subtitle="Mission-critical unknowns identified across the evidence corpus"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Identify Gaps" }]}
    >
      {!gaps.length ? (
        <EmptyState
          title="No gaps available"
          suggestions={[
            'Verify NEXT_PUBLIC_GAPS_TABLE (defaults to "gaps")',
            "Open /api/gaps-smoke to confirm access",
            "Check database connection and table configuration",
          ]}
          primaryHref="/api/gaps-smoke"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gaps.map((gap: any) => (
            <Card key={gap.gap_id} elevation="e2">
              <CardHeader>
                <CardTitle className="text-xl">{gap.recommended_study || gap.gap_id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-700">
                  {gap.topic && (
                    <p>
                      <span className="font-semibold">Topic:</span> {gap.topic}
                    </p>
                  )}
                  {gap.organism && (
                    <p>
                      <span className="font-semibold">Organism:</span> {gap.organism}
                    </p>
                  )}
                  {gap.priority_score && (
                    <p>
                      <span className="font-semibold">Priority:</span> {gap.priority_score}
                    </p>
                  )}
                  {gap.mission_impact && (
                    <p>
                      <span className="font-semibold">Mission Impact:</span> {gap.mission_impact}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
