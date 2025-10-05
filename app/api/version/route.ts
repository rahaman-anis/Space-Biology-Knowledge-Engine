import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    buildId: process.env.VERCEL_BUILD_OUTPUT ? "edge" : null,
    ts: new Date().toISOString(),
  })
}
