# Security Notes

- RLS: read-only anon; RPCs `match_documents/passages` are `security definer` with execute for `anon`
- Keys: never expose secrets via `NEXT_PUBLIC_*`
- Headers: CSP, Referrer-Policy, XFO DENY, HSTS (HTTPS), Permissions-Policy
- Rate limit: `/api/chat` 8/min/IP
- Telemetry: redacted; no user content or PII
- Report policy: `/.well-known/security.txt`
