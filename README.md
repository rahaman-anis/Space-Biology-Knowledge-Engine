# Space Biology Knowledge Engine

Evidence-driven decision support for Moon/Mars missions. Built with Next.js (App Router), Tailwind, Supabase (Postgres + pgvector), and Groq.

## Quick start

1. **Environment variables**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`
2. **Install & run**
   \`\`\`bash
   pnpm i
   pnpm dev
   # or: npm i && npm run dev
   \`\`\`

## Sanity checks

- Open `/demo` (curated flows)
- Open `/go-no-go` (readiness report)
- Open `/api/health` and `/api/version`

## Key routes

- `/aria` – ARIA chat (retrieval → Groq synthesis → structured payload)
- `/evidence/[topic]` – Evidence explorer & table
- `/graph` – Subgraph & contradictions
- `/gaps` – Research gaps
- `/methods` – Methodology & transparency
- `/docs` – In-app documentation hub

## Tech

- Next.js 14, React 18, TypeScript, Tailwind
- Supabase: read-only anon + RPC (match_documents, match_passages)
- Groq: llama-3.3-70b-versatile (OpenAI-compatible API)
- Accessibility: WCAG 2.2 AA; focus traps; reduced-motion safe

## Folder map

\`\`\`
app/…           # routes (App Router)
components/…    # UI components
lib/…           # fetchers, RAG, security, telemetry
types/…         # shared types
docs/…          # ops/design/api/security docs
\`\`\`

## Deployment

Ensure env vars set in Project → Settings → Environment Variables.

See `docs/OPERATIONS.md` for runbook, key rotation, and smoke tests.

## Licence

MIT.
