"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MessageCircle, Loader2 } from "lucide-react"
import { ExplanationBox } from "./ExplanationBox"
import { PresetQuestionCard } from "./PresetQuestionCard"
import { AnswerCard } from "./AnswerCard"
import { EvidenceAccordion } from "./EvidenceAccordion"
import { askAnswer } from "@/lib/aria/client"
import type { EvidenceRow } from "@/lib/aria/schema"

export function AskPane() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loadingAnswer, setLoadingAnswer] = useState(false)
  const [evidences, setEvidences] = useState<EvidenceRow[]>([])
  const [answerError, setAnswerError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [emptyQueryError, setEmptyQueryError] = useState(false)
  const [searchHint, setSearchHint] = useState<string | null>(null)
  const [searchExamples, setSearchExamples] = useState<string[]>([])

  useEffect(() => {
    setEvidences([])
    setAnswer("")
  }, [])

  const handleAskAria = async (q: string) => {
    if (!q.trim()) {
      setEmptyQueryError(true)
      return
    }

    setEmptyQueryError(false)
    setQuestion(q)
    setAnswer("")
    setAnswerError(null)
    setSearchHint(null)
    setSearchExamples([])
    setLoadingAnswer(true)
    setHasSearched(true)

    console.log("[v0] AskPane: Calling askAnswer with question:", q)

    const result = await askAnswer(q.trim())

    setLoadingAnswer(false)
    if (result.ok) {
      console.log("[v0] AskPane: Answer received, evidence count:", result.evidence.length)
      setAnswer(result.answer)
      setEvidences(result.evidence)
    } else {
      console.log("[v0] AskPane: Error:", result.error)
      const errorMsg = result.error || "Unknown error"
      if (errorMsg.includes("model_not_found") || errorMsg.includes("model")) {
        setAnswerError(
          `Unable to generate answer — ${errorMsg}. Try setting GROQ_MODEL to one of: llama-3.3-70b-versatile, llama-3.3-8b-instant, openai/gpt-oss-20b. Showing evidence below.`,
        )
      } else {
        setAnswerError(`Unable to generate answer — ${errorMsg}`)
      }
      // If answer fails but we have hint/examples, show them
      if (errorMsg.includes("No evidence found")) {
        setSearchHint("No evidence found. Try different keywords or check the examples below.")
      }
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleAskAria(question)
  }

  return (
    <div className="space-y-8 mt-6">
      {!hasSearched && (
        <ExplanationBox
          variant="ask"
          title="Ask ARIA"
          subtitle="Artemis Research Intelligence Assistant"
          body="Get AI-powered answers synthesized from NASA space biology research. ARIA searches 2,165 evidence spans across 572 publications, prioritizing [Results] sections for validated findings and [Discussion] sections for gaps."
          features={[
            "Natural language answers with source citations",
            "Section-aware retrieval (prioritizes Results)",
            "Confidence scoring on every source",
            "Direct PMC links for verification",
          ]}
        />
      )}

      <div className="bg-white rounded-2xl aria-card-shadow-lg p-8 border-2 border-gray-200">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value)
              setEmptyQueryError(false)
            }}
            placeholder="Ask a question about space biology evidence…"
            rows={2}
            className="w-full pl-14 pr-36 py-5 text-lg rounded-xl border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-200 transition-all resize-none"
            disabled={loadingAnswer}
          />
          <MessageCircle className="absolute left-5 top-6 w-7 h-7 text-gray-400" />
          <button
            type="submit"
            disabled={loadingAnswer}
            className="absolute right-3 top-3 px-7 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2 text-base"
          >
            {loadingAnswer ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing…
              </>
            ) : (
              "Ask"
            )}
          </button>
        </form>
        {emptyQueryError && <p className="mt-3 text-sm text-orange-600">Enter a question or try an example below.</p>}
      </div>

      {!hasSearched && (
        <div className="space-y-4">
          <PresetQuestionCard
            emoji="🦴"
            question="Does microgravity increase bone resorption?"
            subtitle="RANKL pathways"
            fullQuestion="Does microgravity increase bone resorption? What are the mechanisms and what evidence exists for countermeasures?"
            borderColor="bone"
            onSelect={handleAskAria}
          />
          <PresetQuestionCard
            emoji="🛡️"
            question="What happens to T-cells in long missions?"
            subtitle="immune dysfunction"
            fullQuestion="What happens to T-cells during long-duration space missions? What evidence exists for immune system dysfunction?"
            borderColor="immune"
            onSelect={handleAskAria}
          />
          <PresetQuestionCard
            emoji="💪"
            question="Why do muscles atrophy in 0g—and can ARED help?"
            subtitle="countermeasures"
            fullQuestion="Why do muscles atrophy in microgravity and can the Advanced Resistive Exercise Device (ARED) help prevent muscle loss?"
            borderColor="muscle"
            onSelect={handleAskAria}
          />
        </div>
      )}

      {loadingAnswer && !answer && (
        <div className="text-center py-12">
          <Loader2 className="inline-block animate-spin w-16 h-16 text-blue-600 mb-4" />
          <p className="text-xl text-gray-700">🤔 Analyzing evidence across 572 publications…</p>
        </div>
      )}

      {hasSearched && <AnswerCard isStreaming={loadingAnswer} text={answer} error={answerError} />}

      {hasSearched && searchHint && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <p className="text-orange-900 font-semibold mb-3">{searchHint}</p>
          {searchExamples.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-orange-800 font-semibold">Try these examples:</p>
              {searchExamples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuestion(ex)
                    handleAskAria(ex)
                  }}
                  className="block w-full text-left px-4 py-3 bg-white hover:bg-orange-100 rounded-lg text-sm font-mono text-gray-900 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {hasSearched && <EvidenceAccordion results={evidences} />}
    </div>
  )
}
