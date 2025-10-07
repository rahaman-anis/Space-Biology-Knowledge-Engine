"use client"

interface Props {
  onSelect: (question: string) => void
}

const QUESTIONS = [
  {
    icon: "🦴",
    title: "Does microgravity increase bone resorption?",
    tagline: "RANKL pathways",
    full: "Does microgravity increase bone resorption? What are the mechanisms and what evidence exists for countermeasures?",
  },
  {
    icon: "🛡️",
    title: "What happens to T-cells in long missions?",
    tagline: "immune dysfunction",
    full: "What happens to T-cells during long-duration space missions? What evidence exists for immune system dysfunction?",
  },
  {
    icon: "💪",
    title: "Why do muscles atrophy in 0g—and can ARED help?",
    tagline: "countermeasures",
    full: "Why do muscles atrophy in microgravity and can the Advanced Resistive Exercise Device (ARED) help prevent muscle loss?",
  },
]

export function PreMadeQuestions({ onSelect }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-medium">Pre-made questions:</p>
      <div className="grid gap-3">
        {QUESTIONS.map((q, i) => {
          const displayTitle = q.title?.trim() || `Full study`
          const subtitle = q.tagline || q.topic || ""

          return (
            <button
              key={i}
              onClick={() => onSelect(q.full)}
              className="text-left px-5 py-4 bg-card hover:bg-card/80 border border-border rounded-xl text-foreground transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{q.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base mb-1">{displayTitle}</p>
                  {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
