import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { PageLayout } from "@/components/layout/PageLayout"
import EmptyState from "@/components/common/EmptyState"

export const revalidate = 60

async function fetchDoc(id: string) {
  const sb = getSupabaseClient()
  if (!sb) return null
  const table = process.env.NEXT_PUBLIC_SUPABASE_DOCS_TABLE || "documents"
  const { data } = await sb.from(table).select("*").eq("pmcid", id).limit(1)
  return (data && data[0]) || null
}

export default async function DocPage({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id)
  const doc = await fetchDoc(id)

  if (!doc) {
    const externalUrl = /^PMC\d+$/i.test(id) ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${id}/` : `/evidence`

    return (
      <PageLayout
        title="Document not found"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Explore Topics", href: "/evidence" }, { label: id }]}
      >
        <EmptyState
          title={`Document ${id} not found`}
          suggestions={["Check the document ID", "Open the source externally", "Browse all topics"]}
          primaryHref="/evidence"
        />
        {/^PMC\d+$/i.test(id) && (
          <div className="mt-4 text-center">
            <Link
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              Open in PubMed Central
            </Link>
          </div>
        )}
      </PageLayout>
    )
  }

  const externalUrl = /^PMC\d+$/i.test(id) ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${id}/` : null

  return (
    <PageLayout
      title={doc.title || id}
      subtitle={`Year: ${doc.year ?? "—"}`}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Explore Topics", href: "/evidence" }, { label: id }]}
    >
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Document Details</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-600">ID</dt>
              <dd className="text-base text-gray-900 font-mono">{id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Year</dt>
              <dd className="text-base text-gray-900">{doc.year ?? "—"}</dd>
            </div>
            {doc.topic && (
              <div>
                <dt className="text-sm font-medium text-gray-600">Topic</dt>
                <dd className="text-base text-gray-900">{doc.topic}</dd>
              </div>
            )}
            {doc.organism_normalized && (
              <div>
                <dt className="text-sm font-medium text-gray-600">Organism</dt>
                <dd className="text-base text-gray-900">{doc.organism_normalized}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {externalUrl && (
            <Link
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              Open in PubMed Central
            </Link>
          )}
          <Link
            href="/evidence"
            className="px-4 py-2 rounded border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Back to Topics
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
