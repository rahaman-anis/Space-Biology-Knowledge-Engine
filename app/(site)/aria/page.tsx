"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import { AriaErrorBoundary } from "@/components/aria/AriaErrorBoundary"
import { ExplanationBox } from "@/components/aria/ExplanationBox"
import { PresetQuestionCard } from "@/components/aria/PresetQuestionCard"
import { SearchFilters } from "@/components/aria/SearchFilters"
import { AnswerCard } from "@/components/aria/AnswerCard"
import { EvidenceAccordion } from "@/components/aria/EvidenceAccordion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/aria/Tabs"
import { searchPassages, askAnswer } from "@/lib/aria/client"
import type { EvidenceRow, SectionType, Confidence } from "@/lib/aria/schema"
import { MessageCircle, Loader2 } from "lucide-react"
import "@/styles/aria.css"

let SmokeTest: React.ComponentType | null = null
if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("test")) {
  import("./_qa/smoke").then((mod) => {
    SmokeTest = mod.SmokeTest
  })
}

function DebugBanner({ lastModel }: { lastModel?: string }) {
  const [show, setShow] = useState(false)
  const [diag, setDiag] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const debug = new URLSearchParams(window.location.search).has("debug")
      setShow(debug)
      if (debug) {
        fetch("/api/aria/diag")
          .then((r) => r.json())
          .then(setDiag)
          .catch(console.error)
      }
    }
  }, [])

  if (!show) return null

  return (
    <div className="mb-4 rounded-lg px-4 py-3 text-sm font-mono bg-blue-50 border-2 border-blue-200">
      <div className="font-semibold text-blue-900">Debug Mode</div>
      <div className="text-xs mt-1 text-blue-800">
        Model used: {lastModel || "(none)"} | Groq key: {diag?.env?.GROQ_API_KEY ? "✓" : "✗"} | Supabase:{" "}
        {diag?.env?.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "✗"}
      </div>
      <div className="text-xs mt-1">
        <a href="/api/aria/diag" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          View full diagnostics →
        </a>
      </div>
    </div>
  )
}

