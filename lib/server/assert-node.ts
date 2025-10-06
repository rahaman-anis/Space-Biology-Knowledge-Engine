export function assertNodeRuntime(label = "server") {
  if (typeof window !== "undefined") {
    throw new Error(`[${label}] imported in browser — must be server-only`)
  }
}
