"use client"
import { useEffect, useRef, useState } from "react"
import { Chip } from "@/components/ui/Chip"

export default function ChatInput({
  onSend,
  context,
  onApplyFilters,
}: {
  onSend: (text: string) => void
  context?: { topic?: string; organism?: string; environment?: string }
  onApplyFilters?: (next: { topic?: string; organism?: string; environment?: string }) => void
}) {
  const [text, setText] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <textarea
        ref={ref}
        rows={2}
        maxLength={500}
        placeholder="Ask about evidence, gaps, or methodology…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded border border-gray-200 p-2 focus-visible:ring-2 focus-visible:ring-primary-300"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Chip>{`Topic: ${context?.topic ?? "—"}`}</Chip>
          <Chip>{`Organism: ${context?.organism ?? "—"}`}</Chip>
          <Chip>{`Environment: ${context?.environment ?? "—"}`}</Chip>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onApplyFilters?.({})}
            className="rounded bg-gray-100 px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Find gaps
          </button>
          <button
            onClick={() => onApplyFilters?.({})}
            className="rounded bg-gray-100 px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Compare organisms
          </button>
          <button
            disabled={!text.trim()}
            onClick={() => {
              onSend(text.trim())
              setText("")
            }}
            className="rounded bg-primary-600 text-white px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-300 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
