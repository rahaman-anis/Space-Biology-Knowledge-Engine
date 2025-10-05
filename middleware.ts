import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { buildCSP } from "@/lib/security/csp"

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Security headers (do not expose secrets)
  res.headers.set("Content-Security-Policy", buildCSP())
  res.headers.set("Referrer-Policy", "no-referrer")
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set(
    "Permissions-Policy",
    [
      "geolocation=()",
      "microphone=()",
      "camera=()",
      "payment=()",
      "fullscreen=(self)", // allow within app
    ].join(", "),
  )

  // HSTS only on production over HTTPS (Vercel)
  if (req.headers.get("x-forwarded-proto") === "https") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  }

  return res
}

export const config = {
  matcher: [
    /*
      Apply to all HTML/doc/API routes. Skip _next/static and public assets.
    */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg)).*)",
  ],
}
