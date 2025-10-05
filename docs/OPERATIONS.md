# Operations Runbook

## Environments
- **Local**: `.env.local` with three vars (see README)
- **Preview/Prod**: Vercel Project Settings → Environment Variables

## Key rotation
- Rotate `GROQ_API_KEY` and Supabase keys in Vercel → redeploy
- Confirm `/go-no-go` → GROQ auth + Supabase RPC ✅

## Health & readiness
- `/api/health` – env presence + endpoint reachability
- `/api/version` – commit/branch/time
- `/go-no-go` – full checklist incl. RPC

## Incident handling
1. User reports "No evidence found"
   - Check Supabase availability
   - Verify RLS policies and RPC grants (see Batch 3 notes)
2. Chat timeouts
   - Retry once (client) and check `/api/telemetry` logs
   - Inspect Groq status (models/list)

## Rate limiting
- `/api/chat` → 8 req/min/IP (see `lib/security/rateLimit.ts`)

## Deploy tips
- Ensure `middleware.ts` headers present (CSP/HSTS etc.)
- Demo links: `/demo` stable flows
