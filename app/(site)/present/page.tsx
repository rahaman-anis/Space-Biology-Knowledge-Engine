"use client"

import { useState } from "react"
import ScenarioCard from "@/components/present/ScenarioCard"
import HotkeysOverlay from "@/components/present/HotkeysOverlay"

export default function PresentPage() {
  const [warming, setWarming] = useState(false)
  const [status, setStatus] = useState<string>("")

  async function warm() {
    setWarming(true)
    setStatus("Warming caches…")
    try {
      // Ping health + endpoints
      await fetch("/api/health", { cache: "no-store" })
      // Pre-run typical searches to prime Vercel/Supabase edges
      await fetch("/api/search-passages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "bone loss microgravity", k: 8 }),
      })
      await fetch("/api/search-passages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "radiation dna damage", k: 8 }),
      })
      setStatus("Ready. Caches primed.")
    } catch (e: any) {
      setStatus(`Warm-up error: ${e?.message ?? "unknown"}`)
    } finally {
      setWarming(false)
    }
  }

  function hardReset() {
    try {
      localStorage.removeItem("lifelens_brief")
      localStorage.removeItem("chat_sessions")
      setStatus("Local state cleared.")
    } catch {
      setStatus("Couldn't clear local state (sandboxed).")
    }
  }

  function openAria(q: string) {
    window.location.href = `/aria?q=${encodeURIComponent(q)}`
  }

  function openEvidence(topic: string, params?: Record<string, string>) {
    const qp = new URLSearchParams(params ?? {}).toString()
    window.location.href = `/evidence/${encodeURIComponent(topic)}${qp ? `?${qp}` : ""}`
  }

  function openGraph(topic: string) {
    window.location.href = `/graph?topic=${encodeURIComponent(topic)}&contradictionsOnly=true`
  }

  return (
    <main id="main" className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-h1 text-gray-900">Presenter Mode</h1>
          <p className="text-body text-gray-700">
            Run a deterministic demo with prewarmed queries. Press{" "}
            <kbd className="px-1 py-0.5 bg-gray-100 rounded">⌘</kbd>+
            <kbd className="px-1 py-0.5 bg-gray-100 rounded">K</kbd> for hotkeys.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={warm}
            disabled={warming}
            className="rounded bg-primary-600 text-white px-4 py-2 focus:ring-2 focus:ring-primary-300 disabled:opacity-50"
          >
            {warming ? "Warming…" : "Warm caches"}
          </button>
          <button
            onClick={hardReset}
            className="rounded border-2 border-primary-600 text-primary-600 px-4 py-2 hover:bg-primary-600 hover:text-white focus:ring-2 focus:ring-primary-300"
          >
            Reset local state
          </button>
        </div>
      </div>

      {status && <div className="rounded border border-gray-200 bg-white p-3 text-caption text-gray-800">{status}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScenarioCard
          title="Q1 — Bone loss (ISS)"
          subtitle="ARIA with section-tagged citations"
          onRun={() => openAria("What evidence exists for bone loss in microgravity?")}
        />
        <ScenarioCard
          title="Q2 — Radiation → DNA"
          subtitle="ARIA contradictions + compare"
          onRun={() => openAria("Show contradictions about radiation-induced DNA damage in LEO vs Mars")}
        />
        <ScenarioCard
          title="Browse — Evidence: Bone loss"
          subtitle="Evidence table (compact density, sorting)"
          onOpen={() => openEvidence("bone-loss", { organism: "Human", density: "compact" })}
        />
        <ScenarioCard
          title="Graph — Contradictions view"
          subtitle="Subgraph pruned to contradicting edges"
          onOpen={() => openGraph("bone loss")}
        />
        <ScenarioCard
          title="Gaps — Quick filter"
          subtitle="Open research gaps for muscle atrophy"
          onOpen={() => (window.location.href = "/gaps?topic=muscle")}
        />
      </div>

      <div className="text-caption text-gray-600">
        Tip: If anything feels slow, press <strong>Warm caches</strong> first, then re-run scenarios.
      </div>

      <HotkeysOverlay />
    </main>
  )
}