function AriaPageContent() {
  const router = useRouter()
  const params = useSearchParams()
  const initialQuery = params.get("q") ?? ""
  const initialMode = (params.get("mode") as "passages" | "documents") ?? "passages"

  const [query, setQuery] = useState(initialQuery)
  const [mode, setMode] = useState<"passages" | "documents">(initialMode)
  const [results, setResults] = useState<EvidenceRow[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAnswering, setIsAnswering] = useState(false)
  const [answerText, setAnswerText] = useState("")
  const [answerError, setAnswerError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeTab, setActiveTab] = useState<"ask" | "search">("ask")
  const [emptyQueryError, setEmptyQueryError] = useState(false)
  const [searchHint, setSearchHint] = useState<string | null>(null)
  const [searchExamples, setSearchExamples] = useState<string[]>([])

  const [section, setSection] = useState<SectionType | "All">("All")
  const [confidence, setConfidence] = useState<Confidence | "All">("All")
  const [sort, setSort] = useState<"Relevance" | "Confidence" | "Year">("Relevance")

  const [lastModel, setLastModel] = useState<string>()

  const updateUrl = (q: string, m: "passages" | "documents") => {
    const sp = new URLSearchParams()
    sp.set("q", q)
    sp.set("mode", m)
    router.replace(`/aria?${sp.toString()}`, { scroll: false })
  }

  const handleSearch = async (q: string, m: "passages" | "documents") => {
    if (!q.trim()) {
      setEmptyQueryError(true)
      return
    }
    setEmptyQueryError(false)
    setSearchHint(null)
    setSearchExamples([])
    setIsSearching(true)
    setHasSearched(true)
    setMode(m)
    updateUrl(q, m)

    const result = await searchPassages({ q: q.trim(), mode: m, topK: 20, section, confidence, sort })
    if (result.ok) {
      setResults(result.results)
      if (result.hint) setSearchHint(result.hint)
      if (result.examples) setSearchExamples(result.examples)
    } else {
      console.error("[v0] Search failed:", result.error)
      setResults([])
    }
    setIsSearching(false)
  }

  const handleAskAria = async (question: string) => {
    if (!question.trim()) {
      setEmptyQueryError(true)
      return
    }
    setEmptyQueryError(false)
    setQuery(question)
    setAnswerText("")
    setAnswerError(null)
    setSearchHint(null)
    setSearchExamples([])
    setIsAnswering(true)
    setActiveTab("ask")
    setHasSearched(true)

    const result = await askAnswer(question.trim())

    setIsAnswering(false)
    if (result.ok) {
      setAnswerText(result.answer)
      setResults(result.evidence)
      setLastModel(result.model)
    } else {
      const errorMsg = result.error || "Unknown error"
      if (errorMsg.includes("model_not_found") || errorMsg.includes("model")) {
        setAnswerError(
          `Unable to generate answer — ${errorMsg}. Try setting GROQ_MODEL to one of: llama-3.3-70b-versatile, llama-3.3-8b-instant, openai/gpt-oss-20b. Showing evidence below.`,
        )
      } else {
        setAnswerError(`Unable to generate answer — ${errorMsg}`)
      }
      handleSearch(question, "passages")
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (activeTab === "ask") {
      handleAskAria(query)
    } else {
      handleSearch(query, mode)
    }
  }

  useEffect(() => {
    const q = initialQuery.trim()
    if (q && !hasSearched) {
      handleAskAria(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const searchExamplesDefault = [
    "microgravity bone resorption RANKL Results",
    "ISS T-cell dysfunction latent virus Results",
    "unloading muscle mitochondrial dysfunction ARED Discussion",
  ]

  return (
    <div className="min-h-screen aria-gradient-bg">
      <header className="max-w-7xl mx-auto px-4 md:px-6 pt-10 pb-6">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Ask ARIA" }]} />
        <DebugBanner lastModel={lastModel} />
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="ask">🤖 Ask ARIA</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="ask">
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
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setEmptyQueryError(false)
                    }}
                    placeholder="Ask a question about space biology evidence…"
                    rows={2}
                    className="w-full pl-14 pr-36 py-5 text-lg rounded-xl border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-200 transition-all resize-none"
                    disabled={isSearching || isAnswering}
                  />
                  <MessageCircle className="absolute left-5 top-6 w-7 h-7 text-gray-400" />
                  <button
                    type="submit"
                    disabled={isSearching || isAnswering}
                    className="absolute right-3 top-3 px-7 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2 text-base"
                  >
                    {isSearching || isAnswering ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Analyzing…
                      </>
                    ) : (
                      "Ask"
                    )}
                  </button>
                </form>
                {emptyQueryError && (
                  <p className="mt-3 text-sm text-orange-600">Enter a question or try an example below.</p>
                )}
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

              {isAnswering && !answerText && (
                <div className="text-center py-12">
                  <Loader2 className="inline-block animate-spin w-16 h-16 text-blue-600 mb-4" />
                  <p className="text-xl text-gray-700">🤔 Analyzing evidence across 572 publications…</p>
                </div>
              )}

              {hasSearched && <AnswerCard isStreaming={isAnswering} text={answerText} error={answerError} />}

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
                            setQuery(ex)
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

              {hasSearched && !isSearching && <EvidenceAccordion results={results} />}

              {hasSearched && isSearching && (
                <div className="text-center py-16">
                  <Loader2 className="inline-block animate-spin w-16 h-16 text-blue-600" />
                  <p className="text-xl text-gray-700 mt-4">Searching evidence…</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="search">
            <div className="space-y-8 mt-6">
              {!hasSearched && (
                <ExplanationBox
                  variant="search"
                  title="Search"
                  subtitle="Traditional keyword search"
                  body="Traditional keyword search across section-tagged evidence spans. Use this when you want to browse specific topics or filter by paper section without AI synthesis. Results show exact matches from paper sections with confidence scores."
                />
              )}

              <div className="bg-white rounded-2xl aria-card-shadow-lg p-8 border-2 border-gray-200">
                <div className="flex gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setMode("passages")}
                    className={`px-6 py-3 rounded-xl font-bold transition-colors text-base ${
                      mode === "passages" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Passages
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("documents")}
                    className={`px-6 py-3 rounded-xl font-bold transition-colors text-base ${
                      mode === "documents" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Documents
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setEmptyQueryError(false)
                    }}
                    placeholder="Search for evidence spans or full papers..."
                    className="w-full h-16 pl-14 pr-36 text-lg rounded-xl border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-200 transition-all"
                    disabled={isSearching}
                  />
                  <MessageCircle className="absolute left-5 top-5 w-7 h-7 text-gray-400" />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="absolute right-3 top-3 px-7 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2 text-base"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Searching…
                      </>
                    ) : (
                      "Search"
                    )}
                  </button>
                </form>
                {emptyQueryError && (
                  <p className="mt-3 text-sm text-orange-600">Enter a question or try an example below.</p>
                )}
              </div>

              {!hasSearched && (
                <div className="space-y-3">
                  <p className="text-base text-gray-700 font-semibold">
                    Clickable examples (monospace, copy-on-hover, auto-submit on click):
                  </p>
                  <div className="grid gap-3">
                    {searchExamplesDefault.map((kw, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQuery(kw)
                          handleSearch(kw, mode)
                        }}
                        className="text-left px-5 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-base font-mono text-gray-900 transition-colors"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                            setQuery(ex)
                            handleSearch(ex, mode)
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

              {hasSearched && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                  <div>
                    {isSearching ? (
                      <div className="text-center py-16">
                        <Loader2 className="inline-block animate-spin w-16 h-16 text-blue-600" />
                        <p className="text-xl text-gray-700 mt-4">Searching evidence…</p>
                      </div>
                    ) : (
                      <EvidenceAccordion results={results} />
                    )}
                  </div>

                  <aside>
                    <SearchFilters
                      section={section}
                      confidence={confidence}
                      sort={sort}
                      onSectionChange={setSection}
                      onConfidenceChange={setConfidence}
                      onSortChange={setSort}
                    />
                  </aside>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {SmokeTest && <SmokeTest />}
    </div>
  )
}

export default function AriaPage() {
  return (
    <AriaErrorBoundary>
      <AriaPageContent />
    </AriaErrorBoundary>
  )
}
