"use client"

import { useState } from "react"

export function SmokePanel() {
  const [searchStatus, setSearchStatus] = useState<string>("")
  const [answerStatus, setAnswerStatus] = useState<string>("")
  const [lastEvidences, setLastEvidences] = useState<any[]>([])

  const pingSearch = async () => {
    setSearchStatus("Pinging...")
    try {
      const res = await fetch("/api/aria/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "bone loss", k: 4, mode: "both" }),
      })
      const data = await res.json()
      if (data.ok) {
        setLastEvidences(data.evidences || [])
        setSearchStatus(`✓ ${res.status} - ${data.evidences?.length || 0} results`)
      } else {
        setSearchStatus(`✗ ${res.status} - ${data.error}`)
      }
    } catch (e: any) {
      setSearchStatus(`✗ Error: ${e.message}`)
    }
  }

  const pingAnswer = async () => {
    setAnswerStatus("Pinging...")
    if (lastEvidences.length === 0) {
      setAnswerStatus("✗ No evidences from search. Run Ping Search first.")
      return
    }
    try {
      const res = await fetch("/api/aria/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "Does microgravity increase bone resorption?",
          evidences: lastEvidences.slice(0, 4),
        }),
      })
      const data = await res.json()
      if (data.ok) {
        const preview = (data.answer || "").slice(0, 200)
        setAnswerStatus(`✓ ${res.status} - ${preview}...`)
      } else {
        setAnswerStatus(`✗ ${res.status} - ${data.error}`)
      }
    } catch (e: any) {
      setAnswerStatus(`✗ Error: ${e.message}`)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-600 rounded-xl p-4 shadow-lg max-w-md z-50">
      <h3 className="text-lg font-bold text-gray-900 mb-3">🧪 Smoke Test Panel</h3>
      <div className="space-y-3">
        <div>
          <button
            onClick={pingSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors w-full"
          >
            Ping Search
          </button>
          {searchStatus && <p className="text-sm mt-2 text-gray-700 font-mono">{searchStatus}</p>}
        </div>
        <div>
          <button
            onClick={pingAnswer}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors w-full"
          >
            Ping Answer
          </button>
          {answerStatus && <p className="text-sm mt-2 text-gray-700 font-mono break-words">{answerStatus}</p>}
        </div>
      </div>
    </div>
  )
}
