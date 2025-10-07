"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import { AriaErrorBoundary } from "@/components/aria/AriaErrorBoundary"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/aria/Tabs"
import { AskPane } from "@/components/aria/AskPane"
import { SearchPane } from "@/components/aria/SearchPane"
import "@/styles/aria.css"

let SmokePanel: React.ComponentType | null = null
if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug")) {
  import("./_dev/SmokePanel")
    .then((mod) => {
      SmokePanel = mod.SmokePanel
    })
    .catch(() => {
      // SmokePanel not available yet
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
  const initialTab = (params.get("tab") as "ask" | "search") ?? "ask"

  const [activeTab, setActiveTab] = useState<"ask" | "search">(initialTab)

  const handleTabChange = (newTab: string) => {
    console.log("[v0] Tab changed to:", newTab)
    setActiveTab(newTab as "ask" | "search")
    const sp = new URLSearchParams(window.location.search)
    sp.set("tab", newTab)
    router.replace(`/aria?${sp.toString()}`, { scroll: false })
  }

  return (
    <div className="min-h-screen aria-gradient-bg">
      <header className="max-w-7xl mx-auto px-4 md:px-6 pt-10 pb-6">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Ask ARIA" }]} />
        <DebugBanner />
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="ask">🤖 Ask ARIA</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="ask">{activeTab === "ask" && <AskPane key="ask-pane" />}</TabsContent>

          <TabsContent value="search">{activeTab === "search" && <SearchPane key="search-pane" />}</TabsContent>
        </Tabs>
      </main>

      {SmokePanel && <SmokePanel />}
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
