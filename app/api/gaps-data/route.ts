import { NextResponse } from "next/server"
import { dsGaps } from "@/lib/datasources"

export const revalidate = 60

export async function GET() {
  try {
    const gaps = await dsGaps(60)

    return NextResponse.json({
      ok: true,
      results: gaps,
    })
  } catch (error) {
    console.error("[gaps-data] Error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to fetch gaps",
      },
      { status: 500 },
    )
  }
}
