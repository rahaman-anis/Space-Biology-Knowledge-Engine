import Link from "next/link"
import { dsListTopics } from "@/lib/datasources"
import { Card } from "@/components/ui/Card"
import EmptyState from "@/components/common/EmptyState"

export const revalidate = 60

export default async function EvidenceIndexPage() {
  const topics = await dsListTopics(60)

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-heading text-4xl text-white mb-6">Explore Topics</h1>

      {!topics.length ? (
        <EmptyState
          title="No topics detected"
          suggestions={[
            "Check /api/topics-smoke to see what the app can read",
            "Verify the documents table env points to the right table",
            "Ensure the database has a topic column",
          ]}
          primaryHref="/api/topics-smoke"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topics.map((t) => (
            <Link href={`/evidence/${encodeURIComponent(t)}`} key={t} className="block">
              <Card className="hover:shadow-lg transition-shadow p-6">
                <h3 className="font-heading text-xl text-gray-900 mb-2">{t}</h3>
                <p className="text-sm text-gray-600">Browse evidence</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
