"use client"
import { useEffect, useRef, useState } from "react"
import ChatActionsBar from "./ChatActionsBar"
import ChatMessageUser from "./ChatMessageUser"
import ChatMessageAssistant from "./ChatMessageAssistant"
import ChatInput from "./ChatInput"
import ChatSidebar from "./ChatSidebar"
import type { ChatMessage, ChatSession } from "@/types/chat"
import { getOrCreateSession, appendMessage } from "@/lib/chat/session"
import type { EvidenceRow } from "@/components/table/EvidenceTable"
import { BusyBanner, ErrorBanner } from "@/components/common/StatusBanner"

export default function ChatThread({ sessionId }: { sessionId?: string }) {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [busy, setBusy] = useState<null | "retrieving" | "synthesizing">(null)
  const [error, setError] = useState<string | null>(null)
  const [sources, setSources] = useState<EvidenceRow[]>([])
  const liveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const s = getOrCreateSession(sessionId)
    setSession(s)
  }, [sessionId])

  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = session?.messages.at(-1)?.content ?? ""
    }
  }, [session?.messages])

  const timeNow = () => new Date().toISOString()

  async function onSend(text: string) {
    if (!session) return
    setError(null)
    const user: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text, createdAt: timeNow() }
    appendMessage(session.id, user)
    setSession(getOrCreateSession(session.id))

    try {
      setBusy("retrieving")
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: text, k: 12 }),
      })
      setBusy(null)
      if (!res.ok) throw new Error((await res.json()).error ?? "Server error")
      const { payload } = await res.json()

      if (!payload) {
        setError("No evidence found for this query.")
        return
      }

      const assistant: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Answer",
        payload,
        createdAt: timeNow(),
      }
      appendMessage(session.id, assistant)
      setSession(getOrCreateSession(session.id))

      const rows: EvidenceRow[] = (payload.sources ?? []).slice(0, 6).map((s: any, i: number) => ({
        id: `src_${i}`,
        sourceId: s.pmcid ? `PMC${s.pmcid}` : s.ntrsId ? `NTRS-${s.ntrsId}` : s.osdrId ? `OSDR-${s.osdrId}` : "—",
        section: s.section ?? "Results",
        confidence: payload.confidence ?? "Medium",
        date: s.year ? `${s.year}-01-01` : undefined,
        title: s.title ?? undefined,
      }))
      setSources(rows)
    } catch (e: any) {
      setBusy(null)
      setError(e?.message ?? "Failed to complete chat")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <section aria-label="Chat" className="space-y-4">
        <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef} />
        <ChatActionsBar />
        {busy && <BusyBanner text={busy === "retrieving" ? "Searching evidence corpus…" : "Synthesizing answer…"} />}
        {error && <ErrorBanner text={error} onRetry={() => setError(null)} altHref="/gaps" />}
        {session?.messages.map((m) =>
          m.role === "user" ? (
            <ChatMessageUser key={m.id} text={m.content} time={new Date(m.createdAt).toLocaleTimeString()} />
          ) : m.role === "assistant" && m.payload ? (
            <ChatMessageAssistant key={m.id} payload={m.payload} time={new Date(m.createdAt).toLocaleTimeString()} />
          ) : null,
        )}
        <ChatInput onSend={onSend} context={session?.context ?? {}} />
      </section>
      <ChatSidebar sources={sources} context={session?.context ?? {}} />
    </div>
  )
}
