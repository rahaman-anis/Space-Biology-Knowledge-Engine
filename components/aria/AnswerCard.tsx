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
    const keyFindings: string[] = []
    const mechanisticInsight = ""
    const evidenceGaps = ""
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

    return { verdict, keyFindings, mechanisticInsight, evidenceGaps, sources }
  }

  const { verdict, keyFindings, sources } = parseAnswer()

  // Render inline citations
  const renderTextWithCitations = (text: string) => {
    const parts = text.split(/(\[PMC\d+(?:,\s*[A-Za-z]+)?\])/g)
    return parts.map((part, i) => {
      if (part.match(/\[PMC\d+/)) {
        return (
          <span key={i} className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            {part}
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

      {/* Disclaimer */}
      {!isStreaming && text && (
        <div className="pt-4 border-t-2 border-gray-200">
          <p className="text-sm text-gray-600 italic flex items-center gap-2">
            <span>⚠️</span>
            <span>AI-generated summary. Verify with evidence below.</span>
          </p>
        </div>
      )}
    </div>
  )
}

export default AnswerCard
