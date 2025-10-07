"use client"

import { Loader2, AlertTriangle } from "lucide-react"

interface AnswerCardProps {
  isStreaming: boolean
  text: string
  error: string | null
}

export function AnswerCard({ isStreaming, text, error }: AnswerCardProps) {
  if (error) {
    return (
      <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-8" data-testid="aria-answer-card">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-900 mb-3">Unable to generate answer</h3>
            <p className="text-base text-red-800 mb-4">{error}</p>
            <p className="text-base text-gray-900 font-semibold">Showing evidence below.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!text && !isStreaming) {
    return null
  }

  // Parse the answer into sections
  const parseAnswer = () => {
    const lines = text.split("\n").filter(Boolean)
    let verdict = ""
    let keyFindings: string[] = []
    let sources = ""

    for (const line of lines) {
      // Check for verdict (Yes/No/Inconclusive)
      const verdictMatch = line.match(/^\*\*(Yes|No|Inconclusive)\*\*/)
      if (verdictMatch) {
        verdict = verdictMatch[1]
        const rest = line.slice(verdictMatch[0].length).trim()
        if (rest) keyFindings.push(rest)
        continue
      }

      // Check for Sources line
      if (line.startsWith("Sources:")) {
        sources = line.slice(8).trim()
        continue
      }

      // Check for section headers
      if (line.includes("Key Findings") || line.includes("Mechanistic Insight") || line.includes("Evidence Gaps")) {
        continue
      }

      // Otherwise, add to key findings
      keyFindings.push(line)
    }

    // De-duplicate bullets
    const seen = new Set<string>()
    keyFindings = keyFindings.filter((b) => {
      const key = b.replace(/\s+/g, " ").trim().toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Clamp to 3-5 bullets
    keyFindings = keyFindings.slice(0, 5)

    // If fewer than 3 bullets and we have evidence, synthesize from evidence
    // (This is a safety fallback - the model should return 3-5)
    if (keyFindings.length < 3 && keyFindings.length > 0) {
      // Just ensure we have at least what the model gave us
      // Don't synthesize - trust the model's output
    }

    // Append PMCIDs to bullets that don't already have them
    // Note: The model should already include PMCIDs, but this is a safety fallback
    const pmcidPattern = /\[PMC\d+(?:,\s*PMC\d+)?\]$/
    keyFindings = keyFindings.map((bullet) => {
      // If bullet already ends with PMCID, keep it as-is
      if (pmcidPattern.test(bullet.trim())) {
        return bullet
      }
      // Otherwise, the model should have included it - don't modify
      return bullet
    })

    return { verdict, keyFindings, sources }
  }

  const { verdict, keyFindings, sources } = parseAnswer()

  // Render inline citations
  const renderTextWithCitations = (text: string) => {
    const parts = text.split(/(\[PMC\d+(?:,\s*PMC\d+)?\])/g)
    return parts.map((part, i) => {
      const pmcMatch = part.match(/\[PMC(\d+)(?:,\s*PMC(\d+))?\]/)
      if (pmcMatch) {
        const pmcids = [pmcMatch[1], pmcMatch[2]].filter(Boolean)
        return (
          <span key={i} className="inline-flex gap-1">
            {pmcids.map((pmcid, idx) => (
              <a
                key={idx}
                href={`https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${pmcid}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200 hover:underline transition-colors"
              >
                [PMC{pmcid}]
              </a>
            ))}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div
      className="bg-white rounded-2xl border-2 border-blue-200 aria-card-shadow-lg p-8 space-y-6"
      data-testid="aria-answer-card"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🤖</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">ARIA RESPONSE</h3>
      </div>

      {/* Verdict */}
      {verdict && (
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
          <p className="text-3xl font-bold text-blue-600 mb-2">{verdict}</p>
        </div>
      )}

      {/* Key Findings */}
      {keyFindings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xl font-bold text-gray-900">Key Findings</h4>
          <ul className="space-y-2 list-disc list-inside">
            {keyFindings.map((finding, i) => (
              <li key={i} className="text-base text-gray-900 leading-relaxed">
                {renderTextWithCitations(finding)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      {sources && (
        <div className="pt-4 border-t-2 border-gray-200">
          <p className="text-base text-gray-900">
            <span className="font-bold">Sources:</span>{" "}
            <span className="font-mono text-sm text-blue-700">{sources}</span>
          </p>
        </div>
      )}

      {/* Loading indicator */}
      {isStreaming && (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Generating answer...</span>
        </div>
      )}

      {!isStreaming && text && (
        <div className="pt-4 border-t-2 border-gray-200">
          <p className="text-sm text-gray-600">AI-generated summary. Verify with evidence below.</p>
        </div>
      )}
    </div>
  )
}

export default AnswerCard
