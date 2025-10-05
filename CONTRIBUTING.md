# Contributing

## Workflow
- Branch naming: `feat/*`, `fix/*`, `docs/*`
- Conventional commits preferred
- PR checklist:
  - [ ] Unit compile (no TS errors)
  - [ ] `/go-no-go` = **GO**
  - [ ] Axe/contrast check (no critical A11y issues)
  - [ ] Lighthouse ≥ 85 perf/SEO

## Code style
- TypeScript strict; no `any` unless justified
- Tailwind tokens only (NASA palette & scales)
- Accessible by default: aria labels + focus rings

## Testing
- Manual smoke: see `docs/SMOKE_TESTS.md`
- API smoke: `/api/health`, `/api/version`, `/api/go-no-go`

## Security
- Never commit secrets
- No `NEXT_PUBLIC_*` for sensitive keys; see `docs/SECURITY.md`
