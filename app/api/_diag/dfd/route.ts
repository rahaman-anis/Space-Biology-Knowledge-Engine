import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const dfd = `graph TD
  UI[Ask ARIA / Search] -->|query, filters| /api/aria/search
  /api/aria/search -->|top-k evidences| UI
  UI -->|question + evidences| /api/aria/answer
  /api/aria/answer -->|answer text| UI`

  return new NextResponse(dfd, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
