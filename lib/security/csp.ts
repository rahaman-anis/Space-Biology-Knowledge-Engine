// Builds a CSP string using known hosts; avoid breaking 3rd-party fonts/images you actually use.
export function buildCSP() {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : null

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'"], // no 'unsafe-inline' — all scripts via bundler
    "style-src": ["'self'", "'unsafe-inline'"], // allow inline styles for Tailwind preflight/SSR
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", "https://api.groq.com"],
    "frame-ancestors": ["'none'"], // disallow embedding
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
    "upgrade-insecure-requests": [],
  }

  if (supabase) {
    directives["connect-src"].push(supabase)
    directives["img-src"].push(supabase)
  }

  // turn into header string
  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
    .join("; ")
}
