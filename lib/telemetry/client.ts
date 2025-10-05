"use client"

type TelemetryEvent = {
  type: "chat" | "search" | "graph" | "error"
  route?: string
  ms?: number
  ok?: boolean
  code?: number
  note?: string
}

export async function sendTelemetry(ev: TelemetryEvent) {
  try {
    const url = "/api/telemetry"
    const body = JSON.stringify(ev)
    if ("sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" })
      navigator.sendBeacon(url, blob)
      return
    }
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    })
  } catch {
    /* swallow */
  }
}
