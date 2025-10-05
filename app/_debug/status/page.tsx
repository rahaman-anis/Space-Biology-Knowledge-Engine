"use client"

import { useEffect, useState } from "react"

export default function DebugStatus() {
  const [supabaseHealth, setSupabaseHealth] = useState(null)

  useEffect(() => {
    async function checkSupabaseHealth() {
      try {
        const response = await fetch(process.env.HEALTH_CHECK_RPC)
        const data = await response.json()
        setSupabaseHealth(data.status === "ok")
      } catch (error) {
        setSupabaseHealth(false)
      }
    }

    checkSupabaseHealth()
  }, [])

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Debug Status</h1>
      <ul className="text-sm text-gray-800 space-y-2">
        <li>process.env.NEXT_PUBLIC_SUPABASE_URL present = {String(!!process.env.NEXT_PUBLIC_SUPABASE_URL)}</li>
        <li>
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY present = {String(!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)}
        </li>
        <li>process.env.GROQ_API_KEY present = {String(!!process.env.GROQ_API_KEY)}</li>
        <li>process.env.NEXT_PUBLIC_VECTOR_DIM = {String(process.env.NEXT_PUBLIC_VECTOR_DIM)}</li>
        <li>process.env.HEALTH_CHECK_RPC = {String(process.env.HEALTH_CHECK_RPC)}</li>
        <li>process.env.NEXT_PUBLIC_SUPABASE_DOCS_TABLE = {String(process.env.NEXT_PUBLIC_SUPABASE_DOCS_TABLE)}</li>
        <li>process.env.NEXT_PUBLIC_BASE_URL = {String(process.env.NEXT_PUBLIC_BASE_URL)}</li>
        <li>process.env.NEXT_PUBLIC_FEATURE_3D_GRAPH = {String(process.env.NEXT_PUBLIC_FEATURE_3D_GRAPH)}</li>
        <li>
          Supabase Health Check = {supabaseHealth !== null ? (supabaseHealth ? "Healthy" : "Unhealthy") : "Pending"}
        </li>
      </ul>
      <p className="text-sm text-gray-600">
        If this page renders, routing and basic build are OK. If not, the error is earlier (layout/page export, parse
        error, or import crash).
      </p>
    </main>
  )
}
