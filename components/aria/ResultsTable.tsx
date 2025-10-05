import Link from "next/link"
import { ExternalLink } from "lucide-react"

interface PassageResult {
  type: "passage"
  pmcid: string
  section: string
  score: number
  snippet: string
}

interface DocumentResult {
  type: "document"
  title: string
  pmcid: string
  year: number
  score: number
}

type Result = PassageResult | DocumentResult

interface ResultsTableProps {
  results: Result[]
  mode: "passages" | "documents"
}

function level(score: number): { label: string; color: string } {
  if (score >= 0.8)
    return { label: "High", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" }
  if (score >= 0.6)
    return { label: "Medium", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" }
  return { label: "Low", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" }
}

function sectionBadge(section: string): string {
  const m: Record<string, string> = {
    Results: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Discussion: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  }
  return m[section] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
}

const pmcUrl = (pmcid: string) => `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`

export function ResultsTable({ results, mode }: ResultsTableProps) {
  if (!results?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No results found. Try a different query.</p>
      </div>
    )
  }

  if (mode === "passages") {
    return (
      <div className="space-y-4">
        {(results as PassageResult[]).map((r, i) => {
          const conf = level(r.score)
          return (
            <article
              key={`${r.pmcid}-${i}`}
              className="bg-card rounded-xl p-6 shadow border border-border"
              aria-label="Evidence result"
            >
              <header className="flex items-start justify-between mb-3 gap-4">
                <div className="flex gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${sectionBadge(r.section)}`}>
                    [{r.section}]
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${conf.color}`}>
                    {conf.label} Confidence
                  </span>
                </div>
                <Link
                  href={pmcUrl(r.pmcid)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline text-sm font-semibold whitespace-nowrap"
                  aria-label={`Open ${r.pmcid} in new tab`}
                >
                  {r.pmcid}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </header>
              <p className="text-base text-foreground leading-relaxed">{r.snippet}</p>
              <div className="mt-3 text-sm text-muted-foreground">Similarity: {(r.score * 100).toFixed(1)}%</div>
            </article>
          )
        })}
      </div>
    )
  }

  // documents
  return (
    <div className="space-y-3">
      {(results as DocumentResult[]).map((r, i) => {
        const conf = level(r.score)
        return (
          <article
            key={`${r.pmcid}-${i}`}
            className="bg-card rounded-xl p-6 shadow border border-border flex items-center justify-between gap-4"
            aria-label="Document result"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">{r.title}</h3>
              <div className="flex gap-3 items-center text-sm text-muted-foreground flex-wrap">
                <span>Year: {r.year}</span>
                <span aria-hidden>•</span>
                <span className={`px-2 py-1 rounded ${conf.color} text-xs font-semibold`}>{conf.label} Relevance</span>
              </div>
            </div>
            <Link
              href={pmcUrl(r.pmcid)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline font-semibold whitespace-nowrap"
              aria-label="View paper in PMC"
            >
              View Paper
              <ExternalLink className="w-4 h-4" />
            </Link>
          </article>
        )
      })}
    </div>
  )
}
