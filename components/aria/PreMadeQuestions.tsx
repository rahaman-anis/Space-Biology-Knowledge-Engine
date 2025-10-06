"use client"

interface Props {
  onSelect: (question: string) => void
}

const QUESTIONS = [
  {
    icon: "🦴",
    short: "Does microgravity increase bone resorption?",
    subtitle: "(Click to ask about bone loss mechanisms)",
    full: "Does microgravity increase bone resorption? What are the mechanisms and what evidence exists for countermeasures?",
  },
  {
    icon: "🛡️",
    short: "What happens to T-cells in long missions?",
    subtitle: "(Click to ask about immune dysfunction)",
    full: "What happens to T-cells during long-duration space missions? What evidence exists for immune system dysfunction?",
  },
  {
    icon: "💪",
    short: "Why do muscles atrophy in 0g—and can ARED help?",
    subtitle: "(Click to ask about muscle loss countermeasures)",
    full: "Why do muscles atrophy in microgravity and can the Advanced Resistive Exercise Device (ARED) help prevent muscle loss?",
  },
]

export function PreMadeQuestions({ onSelect }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-medium">Pre-made questions:</p>
      <div className="grid gap-3">
        {QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q.full)}
            className="text-left px-5 py-4 bg-card hover:bg-card/80 border border-border rounded-xl text-foreground transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{q.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base mb-1">{q.short}</p>
                <p className="text-xs text-muted-foreground">{q.subtitle}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
