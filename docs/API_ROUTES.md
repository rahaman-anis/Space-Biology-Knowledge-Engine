# API Routes

## /api/search-docs (POST)
- Body: `{ query: string, k?: number }`
- Result: `{ results: Array<{ pmcid, title, year, score, ... }> }`

## /api/search-passages (POST)
- Body: `{ query: string, k?: number, scope?: { topic?, organism?, environment? } }`
- Result: `{ results: Array<{ snippet, section, pmcid?, ntrs_id?, year?, score? }> }`

## /api/chat (POST)
- Body: `{ question: string, k?: number }`
- Flow: retrieve → Groq synth (`llama-3.1-70b-versatile`) → JSON payload
- Result: `{ payload: AssistantPayload }`

## /api/subgraph (GET) *(stub)*
- Query: `?topic=&contradictionsOnly=&limit=`
- Result: `{ nodes:[], edges:[] }` (UI can fall back)

## /api/health (GET)
- Env booleans, endpoint pings, leak audit

## /api/go-no-go (GET)
- Env presence, Supabase read + RPC, Groq auth, E2E dry run

## /api/telemetry (POST)
- Body: `{ type, route?, ms?, ok?, code? }`
- Logs to server console (demo-grade)
