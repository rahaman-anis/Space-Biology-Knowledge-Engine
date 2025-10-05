# Smoke Tests (5–7 mins)

## 1) Demo
- Open `/demo`; follow four cards (ARIA, Evidence, Graph, Gaps)

## 2) Readiness
- `/go-no-go` → expect **GO**
- `/api/health` ok: true; `/api/version` shows commit

## 3) ARIA chat
- Ask: "What evidence exists for bone loss in microgravity?"
- Expect: summary + 3–6 evidence bullets with citations
- Click "Show contradictions" → compare modal opens
- Export `.bib` and `.ris` succeed

## 4) Evidence table
- Sort by Confidence; header sticky; row hover
- IDs rendered with `.mono`

## 5) A11y
- Tab through header → Skip link → Main
- Open citation popover → Esc returns focus to anchor

## 6) Offline
- Simulate offline → Offline banner; friendly retry when sending chat
