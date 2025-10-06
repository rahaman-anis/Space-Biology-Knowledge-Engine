export function assertServerEnv(label = "server") {
  // Block accidental import in browser/edge
  if (typeof window !== "undefined") {
    throw new Error(`[${label}] Imported in browser bundle — move this code to a server-only file.`)
  }
}
