"use client"
import { useState } from "react"

export default function ShareLink({
  label = "Share link",
  params,
}: {
  label?: string
  params?: Record<string, string | undefined>
}) {
  const [copied, setCopied] = useState(false)
  const href = (() => {
    const url = new URL(window.location.href)
    if (params)
      Object.entries(params).forEach(([k, v]) =>
        v == null ? url.searchParams.delete(k) : url.searchParams.set(k, String(v)),
      )
    return url.toString()
  })()
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(href)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="rounded border-2 border-primary-600 text-primary-600 px-3 py-1.5 text-sm hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300"
    >
      {copied ? "Copied!" : label}
    </button>
  )
}
