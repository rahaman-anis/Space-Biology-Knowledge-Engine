"use client"

import { Loader2, AlertTriangle } from "lucide-react"

interface StreamingAnswerProps {
  isStreaming: boolean
  text: string
  error: string | null
}

export function StreamingAnswer({ isStreaming, text, error }: StreamingAnswerProps) {
  if (error) {
    return (
      <div className="rounded-xl border-2 border-destructive bg-destructive/10 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-destructive mb-2">Unable to generate answer</h3>
            <p className="text-sm text-muted-foreground mb-3">{error}</p>
            <p className="text-sm text-foreground font-medium">Showing evidence below.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!text && !isStreaming) {
    return null
  }

  const renderAnswer = () => {
    const lines = text.split("\n").filter(Boolean)
    return lines.map((line, i) => {
      // Check if line starts with **Yes**, **No**, or **Inconclusive**
      const verdictMatch = line.match(/^\*\*(Yes|No|Inconclusive)\*\*/)
      if (verdictMatch) {
        const verdict = verdictMatch[1]
        const rest = line.slice(verdictMatch[0].length).trim()
        return (
          <p key={i} className="mb-3">
            <span className="font-bold text-lg text-primary">{verdict}</span>
            {rest && <span className="ml-2">{rest}</span>}
          </p>
        )
      }

      // Check if line starts with "Sources:"
      if (line.startsWith("Sources:")) {
        return (
          <p key={i} className="mt-4 pt-3 border-t border-border text-sm">
            <span className="font-semibold">Sources:</span>
            <span className="ml-2 font-mono text-xs">{line.slice(8).trim()}</span>
          </p>
        )
      }

      // Regular paragraph with inline [PMCxxxxx] citations
      const parts = line.split(/(\[PMC\d+\])/g)
      return (
        <p key={i} className="mb-2 last:mb-0">
          {parts.map((part, j) => {
            if (part.match(/\[PMC\d+\]/)) {
              return (
                <span key={j} className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                  {part}
                </span>
              )
            }
            return <span key={j}>{part}</span>
          })}
        </p>
      )
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-3">ARIA Response</h3>
          <div className="prose prose-sm max-w-none text-foreground">
            {renderAnswer()}
            {isStreaming && (
              <span className="inline-flex items-center gap-1 text-muted-foreground mt-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">Generating...</span>
              </span>
            )}
          </div>
          {!isStreaming && text && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span>⚠️</span>
                <span>AI-generated summary. Verify with evidence below.</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
