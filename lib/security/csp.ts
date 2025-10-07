// Builds a CSP string using known hosts; avoid breaking 3rd-party fonts/images you actually use.
export function buildCSP() {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : null

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"],
    "style-src": ["'self'", "'unsafe-inline'"], // allow inline styles for Tailwind preflight/SSR
    "img-src": ["*", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      "https://v0.dev",
      "https://v0.app",
      "https://api.v0.app",
      "https://v0chat.vercel.sh",
      "https://vercel.live",
      "https://vercel.com",
      "https://*.pusher.com",
      "https://blob.vercel-storage.com",
      "https://*.blob.vercel-storage.com",
      "https://blobs.vusercontent.net",
      "wss://*.pusher.com",
      "https://fides-vercel.us.fides.ethyca.com/api/v1/",
      "https://cdn-api.ethyca.com/location",
      "https://privacy-vercel.us.fides.ethyca.com/api/v1/",
      "https://api.getkoala.com",
      "https://*.sentry.io/api/",
      "https://huggingface.co/onnx-community/",
      "https://cas-bridge.xethub.hf.co/xet-bridge-us/",
      "https://cdn.jsdelivr.net/npm/@huggingface/",
      "https://api.groq.com",
      ...(supabase ? [supabase] : []),
    ],
    "worker-src": ["'self'", "blob:"],
    "frame-src": ["*"],
    "frame-ancestors": ["'none'"], // disallow embedding
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
    "upgrade-insecure-requests": [],
  }

  // Supabase is already covered by wildcard connect-src and img-src
  // but we keep this for documentation purposes
  if (supabase) {
    // Already covered by * wildcards above
  }

  // turn into header string
  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
    .join("; ")
}
